import { generateTemplate, parseExcelFile } from '../utils/excelHandler.js';
import { Student } from '../models/Student.js';

// Excel 양식 다운로드
export const downloadTemplate = (req, res) => {
  try {
    const buffer = generateTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=학생명단_양식.xlsx');
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '양식 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// Excel 파일 업로드 및 학생 일괄 등록
export const uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel 파일을 업로드해주세요.'
      });
    }

    // Excel 파일 파싱
    const students = parseExcelFile(req.file.buffer);

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: '등록할 학생 데이터가 없습니다.'
      });
    }

    // 학생 일괄 등록
    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    for (const studentData of students) {
      try {
        // 중복 확인 (이름 + 학부모 연락처)
        const existing = Student.getAll().find(
          s => s.name === studentData.name && 
               s.parent_phone === studentData.parent_phone
        );

        if (existing) {
          results.skipped.push({
            name: studentData.name,
            reason: '이미 등록된 학생입니다.'
          });
          continue;
        }

        // 학생 등록
        const student = Student.create(studentData);
        results.success.push({
          id: student.id,
          name: student.name
        });
      } catch (error) {
        results.failed.push({
          name: studentData.name,
          reason: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `${results.success.length}명 등록 완료, ${results.skipped.length}명 건너뜀, ${results.failed.length}명 실패`,
      data: {
        total: students.length,
        success: results.success.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
        details: {
          success: results.success,
          skipped: results.skipped,
          failed: results.failed
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Excel 파일 업로드 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
