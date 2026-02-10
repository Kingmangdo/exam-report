import { supabase } from '../models/supabase.js';
import { sendAligoAlimtalk } from '../utils/kakaoHandler.js';
import { Report } from '../models/Report.js';
import { Student } from '../models/Student.js';
import { Score } from '../models/Score.js';

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
    
    // 실제 배정된 도메인 주소로 변경 필요 (현재는 Vercel 주소 기준)
    const reportUrl = `https://exam-report.vercel.app/report/${token}`;

    // 3. 알림톡 메시지 구성 (공백/들여쓰기 절대 금지 - 템플릿과 100% 일치해야 함)
    const avgScore = score.average_score || 0;
    const classAvgScore = score.class_average || 0;
    
    // 날짜 형식 (템플릿에 따라 26-02-10 또는 2026-02-10 중 선택)
    // 일단 2026-02-10 형식을 유지하되, 템플릿과 대조 필요
    let displayDate = score.exam_date;
    if (displayDate && displayDate.length === 8 && displayDate.includes('-')) {
      displayDate = '20' + displayDate;
    }
    
    // 템플릿 텍스트와 줄바꿈을 극한으로 일치시킴 (불필요한 빈 줄 제거 시도)
    const message = `[독강영어학원 성적표 안내]
안녕하세요, ${student.name} 학생 학부모님.
독강영어학원입니다.

오늘 실시한 일일 테스트 성적표가 도착했습니다.
자녀의 학습 성취도를 아래 링크에서 확인해 주세요.

▶ 시험일자: ${displayDate}
▶ 평균점수: ${avgScore}점
▶ 반 평균: ${classAvgScore}점

[상세 성적표 확인하기]
${reportUrl}`;

    const aligoData = {
      receiver_1: student.parent_phone,
      subject_1: '성적표 안내',
      message_1: message,
      tpl_code: process.env.ALIGO_TEMPLATE_CODE,
      button_1: {
        button: [
          {
            name: '성적표 확인하기',
            linkType: 'WL',
            linkTypeName: '웹링크',
            linkMo: reportUrl,
            linkPc: reportUrl
          },
          {
            name: '채널추가하기',
            linkType: 'AC',
            linkTypeName: '채널추가'
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
