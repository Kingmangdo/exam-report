import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ESM 환경에서 __dirname 확보 및 .env 절대경로 로딩
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import { supabase } from './models/supabase.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 서버 시작 시 외부 IP 로깅 (알리고 등록용)
const logExternalIP = async () => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    console.log('================================================');
    console.log(`[ALIGO_IP_CHECK] Current Server External IP: ${response.data.ip}`);
    console.log(`[ALIGO_IP_CHECK] 👉 이 IP를 알리고 [인증IP관리]에 등록하세요!`);
    console.log(`[ALIGO_IP_CHECK] Force Update: ${new Date().getTime()}`);
    console.log('================================================');
  } catch (error) {
    console.error('[ALIGO_IP_CHECK] Failed to get external IP:', error.message);
  }
};

// Supabase 연결 확인
if (!supabase) {
  console.error('❌ Supabase 초기화 실패');
  process.exit(1);
}

// Middleware
app.use(compression()); // 응답 압축 추가

// CORS 설정: Vercel Proxy를 통해 접근하므로 모든 origin 허용
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '독강영어학원 성적표 시스템 API 서버가 정상 작동 중입니다.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
import studentsRouter from './routes/students.js';
import scoresRouter from './routes/scores.js';
import statisticsRouter from './routes/statistics.js';
import compareRouter from './routes/compare.js';
import settingsRouter from './routes/settings.js';
import reportsRouter from './routes/reports.js';
import excelRouter from './routes/excel.js';
import counselingRouter from './routes/counseling.js';
import authRouter from './routes/auth.js';
import classesRouter from './routes/classes.js';
import kakaoRouter from './routes/kakao.js';

app.use('/api/students', studentsRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/compare', compareRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/excel', excelRouter);
app.use('/api/counseling', counselingRouter);
app.use('/api/auth', authRouter);
app.use('/api/classes', classesRouter);
app.use('/api/kakao', kakaoRouter);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  logExternalIP();
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`);
    console.error(`   다른 프로세스를 종료하거나 포트를 변경해주세요.`);
  } else {
    console.error('❌ 서버 시작 실패:', error);
  }
  process.exit(1);
});
