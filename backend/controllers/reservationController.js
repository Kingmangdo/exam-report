import { Reservation } from '../models/Reservation.js';
import { LevelTest } from '../models/LevelTest.js';
import { Student } from '../models/Student.js';

// ========== 예약자 CRUD ==========
export const getAllReservations = async (req, res) => {
  try {
    const filters = {
      status: req.query.status || null,
      search: req.query.search || null
    };
    const data = await Reservation.getAll(filters);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const data = await Reservation.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: '예약 정보를 찾을 수 없습니다.' });
  }
};

export const createReservation = async (req, res) => {
  try {
    const data = await Reservation.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const data = await Reservation.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    await Reservation.delete(req.params.id);
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== 입학 처리 (학생 자동 등록) ==========
export const enrollStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.getById(id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: '예약 정보를 찾을 수 없습니다.' });
    }

    // 학생 등록
    const studentData = {
      name: reservation.name,
      school: reservation.school || null,
      grade: reservation.grade || null,
      phone: reservation.student_phone || null,
      parent_phone: reservation.parent_phone || null,
      class_name: null
    };
    const student = await Student.create(studentData);

    // 예약 상태를 '입학'으로 변경
    await Reservation.update(id, { ...reservation, status: '입학' });

    res.json({
      success: true,
      message: `${reservation.name} 학생이 등록되었습니다.`,
      data: { student, reservation_id: id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== 레벨테스트 ==========
export const getLevelTest = async (req, res) => {
  try {
    const data = await LevelTest.getByReservationId(req.params.reservationId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveLevelTest = async (req, res) => {
  try {
    const data = await LevelTest.createOrUpdate(req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLevelTestById = async (req, res) => {
  try {
    const data = await LevelTest.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: '레벨테스트 결과를 찾을 수 없습니다.' });
  }
};

export const deleteLevelTest = async (req, res) => {
  try {
    await LevelTest.delete(req.params.id);
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
