import axios from 'axios';
import FormData from 'form-data';

/**
 * 알리고 알림톡 발송 유틸리티 (이전 직접 발송 방식)
 */
export const sendAligoAlimtalk = async (data) => {
  const {
    receiver_1,
    subject_1,
    message_1,
    emtitle_1,
    tpl_code,
    button_1
  } = data;

  // IP 확인 로그 추가 (고객센터 문의 시 필요할 수 있음)
  try {
    const ipRes = await axios.get('https://api64.ipify.org?format=json', { timeout: 5000 });
    console.log('[DEBUG] Current Server External IP:', ipRes.data.ip);
  } catch (ipErr) {
    console.log('[DEBUG] Failed to get external IP:', ipErr.message);
  }

  const apiKey = String(process.env.ALIGO_API_KEY || '').trim();
  const userId = String(process.env.ALIGO_USER_ID || '').trim();
  const sender = String(process.env.ALIGO_SENDER || '').trim();
  const senderKey = String(process.env.ALIGO_SENDER_KEY || '').trim();
  const templateCode = String(tpl_code || process.env.ALIGO_TEMPLATE_CODE || '').trim();

  const form = new FormData();
  form.append('apikey', apiKey);
  form.append('userid', userId);
  form.append('senderkey', senderKey);
  form.append('tpl_code', templateCode);
  form.append('sender', sender);
  form.append('receiver_1', receiver_1);
  form.append('subject_1', subject_1);
  form.append('message_1', message_1);
  if (emtitle_1) form.append('emtitle_1', emtitle_1);
  
  if (button_1) {
    // 알리고 가이드에 따라 JSON 문자열을 최대한 단순하게(공백 없이) 변환하여 전송
    const buttonString = JSON.stringify(button_1);
    form.append('button_1', buttonString);
    console.log('[DEBUG] Aligo Button_1 String:', buttonString);
  }

  // 환경변수 값 확인 로그
  console.log('Aligo Auth Check:', {
    userid: userId,
    key_prefix: apiKey.substring(0, 4),
    sender: sender
  });

  try {
    const response = await axios.post('https://kakaoapi.aligo.in/akv10/alimtalk/send/', form, {
      headers: form.getHeaders(),
      timeout: 10000
    });
    
    // 응답 데이터가 문자열일 경우 JSON 파싱 시도 (가끔 문자열로 오는 경우 대비)
    let result = response.data;
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result);
      } catch (e) {
        console.error('알리고 응답 파싱 실패 (문자열):', result);
      }
    }
    return result;
  } catch (error) {
    console.error('알리고 API 호출 에러:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};
