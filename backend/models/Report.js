import db from './database.js';
import crypto from 'crypto';
import { Score } from './Score.js';
import { Setting } from './Setting.js';

export class Report {
  // 고유 토큰 생성
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 성적표 링크 생성
  static createAccessLink(scoreId, studentName, phoneLast4) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    // 기존 토큰이 있으면 삭제
    db.prepare('DELETE FROM report_access WHERE score_id = ?').run(scoreId);

    // 새 토큰 생성
    const stmt = db.prepare(`
      INSERT INTO report_access (
        score_id, access_token, student_name, phone_last4, expires_at
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(scoreId, token, studentName, phoneLast4, expiresAt.toISOString());

    return token;
  }

  // 토큰으로 접근 정보 조회
  static getAccessByToken(token) {
    return db.prepare(`
      SELECT * FROM report_access 
      WHERE access_token = ?
    `).get(token);
  }

  // 접근 인증 확인
  static verifyAccess(token, studentName, phoneLast4) {
    const access = this.getAccessByToken(token);

    if (!access) {
      return {
        valid: false,
        message: '유효하지 않은 링크입니다.'
      };
    }

    // 만료 확인
    const expiresAt = new Date(access.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return {
        valid: false,
        message: '링크가 만료되었습니다. (발송 후 7일)'
      };
    }

    // 인증 정보 확인
    if (access.student_name !== studentName || access.phone_last4 !== phoneLast4) {
      return {
        valid: false,
        message: '학생 이름 또는 연락처가 일치하지 않습니다.'
      };
    }

    // 접근 시간 업데이트
    db.prepare(`
      UPDATE report_access 
      SET accessed_at = CURRENT_TIMESTAMP 
      WHERE access_token = ?
    `).run(token);

    return {
      valid: true,
      access
    };
  }

  // 성적표 데이터 조회
  static getReportData(scoreId) {
    const score = Score.getById(scoreId);

    if (!score) {
      return null;
    }

    // 학생 정보 조회
    const student = db.prepare(`
      SELECT * FROM students WHERE id = ?
    `).get(score.student_id);

    // 이전 성적 조회
    const previousScore = Score.getPreviousScore(score.student_id, score.exam_date);

    // 종합 문구 조회
    const generalComment = Setting.get('general_comment') || '';

    // 단어시험 84점 이하 확인
    const wordRetest = score.word_score !== null && score.word_score <= 84;

    return {
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        class_name: student.class_name
      },
      score: {
        id: score.id,
        exam_date: score.exam_date,
        rt: {
          total: score.rt_total || 0,
          correct: score.rt_correct || 0,
          score: score.rt_score || 0
        },
        word: {
          total: score.word_total || 0,
          correct: score.word_correct || 0,
          score: score.word_score || 0,
          retest: wordRetest
        },
        assignment: score.assignment_score || 0,
        attitude: score.attitude_score || 0,
        total: score.total_score || 0,
        average: score.average_score || 0,
        class_average: score.class_average || 0,
        comment: score.comment || ''
      },
      previous: previousScore ? {
        exam_date: previousScore.exam_date,
        average: previousScore.average_score,
        total: previousScore.total_score
      } : null,
      comparison: previousScore ? {
        average_diff: Math.round(((score.average_score || 0) - (previousScore.average_score || 0)) * 100) / 100,
        total_diff: Math.round(((score.total_score || 0) - (previousScore.total_score || 0)) * 100) / 100,
        trend: (score.average_score || 0) > (previousScore.average_score || 0) ? 'up' : 
               (score.average_score || 0) < (previousScore.average_score || 0) ? 'down' : 'stable'
      } : null,
      general_comment: generalComment
    };
  }

  // 성적표 미리보기 (인증 없이)
  static getPreview(scoreId) {
    return this.getReportData(scoreId);
  }

  // 만료된 링크 정리 (선택사항)
  static cleanupExpiredLinks() {
    const result = db.prepare(`
      DELETE FROM report_access 
      WHERE expires_at < datetime('now')
    `).run();

    return result.changes;
  }
}
