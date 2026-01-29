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

// 초기 관리자 생성 (최초 1회용)
export const createFirstAdmin = async (req, res) => {
  try {
    const users = await User.getAll();
    if (users.length > 0) {
      return res.status(400).json({ success: false, message: '이미 사용자가 존재합니다.' });
    }

    const admin = await User.create({
      username: 'admin',
      password: 'admin-password-1234', // 실제 운영 시 변경 필요
      name: '원장님',
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: '초기 관리자 계정이 생성되었습니다.',
      data: admin
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
