import { Report } from '../models/Report.js';
import { Score } from '../models/Score.js';
import db from '../models/database.js';

// 성적표 링크 생성
export const generateReportLink = (req, res) => {
  try {
    const { score_id } = req.body;

    if (!score_id) {
      return res.status(400).json({
        success: false,
        message: '성적 ID(score_id)는 필수입니다.'
      });
    }

    // 성적 조회
    const score = Score.getById(score_id);
    if (!score) {
      return res.status(404).json({
        success: false,
        message: '성적을 찾을 수 없습니다.'
      });
    }

    // 학생 정보 조회
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(score.student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '학생 정보를 찾을 수 없습니다.'
      });
    }

    // 학부모 핸드폰 뒷4자리 추출
    const phoneLast4 = student.parent_phone.slice(-4);

    // 링크 생성
    const token = Report.createAccessLink(
      score_id,
      student.name,
      phoneLast4
    );

    // 링크 URL 생성 (프론트엔드 URL)
    const reportUrl = `/report/${token}`;

    res.json({
      success: true,
      message: '성적표 링크가 생성되었습니다.',
      data: {
        token,
        url: reportUrl,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7일 후
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '성적표 링크 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 성적표 접근 인증
export const verifyReportAccess = (req, res) => {
  try {
    const { token } = req.params;
    const { student_name, phone_last4 } = req.body;

    if (!student_name || !phone_last4) {
      return res.status(400).json({
        success: false,
        message: '학생 이름과 핸드폰 뒷4자리는 필수입니다.'
      });
    }

    // 인증 확인
    const verification = Report.verifyAccess(token, student_name, phone_last4);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: verification.message
      });
    }

    res.json({
      success: true,
      message: '인증이 완료되었습니다.',
      data: {
        score_id: verification.access.score_id,
        verified: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '인증 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 성적표 데이터 조회 (인증 후)
export const getReportData = (req, res) => {
  try {
    const { token } = req.params;
    const { student_name, phone_last4 } = req.query;

    if (!student_name || !phone_last4) {
      return res.status(400).json({
        success: false,
        message: '학생 이름과 핸드폰 뒷4자리는 필수입니다.'
      });
    }

    // 인증 확인
    const verification = Report.verifyAccess(token, student_name, phone_last4);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: verification.message
      });
    }

    // 성적표 데이터 조회
    const reportData = Report.getReportData(verification.access.score_id);

    if (!reportData) {
      return res.status(404).json({
        success: false,
        message: '성적표 데이터를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '성적표 데이터 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 성적표 미리보기 (관리자용, 인증 없이)
export const previewReport = (req, res) => {
  try {
    const { scoreId } = req.params;

    if (!scoreId) {
      return res.status(400).json({
        success: false,
        message: '성적 ID(scoreId)는 필수입니다.'
      });
    }

    const scoreIdNum = parseInt(scoreId, 10);
    if (isNaN(scoreIdNum)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 성적 ID입니다.'
      });
    }

    const reportData = Report.getPreview(scoreIdNum);

    if (!reportData) {
      return res.status(404).json({
        success: false,
        message: '성적표 데이터를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '성적표 미리보기 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 성적표 링크 상태 확인
export const checkReportLink = (req, res) => {
  try {
    const { token } = req.params;

    const access = Report.getAccessByToken(token);

    if (!access) {
      return res.status(404).json({
        success: false,
        message: '유효하지 않은 링크입니다.'
      });
    }

    // 만료 확인
    const expiresAt = new Date(access.expires_at);
    const now = new Date();
    const isExpired = now > expiresAt;

    res.json({
      success: true,
      data: {
        token,
        student_name: access.student_name,
        expires_at: access.expires_at,
        is_expired: isExpired,
        accessed_at: access.accessed_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '링크 상태 확인 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
