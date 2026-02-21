import { BimonthlyScore } from '../models/BimonthlyScore.js';

export const createBimonthlyScore = async (req, res) => {
  try {
    const result = await BimonthlyScore.createOrUpdate(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('바이먼스리 성적 저장 에러:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBimonthlyScores = async (req, res) => {
  try {
    const filters = {
      class_name: req.query.class_name || null,
      exam_date: req.query.exam_date || null,
      student_id: req.query.student_id || null
    };
    const data = await BimonthlyScore.getAll(filters);
    res.json({ success: true, data });
  } catch (error) {
    console.error('바이먼스리 성적 조회 에러:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBimonthlyScoreById = async (req, res) => {
  try {
    const data = await BimonthlyScore.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: '성적을 찾을 수 없습니다.' });
  }
};

export const deleteBimonthlyScore = async (req, res) => {
  try {
    await BimonthlyScore.delete(req.params.id);
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBimonthlyClassAverage = async (req, res) => {
  try {
    const { class_name, exam_date } = req.query;
    if (!class_name || !exam_date) {
      return res.status(400).json({ success: false, message: 'class_name과 exam_date가 필요합니다.' });
    }
    const data = await BimonthlyScore.getClassAverage(class_name, exam_date);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
