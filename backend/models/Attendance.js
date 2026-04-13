import { supabase } from './supabase.js';

export class Attendance {
  // 특정 반 + 날짜의 출결 조회
  static async getByClassAndDate(classId, date) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(name, parent_phone, phone)')
      .eq('class_id', classId)
      .eq('attendance_date', date);

    if (error) throw new Error(error.message);
    return data || [];
  }

  // 특정 날짜의 전체 출결 조회 (대시보드/관리자 출결용)
  static async getByDate(date) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(name, parent_phone, phone, class_name, school, grade), classes(name)')
      .eq('attendance_date', date);

    if (error) throw new Error(error.message);
    return data || [];
  }

  // 특정 학생의 월별 출결 조회 (출결 조회 탭용)
  static async getByStudentAndMonth(studentId, yearMonth) {
    const startDate = `${yearMonth}-01`;
    const endParts = yearMonth.split('-');
    const year = parseInt(endParts[0]);
    const month = parseInt(endParts[1]);
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('attendance')
      .select('*, classes(name)')
      .eq('student_id', studentId)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  // 월간 출결 요약 (캘린더용 - 날짜별 출석/결석/지각 집계)
  static async getMonthlySummary(yearMonth) {
    const startDate = `${yearMonth}-01`;
    const endParts = yearMonth.split('-');
    const year = parseInt(endParts[0]);
    const month = parseInt(endParts[1]);
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('attendance')
      .select('attendance_date, status')
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate);

    if (error) throw new Error(error.message);

    const summary = {};
    (data || []).forEach(row => {
      const d = row.attendance_date;
      if (!summary[d]) summary[d] = { date: d, present: 0, absent: 0, late: 0, left: 0 };
      if (row.status === '등원' || row.status === '하원') summary[d].present++;
      else if (row.status === '결석') summary[d].absent++;
      else if (row.status === '지각') summary[d].late++;
    });

    return Object.values(summary);
  }

  // 출결 upsert (등원/하원/결석/지각/취소)
  static async upsertAttendance(attendanceData) {
    const { class_id, student_id, attendance_date, status, arrival_time, departure_time } = attendanceData;

    if (status === '취소') {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('class_id', class_id)
        .eq('student_id', student_id)
        .eq('attendance_date', attendance_date);
      if (error) throw new Error(error.message);
      return { status: null, arrival_time: null, departure_time: null };
    }

    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', class_id)
      .eq('student_id', student_id)
      .eq('attendance_date', attendance_date)
      .single();

    const updateData = {
      class_id,
      student_id,
      attendance_date,
      status,
      updated_at: new Date().toISOString()
    };

    if (status === '등원') {
      updateData.arrival_time = arrival_time || existing?.arrival_time;
      updateData.departure_time = existing?.departure_time;
    } else if (status === '하원') {
      updateData.arrival_time = existing?.arrival_time;
      updateData.departure_time = departure_time || existing?.departure_time;
    } else if (status === '지각') {
      updateData.arrival_time = arrival_time || existing?.arrival_time;
      updateData.departure_time = existing?.departure_time;
    } else if (status === '결석') {
      updateData.arrival_time = null;
      updateData.departure_time = null;
    }

    const { data, error } = await supabase
      .from('attendance')
      .upsert(updateData, { onConflict: 'class_id, student_id, attendance_date' })
      .select('*, students(name, parent_phone)')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // 연속 결석 학생 조회 (특이사항용)
  static async getConsecutiveAbsent(days = 3) {
    const kstTime = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
    const today = kstTime.toISOString().split('T')[0];

    const startDate = new Date(kstTime);
    startDate.setDate(startDate.getDate() - (days + 7));

    const { data, error } = await supabase
      .from('attendance')
      .select('student_id, attendance_date, status, students(name)')
      .eq('status', '결석')
      .gte('attendance_date', startDate.toISOString().split('T')[0])
      .lte('attendance_date', today)
      .order('student_id')
      .order('attendance_date', { ascending: false });

    if (error) throw new Error(error.message);

    const grouped = {};
    (data || []).forEach(row => {
      if (!grouped[row.student_id]) {
        grouped[row.student_id] = { name: row.students?.name, dates: [] };
      }
      grouped[row.student_id].dates.push(row.attendance_date);
    });

    const result = [];
    Object.entries(grouped).forEach(([studentId, info]) => {
      const sortedDates = info.dates.sort().reverse();
      let consecutive = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (prev - curr) / (1000 * 60 * 60 * 24);
        if (diff <= 2) consecutive++;
        else break;
      }
      if (consecutive >= days) {
        result.push({ student_id: parseInt(studentId), name: info.name, consecutive_days: consecutive });
      }
    });

    return result;
  }
}
