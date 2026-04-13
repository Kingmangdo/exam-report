import { Attendance } from '../models/Attendance.js';
import { supabase } from '../models/supabase.js';

const getKstTimeStr = () => {
  const kstTime = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
  const h = String(kstTime.getUTCHours()).padStart(2, '0');
  const m = String(kstTime.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// 특정 반 + 날짜 출결 조회
export const getAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date 파라미터가 필요합니다.' });
    const data = await Attendance.getByClassAndDate(classId, date);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 특정 날짜 전체 출결 조회 (대시보드/관리자출결)
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const data = await Attendance.getByDate(date);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 학생별 월간 출결 조회
export const getStudentMonthly = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;
    if (!month) return res.status(400).json({ success: false, message: 'month 파라미터가 필요합니다. (예: 2026-04)' });
    const data = await Attendance.getByStudentAndMonth(studentId, month);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 월간 출결 요약 (캘린더용)
export const getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.params;
    const data = await Attendance.getMonthlySummary(month);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 출결 입력/수정
export const updateAttendance = async (req, res) => {
  try {
    const { class_id, student_id, attendance_date, status } = req.body;

    if (!class_id || !student_id || !attendance_date || !status) {
      return res.status(400).json({ success: false, message: '필수 파라미터가 누락되었습니다.' });
    }

    const timeStr = getKstTimeStr();
    let arrival_time, departure_time;

    if (status === '등원') {
      arrival_time = timeStr;
    } else if (status === '하원') {
      departure_time = timeStr;
    } else if (status === '지각') {
      arrival_time = timeStr;
    }

    const data = await Attendance.upsertAttendance({
      class_id, student_id, attendance_date, status, arrival_time, departure_time
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 연속 결석 학생 조회
export const getConsecutiveAbsent = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 3;
    const data = await Attendance.getConsecutiveAbsent(days);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 특정 날짜 전체 출결 조회 (최적화 버전)
export const getAttendanceByDateOptimized = async (req, res) => {
  try {
    const { date } = req.params;
    
    // 1. 해당 날짜의 출결 데이터 가져오기
    const attendanceData = await Attendance.getByDate(date);
    
    // 2. 전체 활성 학생 데이터 가져오기 (메모리 매칭용)
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, name, school, grade, class_name')
      .eq('status', 'active');
      
    if (studentError) throw new Error(studentError.message);

    // 3. 전체 반 정보 가져오기
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('id, name, weekdays');
      
    if (classError) throw new Error(classError.message);

    res.json({ 
      success: true, 
      data: {
        attendance: attendanceData,
        students: students,
        classes: classes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
