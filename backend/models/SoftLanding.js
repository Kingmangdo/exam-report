import crypto from 'crypto';
import { supabase } from './supabase.js';

export class SoftLanding {
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 리포트 접근 링크 생성
  static async createAccessLink(studentId, phase, studentName, phoneLast4) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 기존 토큰 삭제
    await supabase
      .from('soft_landing_report_access')
      .delete()
      .eq('student_id', studentId)
      .eq('phase', phase);

    // 새 토큰 생성
    const { error } = await supabase
      .from('soft_landing_report_access')
      .insert({
        access_token: token,
        student_id: studentId,
        phase: phase,
        student_name: studentName,
        phone_last4: phoneLast4,
        expires_at: expiresAt.toISOString()
      });
      
    if (error) throw new Error(error.message);
    return token;
  }

  // 접근 인증 확인
  static async verifyAccess(token, studentName, phoneLast4) {
    const { data: access, error } = await supabase
      .from('soft_landing_report_access')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error || !access) {
      return { valid: false, message: '유효하지 않은 링크입니다.' };
    }

    if (new Date() > new Date(access.expires_at)) {
      return { valid: false, message: '링크가 만료되었습니다. (발송 후 7일)' };
    }

    if (access.student_name !== studentName || access.phone_last4 !== phoneLast4) {
      return { valid: false, message: '학생 이름 또는 연락처가 일치하지 않습니다.' };
    }

    await supabase
      .from('soft_landing_report_access')
      .update({ accessed_at: new Date().toISOString() })
      .eq('access_token', token);

    return { valid: true, access };
  }

  // 토큰으로 접근 정보 조회 (미리보기 용도)
  static async getAccessByToken(token) {
    const { data, error } = await supabase
      .from('soft_landing_report_access')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data || null;
  }

  // 소프트랜딩 대상 학생 조회 (중등부만, 제외되지 않은 최근 12주 이내 등록 학생 등)
  static async getTargetStudents() {
    // 서버 시간 기준으로 84일 전 날짜 계산
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 84);
    const dateString = targetDate.toISOString().split('T')[0];

    // students 테이블과 soft_landing_settings 조인
    // 테스트 환경이거나 최근 등록일 필터링이 잘 안 될 경우를 대비해 쿼리 재확인
    let { data, error } = await supabase
      .from('students')
      .select(`
        *,
        soft_landing_settings(excluded, excluded_reason, excluded_at, initial_level),
        soft_landing_checkpoints(id, phase, status, scheduled_date, completed_date, consult_method, ratings, english_score, teacher_memo, focus_memo, parent_memo, parent_report_sent, high_school_readiness)
      `)
      .eq('status', 'active')
      .gte('created_at', `${dateString}T00:00:00.000Z`);

    if (error) throw new Error(error.message);
    
    return data || [];
  }

  // 소프트랜딩 설정 가져오기/생성
  static async getSettings(studentId) {
    const { data, error } = await supabase
      .from('soft_landing_settings')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return data;
  }

  // 제외 처리 또는 복구
  static async updateExclusion(studentId, excluded, excludedReason = null) {
    const payload = {
      student_id: studentId,
      excluded,
      excluded_reason: excluded ? excludedReason : null,
      excluded_at: excluded ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('soft_landing_settings')
      .upsert(payload, { onConflict: 'student_id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // 입학 당시 레벨 설정
  static async updateInitialLevel(studentId, initialLevel) {
    const { data, error } = await supabase
      .from('soft_landing_settings')
      .upsert({ student_id: studentId, initial_level: initialLevel }, { onConflict: 'student_id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // 특정 학생의 전체 체크포인트 가져오기
  static async getCheckpoints(studentId) {
    const { data, error } = await supabase
      .from('soft_landing_checkpoints')
      .select('*')
      .eq('student_id', studentId)
      .order('phase', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  // 체크포인트 저장 (생성/수정)
  static async upsertCheckpoint(studentId, phase, payload) {
    const dataToSave = {
      student_id: studentId,
      phase,
      ...payload
    };

    const { data, error } = await supabase
      .from('soft_landing_checkpoints')
      .upsert(dataToSave, { onConflict: 'student_id, phase' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
