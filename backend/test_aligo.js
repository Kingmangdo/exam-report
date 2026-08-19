import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import axios from 'axios';
import FormData from 'form-data';

async function test() {
  const form = new FormData();
  form.append('apikey', process.env.ALIGO_API_KEY || '');
  form.append('userid', process.env.ALIGO_USER_ID || '');
  form.append('senderkey', process.env.ALIGO_SENDER_KEY || '');
  form.append('tpl_code', 'UK_3821');
  form.append('sender', process.env.ALIGO_SENDER || '');
  form.append('receiver_1', '01000000000');
  form.append('subject_1', '상담 안내');
  form.append('message_1', `[독강영어전문학원 상담안내]

■ 이름 : 홍길동
■ 일자 : 2026-05-21
■ 내용 : 테스트

추가로 문의하실 점은 학생의 
【학년 & 이름】과 함께 채팅창에 
보내주시면 확인하는 대로 
답변 드리도록 하겠습니다. 

감사합니다.`);

  try {
    const response = await axios.post('https://kakaoapi.aligo.in/akv10/alimtalk/send/', form, {
      headers: form.getHeaders(),
      timeout: 10000
    });
    console.log(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();