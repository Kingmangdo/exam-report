import { supabase } from './supabase.js';

export class SoftLanding {
  // 소프트랜딩 대상 학생 조회 (중등부만, 제외되지 않은 최근 12주 이내 등록 학생 등)
  static async getTargetStudents() {
    // 서버 시간 기준으로 84일 전 날짜 계산
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 84);
    const dateString = targetDate.toISOString().split('T')[0];

    // students 테이블과 soft_landing_settings 조인
    let { data, error } = await supabase
      .from('students')
      .select(`
        *,
        classes!inner(name),
        soft_landing_settings(excluded, excluded_reason, excluded_at, initial_level),
        soft_landing_checkpoints(id, phase, status, scheduled_date, completed_date, consult_method, ratings, english_score, parent_report_sent, high_school_readiness)
      `)
      .eq('status', 'active')
      .gte('created_at', dateString);

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
