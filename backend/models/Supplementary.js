
import { supabase } from '../models/supabase.js';

export class Supplementary {
  // 특정 반의 보강 일정 조회 (날짜 범위 필터링 가능)
  static async getSessionsByClass(classId, startDate, endDate) {
    let query = supabase
      .from('supplementary_sessions')
      .select(`
        *,
        supplementary_students (
          student_id,
          attendance_status,
          students (name, phone)
        )
      `)
      .eq('class_id', classId)
      .order('session_date', { ascending: true });

    if (startDate) {
      query = query.gte('session_date', startDate);
    }
    if (endDate) {
      query = query.lte('session_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  // 보강 일정 생성
  static async createSession(sessionData) {
    const { class_id, session_date, content } = sessionData;
    const { data, error } = await supabase
      .from('supplementary_sessions')
      .insert({ class_id, session_date, content })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // 보강 일정 수정
  static async updateSession(id, sessionData) {
    const { session_date, content } = sessionData;
    const { data, error } = await supabase
      .from('supplementary_sessions')
      .update({ session_date, content })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // 보강 일정 삭제
  static async deleteSession(id) {
    const { error } = await supabase
      .from('supplementary_sessions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  // 보강 참여 학생 추가 (다중 추가)
  static async addStudents(sessionId, studentIds) {
    if (!studentIds || studentIds.length === 0) return [];

    const insertData = studentIds.map(sid => ({
      session_id: sessionId,
      student_id: sid,
      attendance_status: 'pending'
    }));

    const { data, error } = await supabase
      .from('supplementary_students')
      .insert(insertData)
      .select('*');

    if (error) throw new Error(error.message);
    return data;
  }

  // 보강 참여 학생 제거
  static async removeStudent(sessionId, studentId) {
    const { error } = await supabase
      .from('supplementary_students')
      .delete()
      .eq('session_id', sessionId)
      .eq('student_id', studentId);

    if (error) throw new Error(error.message);
    return true;
  }

  // 학생별 보강 히스토리 조회 (최근 3주 등)
  static async getStudentHistory(studentId) {
    // Supabase JS client filtering on joined tables can be tricky.
    // We will fetch all history for the student and filter in application code if needed,
    // or rely on client-side filtering.
    // Here we fetch sessions the student is part of.
    
    const { data, error } = await supabase
      .from('supplementary_students')
      .select(`
        *,
        supplementary_sessions!inner (
          session_date,
          content,
          classes (name)
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }); // Order by when they were added or session date?
      // Ideally order by session date, but nested ordering is complex.
      // Let's sort in JS.

    if (error) throw new Error(error.message);
    
    // Sort by session date descending
    data.sort((a, b) => {
      return new Date(b.supplementary_sessions.session_date) - new Date(a.supplementary_sessions.session_date);
    });

    return data;
  }
}
