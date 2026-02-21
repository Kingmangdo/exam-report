import crypto from 'crypto';
import { supabase } from './supabase.js';
import { BimonthlyScore } from './BimonthlyScore.js';

export class BimonthlyReport {
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 바이먼스리 성적표 링크 생성
  static async createAccessLink(bimonthlyScoreId, studentName, phoneLast4) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 기존 토큰 삭제
    await supabase
      .from('bimonthly_report_access')
      .delete()
      .eq('bimonthly_score_id', bimonthlyScoreId);

    // 새 토큰 생성
    const { error } = await supabase
      .from('bimonthly_report_access')
      .insert({
        bimonthly_score_id: bimonthlyScoreId,
        access_token: token,
        student_name: studentName,
        phone_last4: phoneLast4,
        expires_at: expiresAt.toISOString()
      });
    if (error) throw new Error(error.message);

    return token;
  }

  // 토큰으로 접근 정보 조회
  static async getAccessByToken(token) {
    const { data, error } = await supabase
      .from('bimonthly_report_access')
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
      return { valid: false, message: '유효하지 않은 링크입니다.' };
    }

    if (new Date() > new Date(access.expires_at)) {
      return { valid: false, message: '링크가 만료되었습니다. (발송 후 7일)' };
    }

    if (access.student_name !== studentName || access.phone_last4 !== phoneLast4) {
      return { valid: false, message: '학생 이름 또는 연락처가 일치하지 않습니다.' };
    }

    await supabase
      .from('bimonthly_report_access')
      .update({ accessed_at: new Date().toISOString() })
      .eq('access_token', token);

    return { valid: true, access };
  }

  // 바이먼스리 성적표 데이터 조회
  static async getReportData(bimonthlyScoreId) {
    const score = await BimonthlyScore.getById(bimonthlyScoreId);
    if (!score) return null;

    // 학생 정보 조회
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', score.student_id)
      .single();
    if (studentError) throw new Error(studentError.message);

    // 반 평균 조회
    let classAvg = null;
    if (score.class_name && score.exam_date) {
      classAvg = await BimonthlyScore.getClassAverage(score.class_name, score.exam_date);
    }

    // 최근 3개월 이력 조회 (트렌드용)
    const allScores = await BimonthlyScore.getAll({ student_id: score.student_id });
    const recentScores = allScores
      .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
      .slice(-3);

    return {
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        school: student.school,
        class_name: student.class_name
      },
      score: {
        id: score.id,
        exam_date: score.exam_date,
        class_name: score.class_name,
        parts: score.parts,
        total_score: score.total_score,
        average_score: score.average_score,
        comment: score.comment
      },
      class_average: classAvg,
      recent_scores: recentScores
    };
  }
}
