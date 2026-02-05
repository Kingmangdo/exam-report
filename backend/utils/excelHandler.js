import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Excel 양식 생성
export function generateTemplate() {
  const templateData = [
    {
      '학생 이름': '홍길동',
      '학교': '청수초',
      '학년': '3',
      '반': 'A반',
      '담임': '댄T',
      '학생 연락처': '01012345678',
      '학부모 연락처1': '01087654321',
      '학부모 연락처2': '01011112222'
    },
    {
      '학생 이름': '김영희',
      '학교': '하늘빛초',
      '학년': '2',
      '반': 'B반',
      '담임': '마이크T',
      '학생 연락처': '',
      '학부모 연락처1': '01033334444',
      '학부모 연락처2': ''
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '학생명단');

  // 컬럼 너비 설정
  ws['!cols'] = [
    { wch: 15 }, // 학생 이름
    { wch: 15 }, // 학교
    { wch: 10 }, // 학년
    { wch: 10 }, // 반
    { wch: 15 }, // 담임
    { wch: 15 }, // 학생 연락처
    { wch: 15 }, // 학부모 연락처1
    { wch: 15 }  // 학부모 연락처2
  ];

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// Excel 파일 파싱
export function parseExcelFile(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // JSON으로 변환
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      throw new Error('Excel 파일에 데이터가 없습니다.');
    }
    
    // 데이터 검증 및 변환
    const students = [];
    const errors = [];
    
    data.forEach((row, index) => {
      try {
        // 다양한 컬럼명 지원 (값이 없을 경우 빈 문자열로 처리하여 에러 방지)
        const studentName = String(row['학생 이름'] || row['이름'] || row['name'] || '').trim();
        const school = String(row['학교'] || row['school'] || '').trim();
        const grade = String(row['학년'] || row['grade'] || '').trim();
        const className = String(row['반'] || row['반명'] || row['class'] || row['class_name'] || '').trim();
        const teacherName = String(row['담임'] || row['담임선생님'] || row['teacher_name'] || '').trim();
        const studentPhone = String(row['학생 연락처'] || row['연락처'] || row['phone'] || '').trim();
        const parentPhone1 = String(row['학부모 연락처1'] || row['학부모 연락처'] || row['parent_phone'] || '').trim();
        const parentPhone2 = String(row['학부모 연락처2'] || row['phone2'] || '').trim();

        // 필수 필드 검증 (이름만 필수로 제한)
        if (!studentName) {
          errors.push(`${index + 2}번째 행: 학생 이름이 없습니다.`);
          return;
        }

        // 연락처 정리 (하이픈 제거, 숫자만)
        const cleanStudentPhone = studentPhone.replace(/[^0-9]/g, '');
        const cleanParentPhone1 = parentPhone1.replace(/[^0-9]/g, '');
        const cleanParentPhone2 = parentPhone2.replace(/[^0-9]/g, '');

        students.push({
          name: studentName,
          school: school || null,
          grade: grade || null,
          class_name: className || null,
          teacher_name: teacherName || null,
          student_no: cleanStudentPhone || null,
          parent_phone: cleanParentPhone1 || null,
          phone: cleanParentPhone2 || null
        });
      } catch (error) {
        errors.push(`${index + 2}번째 행 처리 실패: ${error.message}`);
      }
    });

    if (students.length === 0 && errors.length > 0) {
      throw new Error(`등록 가능한 학생이 없습니다.\n${errors.slice(0, 5).join('\n')}`);
    }

    return students;
  } catch (error) {
    throw new Error(`Excel 파일 파싱 실패: ${error.message}`);
  }
}
