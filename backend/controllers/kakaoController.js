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

    // 3. 알림톡 메시지 구성 (이미지 템플릿과 글자 하나하나 대조)
    const avgScore = score.average_score || 0;
    const classAvgScore = score.class_average || 0;

    // 이미지 텍스트와 100% 일치하도록 구성
    // 주의: 줄바꿈, 띄어쓰기, 변수 위치 엄격 준수
    const message = `[독강영어학원 성적표 안내]
안녕하세요, ${student.name} 학생 학부모님.
독강영어학원입니다.
오늘 실시한 일일 테스트 성적표가 도착했습니다.
자녀의 학습 성취도를 아래 링크에서 확인해 주세요.
▶ 시험일자: ${score.exam_date}
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
    
    // 알리고 응답 로그 확인
    console.log('Aligo Send Result:', result);

    // 5. 발송 이력 저장
    await supabase.from('kakao_send_history').insert({
      student_id: student.id,
      score_id: score.id,
      parent_phone: student.parent_phone,
      send_status: String(result.result_code) === '1' ? 'success' : 'fail',
      error_message: result.message || null
    });

    // result_code가 1(성공)이 아니면 에러로 처리
    if (String(result.result_code) !== '1') {
      return res.status(400).json({
        success: false,
        message: result.message || '알림톡 발송 실패',
        data: result
      });
    }

    res.json({
      success: true,
      message: '알림톡이 발송되었습니다.',
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
