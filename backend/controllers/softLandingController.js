import { SoftLanding } from '../models/SoftLanding.js';

export const getTargetStudents = async (req, res) => {
  try {
    const data = await SoftLanding.getTargetStudents();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExclusion = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { excluded, excludedReason } = req.body;
    
    if (excluded === undefined) {
      return res.status(400).json({ success: false, message: 'excluded 값이 필요합니다.' });
    }

    const data = await SoftLanding.updateExclusion(studentId, excluded, excludedReason);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInitialLevel = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { initialLevel } = req.body;
    
    if (!initialLevel) {
      return res.status(400).json({ success: false, message: 'initialLevel 값이 필요합니다.' });
    }

    const data = await SoftLanding.updateInitialLevel(studentId, initialLevel);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upsertCheckpoint = async (req, res) => {
  try {
    const { studentId, phase } = req.params;
    const payload = req.body;

    if (![1, 2, 3].includes(Number(phase))) {
      return res.status(400).json({ success: false, message: '유효하지 않은 phase 입니다.' });
    }

    const data = await SoftLanding.upsertCheckpoint(studentId, Number(phase), payload);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateReportLink = async (req, res) => {
  try {
    const { student_id, phase, student_name, phone_last4 } = req.body;
    if (!student_id || !phase || !student_name || !phone_last4) {
      return res.status(400).json({ success: false, message: '필수 파라미터가 누락되었습니다.' });
    }

    const token = await SoftLanding.createAccessLink(student_id, phase, student_name, phone_last4);

    res.json({
      success: true,
      data: {
        token,
        url: `/report/soft-landing/${token}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyReportAccess = async (req, res) => {
  try {
    const { token } = req.params;
    const { student_name, phone_last4 } = req.body;

    const result = await SoftLanding.verifyAccess(token, student_name, phone_last4);
    
    if (!result.valid) {
      return res.status(401).json({ success: false, message: result.message });
    }

    res.json({ success: true, data: result.access });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportData = async (req, res) => {
  try {
    const { token } = req.params;
    const { student_name, phone_last4 } = req.query;

    const result = await SoftLanding.verifyAccess(token, student_name, phone_last4);
    if (!result.valid) {
      return res.status(401).json({ success: false, message: result.message });
    }

    const { student_id, phase } = result.access;
    
    // 1. 학생 기본 정보와 soft_landing_settings (초기 레벨)
    const { data: students } = await SoftLanding.getTargetStudents();
    const student = students.find(s => s.id === student_id);

    if (!student) {
      return res.status(404).json({ success: false, message: '학생 정보를 찾을 수 없습니다.' });
    }

    const checkpoint = student.soft_landing_checkpoints.find(c => c.phase === phase);

    res.json({ 
      success: true, 
      data: {
        student: {
          name: student.name,
          grade: student.grade,
          school: student.school,
          initialLevel: student.soft_landing_settings?.initial_level
        },
        phase,
        checkpoint
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
