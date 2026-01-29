import { supabase } from './supabase.js';

export class Payment {
  // 특정 학생의 결제 내역 조회
  static async getByStudentId(studentId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('billing_month', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  // 모든 결제 내역 조회 (필터 가능)
  static async getAll(filters = {}) {
    let query = supabase
      .from('payments')
      .select('*, students(name, class_name)')
      .order('billing_month', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.billing_month) {
      query = query.eq('billing_month', filters.billing_month);
    }
    if (filters.student_name) {
      query = query.ilike('students.name', `%${filters.student_name}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map(row => {
      const { students, ...payment } = row;
      return {
        ...payment,
        student_name: students?.name,
        class_name: students?.class_name
      };
    });
  }

  // 결제 기록 생성
  static async create(data) {
    const { student_id, amount, billing_month, status, payment_date, payment_method, remarks } = data;
    const { data: inserted, error } = await supabase
      .from('payments')
      .insert({
        student_id,
        amount,
        billing_month,
        status: status || 'unpaid',
        payment_date,
        payment_method,
        remarks
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  }

  // 결제 기록 대량 생성
  static async bulkCreate(paymentsArray) {
    if (!paymentsArray || paymentsArray.length === 0) return [];
    
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentsArray.map(p => ({
        student_id: p.student_id,
        amount: p.amount,
        billing_month: p.billing_month,
        status: p.status || 'unpaid',
        payment_date: p.payment_date,
        payment_method: p.payment_method,
        remarks: p.remarks
      })))
      .select('*');

    if (error) throw new Error(error.message);
    return data;
  }

  // 결제 기록 수정
  static async update(id, data) {
    const { amount, billing_month, status, payment_date, payment_method, remarks } = data;
    const { data: updated, error } = await supabase
      .from('payments')
      .update({
        amount,
        billing_month,
        status,
        payment_date,
        payment_method,
        remarks,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return updated;
  }

  // 결제 기록 삭제
  static async delete(id) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }
}
