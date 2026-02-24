import { supabase } from './supabase.js';

export class Score {
  // 모든 성적 조회 (필터링 가능)
  static async getAll(filters = {}) {
    let query = supabase
      .from('scores')
      .select('*, students!inner(name,class_name,grade), kakao_send_history(send_status)')
      .order('exam_date', { ascending: false })
      .order('name', { foreignTable: 'students', ascending: true });

    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
    }

    if (filters.student_name) {
      // students!inner를 사용하므로 joined table 필터링 가능
      query = query.ilike('students.name', `%${filters.student_name}%`);
    }

    if (filters.exam_date) {
      query = query.eq('exam_date', filters.exam_date);
    }

    if (filters.class_name) {
      query = query.eq('class_name', filters.class_name);
    }

    if (filters.start_date && filters.end_date) {
      query = query.gte('exam_date', filters.start_date).lte('exam_date', filters.end_date);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map(row => {
      const { students, kakao_send_history, ...score } = row;
      // 가장 최근의 발송 상태를 가져옴
      const kakaoStatus = kakao_send_history && kakao_send_history.length > 0 
        ? kakao_send_history[kakao_send_history.length - 1].send_status 
        : null;

      return {
        ...score,
        student_name: students?.name,
        student_class_name: students?.class_name,
        grade: students?.grade,
        kakao_status: kakaoStatus
      };
    });
  }

  // 성적 ID로 조회
  static async getById(id) {
    const { data, error } = await supabase
      .from('scores')
      .select('*, students!inner(name,class_name,grade)')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    if (!data) return null;
    const { students, ...score } = data;
    return {
      ...score,
      student_name: students?.name,
      student_class_name: students?.class_name,
      grade: students?.grade
    };
  }

