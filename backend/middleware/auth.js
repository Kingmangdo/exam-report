import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dokgang-secret-key-2026';

// 인증 확인 미들웨어
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: '유효하지 않은 사용자입니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '유효하지 않거나 만료된 토큰입니다.' });
  }
};

// 관리자 권한 확인 미들웨어
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: '관리자 권한이 필요합니다.' });
  }
};
