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

  // IP 확인을 위해 외부 서비스 호출
  try {
    const ipRes = await axios.get('https://api64.ipify.org?format=json', { timeout: 5000 });
    console.log('[DEBUG] Current Server External IP:', ipRes.data.ip);
  } catch (ipErr) {
    console.log('[DEBUG] Failed to get external IP:', ipErr.message);
  }

  const form = new FormData();
  
  // 환경변수 값 확인 (보안을 위해 앞 4자리만)
  console.log('Aligo Auth Check:', {
    userid: process.env.ALIGO_USER_ID,
    key_prefix: process.env.ALIGO_API_KEY?.substring(0, 4),
    sender: process.env.ALIGO_SENDER
  });

  form.append('apikey', String(process.env.ALIGO_API_KEY || '').trim());
  form.append('userid', String(process.env.ALIGO_USER_ID || '').trim());
  form.append('sender', String(process.env.ALIGO_SENDER || '').trim());
  form.append('tpl_code', String(tpl_code || process.env.ALIGO_TEMPLATE_CODE || '').trim());
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