  // 학생 ID와 날짜로 조회
  static async getByStudentAndDate(studentId, examDate, className = null) {
    let query = supabase.from('scores').select('*').eq('student_id', Number(studentId)).eq('exam_date', examDate);
    if (className) {
      query = query.eq('class_name', className).maybeSingle();
    } else {
      query = query.order('id', { ascending: false }).limit(1).maybeSingle();
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || null;
  }

  // 점수 계산 함수
  static calculateScore(correct, total) {
    const c = Number(correct) || 0;
    const t = Number(total) || 0;
    if (t === 0) return 0;
    return Math.round((c / t) * 100 * 100) / 100; // 소수점 2자리
  }

  // 총점 및 평균 계산
  static calculateTotalAndAverage(rtScore, wordScore, assignmentScore) {
    const s1 = Number(rtScore) || 0;
    const s2 = Number(wordScore) || 0;
    const s3 = Number(assignmentScore) || 0;
    const total = s1 + s2 + s3;
    const average = total / 3;
    return {
      total: Math.round(total * 100) / 100,
      average: Math.round(average * 100) / 100
    };
  }

  // 반 평균 계산
  static async calculateClassAverage(className, examDate) {
    if (!className || !examDate) return 0;
    const { data, error } = await supabase
      .from('scores')
      .select('average_score')
      .eq('class_name', className)
      .eq('exam_date', examDate);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return 0;
    
    // average_score가 0인 경우 제외 (결석 학생)
    // average_score가 null, undefined, 0이 아닌 경우만 포함
    const validScores = data.filter(score => {
      const avg = Number(score.average_score);
      return !isNaN(avg) && avg > 0;
    });
    if (validScores.length === 0) return 0;
    
    const sum = validScores.reduce((acc, score) => acc + (score.average_score || 0), 0);
    return Math.round((sum / validScores.length) * 100) / 100;
  }

  // 성적 등록
  static async create(data) {
    const {
      student_id,
      exam_date,
      class_name,
      rt_total,
      rt_correct,
      word_total,
      word_correct,
      rt_details,
      word_details,
      assignment_score,
      comment
    } = data;

    // 카테고리별 점수 계산 (상세 내역이 있으면 개별 테스트의 평균 백분율로 계산)
    let rtScore = 0;
    if (rt_details && rt_details.length > 0) {
      const rtPercentages = rt_details.map(rt => (rt.total > 0 ? (rt.correct / rt.total) * 100 : 0));
      rtScore = rtPercentages.reduce((a, b) => a + b, 0) / rt_details.length;
    } else {
      rtScore = rt_total > 0 ? (rt_correct / rt_total) * 100 : 0;
    }

    let wordScore = 0;
    if (word_details && word_details.length > 0) {
      const wordPercentages = word_details.map(word => (word.total > 0 ? (word.correct / word.total) * 100 : 0));
      wordScore = wordPercentages.reduce((a, b) => a + b, 0) / word_details.length;
    } else {
      wordScore = word_total > 0 ? (word_correct / word_total) * 100 : 0;
    }

    // 총점 및 평균 계산 (RT, 단어, 과제 3개 카테고리 동일 비율)
    const { total, average } = this.calculateTotalAndAverage(
      rtScore,
      wordScore,
      assignment_score
    );

    // 학생 정보 조회 (반 평균 계산용)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('class_name')
      .eq('id', Number(student_id))
      .single();
    if (studentError || !student) throw new Error('학생을 찾을 수 없습니다.');

    const targetClassName = class_name || (student.class_name ? student.class_name.split(',')[0].trim() : null);
    const existing = await this.getByStudentAndDate(Number(student_id), exam_date, targetClassName);

    // 반평균은 저장 후 일괄 계산하므로 임시로 0 저장
    const payload = {
      student_id: Number(student_id),
      exam_date,
      class_name: targetClassName,
      rt_total: Number(rt_total) || 0,
      rt_correct: Number(rt_correct) || 0,
      rt_score: rtScore,
      word_total: Number(word_total) || 0,
      word_correct: Number(word_correct) || 0,
      word_score: wordScore,
      rt_details: rt_details || [],
      word_details: word_details || [],
      assignment_score: Number(assignment_score) || 0,
      total_score: total,
      average_score: average,
      class_average: 0, // 임시값, 저장 후 재계산
      comment: comment || '',
      updated_at: new Date().toISOString()
    };

    let savedScore;
    if (existing) {
      const { error } = await supabase.from('scores').update(payload).eq('id', existing.id);
      if (error) throw new Error(error.message);
      savedScore = await this.getById(existing.id);
    } else {
      const { data: inserted, error } = await supabase
        .from('scores')
        .insert(payload)
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      savedScore = await this.getById(inserted.id);
    }

    // 저장 후 정확한 반평균 계산 및 일괄 업데이트
    if (targetClassName) {
      const classAverage = await this.calculateClassAverage(targetClassName, exam_date);
      // 해당 반/날짜의 모든 성적 레코드의 반평균을 동일하게 업데이트
      const { error: updateError } = await supabase
        .from('scores')
        .update({ class_average: classAverage })
        .eq('class_name', targetClassName)
        .eq('exam_date', exam_date);
      if (updateError) {
        console.error('반평균 일괄 업데이트 실패:', updateError);
        // 에러가 발생해도 저장된 성적은 반환 (반평균만 업데이트 실패)
      }
      // 반환할 데이터에 정확한 반평균 반영
      if (savedScore) {
        savedScore.class_average = classAverage;
      }
    }

    return savedScore;
  }

  // 성적 수정
  static async update(id, data) {
    const {
      rt_total,
      rt_correct,
      word_total,
      word_correct,
      rt_details,
      word_details,
      assignment_score,
      comment
    } = data;

    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    // 카테고리별 점수 계산
    let rtScore = 0;
    if (rt_details && rt_details.length > 0) {
      const rtPercentages = rt_details.map(rt => (rt.total > 0 ? (rt.correct / rt.total) * 100 : 0));
      rtScore = rtPercentages.reduce((a, b) => a + b, 0) / rt_details.length;
    } else {
      rtScore = rt_total > 0 ? (rt_correct / rt_total) * 100 : 0;
    }

    let wordScore = 0;
    if (word_details && word_details.length > 0) {
      const wordPercentages = word_details.map(word => (word.total > 0 ? (word.correct / word.total) * 100 : 0));
      wordScore = wordPercentages.reduce((a, b) => a + b, 0) / word_details.length;
    } else {
      wordScore = word_total > 0 ? (word_correct / word_total) * 100 : 0;
    }

    const { total, average } = this.calculateTotalAndAverage(
      rtScore,
      wordScore,
      assignment_score
    );

    // 먼저 성적 업데이트 (반평균은 임시로 0)
    const { error } = await supabase
      .from('scores')
      .update({
        rt_total: rt_total || 0,
        rt_correct: rt_correct || 0,
        rt_score: rtScore,
        word_total: word_total || 0,
        word_correct: word_correct || 0,
        word_score: wordScore,
        rt_details: rt_details || [],
        word_details: word_details || [],
        assignment_score: assignment_score || 0,
        total_score: total,
        average_score: average,
        class_average: 0, // 임시값, 업데이트 후 재계산
        comment: comment || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw new Error(error.message);

    // 업데이트 후 정확한 반평균 계산 및 일괄 업데이트
    if (existing.class_name && existing.exam_date) {
      const classAverage = await this.calculateClassAverage(existing.class_name, existing.exam_date);
      // 해당 반/날짜의 모든 성적 레코드의 반평균을 동일하게 업데이트
      const { error: updateError } = await supabase
        .from('scores')
        .update({ class_average: classAverage })
        .eq('class_name', existing.class_name)
        .eq('exam_date', existing.exam_date);
      if (updateError) {
        console.error('반평균 일괄 업데이트 실패:', updateError);
        // 에러가 발생해도 저장된 성적은 반환 (반평균만 업데이트 실패)
      }
    }

    const updatedScore = await this.getById(id);
    return updatedScore;
  }

  // 성적 삭제
  static async delete(id) {
    // 삭제 전 성적 정보 조회 (반평균 재계산용)
    const existing = await this.getById(id);
    const className = existing?.class_name;
    const examDate = existing?.exam_date;

    const deleteHistory = supabase.from('kakao_send_history').delete().eq('score_id', id);
    const deleteAccess = supabase.from('report_access').delete().eq('score_id', id);
    const deleteScore = supabase.from('scores').delete().eq('id', id);
    const results = await Promise.all([deleteHistory, deleteAccess, deleteScore]);
    const last = results[2];
    if (last.error) throw new Error(last.error.message);

    // 삭제 후 반평균 재계산 및 일괄 업데이트
    if (className && examDate) {
      const classAverage = await this.calculateClassAverage(className, examDate);
      // 해당 반/날짜의 모든 성적 레코드의 반평균을 동일하게 업데이트
      const { error: updateError } = await supabase
        .from('scores')
        .update({ class_average: classAverage })
        .eq('class_name', className)
        .eq('exam_date', examDate);
      if (updateError) {
        console.error('반평균 일괄 업데이트 실패:', updateError);
        // 에러가 발생해도 삭제는 성공 (반평균만 업데이트 실패)
      }
    }

    return true;
  }

  // 이전 성적 조회 (비교용)
  static async getPreviousScore(studentId, examDate) {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('student_id', studentId)
      .lt('exam_date', examDate)
      .order('exam_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data || null;
  }

  // 최근 성적 조회 (기준 날짜 포함, 제한 개수)
  static async getRecentScores(studentId, examDate, limit = 6, className = null) {
    let query = supabase
      .from('scores')
      .select('*')
      .eq('student_id', studentId)
      .lte('exam_date', examDate)
      .order('exam_date', { ascending: false })
      .limit(limit);
    if (className) {
      query = query.eq('class_name', className);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }
}
