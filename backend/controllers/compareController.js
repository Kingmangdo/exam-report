import { Score } from '../models/Score.js';

// 반 평균 계산
export const getClassAverage = async (req, res) => {
  try {
    const { classId } = req.params;
    const { exam_date } = req.query;

    if (!exam_date) {
      return res.status(400).json({
        success: false,
        message: '시험일자(exam_date)는 필수입니다.'
      });
    }

    const classAverage = await Score.calculateClassAverage(classId, exam_date);

    res.json({
      success: true,
      data: {
        class_name: classId,
        exam_date,
        class_average: classAverage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '반 평균 계산 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 이전 성적과 비교
export const compareWithPrevious = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { exam_date } = req.query;

    if (!exam_date) {
      return res.status(400).json({
        success: false,
        message: '시험일자(exam_date)는 필수입니다.'
      });
    }

    // 현재 성적 조회
    const currentScore = await Score.getByStudentAndDate(studentId, exam_date);
    
    if (!currentScore) {
      return res.status(404).json({
        success: false,
        message: '해당 날짜의 성적을 찾을 수 없습니다.'
      });
    }

    // 이전 성적 조회
    const previousScore = await Score.getPreviousScore(studentId, exam_date);

    if (!previousScore) {
      return res.json({
        success: true,
        data: {
          current: currentScore,
          previous: null,
          comparison: {
            has_previous: false,
            message: '이전 성적이 없습니다.'
          }
        }
      });
    }

    // 비교 데이터 계산
    const averageDiff = currentScore.average_score - previousScore.average_score;
    const totalDiff = currentScore.total_score - previousScore.total_score;
    
    const comparison = {
      has_previous: true,
      average_diff: Math.round(averageDiff * 100) / 100,
      total_diff: Math.round(totalDiff * 100) / 100,
      trend: averageDiff > 0 ? 'up' : averageDiff < 0 ? 'down' : 'stable',
      rt_diff: Math.round((currentScore.rt_score - previousScore.rt_score) * 100) / 100,
      word_diff: Math.round((currentScore.word_score - previousScore.word_score) * 100) / 100,
      assignment_diff: Math.round((currentScore.assignment_score - previousScore.assignment_score) * 100) / 100,
      attitude_diff: Math.round((currentScore.attitude_score - previousScore.attitude_score) * 100) / 100
    };

    res.json({
      success: true,
      data: {
        current: currentScore,
        previous: previousScore,
        comparison
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '이전 성적 비교 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
