import axios from 'axios';
import FormData from 'form-data';

/**
 * 알리고 알림톡 발송 유틸리티 (토큰 발급 방식 적용)
 */
export const sendAligoAlimtalk = async (data) => {
  const {
    receiver_1,
    subject_1,
    message_1,
    tpl_code,
    button_1
  } = data;

  const apiKey = String(process.env.ALIGO_API_KEY || '').trim();
  const userId = String(process.env.ALIGO_USER_ID || '').trim();
  const sender = String(process.env.ALIGO_SENDER || '').trim();
  const senderKey = String(process.env.ALIGO_SENDER_KEY || '').trim();
  const templateCode = String(tpl_code || process.env.ALIGO_TEMPLATE_CODE || '').trim();

  try {
    // 1. 토큰 생성 요청 (인증 오류 방지를 위해 먼저 토큰을 받아옵니다)
    const tokenForm = new FormData();
    tokenForm.append('apikey', apiKey);
    tokenForm.append('userid', userId);
    tokenForm.append('type', 'h'); // 유효시간 타입: h(시)
    tokenForm.append('time', '1'); // 유효시간: 1시간

    console.log('[DEBUG] Requesting Aligo Token...');
    const tokenResponse = await axios.post('https://kakaoapi.aligo.in/akv10/token/create/1/h/', tokenForm, {
      headers: tokenForm.getHeaders(),
      timeout: 10000
    });

    if (tokenResponse.data.code !== 0) {
      console.error('[DEBUG] Token Creation Failed:', tokenResponse.data);
      // 토큰 생성 실패 시에도 IP 에러가 날 수 있으므로 상세 에러 출력
      throw new Error(`토큰 생성 실패: ${tokenResponse.data.message} (Code: ${tokenResponse.data.code})`);
    }

    const token = tokenResponse.data.token;
    console.log('[DEBUG] Token Created Successfully');

    // 2. 알림톡 발송 요청 (받아온 토큰 사용)
    const sendForm = new FormData();
    sendForm.append('apikey', apiKey);
    sendForm.append('userid', userId);
    sendForm.append('token', token); // 발급받은 토큰 추가
    sendForm.append('senderkey', senderKey);
    sendForm.append('tpl_code', templateCode);
    sendForm.append('sender', sender);
    sendForm.append('receiver_1', receiver_1);
    sendForm.append('subject_1', subject_1);
    sendForm.append('message_1', message_1);

    if (button_1) {
      sendForm.append('button_1', JSON.stringify(button_1));
    }

    console.log('[DEBUG] Sending Alimtalk with Token...');
    const response = await axios.post('https://kakaoapi.aligo.in/akv10/alimtalk/send/', sendForm, {
      headers: sendForm.getHeaders(),
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    console.error('알리고 API 호출 최종 에러:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};
