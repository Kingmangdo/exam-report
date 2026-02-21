import { supabase } from './supabase.js';

export class LevelTest {
  // 조회 (reservation_id 기반)
  static async getByReservationId(reservationId) {
    const { data, error } = await supabase
      .from('level_test_scores')
      .select('*')
      .eq('reservation_id', reservationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  // ID로 조회
  static async getById(id) {
    const { data, error } = await supabase
      .from('level_test_scores')
      .select('*, reservations!inner(name, school, grade)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      student_name: data.reservations?.name,
      student_school: data.reservations?.school,
      student_grade: data.reservations?.grade
    };
  }

  // 생성 또는 수정 (upsert)
  static async createOrUpdate(data) {
    const { reservation_id, test_date, parts, total_score, average_score, overall_comment } = data;

    const { data: existing } = await supabase
      .from('level_test_scores')
      .select('id')
      .eq('reservation_id', reservation_id)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase
        .from('level_test_scores')
        .update({ test_date, parts, total_score, average_score, overall_comment, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('level_test_scores')
        .insert({ reservation_id, test_date, parts, total_score, average_score, overall_comment })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return inserted;
    }
  }

  // 삭제
  static async delete(id) {
    const { error } = await supabase
      .from('level_test_scores')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  // 전체 조회
  static async getAll() {
    const { data, error } = await supabase
      .from('level_test_scores')
      .select('*, reservations!inner(name, school, grade)')
      .order('test_date', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(score => ({
      ...score,
      student_name: score.reservations?.name,
      student_school: score.reservations?.school,
      student_grade: score.reservations?.grade
    }));
  }
}
