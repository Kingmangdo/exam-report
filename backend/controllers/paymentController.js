import { Payment } from '../models/Payment.js';

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.getAll(req.query);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await Payment.getByStudentId(studentId);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.update(id, req.body);
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await Payment.delete(id);
    res.json({ success: true, message: '결제 기록이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
