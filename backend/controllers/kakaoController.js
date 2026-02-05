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

    // 3. 알림톡 메시지 구성 (알리고 템플릿 가이드에 맞게 수정 필요)
    const message = `[독강영어학원] ${student.name} 학생의 성적표가 도착했습니다.
    
시험일자: ${score.exam_date}
반: ${score.class_name}

아래 버튼을 클릭하여 상세 성적을 확인해 주세요.
인증번호: 학부모님 휴대폰 번호 뒷 4자리`;

    const aligoData = {
      receiver_1: student.parent_phone,
      subject_1: '성적표 발송',
      message_1: message,
      tpl_code: process.env.ALIGO_TEMPLATE_CODE,
      button_1: {
        button: [
          {
            name: '성적표 확인하기',
            linkType: 'WL', // Web Link
            linkTypeName: '웹링크',
            linkMo: reportUrl,
            linkPc: reportUrl
          }
        ]
      }
    };

    // 4. 알림톡 발송
    const result = await sendAligoAlimtalk(aligoData);

    // 5. 발송 이력 저장
    await supabase.from('kakao_send_history').insert({
      student_id: student.id,
      score_id: score.id,
      parent_phone: student.parent_phone,
      send_status: result.result_code === '1' ? 'success' : 'fail',
      error_message: result.message || null
    });

    if (result.result_code !== '1') {
      throw new Error(result.message || '알림톡 발송 실패');
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
