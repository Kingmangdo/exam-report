import DailyBoard from '../models/DailyBoard.js';
import { Class } from '../models/Class.js';

export const getDailyBoardsByMonth = async (req, res) => {
  try {
    const { month } = req.params; // format: YYYY-MM
    const boards = await DailyBoard.getByMonth(month);
    res.json({ success: true, data: boards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDailyBoard = async (req, res) => {
  try {
    const { date } = req.params;
    
    // 1. 데일리 보드 메모/RT노트 가져오기
    const boardData = await DailyBoard.getByDate(date);
    
    // 2. 해당 날짜의 과제/RT 목록 가져오기
    const dueList = await Class.getHomeworkDueByDate(date);
    
    res.json({ 
      success: true, 
      data: {
        board: boardData,
        dueList: dueList
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveDailyBoard = async (req, res) => {
  try {
    const { date } = req.params;
    const { global_memo, rt_notes, last_modified_by } = req.body;
    
    const savedData = await DailyBoard.save(date, {
      global_memo,
      rt_notes,
      last_modified_by
    });
    
    res.json({ success: true, data: savedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
