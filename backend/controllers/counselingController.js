import { CounselingLog } from '../models/CounselingLog.js';

export const getLogsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const logs = await CounselingLog.getByStudentId(studentId);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLog = async (req, res) => {
  try {
    const log = await CounselingLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await CounselingLog.update(id, req.body);
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    await CounselingLog.delete(id);
    res.json({ success: true, message: '상담일지가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
