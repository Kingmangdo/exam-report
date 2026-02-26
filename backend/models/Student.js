import { supabase } from './supabase.js';

const toClassNames = (class_name) => {
  if (Array.isArray(class_name)) {
    return class_name.filter(c => c).join(',');
  }
  return class_name || '';
};

const withClasses = (student) => ({
  ...student,
  classes: student.class_name ? student.class_name.split(',').map(c => c.trim()).filter(c => c) : []
});

export class Student {
  // 모든 학생 조회 (중복 반 지원)
  static async getAll(filters = {}) {
    // 정렬 옵션: 'name' (기본값), 'created_at', 'created_at_desc'
    const sortBy = filters.sort_by || 'name';
    const ascending = sortBy === 'created_at' ? true : (sortBy === 'created_at_desc' ? false : true);
    const orderColumn = sortBy === 'created_at' || sortBy === 'created_at_desc' ? 'created_at' : 'name';
    
    let query = supabase.from('students').select('*').order(orderColumn, { ascending });

    if (filters.class_name) {
      const className = filters.class_name;
      // class_name이 쉼표로 구분된 문자열이므로, 정확한 일치를 위해 like 패턴 사용
      // 1. "A" (정확히 일치)
      // 2. "A,..." (시작)
      // 3. "...,A,..." (중간)
      // 4. "...,A" (끝)
      query = query.or(
        `class_name.eq."${className}",class_name.like."${className},%",class_name.like."%,${className},%",class_name.like."%,${className}"`
      );
    }

    if (filters.grade) {
      query = query.eq('grade', filters.grade);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.ilike('name', searchTerm);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map(withClasses);
  }

  // 학생 ID로 조회
  static async getById(id) {
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data ? withClasses(data) : null;
  }

  // 학생 등록
  static async create(data) {
    const { name, student_no, grade, school, teacher_name, class_name, phone, parent_name, parent_phone, monthly_tuition, created_at } = data;
    const classNames = toClassNames(class_name);

    const insertData = {
      name,
      student_no: student_no || null,
      grade: grade || null,
      school: school || null,
      teacher_name: teacher_name || null,
      class_name: classNames || null,
      phone: phone || null,
      parent_name: parent_name || null,
      parent_phone,
      monthly_tuition: monthly_tuition || 0
    };

    // 등록일시가 지정된 경우 사용, 없으면 DB 기본값(now()) 사용
    if (created_at) {
      insertData.created_at = created_at;
    }

    const { data: inserted, error } = await supabase
      .from('students')
      .insert(insertData)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return withClasses(inserted);
  }

  // 학생 수정 (전달된 필드만 업데이트)
  static async update(id, data) {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.student_no !== undefined) updateData.student_no = data.student_no || null;
    if (data.grade !== undefined) updateData.grade = data.grade || null;
    if (data.school !== undefined) updateData.school = data.school || null;
    if (data.teacher_name !== undefined) updateData.teacher_name = data.teacher_name || null;
    if (data.class_name !== undefined) updateData.class_name = toClassNames(data.class_name);
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.parent_name !== undefined) updateData.parent_name = data.parent_name || null;
    if (data.parent_phone !== undefined) updateData.parent_phone = data.parent_phone;
    if (data.monthly_tuition !== undefined) updateData.monthly_tuition = data.monthly_tuition;
    // 등록일시 수정도 지원 (날짜 변경이 필요한 경우)
    if (data.created_at !== undefined) updateData.created_at = data.created_at;

    const { data: updated, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return withClasses(updated);
  }

  // 학생 일괄 반 이동
  static async updateClasses(studentIds, classNames) {
    const classNamesStr = toClassNames(classNames);
    const { error } = await supabase
      .from('students')
      .update({
        class_name: classNamesStr || null,
        updated_at: new Date().toISOString()
      })
      .in('id', studentIds);
    if (error) throw new Error(error.message);
    return studentIds.length;
  }

  // 학생 삭제
  static async delete(id) {
    const deleteScores = supabase.from('scores').delete().eq('student_id', id);
    const deleteHistory = supabase.from('kakao_send_history').delete().eq('student_id', id);
    const deleteStudent = supabase.from('students').delete().eq('id', id);

    const results = await Promise.all([deleteScores, deleteHistory, deleteStudent]);
    const last = results[2];
    if (last.error) throw new Error(last.error.message);
    return last.count ? last.count > 0 : true;
  }

  // 학부모 연락처로 학생 조회 (성적표 인증용)
  static async getByParentPhone(phoneLast4) {
    const pattern = `%${phoneLast4}`;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .like('parent_phone', pattern);
    if (error) throw new Error(error.message);
    return data || [];
  }
}
