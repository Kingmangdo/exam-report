import axios from 'axios';
import FormData from 'form-data';

/**
 * 알리고 알림톡 발송 유틸리티 (이전 직접 발송 방식)
 */
export const sendAligoAlimtalk = async (data) => {
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
  const templateCode = String(data.tpl_code || process.env.ALIGO_TEMPLATE_CODE || '').trim();

  // 알리고 API는 동적으로 여러 건의 데이터를 처리할 수 있도록 되어 있습니다.
  const form = new FormData();
  form.append('apikey', apiKey);
  form.append('userid', userId);
  form.append('senderkey', senderKey);
  form.append('tpl_code', templateCode);
  form.append('sender', sender);
  
  // 전달받은 data에서 receiver_, subject_, message_, emtitle_, button_ 등 모든 동적 키를 찾아서 폼에 추가
  Object.keys(data).forEach(key => {
    if (key !== 'tpl_code' && key !== 'sender') { // 중복 제외
      if (key.startsWith('button_')) {
        const buttonString = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
        form.append(key, buttonString);
        console.log(`[DEBUG] Aligo ${key} String:`, buttonString);
      } else {
        form.append(key, data[key]);
      }
    }
  });

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
