import { initializeDatabase, closeDatabase } from '../models/database.js';

// 데이터베이스 초기화 스크립트
initializeDatabase();
closeDatabase();

console.log('데이터베이스 초기화가 완료되었습니다.');
