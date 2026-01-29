import { supabase } from './supabase.js';

export class CounselingLog {
  // 특정 학생의 상담일지 조회
  static async getByStudentId(studentId) {
    const { data, error } = await supabase
      .from('counseling_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('consultation_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  // 상담일지 등록
  static async create(data) {
    const { student_id, counselor_name, category, content, consultation_date } = data;
    const { data: inserted, error } = await supabase
      .from('counseling_logs')
      .insert({
        student_id,
        counselor_name,
        category: category || '일반상담',
        content,
        consultation_date: consultation_date || new Date().toISOString().split('T')[0]
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  }

  // 상담일지 수정
  static async update(id, data) {
    const { counselor_name, category, content, consultation_date } = data;
    const { data: updated, error } = await supabase
      .from('counseling_logs')
      .update({
        counselor_name,
        category,
        content,
        consultation_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return updated;
  }

  // 상담일지 삭제
  static async delete(id) {
    const { error } = await supabase
      .from('counseling_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }
}
