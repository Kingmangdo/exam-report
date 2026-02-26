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
    const { name, description, teacher_name, category } = classData;
    const { data, error } = await supabase
      .from('classes')
      .insert({ 
        name, 
        description: description || null, 
        teacher_name: teacher_name || null,
        category: category || 'regular'
      })
      .select('*')
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // 반 수정
  static async update(id, classData) {
    // 기존 반 이름 조회 (이름 변경 시 학생들의 class_name 업데이트용)
    const existing = await this.getById(id);
    const oldName = existing?.name;
    const { name, description, teacher_name, category } = classData;
    
    const { data, error } = await supabase
      .from('classes')
      .update({ 
        name, 
        description: description || null, 
        teacher_name: teacher_name || null, 
        category: category || 'regular',
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw new Error(error.message);
    
    // 반 이름이 변경된 경우, 해당 반에 배정된 모든 학생의 class_name 업데이트
    if (oldName && name && oldName !== name) {
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, class_name')
        .or(`class_name.eq."${oldName}",class_name.like."${oldName},%",class_name.like."%,${oldName},%",class_name.like."%,${oldName}"`);
      
      if (!studentError && students) {
        for (const student of students) {
          if (student.class_name) {
            const classes = student.class_name.split(',').map(c => c.trim()).filter(c => c);
            const index = classes.indexOf(oldName);
            if (index !== -1) {
              classes[index] = name;
              const newClassName = classes.join(',');
              await supabase
                .from('students')
                .update({ class_name: newClassName })
                .eq('id', student.id);
            }
          }
        }
      }
    }
    
    return data;
  }

  // 반 삭제
  static async delete(id) {
    // 삭제 전 반 이름 조회 (학생들의 class_name에서 제거하기 위해)
    const existing = await this.getById(id);
    const className = existing?.name;
    
    // 반 삭제
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    
    // 해당 반에 배정된 모든 학생의 class_name에서 반 이름 제거
    if (className) {
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, class_name')
        .or(`class_name.eq."${className}",class_name.like."${className},%",class_name.like."%,${className},%",class_name.like."%,${className}"`);
      
      if (!studentError && students) {
        for (const student of students) {
          if (student.class_name) {
            const classes = student.class_name.split(',').map(c => c.trim()).filter(c => c);
            const filteredClasses = classes.filter(c => c !== className);
            const newClassName = filteredClasses.length > 0 ? filteredClasses.join(',') : null;
            
            await supabase
              .from('students')
              .update({ class_name: newClassName })
              .eq('id', student.id);
          }
        }
      }
    }
    
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
    const { class_id, log_date, progress, textbook, homework, homework_deadline, created_by } = logData;
    
    // 기존 로그가 있는지 확인 (최초 작성자 보존을 위해)
    const existing = await this.getLearningLog(class_id, log_date);
    
    const upsertData = { 
      class_id, 
      log_date, 
      progress, 
      textbook, 
      homework,
      homework_deadline,
      updated_by: created_by || null,
      updated_at: new Date().toISOString()
    };
    
    // 새로 작성하는 경우에만 created_by 설정 (기존 데이터가 없을 때)
    if (!existing) {
      upsertData.created_by = created_by || null;
    }

    const { data, error } = await supabase
      .from('class_learning_logs')
      .upsert(upsertData, {
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

  // 특정 날짜에 숙제 검사 예정인 로그 조회 (모든 반 대상)
  static async getHomeworkDueByDate(date) {
    const { data, error } = await supabase
      .from('class_learning_logs')
      .select('*, classes!inner(name)')
      .eq('homework_deadline', date)
      .not('homework', 'is', null);
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  // 최근 학습 로그 날짜 목록 조회 (숙제 포함)
  static async getRecentLogDates(classId, days = 21) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    const dateStr = dateLimit.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('class_learning_logs')
      .select('log_date, homework, homework_deadline')
      .eq('class_id', classId)
      .gte('log_date', dateStr)
      .order('log_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }
}
