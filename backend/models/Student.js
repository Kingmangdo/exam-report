import db from './database.js';

export class Student {
  // 모든 학생 조회 (중복 반 지원)
  static getAll(filters = {}) {
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (filters.class_name) {
      // 콤마로 구분된 반 이름 검색 (LIKE 사용)
      query += ' AND (class_name LIKE ? OR class_name LIKE ? OR class_name = ?)';
      const className = filters.class_name;
      params.push(`${className},%`, `%,${className},%`, className);
    }

    if (filters.grade) {
      query += ' AND grade = ?';
      params.push(filters.grade);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR parent_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    const students = db.prepare(query).all(...params);
    
    // class_name을 배열로 변환 (콤마 구분)
    return students.map(student => ({
      ...student,
      classes: student.class_name ? student.class_name.split(',').map(c => c.trim()).filter(c => c) : []
    }));
  }

  // 학생 ID로 조회
  static getById(id) {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (student) {
      // class_name을 배열로 변환
      return {
        ...student,
        classes: student.class_name ? student.class_name.split(',').map(c => c.trim()).filter(c => c) : []
      };
    }
    return null;
  }

  // 학생 등록
  static create(data) {
    const { name, grade, class_name, phone, parent_name, parent_phone } = data;

    // class_name이 배열이면 콤마로 구분된 문자열로 변환
    const classNames = Array.isArray(class_name) 
      ? class_name.filter(c => c).join(',')
      : (class_name || '');

    const stmt = db.prepare(`
      INSERT INTO students (name, grade, class_name, phone, parent_name, parent_phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, grade, classNames, phone, parent_name, parent_phone);
    return this.getById(result.lastInsertRowid);
  }

  // 학생 수정
  static update(id, data) {
    const { name, grade, class_name, phone, parent_name, parent_phone } = data;

    // class_name이 배열이면 콤마로 구분된 문자열로 변환
    const classNames = Array.isArray(class_name) 
      ? class_name.filter(c => c).join(',')
      : (class_name || '');

    const stmt = db.prepare(`
      UPDATE students 
      SET name = ?, grade = ?, class_name = ?, phone = ?, 
          parent_name = ?, parent_phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(name, grade, classNames, phone, parent_name, parent_phone, id);
    return this.getById(id);
  }

  // 학생 일괄 반 이동
  static updateClasses(studentIds, classNames) {
    // classNames가 배열이면 콤마로 구분된 문자열로 변환
    const classNamesStr = Array.isArray(classNames) 
      ? classNames.filter(c => c).join(',')
      : (classNames || '');

    const placeholders = studentIds.map(() => '?').join(',');
    const stmt = db.prepare(`
      UPDATE students 
      SET class_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
    `);

    stmt.run(classNamesStr, ...studentIds);
    return studentIds.length;
  }

  // 학생 삭제
  static delete(id) {
    // 관련 성적 데이터도 함께 삭제 (CASCADE 대신 명시적 삭제)
    db.prepare('DELETE FROM scores WHERE student_id = ?').run(id);
    db.prepare('DELETE FROM kakao_send_history WHERE student_id = ?').run(id);
    
    const stmt = db.prepare('DELETE FROM students WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 학부모 연락처로 학생 조회 (성적표 인증용)
  static getByParentPhone(phoneLast4) {
    return db.prepare(`
      SELECT * FROM students 
      WHERE substr(parent_phone, -4) = ?
    `).all(phoneLast4);
  }
}
