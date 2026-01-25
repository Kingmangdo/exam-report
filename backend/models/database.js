import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 데이터베이스 경로 설정
const dbPath = process.env.DATABASE_PATH || 
  path.join(__dirname, '../../database/exam_report.db');

// 데이터베이스 연결
const db = new Database(dbPath);

// 데이터베이스 초기화 함수
export function initializeDatabase() {
  // 학생 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grade TEXT,
      class_name TEXT,
      phone TEXT,
      parent_name TEXT,
      parent_phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 성적 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      exam_date TEXT NOT NULL,
      class_name TEXT,
      rt_total INTEGER,
      rt_correct INTEGER,
      rt_score REAL,
      word_total INTEGER,
      word_correct INTEGER,
      word_score REAL,
      assignment_score REAL,
      attitude_score REAL,
      total_score REAL,
      average_score REAL,
      class_average REAL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(student_id, exam_date, class_name)
    )
  `);

  // 기존 테이블에 class_name 컬럼 추가 (마이그레이션)
  try {
    db.prepare('ALTER TABLE scores ADD COLUMN class_name TEXT').run();
  } catch (error) {
    // 컬럼이 이미 존재하면 무시
  }

  // 기존 UNIQUE 제약조건 제거 후 새로운 제약조건 추가 (마이그레이션)
  try {
    // SQLite는 ALTER TABLE로 UNIQUE 제약조건을 직접 수정할 수 없으므로
    // 기존 데이터는 그대로 두고, 새로운 데이터부터 적용
  } catch (error) {
    // 무시
  }

  // 카카오톡 발송 이력 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS kakao_send_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      score_id INTEGER NOT NULL,
      parent_phone TEXT NOT NULL,
      send_status TEXT NOT NULL,
      send_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      retry_count INTEGER DEFAULT 0,
      error_message TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (score_id) REFERENCES scores(id)
    )
  `);

  // 성적표 접근 이력 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS report_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score_id INTEGER NOT NULL,
      access_token TEXT NOT NULL UNIQUE,
      student_name TEXT NOT NULL,
      phone_last4 TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      accessed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (score_id) REFERENCES scores(id)
    )
  `);

  // 설정 테이블 (종합 문구 등)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ 데이터베이스 초기화 완료');
}

// 데이터베이스 연결 종료
export function closeDatabase() {
  db.close();
}

export default db;
