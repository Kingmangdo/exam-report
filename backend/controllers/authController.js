import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dokgang-secret-key-2026';

// 로그인
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력해주세요.' });
    }

    const user = await User.login(username, password);
    if (!user) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 현재 사용자 정보 확인
export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

// 초기 계정 생성 (최초 1회용)
export const createFirstAdmin = async (req, res) => {
  try {
    const users = await User.getAll();
    
    // 이미 admin 계정이 있는 경우에도 나머지 계정이 없으면 생성할 수 있도록 로직 변경
    const existingUsernames = users.map(u => u.username);
    const created = [];

    // 1. 원장님 계정
    if (!existingUsernames.includes('admin')) {
      await User.create({
        username: 'admin',
        password: 'admin-password-1234',
        name: '원장님',
        role: 'admin'
      });
      created.push('admin');
    }

    // 2. 강사 계정 2개
    if (!existingUsernames.includes('teacher1')) {
      await User.create({
        username: 'teacher1',
        password: 'teacher-pass-1',
        name: '댄T',
        role: 'instructor'
      });
      created.push('teacher1');
    }
    if (!existingUsernames.includes('teacher2')) {
      await User.create({
        username: 'teacher2',
        password: 'teacher-pass-2',
        name: '마이크T',
        role: 'instructor'
      });
      created.push('teacher2');
    }

    // 3. 공통 계정 3개 (강사 권한)
    if (!existingUsernames.includes('staff1')) {
      await User.create({
        username: 'staff1',
        password: 'staff-pass-1',
        name: '공통1',
        role: 'instructor'
      });
      created.push('staff1');
    }
    if (!existingUsernames.includes('staff2')) {
      await User.create({
        username: 'staff2',
        password: 'staff-pass-2',
        name: '공통2',
        role: 'instructor'
      });
      created.push('staff2');
    }
    if (!existingUsernames.includes('staff3')) {
      await User.create({
        username: 'staff3',
        password: 'staff-pass-3',
        name: '공통3',
        role: 'instructor'
      });
      created.push('staff3');
    }

    if (created.length === 0) {
      return res.status(400).json({ success: false, message: '이미 모든 계정이 존재합니다.' });
    }

    res.status(201).json({
      success: true,
      message: `${created.join(', ')} 계정이 생성되었습니다.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 모든 사용자 조회 (관리자 전용)
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '권한이 없습니다.' });
    }
    const users = await User.getAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 사용자 정보 수정 (관리자 전용)
export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '권한이 없습니다.' });
    }
    const { id } = req.params;
    const updatedUser = await User.update(id, req.body);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 사용자 삭제 (관리자 전용)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '권한이 없습니다.' });
    }
    const { id } = req.params;
    
    // 자기 자신은 삭제 불가
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: '자기 자신은 삭제할 수 없습니다.' });
    }

    await User.delete(id);
    res.json({ success: true, message: '사용자가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
