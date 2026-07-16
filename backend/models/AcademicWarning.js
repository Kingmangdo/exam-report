import { supabase } from './supabase.js';

export class AcademicWarning {
  // 경고 내역 저장
  static async create(data) {
    const { student_id, class_name, exam_date, warning_type, test_name, message } = data;
    
    // 동일 날짜, 동일 유형의 중복 경고 방지
    let query = supabase
      .from('academic_warnings')
      .select('id')
      .eq('exam_date', exam_date)
      .eq('class_name', class_name)
      .eq('warning_type', warning_type)
      .eq('test_name', test_name || '');
      
    if (student_id) {
      query = query.eq('student_id', student_id);
    } else {
      query = query.is('student_id', null);
    }
    
    const { data: existing } = await query.maybeSingle();
      
    if (existing) {
      // 반 전체 경고의 경우, 나중에 저장된 학생으로 인해 Fail 인원수가 늘어날 수 있으므로 메시지를 최신으로 업데이트
      const { data: updated } = await supabase
        .from('academic_warnings')
        .update({ message })
        .eq('id', existing.id)
        .select('*')
        .single();
      return updated;
    }

    const { data: inserted, error } = await supabase
      .from('academic_warnings')
      .insert({
        student_id,
        class_name,
        exam_date,
        warning_type,
        test_name,
        message
      })
      .select('*')
      .single();

    if (error) {
      console.error('학습 경고 저장 오류:', error);
      return null;
    }
    return inserted;
  }

  // 아직 확인되지 않은 최신 경고 조회 (대시보드용)
  static async getUnacknowledged() {
    const { data, error } = await supabase
      .from('academic_warnings')
      .select(`
        *,
        students(name)
      `)
      .eq('is_acknowledged', false)
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(error.message);
    
    return data.map(w => ({
      ...w,
      student_name: w.students?.name
    }));
  }

  // 경고 확인 처리
  static async acknowledge(id) {
    const { data, error } = await supabase
      .from('academic_warnings')
      .update({ is_acknowledged: true })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  }

  // 비동기 계산을 위한 백그라운드 로직 호출
  static async checkWarningsInBackground(studentId, className, examDate) {
    // Note: Node.js 이벤트 루프에 의해 비동기로 실행됨 (응답 지연 방지)
    setImmediate(async () => {
      try {
        await this._checkStudentWarnings(studentId, className, examDate);
        await this._checkClassDifficultyWarning(className, examDate);
      } catch (err) {
        console.error('Background Warning Check Failed:', err);
      }
    });
  }

