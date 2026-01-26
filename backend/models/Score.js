import { supabase } from './supabase.js';

export class Score {
  // 모든 성적 조회 (필터링 가능)
  static async getAll(filters = {}) {
    let query = supabase
      .from('scores')
      .select('*, students!inner(name,class_name,grade)')
      .order('exam_date', { ascending: false })
      .order('name', { foreignTable: 'students', ascending: true });

    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
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
      const { students, ...score } = row;
      return {
        ...score,
        student_name: students?.name,
        student_class_name: students?.class_name,
        grade: students?.grade
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
    let query = supabase.from('scores').select('*').eq('student_id', studentId).eq('exam_date', examDate);
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
    if (!total || total === 0) return 0;
    return Math.round((correct / total) * 100 * 100) / 100; // 소수점 2자리
  }

  // 총점 및 평균 계산
  static calculateTotalAndAverage(rtScore, wordScore, assignmentScore, attitudeScore) {
    const total = rtScore + wordScore + assignmentScore + attitudeScore;
    const average = total / 4; // 가중치 25% 동일
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
    const sum = data.reduce((acc, score) => acc + (score.average_score || 0), 0);
    return Math.round((sum / data.length) * 100) / 100;
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
      assignment_score,
      attitude_score,
      comment
    } = data;

    // 점수 계산 (null/undefined 처리)
    const rtScore = rt_total && rt_correct !== undefined
      ? this.calculateScore(rt_correct, rt_total)
      : 0;
    const wordScore = word_total && word_correct !== undefined
      ? this.calculateScore(word_correct, word_total)
      : 0;

    // 총점 및 평균 계산
    const { total, average } = this.calculateTotalAndAverage(
      rtScore,
      wordScore,
      assignment_score,
      attitude_score
    );

    // 학생 정보 조회 (반 평균 계산용)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('class_name')
      .eq('id', student_id)
      .single();
    if (studentError || !student) throw new Error('학생을 찾을 수 없습니다.');

    const targetClassName = class_name || (student.class_name ? student.class_name.split(',')[0].trim() : null);
    const existing = await this.getByStudentAndDate(student_id, exam_date, targetClassName);

    let classAverage = 0;
    if (targetClassName) {
      let query = supabase
        .from('scores')
        .select('average_score')
        .eq('class_name', targetClassName)
        .eq('exam_date', exam_date);
      if (existing?.id) {
        query = query.neq('id', existing.id);
      }
      const { data: existingScores, error } = await query;
      if (error) throw new Error(error.message);
      const existingSum = (existingScores || []).reduce((acc, score) => acc + (score.average_score || 0), 0);
      const totalCount = (existingScores || []).length + 1;
      classAverage = Math.round(((existingSum + average) / totalCount) * 100) / 100;
    }

    const payload = {
      student_id,
      exam_date,
      class_name: targetClassName,
      rt_total: rt_total || null,
      rt_correct: rt_correct ?? null,
      rt_score: rtScore,
      word_total: word_total || null,
      word_correct: word_correct ?? null,
      word_score: wordScore,
      assignment_score: assignment_score || 0,
      attitude_score: attitude_score || 0,
      total_score: total,
      average_score: average,
      class_average: classAverage,
      comment: comment || null,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { error } = await supabase.from('scores').update(payload).eq('id', existing.id);
      if (error) throw new Error(error.message);
      return this.getById(existing.id);
    }

    const { data: inserted, error } = await supabase
      .from('scores')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    return this.getById(inserted.id);
  }

  // 성적 수정
  static async update(id, data) {
    const {
      rt_total,
      rt_correct,
      word_total,
      word_correct,
      assignment_score,
      attitude_score,
      comment
    } = data;

    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const rtScore = this.calculateScore(rt_correct, rt_total);
    const wordScore = this.calculateScore(word_correct, word_total);
    const { total, average } = this.calculateTotalAndAverage(
      rtScore,
      wordScore,
      assignment_score,
      attitude_score
    );

    const classAverage = await this.calculateClassAverage(existing.class_name || null, existing.exam_date);

    const { error } = await supabase
      .from('scores')
      .update({
        rt_total,
        rt_correct,
        rt_score: rtScore,
        word_total,
        word_correct,
        word_score: wordScore,
        assignment_score,
        attitude_score,
        total_score: total,
        average_score: average,
        class_average: classAverage,
        comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return this.getById(id);
  }

  // 성적 삭제
  static async delete(id) {
    const deleteHistory = supabase.from('kakao_send_history').delete().eq('score_id', id);
    const deleteAccess = supabase.from('report_access').delete().eq('score_id', id);
    const deleteScore = supabase.from('scores').delete().eq('id', id);
    const results = await Promise.all([deleteHistory, deleteAccess, deleteScore]);
    const last = results[2];
    if (last.error) throw new Error(last.error.message);
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
