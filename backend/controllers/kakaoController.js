import { supabase } from '../models/supabase.js';
import { sendAligoAlimtalk } from '../utils/kakaoHandler.js';
import { Report } from '../models/Report.js';
import { BimonthlyReport } from '../models/BimonthlyReport.js';
import { BimonthlyScore } from '../models/BimonthlyScore.js';
import { Student } from '../models/Student.js';
import { Score } from '../models/Score.js';
import { Reservation } from '../models/Reservation.js';

export const sendScoreReport = async (req, res) => {
  try {
    const { score_id } = req.body;

    if (!score_id) {
      return res.status(400).json({ success: false, message: '성적 ID가 필요합니다.' });
    }

    // 1. 성적 및 학생 정보 조회
    const score = await Score.getById(score_id);
    if (!score) {
      return res.status(404).json({ success: false, message: '성적 정보를 찾을 수 없습니다.' });
    }

    const student = await Student.getById(score.student_id);
    if (!student || !student.parent_phone) {
      return res.status(404).json({ success: false, message: '학생 또는 학부모 연락처가 없습니다.' });
    }

    // 2. 성적표 접근 토큰 생성 (기존 Report 모델 활용)
    const phoneLast4 = student.parent_phone.slice(-4);
    const token = await Report.createAccessLink(score_id, student.name, phoneLast4);
    
    // 알리고 템플릿 설정에 맞춰 https:// 사용 (보안 터널 주소 반영)
    const reportUrl = `http://exam-report.vercel.app/report/${token}`;

    // 3. 알림톡 메시지 구성 (공백/들여쓰기 절대 금지 - 템플릿과 100% 일치해야 함)
    const avgScore = score.average_score || 0;
    const classAvgScore = score.class_average || 0;
    
    // 날짜 형식 (2026-02-10)
    let displayDate = score.exam_date;
    if (displayDate && displayDate.length === 8 && displayDate.includes('-')) {
      displayDate = '20' + displayDate;
    }
    
    // 템플릿 텍스트와 줄바꿈을 극한으로 일치시킴 (하단 안내 문구 포함)
    const message = `[독강영어학원 성적표 안내]

안녕하세요, ${student.name} 학생 학부모님.
독강영어학원입니다.

오늘 실시한 일일 테스트 성적표가 도착했습니다.
자녀의 학습 성취도를 아래 링크에서 확인해 주세요.

▶ 시험일자: ${displayDate}
▶ 평균점수: ${avgScore}점
▶ 반 평균: ${classAvgScore}점

[상세 성적표 확인하기]
${reportUrl}

※ 링크 접속 시 학생 이름과 학부모님 연락처 뒷 4자리로 본인 인증이 필요합니다.

오늘도 독강영어학원을 믿고 맡겨주셔서 감사합니다.
학생의 성장을 위해 최선을 다하겠습니다.`;

    const aligoData = {
      receiver_1: student.parent_phone,
      subject_1: '성적표 안내',
      message_1: message,
      tpl_code: process.env.ALIGO_TEMPLATE_CODE,
      button_1: {
        button: [
          {
            name: '채널 추가',
            linkType: 'AC'
          },
          {
            name: '성적표 확인하기',
            linkType: 'WL',
            linkTypeName: '웹링크',
            linkMo: reportUrl,
            linkPc: reportUrl
          }
        ]
      }
    };

    // 4. 알림톡 발송
    const result = await sendAligoAlimtalk(aligoData);
    
    // [CRITICAL LOG] 알리고의 실제 응답을 서버 로그에 아주 크게 찍습니다.
    console.log('================================================');
    console.log('ALIGO API RESPONSE:', JSON.stringify(result, null, 2));
    console.log('================================================');

    // 5. 발송 이력 저장
    await supabase.from('kakao_send_history').insert({
      student_id: student.id,
      score_id: score.id,
      parent_phone: student.parent_phone,
      send_status: String(result.result_code) === '1' ? 'success' : 'fail',
      error_message: result.message || null
    });

    // 성공/실패 여부와 상관없이 알리고의 메시지를 그대로 전달
    return res.json({
      success: String(result.result_code) === '1',
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('알림톡 발송 에러:', error);
    res.status(500).json({
      success: false,
      message: `알림톡 발송 중 오류가 발생했습니다: ${error.message}`
    });
  }
};

// ========== 바이먼스리 테스트 알림톡 발송 ==========
export const sendBimonthlyReport = async (req, res) => {
  try {
    const { bimonthly_score_id } = req.body;

    if (!bimonthly_score_id) {
      return res.status(400).json({ success: false, message: '바이먼스리 성적 ID가 필요합니다.' });
    }

    // 1. 성적 조회
    const score = await BimonthlyScore.getById(bimonthly_score_id);
    if (!score) {
      return res.status(404).json({ success: false, message: '바이먼스리 성적을 찾을 수 없습니다.' });
    }

    const student = await Student.getById(score.student_id);
    if (!student || !student.parent_phone) {
      return res.status(404).json({ success: false, message: '학생 또는 학부모 연락처가 없습니다.' });
    }

    // 2. 성적표 접근 토큰 생성
    const phoneLast4 = student.parent_phone.slice(-4);
    const token = await BimonthlyReport.createAccessLink(bimonthly_score_id, student.name, phoneLast4);
    const reportUrl = `http://exam-report.vercel.app/report/bimonthly/${token}`;

    // 3. 반 평균 조회
    let classAvgScore = 0;
    if (score.class_name && score.exam_date) {
      const classAvg = await BimonthlyScore.getClassAverage(score.class_name, score.exam_date);
      if (classAvg) classAvgScore = classAvg.class_average;
    }

    // 4. 월 추출
    const examMonth = score.exam_date ? parseInt(score.exam_date.split('-')[1], 10) + '월' : '';

    // 5. 알림톡 메시지 (템플릿과 100% 일치해야 함)
    const avgScore = score.average_score?.toFixed(1) || '0';
    const message = `[독강영어학원 바이먼슬리 성적표안내]

안녕하세요, ${student.name} 학생 학부모님.
독강영어학원입니다.

${examMonth} 실시한 바이먼슬리테스트 성적표가 도착했습니다.
자녀의 학습 성취도를 아래 링크에서 확인해 주세요.

▶ 우리 학생 점수: ${avgScore}점
▶ 반 평균: ${classAvgScore.toFixed(1)}점

[상세 성적표 확인하기]
${reportUrl}

※ 링크 접속 시 학생 이름과 학부모님 연락처 뒷 4자리로 본인 인증이 필요합니다.

오늘도 독강영어학원을 믿고 맡겨주셔서 감사합니다.
학생의 성장을 위해 최선을 다하겠습니다.`;

    const aligoData = {
      receiver_1: student.parent_phone,
      subject_1: '바이먼슬리 성적표 안내',
      message_1: message,
      tpl_code: process.env.ALIGO_BIMONTHLY_TEMPLATE_CODE || process.env.ALIGO_TEMPLATE_CODE,
      button_1: {
        button: [
          {
            name: '채널 추가',
            linkType: 'AC'
          },
          {
            name: '성적표 확인하기',
            linkType: 'WL',
            linkTypeName: '웹링크',
            linkMo: reportUrl,
            linkPc: reportUrl
          }
        ]
      }
    };

    // 6. 알림톡 발송
    const result = await sendAligoAlimtalk(aligoData);
    
    console.log('================================================');
    console.log('BIMONTHLY ALIGO API RESPONSE:', JSON.stringify(result, null, 2));
    console.log('================================================');

    // 7. 발송 이력 저장
    await supabase.from('bimonthly_kakao_send_history').insert({
      student_id: student.id,
      bimonthly_score_id: score.id,
      parent_phone: student.parent_phone,
      send_status: String(result.result_code) === '1' ? 'success' : 'fail',
      error_message: result.message || null
    });

    return res.json({
      success: String(result.result_code) === '1',
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('바이먼스리 알림톡 발송 에러:', error);
    res.status(500).json({
      success: false,
      message: `알림톡 발송 중 오류가 발생했습니다: ${error.message}`
    });
  }
};

// 바이먼스리 성적표 링크 생성 (URL 복사용)
export const generateBimonthlyReportLink = async (req, res) => {
  try {
    const { bimonthly_score_id } = req.body;
    if (!bimonthly_score_id) {
      return res.status(400).json({ success: false, message: '바이먼스리 성적 ID가 필요합니다.' });
    }

    const score = await BimonthlyScore.getById(bimonthly_score_id);
    if (!score) {
      return res.status(404).json({ success: false, message: '성적을 찾을 수 없습니다.' });
    }

    const student = await Student.getById(score.student_id);
    if (!student) {
      return res.status(404).json({ success: false, message: '학생 정보를 찾을 수 없습니다.' });
    }

    const phoneLast4 = student.parent_phone ? student.parent_phone.slice(-4) : '0000';
    const token = await BimonthlyReport.createAccessLink(bimonthly_score_id, student.name, phoneLast4);

    res.json({
      success: true,
      message: '바이먼스리 성적표 링크가 생성되었습니다.',
      data: {
        token,
        url: `/report/bimonthly/${token}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 바이먼스리 성적표 미리보기
export const previewBimonthlyReport = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const reportData = await BimonthlyReport.getReportData(parseInt(scoreId, 10));
    if (!reportData) {
      return res.status(404).json({ success: false, message: '성적표 데이터를 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 바이먼스리 성적표 공개 조회 (인증 후)
export const getBimonthlyReportData = async (req, res) => {
  try {
    const { token } = req.params;
    const { student_name, phone_last4 } = req.query;

    if (!student_name || !phone_last4) {
      return res.status(400).json({ success: false, message: '학생 이름과 핸드폰 뒷4자리는 필수입니다.' });
    }

    const verification = await BimonthlyReport.verifyAccess(token, student_name, phone_last4);
    if (!verification.valid) {
      return res.status(401).json({ success: false, message: verification.message });
    }

    const reportData = await BimonthlyReport.getReportData(verification.access.bimonthly_score_id);
    if (!reportData) {
      return res.status(404).json({ success: false, message: '성적표 데이터를 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 바이먼스리 성적표 인증
export const verifyBimonthlyReportAccess = async (req, res) => {
  try {
    const { token } = req.params;
    const { student_name, phone_last4 } = req.body;

    if (!student_name || !phone_last4) {
      return res.status(400).json({ success: false, message: '학생 이름과 핸드폰 뒷4자리는 필수입니다.' });
    }

    const verification = await BimonthlyReport.verifyAccess(token, student_name, phone_last4);
    if (!verification.valid) {
      return res.status(401).json({ success: false, message: verification.message });
    }

    res.json({
      success: true,
      message: '인증이 완료되었습니다.',
      data: { bimonthly_score_id: verification.access.bimonthly_score_id, verified: true }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 바이먼스리 발송 상태 조회
export const getBimonthlySendStatus = async (req, res) => {
  try {
    const { class_name, exam_date } = req.query;
    if (!class_name || !exam_date) {
      return res.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('bimonthly_kakao_send_history')
      .select('*, bimonthly_scores!inner(class_name, exam_date)')
      .eq('bimonthly_scores.class_name', class_name)
      .eq('bimonthly_scores.exam_date', exam_date)
      .order('send_at', { ascending: false });

    if (error) throw new Error(error.message);

    // 학생별로 가장 최근 발송 이력만 반환
    const latestByStudent = {};
    (data || []).forEach(row => {
      if (!latestByStudent[row.student_id]) {
        latestByStudent[row.student_id] = row;
      }
    });

    res.json({ success: true, data: Object.values(latestByStudent) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== 예약 안내 알림톡 발송 ==========
export const sendReservationNotification = async (req, res) => {
  try {
    const { reservation_id } = req.body;

    if (!reservation_id) {
      return res.status(400).json({ success: false, message: '예약 ID가 필요합니다.' });
    }

    // 1. 예약 정보 조회
    const reservation = await Reservation.getById(reservation_id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: '예약 정보를 찾을 수 없습니다.' });
    }

    if (!reservation.parent_phone) {
      return res.status(400).json({ success: false, message: '학부모 연락처가 등록되지 않았습니다.' });
    }

    // 2. 방문일시 포맷 변수 추출
    const visitDate = new Date(reservation.visit_date);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const MM = String(visitDate.getMonth() + 1).padStart(2, '0');
    const DD = String(visitDate.getDate()).padStart(2, '0');
    const HH = String(visitDate.getHours()).padStart(2, '0');
    const MIN = String(visitDate.getMinutes()).padStart(2, '0');
    const dayName = dayNames[visitDate.getDay()];

    // 3. 알림톡 메시지 구성 (알리고 템플릿과 100% 일치해야 함)
    const message = `[입학 학습진단 일정 확인 안내]
예약을 통해 신청해 주신 입학 학습진단 일정을 안내드립니다.

⭐ 일정: ${MM}월 ${DD}일 (${dayName}) ${HH}:${MIN}
소요 시간: 약 50분
장소: 헤리움리버테라스(죠스떡볶이 건물 2층) 212호
독강학원 데스크로 오시면 안내해드리겠습니다.

⭐ 학습진단은 학생과 먼저 진행되며,
진단 종료 시간에 맞춰 학부모님께서 방문해주시면 됩니다.
※ 학생만 방문하는 경우에는 미리 학원으로 알려주시기 바랍니다.
(방문이 어려우실 경우 전화 상담도 가능합니다.)

⭐ 입학 학습진단 비용은 20,000원이며, 
등록 시 전액 수강료에서 차감됩니다.
(※ 네이버 알림 쿠폰 적용 시 10,000원)

상담은 원장이 직접 진행합니다.
수업 일정에 따라 상담 시간이 일부 조율될 수 있으며, 조정이 필요한 경우 학원에서 사전에 연락드리겠습니다.

원활한 진행을 위해 예약 시간 5분 전까지 도착 부탁드립니다.

소중한 시간 내어 방문해주셔서 감사합니다.
학생의 현재 상태를 정확히 확인하고, 이후 학습 방향을 차분히 안내드리겠습니다.

☎ 문의: 031-983-0905`;

    const aligoData = {
      receiver_1: reservation.parent_phone,
      subject_1: '입학 학습진단 일정 확인 안내',
      message_1: message,
      tpl_code: process.env.ALIGO_RESERVATION_TEMPLATE_CODE || process.env.ALIGO_TEMPLATE_CODE,
      button_1: {
        button: [
          {
            name: '채널 추가',
            linkType: 'AC'
          }
        ]
      }
    };

    // 4. 알림톡 발송
    const result = await sendAligoAlimtalk(aligoData);
    
    console.log('================================================');
    console.log('RESERVATION ALIGO API RESPONSE:', JSON.stringify(result, null, 2));
    console.log('================================================');

    // 5. 발송 이력 저장
    await supabase.from('reservation_kakao_send_history').insert({
      reservation_id: reservation.id,
      parent_phone: reservation.parent_phone,
      send_status: String(result.result_code) === '1' ? 'success' : 'fail',
      error_message: result.message || null
    });

    return res.json({
      success: String(result.result_code) === '1',
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('예약 안내 알림톡 발송 에러:', error);
    res.status(500).json({
      success: false,
      message: `알림톡 발송 중 오류가 발생했습니다: ${error.message}`
    });
  }
};

// 예약 안내 발송 상태 조회
export const getReservationSendStatus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservation_kakao_send_history')
      .select('*')
      .order('send_at', { ascending: false });

    if (error) throw new Error(error.message);

    // 예약별로 가장 최근 발송 이력만 반환
    const latestByReservation = {};
    (data || []).forEach(row => {
      if (!latestByReservation[row.reservation_id]) {
        latestByReservation[row.reservation_id] = row;
      }
    });

    res.json({ success: true, data: Object.values(latestByReservation) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
