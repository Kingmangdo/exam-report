import { supabase } from './supabase.js';
import bcrypt from 'bcryptjs';

export class User {
  // 사용자 로그인 확인
  static async login(username, password) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) return null;

    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) return null;

    const { password: _, ...userWithoutPassword } = data;
    return userWithoutPassword;
  }

  // 사용자 등록 (관리자용)
  static async create(userData) {
    const { username, password, name, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        name,
        role
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    const { password: _, ...userWithoutPassword } = data;
    return userWithoutPassword;
  }

  // 사용자 ID로 조회
  static async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    const { password: _, ...userWithoutPassword } = data;
    return userWithoutPassword;
  }

  // 모든 사용자 조회 (관리자용)
  static async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  // 사용자 정보 수정 (관리자용)
  static async update(id, userData) {
    const { name, role, password } = userData;
    const updateData = { name, role, updated_at: new Date().toISOString() };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    const { password: _, ...userWithoutPassword } = data;
    return userWithoutPassword;
  }

  // 사용자 삭제 (관리자용)
  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}
