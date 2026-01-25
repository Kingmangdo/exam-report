import { Statistics } from '../models/Statistics.js';

// 학생별 통계
export const getStudentStatistics = (req, res) => {
  try {
    const { studentId } = req.params;
    const { start_date, end_date } = req.query;

    const statistics = Statistics.getStudentStatistics(
      studentId,
      start_date || null,
      end_date || null
    );

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '학생별 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 반별 통계
export const getClassStatistics = (req, res) => {
  try {
    const { classId } = req.params;
    const { exam_date } = req.query;

    const statistics = Statistics.getClassStatistics(classId, exam_date || null);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '반별 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 전체 통계 (대시보드용)
export const getOverallStatistics = (req, res) => {
  try {
    const statistics = Statistics.getOverallStatistics();

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '전체 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
