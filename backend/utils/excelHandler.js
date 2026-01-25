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
      '학년': '3',
      '반': 'A반',
      '학생 연락처': '01012345678',
      '학부모 이름': '홍부모',
      '학부모 연락처': '01087654321'
    },
    {
      '학생 이름': '김영희',
      '학년': '2',
      '반': 'B반',
      '학생 연락처': '',
      '학부모 이름': '김부모',
      '학부모 연락처': '01011112222'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '학생명단');

  // 컬럼 너비 설정
  ws['!cols'] = [
    { wch: 15 }, // 학생 이름
    { wch: 10 }, // 학년
    { wch: 10 }, // 반
    { wch: 15 }, // 학생 연락처
    { wch: 15 }, // 학부모 이름
    { wch: 15 }  // 학부모 연락처
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
        // 다양한 컬럼명 지원
        const studentName = String(row['학생 이름'] || row['이름'] || row['name'] || '').trim();
        const grade = String(row['학년'] || row['grade'] || '').trim();
        const className = String(row['반'] || row['반명'] || row['class'] || row['class_name'] || '').trim();
        const phone = String(row['학생 연락처'] || row['연락처'] || row['phone'] || '').trim();
        const parentName = String(row['학부모 이름'] || row['학부모명'] || row['parent_name'] || '').trim();
        const parentPhone = String(row['학부모 연락처'] || row['parent_phone'] || '').trim();

        // 필수 필드 검증
        if (!studentName) {
          errors.push(`${index + 2}번째 행: 학생 이름이 없습니다.`);
          return;
        }

        if (!parentPhone) {
          errors.push(`${index + 2}번째 행: 학부모 연락처가 없습니다.`);
          return;
        }

        // 연락처 정리 (하이픈 제거, 숫자만)
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const cleanParentPhone = parentPhone.replace(/[^0-9]/g, '');

        if (cleanParentPhone.length < 10) {
          errors.push(`${index + 2}번째 행: 학부모 연락처가 올바르지 않습니다.`);
          return;
        }

        students.push({
          name: studentName,
          grade: grade || null,
          class_name: className || null,
          phone: cleanPhone || null,
          parent_name: parentName || null,
          parent_phone: cleanParentPhone
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
