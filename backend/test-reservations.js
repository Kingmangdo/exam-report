import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.from('reservations').insert({
    name: '[홈페이지] 박케빈',
    visit_date: new Date().toISOString(),
    school: '하늘빛중학교',
    grade: '중학교 1학년',
    parent_phone: '01082814300',
    notes: '[신규문의]테스트',
    status: '예약'
  }).select();
  console.log('Result:', data);
  console.log('Error:', error);
}
test();
