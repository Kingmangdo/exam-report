import { supabase } from './supabase.js';

export class Setting {
  // 설정 조회
  static async get(key) {
    const { data, error } = await supabase.from('settings').select('*').eq('key', key).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data ? data.value : null;
  }

  // 설정 저장/수정
  static async set(key, value) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data ? data.value : null;
  }

  // 모든 설정 조회
  static async getAll() {
    const { data, error } = await supabase.from('settings').select('*').order('key', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  // 설정 삭제
  static async delete(key) {
    const { error } = await supabase.from('settings').delete().eq('key', key);
    if (error) throw new Error(error.message);
    return true;
  }
}
