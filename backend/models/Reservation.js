import { supabase } from './supabase.js';

export class Reservation {
  // 전체 조회 (필터 지원)
  static async getAll(filters = {}) {
    let query = supabase
      .from('reservations')
      .select('*')
      .order('visit_date', { ascending: true });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  // ID로 조회
  static async getById(id) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // 생성
  static async create(data) {
    const { name, visit_date, school, grade, recent_english_score, notes, student_phone, parent_phone } = data;
    const { data: inserted, error } = await supabase
      .from('reservations')
      .insert({
        name,
        visit_date,
        school: school || null,
        grade: grade || null,
        recent_english_score: recent_english_score || null,
        notes: notes || null,
        student_phone: student_phone || null,
        parent_phone: parent_phone || null,
        status: '예약'
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  }

  // 수정
  static async update(id, data) {
    const { name, visit_date, school, grade, recent_english_score, notes, status, student_phone, parent_phone } = data;
    const { data: updated, error } = await supabase
      .from('reservations')
      .update({
        name,
        visit_date,
        school: school || null,
        grade: grade || null,
        recent_english_score: recent_english_score || null,
        notes: notes || null,
        student_phone: student_phone || null,
        parent_phone: parent_phone || null,
        status: status || '예약',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return updated;
  }

  // 삭제
  static async delete(id) {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
}
