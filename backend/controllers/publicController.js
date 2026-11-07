import { Reservation } from '../models/Reservation.js';

export const submitPublicConsulting = async (req, res) => {
  try {
    const { studentName, phone, school, grade, memo } = req.body;

    if (!studentName || !phone) {
      return res.status(400).json({ success: false, message: '학생 이름과 연락처는 필수입니다.' });
    }

    // Reservation 모델의 create 함수 파라미터 구조에 맞게 데이터 가공
    // Reservation.js: { name, visit_date, school, grade, recent_english_score, notes, student_phone, parent_phone }
    // 방문일은 아직 미정이므로 현재 시간이나 임의의 텍스트 지정이 필요함 (DB 타입이 datetime이나 text냐에 따라 다름)
    // Reservation 모델을 보니 visit_date가 필수인지 확인 필요. DB 스키마상 필수가 아니면 null, 필수면 현재시간/미정. 
    // 코드를 보면: status = '예약' (또는 '신규문의' 같은 상태 추가를 할 수도 있음)
    
    // visit_date는 상담 후 정해지겠지만, DB에 NOT NULL일 수 있으니 현재 시간으로 우선 설정하고 notes에 랜딩페이지 신청임을 표기
    const visit_date = new Date().toISOString(); 
    const notes = `[홈페이지 상담신청]\n문의내용: ${memo || '없음'}`;

    const newReservation = await Reservation.create({
      name: studentName,
      visit_date: visit_date, 
      school: school || null,
      grade: grade || null,
      parent_phone: phone, // 학부모 연락처로 저장
      notes: notes,
      status: '신규문의'
    });

    res.status(201).json({
      success: true,
      message: '상담 신청이 접수되었습니다.',
      data: newReservation
    });
  } catch (error) {
    console.error('퍼블릭 상담 신청 에러:', error);
    res.status(500).json({ success: false, message: '상담 신청 처리 중 오류가 발생했습니다.', error: error.message });
  }
};