  // 1. 학생별 단어/RT 연속 3회 Fail 여부 체크
  static async _checkStudentWarnings(studentId, className, examDate) {
    // 해당 학생의 최신 성적 3건을 가져옴 (exam_date 기준 내림차순)
    const { data: recentScores } = await supabase
      .from('scores')
      .select('id, exam_date, rt_details, word_details')
      .eq('student_id', studentId)
      .eq('class_name', className)
      .lte('exam_date', examDate)
      .order('exam_date', { ascending: false })
      .limit(3);

    // 3건 미만이면 아직 연속 3회 체크 불가
    if (!recentScores || recentScores.length < 3) return;

    // 단어 테스트 Fail 기준: 정답률 85% 미만
    // RT 테스트 Fail 기준: 점수 50점 미만 또는 'F' (Pass/Fail)
    
    // 가장 최근 시험의 세부 항목별로 분석
    const latestScore = recentScores[0];
    const prev1Score = recentScores[1];
    const prev2Score = recentScores[2];

    // RT 테스트 체크
    if (latestScore.rt_details && Array.isArray(latestScore.rt_details)) {
      for (let i = 0; i < latestScore.rt_details.length; i++) {
        const rtName = latestScore.rt_details[i].name || `RT ${i+1}`;
        
        const isFail = (detail) => {
          if (!detail) return false;
          if (detail.type === 'pf') return detail.correct === 'F';
          return Number(detail.correct) < 50;
        };

        const currentFail = isFail(latestScore.rt_details[i]);
        const prev1Fail = isFail(prev1Score.rt_details?.[i]);
        const prev2Fail = isFail(prev2Score.rt_details?.[i]);

        if (currentFail && prev1Fail && prev2Fail) {
          await this.create({
            student_id: studentId,
            class_name: className,
            exam_date: latestScore.exam_date,
            warning_type: 'RT_3_FAIL',
            test_name: rtName,
            message: `${rtName} 시험 3회 연속 Fail (재시험 대상)`
          });
        }
      }
    }

    // 단어 테스트 체크
    if (latestScore.word_details && Array.isArray(latestScore.word_details)) {
      for (let i = 0; i < latestScore.word_details.length; i++) {
        const wordName = latestScore.word_details[i].name || `단어 ${i+1}`;
        
        const isFail = (detail) => {
          if (!detail || !detail.total || detail.total === 0) return false;
          return (Number(detail.correct) / Number(detail.total)) < 0.85;
        };

        const currentFail = isFail(latestScore.word_details[i]);
        const prev1Fail = isFail(prev1Score.word_details?.[i]);
        const prev2Fail = isFail(prev2Score.word_details?.[i]);

        if (currentFail && prev1Fail && prev2Fail) {
          const p1 = Math.round((Number(latestScore.word_details[i].correct) / Number(latestScore.word_details[i].total)) * 100);
          const p2 = Math.round((Number(prev1Score.word_details[i].correct) / Number(prev1Score.word_details[i].total)) * 100);
          const p3 = Math.round((Number(prev2Score.word_details[i].correct) / Number(prev2Score.word_details[i].total)) * 100);
          
          await this.create({
            student_id: studentId,
            class_name: className,
            exam_date: latestScore.exam_date,
            warning_type: 'WORD_3_FAIL',
            test_name: wordName,
            message: `${wordName} 시험 3회 연속 85% 미만 (${p3}% → ${p2}% → ${p1}%)`
          });
        }
      }
    }
  }

  // 2. 반 전체 난이도 조절 실패 여부 체크 (RT 시험 50% 초과 Fail)
  static async _checkClassDifficultyWarning(className, examDate) {
    // 해당 반, 해당 날짜의 전체 학생 성적 조회
    const { data: scores } = await supabase
      .from('scores')
      .select('id, rt_details')
      .eq('class_name', className)
      .eq('exam_date', examDate);

    if (!scores || scores.length === 0) return;

    // 결석을 제외한 응시자 기준
    const totalStudents = scores.length;

    // RT 시험 항목별로 Fail 수 집계
    const firstScore = scores[0];
    if (firstScore.rt_details && Array.isArray(firstScore.rt_details)) {
      for (let i = 0; i < firstScore.rt_details.length; i++) {
        let failCount = 0;
        const rtName = firstScore.rt_details[i].name || `RT ${i+1}`;

        for (const score of scores) {
          const detail = score.rt_details?.[i];
          if (detail) {
            const isFail = detail.type === 'pf' ? detail.correct === 'F' : Number(detail.correct) < 50;
            if (isFail) failCount++;
          }
        }

        // 응시자 50% 초과 (절반보다 많은 학생이 Fail)
        if (failCount > (totalStudents / 2)) {
          // 기존에 해당 시험에 대해 경고가 있었는지 확인 후 업데이트 (중복 방지 및 수치 갱신)
          const { data: existing } = await supabase
            .from('academic_warnings')
            .select('id')
            .eq('exam_date', examDate)
            .eq('class_name', className)
            .eq('warning_type', 'CLASS_FAIL_50')
            .eq('test_name', rtName)
            .is('student_id', null)
            .maybeSingle();

          const message = `${className} ${rtName} Fail ${totalStudents}명중 ${failCount}명 Fail`;

          if (existing) {
            await supabase
              .from('academic_warnings')
              .update({ message, is_acknowledged: false })
              .eq('id', existing.id);
          } else {
            await this.create({
              student_id: null, // 반 전체 경고
              class_name: className,
              exam_date: examDate,
              warning_type: 'CLASS_FAIL_50',
              test_name: rtName,
              message
            });
          }
        }
      }
    }
  }
}
