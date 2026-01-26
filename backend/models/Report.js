import crypto from 'crypto';
import { Score } from './Score.js';
import { Setting } from './Setting.js';
import { supabase } from './supabase.js';

export class Report {
  // 고유 토큰 생성
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 성적표 링크 생성
  static async createAccessLink(scoreId, studentName, phoneLast4) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    // 기존 토큰이 있으면 삭제
    const { error: deleteError } = await supabase
      .from('report_access')
      .delete()
      .eq('score_id', scoreId);
    if (deleteError) throw new Error(deleteError.message);

    // 새 토큰 생성
    const { error: insertError } = await supabase
      .from('report_access')
      .insert({
        score_id: scoreId,
        access_token: token,
        student_name: studentName,
        phone_last4: phoneLast4,
        expires_at: expiresAt.toISOString()
      });
    if (insertError) throw new Error(insertError.message);

    return token;
  }

  // 토큰으로 접근 정보 조회
  static async getAccessByToken(token) {
    const { data, error } = await supabase
      .from('report_access')
      .select('*')
      .eq('access_token', token)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data || null;
  }

  // 접근 인증 확인
  static async verifyAccess(token, studentName, phoneLast4) {
    const access = await this.getAccessByToken(token);

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
    const { error } = await supabase
      .from('report_access')
      .update({ accessed_at: new Date().toISOString() })
      .eq('access_token', token);
    if (error) throw new Error(error.message);

    return {
      valid: true,
      access
    };
  }

  // 성적표 데이터 조회
  static async getReportData(scoreId) {
    const score = await Score.getById(scoreId);

    if (!score) {
      return null;
    }

    // 학생 정보 조회
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', score.student_id)
      .single();
    if (studentError) throw new Error(studentError.message);

    // 이전 성적 조회
    const previousScore = await Score.getPreviousScore(score.student_id, score.exam_date);

    // 최근 3주(주 2회 기준 6회) 성적 조회
    const recentScores = await Score.getRecentScores(
      score.student_id,
      score.exam_date,
      6,
      score.class_name || null
    );

    // 종합 문구 조회
    const generalComment = (await Setting.get('general_comment')) || '';

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
      recent_scores: recentScores.map(item => ({
        id: item.id,
        exam_date: item.exam_date,
        rt_score: item.rt_score || 0,
        word_score: item.word_score || 0,
        assignment_score: item.assignment_score || 0,
        attitude_score: item.attitude_score || 0,
        total_score: item.total_score || 0,
        average_score: item.average_score || 0,
        class_average: item.class_average || 0
      })),
      general_comment: generalComment
    };
  }

  // 성적표 미리보기 (인증 없이)
  static async getPreview(scoreId) {
    return this.getReportData(scoreId);
  }

  // 만료된 링크 정리 (선택사항)
  static async cleanupExpiredLinks() {
    const { error } = await supabase
      .from('report_access')
      .delete()
      .lt('expires_at', new Date().toISOString());
    if (error) throw new Error(error.message);
    return true;
  }
}
