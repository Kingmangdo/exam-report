import { Student } from '../models/Student.js';

// 모든 학생 조회
export const getAllStudents = async (req, res) => {
  try {
    const filters = {
      class_name: req.query.class_name,
      grade: req.query.grade,
      search: req.query.search,
      sort_by: req.query.sort_by // 'name', 'created_at', 'created_at_desc'
    };

    const students = await Student.getAll(filters);
    res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '학생 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 학생 ID로 조회
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.getById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '학생을 찾을 수 없습니다.'
      });
    }

    // class_name을 배열로 변환
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '학생 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 학생 등록
export const createStudent = async (req, res) => {
  try {
    const { name, student_no, grade, school, teacher_name, class_name, phone, parent_name, parent_phone } = req.body;

    console.log('학생 등록 요청 데이터:', req.body);

    // 필수 필드 검증 (이름만 필수로 제한)
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '학생 이름은 필수입니다.'
      });
    }

    // 학부모 연락처가 있을 경우에만 형식 검증 (숫자만)
    if (parent_phone && !/^\d+$/.test(parent_phone.replace(/-/g, ''))) {
      return res.status(400).json({
        success: false,
        message: '학부모 연락처는 숫자만 입력 가능합니다.'
      });
    }

    const student = await Student.create({
      name,
      student_no: student_no || null,
      grade: grade || null,
      school: school || null,
      teacher_name: teacher_name || null,
      class_name: Array.isArray(class_name) ? class_name : (class_name ? [class_name] : []),
      phone: phone || null,
      parent_name: parent_name || null,
      parent_phone: parent_phone ? parent_phone.replace(/-/g, '') : null
    });

    res.status(201).json({
      success: true,
      message: '학생이 등록되었습니다.',
      data: student
    });
  } catch (error) {
    console.error('학생 등록 에러 상세:', error);
    res.status(500).json({
      success: false,
      message: '학생 등록 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 학생 수정
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingStudent = await Student.getById(id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: '학생을 찾을 수 없습니다.'
      });
    }

    // 수정 시 이름이 전달되었다면 비어있지 않은지 확인
    if (updateData.name !== undefined && !updateData.name) {
      return res.status(400).json({
        success: false,
        message: '학생 이름은 비워둘 수 없습니다.'
      });
    }

    // 수정 시 학부모 연락처가 전달되었다면 유효성 검사
    if (updateData.parent_phone !== undefined) {
      if (updateData.parent_phone) {
        const phoneOnly = updateData.parent_phone.replace(/-/g, '');
        if (!/^\d+$/.test(phoneOnly)) {
          return res.status(400).json({
            success: false,
            message: '학부모 연락처는 숫자만 입력 가능합니다.'
          });
        }
        updateData.parent_phone = phoneOnly;
      } else {
        updateData.parent_phone = null;
      }
    }

    const student = await Student.update(id, updateData);

    res.json({
      success: true,
      message: '학생 정보가 수정되었습니다.',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '학생 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 학생 삭제
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStudent = await Student.getById(id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: '학생을 찾을 수 없습니다.'
      });
    }

    const deleted = await Student.delete(id);

    if (deleted) {
      res.json({
        success: true,
        message: '학생이 삭제되었습니다.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '학생 삭제에 실패했습니다.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '학생 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 학생 일괄 반 이동
export const updateStudentsClasses = async (req, res) => {
  try {
    const { student_ids, class_names } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '학생 ID 목록이 필요합니다.'
      });
    }

    if (!class_names || (!Array.isArray(class_names) && !class_names)) {
      return res.status(400).json({
        success: false,
        message: '반 이름이 필요합니다.'
      });
    }

    const count = await Student.updateClasses(student_ids, class_names);

    res.json({
      success: true,
      message: `${count}명의 학생 반이 변경되었습니다.`,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '반 이동 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
