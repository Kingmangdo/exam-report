import { supabase } from './supabase.js';

export class Statistics {
  // 학생별 통계
  static async getStudentStatistics(studentId, startDate = null, endDate = null) {
    let query = supabase
      .from('scores')
      .select('exam_date, rt_score, word_score, assignment_score, attitude_score, total_score, average_score, class_average')
      .eq('student_id', studentId)
      .order('exam_date', { ascending: true });

    if (startDate && endDate) {
      query = query.gte('exam_date', startDate).lte('exam_date', endDate);
    }

    const { data: scores, error } = await query;
    if (error) throw new Error(error.message);

    if (!scores || scores.length === 0) {
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

    const rtSum = scores.reduce((sum, s) => sum + (s.rt_score || 0), 0);
    const wordSum = scores.reduce((sum, s) => sum + (s.word_score || 0), 0);
    const assignmentSum = scores.reduce((sum, s) => sum + (s.assignment_score || 0), 0);
    const attitudeSum = scores.reduce((sum, s) => sum + (s.attitude_score || 0), 0);
    const totalSum = scores.reduce((sum, s) => sum + (s.total_score || 0), 0);
    const averageSum = scores.reduce((sum, s) => sum + (s.average_score || 0), 0);

    const count = scores.length;

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
  static async getClassStatistics(className, examDate = null) {
    let query = supabase
      .from('scores')
      .select('student_id, exam_date, rt_score, word_score, assignment_score, attitude_score, total_score, average_score, class_average, students!inner(name)')
      .eq('students.class_name', className)
      .order('exam_date', { ascending: false })
      .order('name', { foreignTable: 'students', ascending: true });

    if (examDate) {
      query = query.eq('exam_date', examDate);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const scores = (data || []).map(row => ({
      student_id: row.student_id,
      student_name: row.students?.name,
      exam_date: row.exam_date,
      rt_score: row.rt_score,
      word_score: row.word_score,
      assignment_score: row.assignment_score,
      attitude_score: row.attitude_score,
      total_score: row.total_score,
      average_score: row.average_score,
      class_average: row.class_average
    }));

    if (scores.length === 0) {
      return {
        class_name: className,
        total_students: 0,
        total_exams: 0,
        class_average: 0,
        scores: []
      };
    }

    const uniqueDates = [...new Set(scores.map(s => s.exam_date))];
    const classAverages = uniqueDates.map(date => {
      const dateScores = scores.filter(s => s.exam_date === date);
      const avg = dateScores.reduce((sum, s) => sum + (s.average_score || 0), 0) / dateScores.length;
      return { date, average: Math.round(avg * 100) / 100 };
    });

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
  static async getOverallStatistics() {
    const { count: totalStudents, error: studentsError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    if (studentsError) throw new Error(studentsError.message);

    const { count: totalScores, error: scoresError } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true });
    if (scoresError) throw new Error(scoresError.message);

    const today = new Date().toISOString().split('T')[0].slice(2).replace(/-/g, '-');
    const { count: todayScores, error: todayError } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('exam_date', today);
    if (todayError) throw new Error(todayError.message);

    const recentStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentScores, error: recentError } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', recentStart);
    if (recentError) throw new Error(recentError.message);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    
    const { count: todaySends, error: sendsError } = await supabase
      .from('kakao_send_history')
      .select('*', { count: 'exact', head: true })
      .eq('send_status', 'success')
      .gte('send_at', startOfToday.toISOString())
      .lt('send_at', startOfTomorrow.toISOString());
    if (sendsError) throw new Error(sendsError.message);

    // 오늘 등원해야 하는 총원 (반이 배정된 학생 수)
    const { count: attendingStudents, error: attendingError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .not('class_name', 'is', null)
      .not('class_name', 'eq', '');
    if (attendingError) throw new Error(attendingError.message);

    return {
      total_students: totalStudents || 0,
      attending_students: attendingStudents || 0,
      today_scores: todayScores || 0,
      today_sends: todaySends || 0
    };
  }
}
