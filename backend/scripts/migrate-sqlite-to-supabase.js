import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { supabase } from '../models/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlitePath = process.env.SQLITE_PATH ||
  path.join(__dirname, '../../database/exam_report.db');

const sqlite = new Database(sqlitePath, { readonly: true });

const chunk = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const insertBatch = async (table, rows) => {
  const batches = chunk(rows, 500);
  for (const batch of batches) {
    const { error } = await supabase.from(table).insert(batch);
    if (error) throw new Error(`[${table}] ${error.message}`);
  }
};

const main = async () => {
  console.log('SQLite 경로:', sqlitePath);

  const students = sqlite.prepare('SELECT * FROM students').all();
  const scores = sqlite.prepare('SELECT * FROM scores').all();
  const reportAccess = sqlite.prepare('SELECT * FROM report_access').all();
  const kakaoHistory = sqlite.prepare('SELECT * FROM kakao_send_history').all();
  const settings = sqlite.prepare('SELECT * FROM settings').all();

  // 기존 데이터 삭제 (FK 순서 고려)
  await supabase.from('report_access').delete().neq('id', 0);
  await supabase.from('kakao_send_history').delete().neq('id', 0);
  await supabase.from('scores').delete().neq('id', 0);
  await supabase.from('students').delete().neq('id', 0);
  await supabase.from('settings').delete().neq('id', 0);

  if (students.length) await insertBatch('students', students);
  if (scores.length) await insertBatch('scores', scores);
  if (reportAccess.length) await insertBatch('report_access', reportAccess);
  if (kakaoHistory.length) await insertBatch('kakao_send_history', kakaoHistory);
  if (settings.length) await insertBatch('settings', settings);

  console.log('✅ 마이그레이션 완료');
  process.exit(0);
};

main().catch((error) => {
  console.error('❌ 마이그레이션 실패:', error);
  process.exit(1);
});
