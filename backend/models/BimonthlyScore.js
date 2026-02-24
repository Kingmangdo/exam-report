import { supabase } from './supabase.js';

export class BimonthlyScore {
  // 바이먼스리 성적 생성/수정 (upsert)
  static async createOrUpdate(data) {
    const { student_id, exam_date, class_name, parts, total_score, average_score, comment } = data;

    // 기존 데이터 확인
    const { data: existing } = await supabase
      .from('bimonthly_scores')
      .select('id')
      .eq('student_id', student_id)
      .eq('exam_date', exam_date)
      .eq('class_name', class_name)
      .maybeSingle();

    if (existing) {
      // 수정
      const { data: updated, error } = await supabase
        .from('bimonthly_scores')
        .update({
          parts,
          total_score,
          average_score,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return updated;
    } else {
      // 생성
      const { data: inserted, error } = await supabase
        .from('bimonthly_scores')
        .insert({
          student_id,
          exam_date,
          class_name,
          parts,
          total_score,
          average_score,
          comment
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return inserted;
    }
  }

  // 조회 (필터)
  static async getAll(filters = {}) {
    let query = supabase
      .from('bimonthly_scores')
      .select('*, students!inner(name, school, grade, class_name, parent_phone)')
      .order('exam_date', { ascending: false });

    if (filters.class_name) {
      query = query.eq('class_name', filters.class_name);
    }
    if (filters.exam_date) {
      query = query.eq('exam_date', filters.exam_date);
    }
    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map(score => ({
      ...score,
      student_name: score.students?.name,
      student_school: score.students?.school,
      student_grade: score.students?.grade,
      student_class: score.students?.class_name,
      parent_phone: score.students?.parent_phone
    }));
  }

  // ID로 조회
  static async getById(id) {
    const { data, error } = await supabase
      .from('bimonthly_scores')
      .select('*, students!inner(name, school, grade, class_name, parent_phone)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    return {
      ...data,
      student_name: data.students?.name,
      student_school: data.students?.school,
      student_grade: data.students?.grade,
      student_class: data.students?.class_name,
      parent_phone: data.students?.parent_phone
    };
  }

  // 삭제
  static async delete(id) {
    const { error } = await supabase
      .from('bimonthly_scores')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  // 반 평균 계산
  static async getClassAverage(class_name, exam_date) {
    const { data, error } = await supabase
      .from('bimonthly_scores')
      .select('parts, average_score')
      .eq('class_name', class_name)
      .eq('exam_date', exam_date);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return null;

    // average_score가 0인 경우 제외 (결석 학생)
    const validScores = data.filter(s => s.average_score && s.average_score > 0);
    if (validScores.length === 0) return null;

    const count = validScores.length;
    const totalAvg = validScores.reduce((sum, s) => sum + (s.average_score || 0), 0) / count;

    // 파트별 평균 계산 (결석 학생 제외)
    const partCount = validScores[0]?.parts?.length || 0;
    const partAverages = [];
    for (let i = 0; i < partCount; i++) {
      const partSum = validScores.reduce((sum, s) => {
        const part = s.parts?.[i];
        if (part) {
          return sum + (part.score / part.max_score * 100);
        }
        return sum;
      }, 0);
      partAverages.push(Math.round(partSum / count * 10) / 10);
    }

    return {
      class_average: Math.round(totalAvg * 10) / 10,
      part_averages: partAverages,
      student_count: count
    };
  }
}
