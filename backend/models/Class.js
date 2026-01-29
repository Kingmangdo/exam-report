import { supabase } from './supabase.js';

export class Class {
  // 모든 반 조회 (학생 수 포함)
  static async getAll() {
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });
    
    if (classError) throw new Error(classError.message);

    // 각 반의 학생 수 계산
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('class_name');
    
    if (studentError) throw new Error(studentError.message);

    return (classes || []).map(c => {
      const studentCount = students.filter(s => 
        s.class_name?.split(',').map(name => name.trim()).includes(c.name)
      ).length;
      return { ...c, student_count: studentCount };
    });
  }

  // ID로 반 조회
  static async getById(id) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // 반 생성
  static async create(classData) {
    const { name, description, teacher_name } = classData;
    const { data, error } = await supabase
      .from('classes')
      .insert({ name, description, teacher_name })
      .select('*')
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // 반 수정
  static async update(id, classData) {
    const { name, description, teacher_name } = classData;
    const { data, error } = await supabase
      .from('classes')
      .update({ name, description, teacher_name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // 반 삭제
  static async delete(id) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }

  // 특정 반의 학생들 조회
  static async getStudents(className) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .ilike('class_name', `%${className}%`)
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data || [];
  }
}
