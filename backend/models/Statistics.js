import db from './database.js';

export class Statistics {
  // 학생별 통계
  static getStudentStatistics(studentId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        s.exam_date,
        s.rt_score,
        s.word_score,
        s.assignment_score,
        s.attitude_score,
        s.total_score,
        s.average_score,
        s.class_average
      FROM scores s
      WHERE s.student_id = ?
    `;
    const params = [studentId];

    if (startDate && endDate) {
      query += ' AND s.exam_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY s.exam_date ASC';

    const scores = db.prepare(query).all(...params);

    if (scores.length === 0) {
      return {
        student_id: studentId,
        total_exams: 0,
        average_scores: {
          rt: 0,
          word: 0,
          assignment: 0,
          attitude: 0,
          total: 0,
          average: 0
        },
        trend: 'no_data',
        scores: []
      };
    }

    // 평균 계산
    const rtSum = scores.reduce((sum, s) => sum + (s.rt_score || 0), 0);
    const wordSum = scores.reduce((sum, s) => sum + (s.word_score || 0), 0);
    const assignmentSum = scores.reduce((sum, s) => sum + (s.assignment_score || 0), 0);
    const attitudeSum = scores.reduce((sum, s) => sum + (s.attitude_score || 0), 0);
    const totalSum = scores.reduce((sum, s) => sum + (s.total_score || 0), 0);
    const averageSum = scores.reduce((sum, s) => sum + (s.average_score || 0), 0);

    const count = scores.length;

    // 추이 분석 (최근 2개 비교)
    let trend = 'stable';
    if (scores.length >= 2) {
      const recent = scores[scores.length - 1].average_score;
      const previous = scores[scores.length - 2].average_score;
      if (recent > previous) {
        trend = 'up';
      } else if (recent < previous) {
        trend = 'down';
      }
    }

    return {
      student_id: studentId,
      total_exams: count,
      average_scores: {
        rt: Math.round((rtSum / count) * 100) / 100,
        word: Math.round((wordSum / count) * 100) / 100,
        assignment: Math.round((assignmentSum / count) * 100) / 100,
        attitude: Math.round((attitudeSum / count) * 100) / 100,
        total: Math.round((totalSum / count) * 100) / 100,
        average: Math.round((averageSum / count) * 100) / 100
      },
      trend,
      scores
    };
  }

  // 반별 통계
  static getClassStatistics(className, examDate = null) {
    let query = `
      SELECT 
        s.student_id,
        st.name as student_name,
        s.exam_date,
        s.rt_score,
        s.word_score,
        s.assignment_score,
        s.attitude_score,
        s.total_score,
        s.average_score,
        s.class_average
      FROM scores s
      JOIN students st ON s.student_id = st.id
      WHERE st.class_name = ?
    `;
    const params = [className];

    if (examDate) {
      query += ' AND s.exam_date = ?';
      params.push(examDate);
    }

    query += ' ORDER BY s.exam_date DESC, st.name ASC';

    const scores = db.prepare(query).all(...params);

    if (scores.length === 0) {
      return {
        class_name: className,
        total_students: 0,
        total_exams: 0,
        class_average: 0,
        scores: []
      };
    }

    // 반 평균 계산
    const uniqueDates = [...new Set(scores.map(s => s.exam_date))];
    const classAverages = uniqueDates.map(date => {
      const dateScores = scores.filter(s => s.exam_date === date);
      const avg = dateScores.reduce((sum, s) => sum + (s.average_score || 0), 0) / dateScores.length;
      return { date, average: Math.round(avg * 100) / 100 };
    });

    // 전체 반 평균
    const overallAverage = scores.reduce((sum, s) => sum + (s.average_score || 0), 0) / scores.length;

    return {
      class_name: className,
      total_students: new Set(scores.map(s => s.student_id)).size,
      total_exams: scores.length,
      class_average: Math.round(overallAverage * 100) / 100,
      class_averages_by_date: classAverages,
      scores
    };
  }

  // 전체 통계 (대시보드용)
  static getOverallStatistics() {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get();
    const totalScores = db.prepare('SELECT COUNT(*) as count FROM scores').get();
    
    // 오늘 성적 입력 수
    const today = new Date().toISOString().split('T')[0].slice(2).replace(/-/g, '-');
    const todayScores = db.prepare(`
      SELECT COUNT(*) as count 
      FROM scores 
      WHERE exam_date = ?
    `).get(today);

    // 최근 성적 입력 (7일)
    const recentScores = db.prepare(`
      SELECT COUNT(*) as count
      FROM scores
      WHERE created_at >= datetime('now', '-7 days')
    `).get();

    // 오늘 발송 수
    const todaySends = db.prepare(`
      SELECT COUNT(*) as count
      FROM kakao_send_history
      WHERE date(send_at) = date('now')
    `).get();

    return {
      total_students: totalStudents.count,
      total_scores: totalScores.count,
      today_scores: todayScores.count,
      recent_scores: recentScores.count,
      today_sends: todaySends.count
    };
  }
}
