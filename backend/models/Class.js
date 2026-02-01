import { supabase } from './supabase.js';

export class Class {
  // 모든 반 조회 (학생 수 포함 - 성능 최적화)
  static async getAll() {
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });
    
    if (classError) throw new Error(classError.message);

    // 각 반의 학생 수 계산 (한 번의 쿼리로 모든 학생의 class_name만 가져옴)
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('class_name');
    
    if (studentError) throw new Error(studentError.message);

    // 메모리 상에서 매칭하여 학생 수 계산 (서버 부하 감소)
    const classCountMap = {};
    students.forEach(s => {
      if (s.class_name) {
        s.class_name.split(',').forEach(name => {
          const trimmedName = name.trim();
          classCountMap[trimmedName] = (classCountMap[trimmedName] || 0) + 1;
        });
      }
    });

    return (classes || []).map(c => ({
      ...c,
      student_count: classCountMap[c.name] || 0
    }));
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
    const { name, description, teacher_name, progress, textbook, homework } = classData;
    const { data, error } = await supabase
      .from('classes')
      .insert({ name, description, teacher_name, progress, textbook, homework })
      .select('*')
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // 반 수정
  static async update(id, classData) {
    const { name, description, teacher_name, progress, textbook, homework } = classData;
    const { data, error } = await supabase
      .from('classes')
      .update({ 
        name, 
        description, 
        teacher_name, 
        progress, 
        textbook, 
        homework, 
        updated_at: new Date().toISOString() 
      })
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

  // 일자별 학습 로그 조회
  static async getLearningLog(classId, date) {
    const { data, error } = await supabase
      .from('class_learning_logs')
      .select('*')
      .eq('class_id', classId)
      .eq('log_date', date)
      .maybeSingle();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // 일자별 학습 로그 저장 (upsert)
  static async saveLearningLog(logData) {
    const { class_id, log_date, progress, textbook, homework, homework_deadline } = logData;
    
    const { data, error } = await supabase
      .from('class_learning_logs')
      .upsert({ 
        class_id, 
        log_date, 
        progress, 
        textbook, 
        homework,
        homework_deadline,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'class_id,log_date'
      })
      .select('*')
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // 특정 반의 모든 학습 로그 조회
  static async getAllLogs(classId) {
    const { data, error } = await supabase
      .from('class_learning_logs')
      .select('*')
      .eq('class_id', classId)
      .order('log_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  // 최근 학습 로그 날짜 목록 조회
  static async getRecentLogDates(classId, days = 14) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    const dateStr = dateLimit.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('class_learning_logs')
      .select('log_date')
      .eq('class_id', classId)
      .gte('log_date', dateStr)
      .order('log_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data.map(d => d.log_date);
  }
}
