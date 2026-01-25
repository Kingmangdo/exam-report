import db from './database.js';

export class Score {
  // 모든 성적 조회 (필터링 가능)
  static getAll(filters = {}) {
    let query = `
      SELECT s.*, st.name as student_name, st.class_name, st.grade
      FROM scores s
      JOIN students st ON s.student_id = st.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.student_id) {
      query += ' AND s.student_id = ?';
      params.push(filters.student_id);
    }

    if (filters.exam_date) {
      query += ' AND s.exam_date = ?';
      params.push(filters.exam_date);
    }

    if (filters.class_name) {
      // scores 테이블의 class_name으로 필터링 (중복 반 지원)
      query += ' AND s.class_name = ?';
      params.push(filters.class_name);
    }

    if (filters.start_date && filters.end_date) {
      query += ' AND s.exam_date BETWEEN ? AND ?';
      params.push(filters.start_date, filters.end_date);
    }

    query += ' ORDER BY s.exam_date DESC, st.name ASC';

    return db.prepare(query).all(...params);
  }

  // 성적 ID로 조회
  static getById(id) {
    const score = db.prepare(`
      SELECT s.*, st.name as student_name, st.class_name as student_class_name, st.grade
      FROM scores s
      JOIN students st ON s.student_id = st.id
      WHERE s.id = ?
    `).get(id);
    // class_name은 scores 테이블의 것을 사용 (성적이 어느 반의 성적인지)
    return score;
  }

  // 학생 ID와 날짜로 조회
  static getByStudentAndDate(studentId, examDate, className = null) {
    if (className) {
      return db.prepare(`
        SELECT * FROM scores 
        WHERE student_id = ? AND exam_date = ? AND class_name = ?
      `).get(studentId, examDate, className);
    }
    return db.prepare(`
      SELECT * FROM scores 
      WHERE student_id = ? AND exam_date = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(studentId, examDate);
  }

  // 점수 계산 함수
  static calculateScore(correct, total) {
    if (!total || total === 0) return 0;
    return Math.round((correct / total) * 100 * 100) / 100; // 소수점 2자리
  }

  // 총점 및 평균 계산
  static calculateTotalAndAverage(rtScore, wordScore, assignmentScore, attitudeScore) {
    const total = rtScore + wordScore + assignmentScore + attitudeScore;
    const average = total / 4; // 가중치 25% 동일
    return {
      total: Math.round(total * 100) / 100,
      average: Math.round(average * 100) / 100
    };
  }

  // 반 평균 계산
  static calculateClassAverage(className, examDate) {
    if (!className || !examDate) return 0;
    
    const scores = db.prepare(`
      SELECT s.average_score
      FROM scores s
      WHERE s.class_name = ? AND s.exam_date = ?
    `).all(className, examDate);

    if (scores.length === 0) return 0;

    const sum = scores.reduce((acc, score) => acc + (score.average_score || 0), 0);
    return Math.round((sum / scores.length) * 100) / 100;
  }

