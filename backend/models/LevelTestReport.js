import crypto from 'crypto';
import { supabase } from './supabase.js';
import { LevelTest } from './LevelTest.js';

export class LevelTestReport {
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 레벨테스트 성적표 링크 생성
  static async createAccessLink(levelTestId, name, phoneLast4) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30일 유효

    // 기존 토큰 삭제
    await supabase
      .from('level_test_report_access')
      .delete()
      .eq('level_test_id', levelTestId);

    // 새 토큰 생성
    const { error } = await supabase
      .from('level_test_report_access')
      .insert({
        level_test_id: levelTestId,
        access_token: token,
        name,
        phone_last4: phoneLast4,
        expires_at: expiresAt.toISOString()
      });
    if (error) throw new Error(error.message);

    return token;
  }

  // 토큰으로 접근 정보 조회
  static async getAccessByToken(token) {
    const { data, error } = await supabase
      .from('level_test_report_access')
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
  static async verifyAccess(token, name, phoneLast4) {
    const access = await this.getAccessByToken(token);
    if (!access) {
      return { valid: false, message: '유효하지 않은 링크입니다.' };
    }
    if (new Date() > new Date(access.expires_at)) {
      return { valid: false, message: '링크가 만료되었습니다.' };
    }
    if (access.name !== name || access.phone_last4 !== phoneLast4) {
      return { valid: false, message: '이름 또는 연락처가 일치하지 않습니다.' };
    }

    await supabase
      .from('level_test_report_access')
      .update({ accessed_at: new Date().toISOString() })
      .eq('access_token', token);

    return { valid: true, access };
  }

  // 레벨테스트 성적표 데이터 조회
  static async getReportData(levelTestId) {
    const { data: score, error } = await supabase
      .from('level_test_scores')
      .select('*, reservations!inner(name, school, grade, student_phone, parent_phone)')
      .eq('id', levelTestId)
      .single();
    if (error) throw new Error(error.message);

    return {
      student: {
        name: score.reservations?.name,
        school: score.reservations?.school,
        grade: score.reservations?.grade
      },
      score: {
        id: score.id,
        test_date: score.test_date,
        parts: score.parts,
        total_score: score.total_score,
        average_score: score.average_score,
        overall_comment: score.overall_comment
      }
    };
  }
}
