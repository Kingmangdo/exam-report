import { Score } from '../models/Score.js';

// 모든 성적 조회
export const getAllScores = async (req, res) => {
  try {
    const filters = {
      student_id: req.query.student_id,
      student_name: req.query.student_name,
      exam_date: req.query.exam_date,
      class_name: req.query.class_name,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const scores = await Score.getAll(filters);
    res.json({
      success: true,
      data: scores,
      count: scores.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '성적 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 성적 ID로 조회
export const getScoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const score = await Score.getById(id);

    if (!score) {
      return res.status(404).json({
        success: false,
        message: '성적을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '성적 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 성적 등록
export const createScore = async (req, res) => {
  try {
    const {
      student_id,
      exam_date,
      class_name,
      rt_total,
      rt_correct,
      word_total,
      word_correct,
      assignment_score,
      attitude_score,
      comment
    } = req.body;

    // 필수 필드 검증
    if (!student_id || !exam_date) {
      return res.status(400).json({
        success: false,
        message: '학생 ID와 시험일자는 필수입니다.'
      });
    }

    if (!class_name) {
      return res.status(400).json({
        success: false,
        message: '반 이름은 필수입니다.'
      });
    }

    // 점수 범위 검증
    if (assignment_score < 0 || assignment_score > 100) {
      return res.status(400).json({
        success: false,
        message: '과제점수는 0-100점 사이여야 합니다.'
      });
    }

    // 날짜 형식 검증 (yy-mm-dd)
    const dateRegex = /^\d{2}-\d{2}-\d{2}$/;
    if (!dateRegex.test(exam_date)) {
      return res.status(400).json({
        success: false,
        message: '날짜 형식은 yy-mm-dd여야 합니다.'
      });
    }

    // 같은 날짜, 같은 학생, 같은 반의 성적이 이미 있으면 업데이트
    const existing = await Score.getByStudentAndDate(student_id, exam_date, class_name);
    const isUpdate = !!existing;

    const score = await Score.create({
      student_id,
      exam_date,
      class_name,
      rt_total: rt_total || 0,
      rt_correct: rt_correct || 0,
      word_total: word_total || 0,
      word_correct: word_correct || 0,
      rt_details: req.body.rt_details || [],
      word_details: req.body.word_details || [],
      assignment_score: assignment_score || 0,
      comment: comment || ''
    });

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate 
        ? '성적이 업데이트되었습니다. (같은 날짜의 기존 성적을 덮어씁니다.)'
        : '성적이 등록되었습니다.',
      data: score,
      isUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '성적 등록 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 성적 수정
export const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rt_total,
      rt_correct,
      word_total,
      word_correct,
      assignment_score,
      attitude_score,
      comment
    } = req.body;

    const existingScore = await Score.getById(id);
    if (!existingScore) {
      return res.status(404).json({
        success: false,
        message: '성적을 찾을 수 없습니다.'
      });
    }

    // 점수 범위 검증
    if (assignment_score < 0 || assignment_score > 100) {
      return res.status(400).json({
        success: false,
        message: '과제점수는 0-100점 사이여야 합니다.'
      });
    }

    const score = await Score.update(id, {
      rt_total: rt_total || 0,
      rt_correct: rt_correct || 0,
      word_total: word_total || 0,
      word_correct: word_correct || 0,
      rt_details: req.body.rt_details || [],
      word_details: req.body.word_details || [],
      assignment_score: assignment_score || 0,
      comment: comment || ''
    });

    res.json({
      success: true,
      message: '성적이 수정되었습니다.',
      data: score
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '성적 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 성적 삭제
export const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const existingScore = await Score.getById(id);
    if (!existingScore) {
      return res.status(404).json({
        success: false,
        message: '성적을 찾을 수 없습니다.'
      });
    }

    const deleted = await Score.delete(id);

    if (deleted) {
      res.json({
        success: true,
        message: '성적이 삭제되었습니다.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '성적 삭제에 실패했습니다.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '성적 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
