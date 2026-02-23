
import { Supplementary } from '../models/Supplementary.js';
import { Student } from '../models/Student.js';

// 보강 일정 조회
export const getSessions = async (req, res) => {
  try {
    const { classId } = req.params;
    const { start_date, end_date } = req.query;
    const sessions = await Supplementary.getSessionsByClass(classId, start_date, end_date);
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 보강 일정 생성
export const createSession = async (req, res) => {
  try {
    const { class_id, session_date, content, student_ids } = req.body;
    const session = await Supplementary.createSession({ class_id, session_date, content });
    
    if (student_ids && student_ids.length > 0) {
      await Supplementary.addStudents(session.id, student_ids);
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 보강 일정 수정
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { session_date, content, student_ids } = req.body;
    const session = await Supplementary.updateSession(id, { session_date, content });

    // 학생 목록 업데이트 (기존 삭제 후 재등록 방식이 간단함)
    // 하지만 출석 상태 보존을 위해 추가/삭제 로직을 분리하는 것이 좋음.
    // 여기서는 간단하게 기존 참여 학생을 모두 삭제하고 새로 추가하는 방식은 위험(출석 데이터 유실).
    // 따라서, student_ids가 제공된 경우에만 diff를 계산해서 처리하거나, 별도 API로 학생 관리를 하는 것이 좋음.
    // 이번 구현에서는 "보강 일정 수정"에서는 날짜/내용만 수정하고, 학생 추가/제거는 별도 API로 처리하도록 유도하거나,
    // 프론트엔드에서 학생 관리를 별도로 호출하게 함.
    
    // 만약 student_ids가 explicitly passed, update participants.
    // For simplicity in this iteration, let's assume student management is done via separate endpoints or careful logic.
    // Let's implement a simple sync: find existing, remove missing, add new.
    
    // TODO: Implement student sync logic if needed. For now, just update session details.

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 보강 일정 삭제
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    await Supplementary.deleteSession(id);
    res.json({ success: true, message: '보강 일정이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 보강 참여 학생 추가
export const addStudents = async (req, res) => {
  try {
    const { id } = req.params; // session_id
    const { student_ids } = req.body;
    const result = await Supplementary.addStudents(id, student_ids);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 보강 참여 학생 제거
export const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    await Supplementary.removeStudent(id, studentId);
    res.json({ success: true, message: '학생이 보강 명단에서 제외되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 학생별 보강 히스토리 조회
export const getStudentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { start_date, end_date } = req.query;
    const history = await Supplementary.getStudentHistory(studentId, start_date, end_date);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
