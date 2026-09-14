import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.getAll();
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.update(id, req.body);
    res.json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await Class.delete(id);
    res.json({ success: true, message: '반이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClassStudents = async (req, res) => {
  try {
    const { className } = req.params;
    const students = await Class.getStudents(className);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 반에 학생 추가/이동
export const assignStudentsToClass = async (req, res) => {
  try {
    const { student_ids, class_names } = req.body;
    await Student.updateClasses(student_ids, class_names);
    res.json({ success: true, message: '학생들이 반에 배정되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLearningLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const log = await Class.getLearningLog(id, date);
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const appendHomeworkToLog = async (req, res) => {
  try {
    const { id } = req.params; // class_id
    const { log_date, homework_item, homework_items } = req.body;
    
    if (!log_date || (!homework_item && (!homework_items || homework_items.length === 0))) {
      return res.status(400).json({ success: false, message: '날짜와 과제/RT 정보가 필요합니다.' });
    }

    // 1. 기존 로그 조회
    const existingLog = await Class.getLearningLog(id, log_date);
    
    let parsedHomeworks = [];
    if (existingLog && existingLog.homework) {
      try {
        parsedHomeworks = JSON.parse(existingLog.homework);
        if (!Array.isArray(parsedHomeworks)) parsedHomeworks = [];
      } catch (e) {
        parsedHomeworks = [];
      }
    }

    // 2. 새 숙제/RT 추가
    if (homework_items && Array.isArray(homework_items)) {
      parsedHomeworks.push(...homework_items);
    } else if (homework_item) {
      parsedHomeworks.push(homework_item);
    }

    // 3. homework 배열 중 가장 빠른 마감일을 homework_deadline으로 설정 (기존 로직 동일)
    let earliestDeadline = null;
    parsedHomeworks.forEach(h => {
      if (h.deadline) {
        if (!earliestDeadline || h.deadline < earliestDeadline) {
          earliestDeadline = h.deadline;
        }
      }
    });

    const homeworkString = JSON.stringify(parsedHomeworks);
    
    // 4. 저장 (upsert)
    const logData = {
      class_id: id,
      log_date,
      progress: existingLog ? existingLog.progress : '',
      textbook: existingLog ? existingLog.textbook : '',
      homework: homeworkString,
      homework_deadline: earliestDeadline,
      created_by: existingLog ? existingLog.created_by : (req.user?.name || '알 수 없음')
    };

    const savedLog = await Class.saveLearningLog(logData);
    res.json({ success: true, data: savedLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveLearningLog = async (req, res) => {
  try {
    const { id } = req.params;
    const logData = { 
      ...req.body, 
      class_id: id,
      created_by: req.user?.name || '알 수 없음'
    };
    const savedLog = await Class.saveLearningLog(logData);
    res.json({ success: true, data: savedLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllLearningLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await Class.getAllLogs(id);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHomeworkDue = async (req, res) => {
  try {
    let today = req.query.date;
    if (!today) {
      // KST 기준으로 오늘 날짜 구하기
      const now = new Date();
      const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      today = kstTime.toISOString().split('T')[0];
    }
    const dueList = await Class.getHomeworkDueByDate(today);
    res.json({ success: true, data: dueList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentLogDates = async (req, res) => {
  try {
    const { id } = req.params;
    const dates = await Class.getRecentLogDates(id);
    res.json({ success: true, data: dates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
