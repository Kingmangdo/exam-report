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
