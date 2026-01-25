import db from './database.js';

export class Setting {
  // 설정 조회
  static get(key) {
    const result = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
    return result ? result.value : null;
  }

  // 설정 저장/수정
  static set(key, value) {
    const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);

    if (existing) {
      // 업데이트
      db.prepare(`
        UPDATE settings 
        SET value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE key = ?
      `).run(value, key);
    } else {
      // 신규 등록
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
    }

    return this.get(key);
  }

  // 모든 설정 조회
  static getAll() {
    return db.prepare('SELECT * FROM settings ORDER BY key ASC').all();
  }

  // 설정 삭제
  static delete(key) {
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?');
    const result = stmt.run(key);
    return result.changes > 0;
  }
}
