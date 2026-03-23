import { supabase } from './backend/models/supabase.js';
async function test() {
  const { data } = await supabase.from('students').select('name, class_name');
  const target = data.find(s => s.name === '이서은' || s.name === '이동현' || s.name === '정무혁');
  console.log('Target:', target);
  if (target && target.class_name) {
    const parts = target.class_name.split(',');
    parts.forEach((p, i) => {
      console.log(`Part ${i}: '${p}'`);
      for(let j=0; j<p.length; j++) {
        console.log(`  ${p[j]} : ${p.charCodeAt(j).toString(16)}`);
      }
    });
  }
}
test();