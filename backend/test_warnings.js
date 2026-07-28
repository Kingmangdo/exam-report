import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
  const { data, error } = await supabase.from('academic_warnings').select('*').neq('status', 'resolved');
  console.log('Active warnings:', data?.length, error);
  if (data) {
    data.forEach(w => console.log(`ID: ${w.id}, Date: ${w.exam_date}, Student: ${w.student_id}, Message: ${w.message}`));
  }
}

run();
