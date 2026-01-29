import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.getAll();
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.update(id, req.body);
    res.json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await Class.delete(id);
    res.json({ success: true, message: '반이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClassStudents = async (req, res) => {
  try {
    const { className } = req.params;
    const students = await Class.getStudents(className);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 반에 학생 추가/이동
export const assignStudentsToClass = async (req, res) => {
  try {
    const { student_ids, class_names } = req.body;
    await Student.updateClasses(student_ids, class_names);
    res.json({ success: true, message: '학생들이 반에 배정되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
