import { supabase } from './backend/models/supabase.js';
async function fixAll() {
  console.log('데이터베이스 클리어링 시작...');
  const { data: students } = await supabase.from('students').select('id, name, class_name');
  let count = 0;
  
  for (const s of students) {
    if (s.class_name) {
      const original = s.class_name;
      const cleanedClasses = original.split(',')
        .map(c => c.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim())
        .filter(c => c);
        
      const uniqueClasses = Array.from(new Set(cleanedClasses));
      const fixed = uniqueClasses.join(',');
      
      if (original !== fixed) {
        console.log(`[수정됨] ${s.name}: '${original}' -> '${fixed}'`);
        await supabase.from('students').update({ class_name: fixed }).eq('id', s.id);
        count++;
      }
    }
  }
  console.log(`총 ${count}명의 학생 데이터가 깔끔하게 클리어링 되었습니다.`);
}
fixAll();