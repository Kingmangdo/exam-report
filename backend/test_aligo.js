import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import axios from 'axios';
import FormData from 'form-data';

async function test() {
  const form = new FormData();
  form.append('apikey', process.env.ALIGO_API_KEY || '');
  form.append('userid', process.env.ALIGO_USER_ID || '');
  form.append('senderkey', process.env.ALIGO_SENDER_KEY || '');
  form.append('tpl_code', 'UG_9086');
  form.append('sender', process.env.ALIGO_SENDER || '');
  form.append('receiver_1', '01000000000');
  form.append('subject_1', '상담 안내');
  form.append('message_1', `[독강영어전문학원 상담 안내]

학부모님, 안녕하십니까.
홍길동 학생의 상담 내용을 안내해 드립니다.

■ 클래스 : -
■ 이름 : 홍길동
■ 일자 : 2026-05-21
■ 내용 : 테스트

궁금하신 사항은 학원으로 문의해 주시기 바랍니다.
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