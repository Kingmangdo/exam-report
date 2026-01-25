import { Setting } from '../models/Setting.js';

// 종합 문구 조회
export const getComment = (req, res) => {
  try {
    const comment = Setting.get('general_comment');

    res.json({
      success: true,
      data: {
        key: 'general_comment',
        value: comment || ''
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '종합 문구 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 종합 문구 저장/수정
export const setComment = (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: '종합 문구(value)는 필수입니다.'
      });
    }

    Setting.set('general_comment', value);

    res.json({
      success: true,
      message: '종합 문구가 저장되었습니다.',
      data: {
        key: 'general_comment',
        value
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '종합 문구 저장 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 모든 설정 조회
export const getAllSettings = (req, res) => {
  try {
    const settings = Setting.getAll();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '설정 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 설정 조회 (키로)
export const getSetting = (req, res) => {
  try {
    const { key } = req.params;
    const value = Setting.get(key);

    res.json({
      success: true,
      data: {
        key,
        value: value || ''
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '설정 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 설정 저장/수정 (키로)
export const setSetting = (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: '설정 값(value)은 필수입니다.'
      });
    }

    Setting.set(key, value);

    res.json({
      success: true,
      message: '설정이 저장되었습니다.',
      data: {
        key,
        value
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '설정 저장 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
