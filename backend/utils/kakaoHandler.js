import axios from 'axios';
import FormData from 'form-data';

/**
 * 알리고 알림톡 발송 유틸리티
 */
export const sendAligoAlimtalk = async (data) => {
  const {
    receiver_1,
    subject_1,
    message_1,
    tpl_code,
    button_1
  } = data;

  const form = new FormData();
  
  // 환경변수 값 확인 (로그에는 앞 4자리만 출력하여 보안 유지)
  console.log('Aligo Auth Check:', {
    userid: process.env.ALIGO_USER_ID,
    key_prefix: process.env.ALIGO_API_KEY?.substring(0, 4)
  });

  form.append('apikey', String(process.env.ALIGO_API_KEY).trim());
  form.append('userid', String(process.env.ALIGO_USER_ID).trim());
  form.append('sender', String(process.env.ALIGO_SENDER).trim());
  form.append('tpl_code', (tpl_code || process.env.ALIGO_TEMPLATE_CODE).trim());
  form.append('sender_key', String(process.env.ALIGO_SENDER_KEY || '').trim());
  
  form.append('receiver_1', receiver_1);
  form.append('subject_1', subject_1);
  form.append('message_1', message_1);
  
  if (button_1) {
    form.append('button_1', JSON.stringify(button_1));
  }

  try {
    const response = await axios.post('https://kakaoapi.aligo.in/akv10/alimtalk/send/', form, {
      headers: form.getHeaders(),
      timeout: 10000 // 10초 타임아웃 추가
    });
    return response.data;
  } catch (error) {
    console.error('알리고 API 호출 에러:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};
