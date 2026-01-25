import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './models/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 데이터베이스 초기화
try {
  initializeDatabase();
  console.log('✅ 데이터베이스 초기화 완료');
} catch (error) {
  console.error('❌ 데이터베이스 초기화 실패:', error);
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
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

app.use('/api/students', studentsRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/compare', compareRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/excel', excelRouter);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`);
    console.error(`   다른 프로세스를 종료하거나 포트를 변경해주세요.`);
  } else {
    console.error('❌ 서버 시작 실패:', error);
  }
  process.exit(1);
});