  // 성적 등록
  static create(data) {
    const {
      student_id,
      exam_date,
      class_name,
      rt_total,
      rt_correct,
      word_total,
      word_correct,
      assignment_score,
      attitude_score,
      comment
    } = data;

    // 점수 계산 (null/undefined 처리)
    const rtScore = rt_total && rt_correct !== undefined 
      ? this.calculateScore(rt_correct, rt_total) 
      : 0;
    const wordScore = word_total && word_correct !== undefined 
      ? this.calculateScore(word_correct, word_total) 
      : 0;

    // 총점 및 평균 계산
    const { total, average } = this.calculateTotalAndAverage(
      rtScore,
      wordScore,
      assignment_score,
      attitude_score
    );

    // 학생 정보 조회 (반 평균 계산용)
    const student = db.prepare('SELECT class_name FROM students WHERE id = ?').get(student_id);
    if (!student) {
      throw new Error('학생을 찾을 수 없습니다.');
    }

    // 입력할 반 이름 (성적 입력 시 선택한 반)
    const targetClassName = class_name || (student.class_name ? student.class_name.split(',')[0].trim() : null);

    // 같은 날짜, 같은 학생, 같은 반의 성적이 이미 있으면 업데이트
    const existing = this.getByStudentAndDate(student_id, exam_date, targetClassName);
    
    // 반 평균 계산 (현재 입력하는 성적 포함)
    let classAverage = 0;
    if (targetClassName) {
      // 해당 반의 기존 성적들 조회 (현재 업데이트할 성적 제외)
      const existingScores = db.prepare(`
        SELECT s.average_score
        FROM scores s
        WHERE s.class_name = ? AND s.exam_date = ? AND s.id != ?
      `).all(targetClassName, exam_date, existing?.id || 0);
      
      // 기존 평균들의 합
      const existingSum = existingScores.reduce((acc, score) => acc + (score.average_score || 0), 0);
      const totalCount = existingScores.length + 1; // 현재 입력하는 성적 포함
      classAverage = Math.round(((existingSum + average) / totalCount) * 100) / 100;
    }
    
    if (existing) {
      // 업데이트
      const stmt = db.prepare(`
        UPDATE scores 
        SET rt_total = ?, rt_correct = ?, rt_score = ?,
            word_total = ?, word_correct = ?, word_score = ?,
            assignment_score = ?, attitude_score = ?,
            total_score = ?, average_score = ?,
            class_average = ?, comment = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(
        rt_total || null, rt_correct || null, rtScore,
        word_total || null, word_correct || null, wordScore,
        assignment_score || 0, attitude_score || 0,
        total, average, classAverage,
        comment || null, existing.id
      );

      return this.getById(existing.id);
    } else {
      // 신규 등록
      const stmt = db.prepare(`
        INSERT INTO scores (
          student_id, exam_date, class_name,
          rt_total, rt_correct, rt_score,
          word_total, word_correct, word_score,
          assignment_score, attitude_score,
          total_score, average_score, class_average,
          comment
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        student_id, exam_date, targetClassName,
        rt_total || null, rt_correct || null, rtScore,
        word_total || null, word_correct || null, wordScore,
        assignment_score || 0, attitude_score || 0,
        total, average, classAverage,
        comment || null
      );

      return this.getById(result.lastInsertRowid);
    }
  }

  // 성적 수정
  static update(id, data) {
    const {
      rt_total,
      rt_correct,
      word_total,
      word_correct,
      assignment_score,
      attitude_score,
      comment
    } = data;

    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    // 점수 계산
    const rtScore = this.calculateScore(rt_correct, rt_total);
    const wordScore = this.calculateScore(word_correct, word_total);

    // 총점 및 평균 계산
    const { total, average } = this.calculateTotalAndAverage(
      rtScore,
      wordScore,
      assignment_score,
      attitude_score
    );

    // 반 평균 재계산 (scores 테이블의 class_name 사용)
    const classAverage = this.calculateClassAverage(existing.class_name || null, existing.exam_date);

    const stmt = db.prepare(`
      UPDATE scores 
      SET rt_total = ?, rt_correct = ?, rt_score = ?,
          word_total = ?, word_correct = ?, word_score = ?,
          assignment_score = ?, attitude_score = ?,
          total_score = ?, average_score = ?,
          class_average = ?, comment = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      rt_total, rt_correct, rtScore,
      word_total, word_correct, wordScore,
      assignment_score, attitude_score,
      total, average, class_average,
      comment, id
    );

    return this.getById(id);
  }

  // 성적 삭제
  static delete(id) {
    // 관련 발송 이력도 삭제
    db.prepare('DELETE FROM kakao_send_history WHERE score_id = ?').run(id);
    db.prepare('DELETE FROM report_access WHERE score_id = ?').run(id);

    const stmt = db.prepare('DELETE FROM scores WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 이전 성적 조회 (비교용)
  static getPreviousScore(studentId, examDate) {
    return db.prepare(`
      SELECT * FROM scores 
      WHERE student_id = ? AND exam_date < ?
      ORDER BY exam_date DESC
      LIMIT 1
    `).get(studentId, examDate);
  }
}
