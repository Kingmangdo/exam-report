const fs = require('fs');

let vueContent = fs.readFileSync('frontend/src/views/LandingView.vue', 'utf8');

const formHtml = [
  '      <!-- 상담 신청 폼 -->',
  '      <div id="reservation-form" class="mt-16 bg-white rounded-3xl shadow-xl overflow-hidden max-w-3xl mx-auto">',
  '        <div class="bg-indigo-600 p-8 text-center">',
  '          <h2 class="text-2xl font-bold text-white mb-2">우리 아이의 \'진짜 문제점\'을 진단받으세요</h2>',
  '          <p class="text-indigo-100 text-sm">정보를 남겨주시면 첼시 원장님이 직접 연락드려 심층 학습 상담을 진행해 드립니다.</p>',
  '        </div>',
  '        <div class="p-8 text-left">',
  '          <form @submit.prevent="submitConsulting" class="space-y-6">',
  '            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">',
  '              <!-- 학생 이름 -->',
  '              <div>',
  '                <label class="block text-sm font-bold text-gray-700 mb-2">학생 이름 <span class="text-red-500">*</span></label>',
  '                <input type="text" v-model="form.studentName" required placeholder="홍길동" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />',
  '              </div>',
  '              <!-- 연락처 -->',
  '              <div>',
  '                <label class="block text-sm font-bold text-gray-700 mb-2">학부모님 연락처 <span class="text-red-500">*</span></label>',
  '                <input type="tel" v-model="form.phone" required placeholder="010-0000-0000" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />',
  '              </div>',
  '              <!-- 학교 -->',
  '              <div>',
  '                <label class="block text-sm font-bold text-gray-700 mb-2">학교</label>',
  '                <input type="text" v-model="form.school" placeholder="ㅇㅇ중학교" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />',
  '              </div>',
  '              <!-- 학년 -->',
  '              <div>',
  '                <label class="block text-sm font-bold text-gray-700 mb-2">학년 <span class="text-red-500">*</span></label>',
  '                <select v-model="form.grade" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white">',
  '                  <option value="" disabled selected>선택해주세요</option>',
  '                  <option value="초5">초등학교 5학년</option>',
  '                  <option value="초6">초등학교 6학년</option>',
  '                  <option value="중1">중학교 1학년</option>',
  '                  <option value="중2">중학교 2학년</option>',
  '                  <option value="중3">중학교 3학년</option>',
  '                  <option value="고1">고등학교 1학년</option>',
  '                  <option value="고2">고등학교 2학년</option>',
  '                  <option value="고3">고등학교 3학년</option>',
  '                  <option value="기타">기타</option>',
  '                </select>',
  '              </div>',
  '            </div>',
  '            <!-- 문의 내용 -->',
  '            <div>',
  '                <label class="block text-sm font-bold text-gray-700 mb-2">현재 영어 학습 고민 / 문의사항</label>',
  '                <textarea v-model="form.memo" rows="4" placeholder="아이의 취약한 부분이나 궁금하신 점을 자유롭게 적어주세요." class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"></textarea>',
  '            </div>',
  '            <!-- 동의 체크 -->',
  '            <div class="flex items-start mt-4">',
  '              <div class="flex items-center h-5">',
  '                <input id="privacy" type="checkbox" required class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500">',
  '              </div>',
  '              <label for="privacy" class="ml-2 text-sm text-gray-600">',
  '                개인정보 수집 및 이용에 동의합니다. (수집된 정보는 상담 목적으로만 사용되며 이후 즉시 파기됩니다.)',
  '              </label>',
  '            </div>',
  '            <button type="submit" class="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-indigo-700 transition" :disabled="isSubmitting" :class="{\'opacity-70 cursor-not-allowed\': isSubmitting}">',
  '              {{ isSubmitting ? \'신청 중...\' : \'상담 신청하기\' }}',
  '            </button>',
  '          </form>',
  '        </div>',
  '      </div>'
].join('\n');

// Replace Hero button
vueContent = vueContent.replace(
  /<a href="tel:031-983-0905" class="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-gray-50 transition transform hover:-translate-y-1 w-full sm:w-auto inline-flex items-center justify-center">우리 아이 학습 상담하기<\/a>/,
  '<a @click="scrollToForm" href="javascript:void(0)" class="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-gray-50 transition transform hover:-translate-y-1 w-full sm:w-auto inline-flex items-center justify-center">상담문의</a>'
);

// Replace Nav button
vueContent = vueContent.replace(
  /<a href="#consulting" class="bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition transform hover:-translate-y-0.5 inline-flex items-center text-sm md:text-base">상담예약<\/a>/,
  '<a @click="scrollToForm" href="javascript:void(0)" class="bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition transform hover:-translate-y-0.5 inline-flex items-center text-sm md:text-base">상담문의</a>'
);

// Replace Bottom section button
vueContent = vueContent.replace(
  /<a href="tel:031-983-0905" class="inline-flex items-center justify-center w-full sm:w-auto bg-white text-indigo-900 px-8 py-4 rounded-full font-black text-lg hover:bg-indigo-50 transition">031-983-0905 전화 상담하기<\/a>/,
  '<a @click="scrollToForm" href="javascript:void(0)" class="inline-flex items-center justify-center w-full sm:w-auto bg-white text-indigo-900 px-8 py-4 rounded-full font-black text-lg hover:bg-indigo-50 transition">상담문의</a>'
);

// Add the form just before the end of the consulting section
vueContent = vueContent.replace(
  /<\/div>\s*<\/section>\s*<!-- 푸터 -->/,
  '\n' + formHtml + '\n    </div>\n  </section>\n  <!-- 푸터 -->'
);

// Update Script
const newScript = [
  '<script setup lang="ts">',
  'import axios from \'axios\';',
  'import { ref } from \'vue\';',
  '',
  'const form = ref({',
  '  studentName: \'\',',
  '  phone: \'\',',
  '  school: \'\',',
  '  grade: \'\',',
  '  memo: \'\'',
  '});',
  '',
  'const isSubmitting = ref(false);',
  '',
  'const scrollToForm = () => {',
  '  const el = document.getElementById(\'reservation-form\');',
  '  if (el) {',
  '    el.scrollIntoView({ behavior: \'smooth\', block: \'center\' });',
  '  }',
  '};',
  '',
  'const submitConsulting = async () => {',
  '  isSubmitting.value = true;',
  '  try {',
  '    const apiUrl = import.meta.env.VITE_API_BASE_URL || \'/api\';',
  '    await axios.post(${apiUrl}/public/consulting, {',
  '      studentName: form.value.studentName,',
  '      phone: form.value.phone,',
  '      school: form.value.school,',
  '      grade: form.value.grade,',
  '      memo: form.value.memo',
  '    });',
  '    ',
  '    alert(\'상담 신청이 접수되었습니다! 첼시 원장님이 확인 후 연락드리겠습니다.\');',
  '    ',
  '    // 폼 초기화',
  '    form.value = {',
  '      studentName: \'\',',
  '      phone: \'\',',
  '      school: \'\',',
  '      grade: \'\',',
  '      memo: \'\'',
  '    };',
  '  } catch (error: any) {',
  '    if (error.response?.data?.message) {',
  '      alert(error.response.data.message);',
  '    } else {',
  '      alert(\'신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.\');',
  '    }',
  '  } finally {',
  '    isSubmitting.value = false;',
  '  }',
  '};',
  '</script>'
].join('\n');

vueContent = vueContent.replace(
  /<script setup lang="ts">[\s\S]*?<\/script>/,
  newScript.trim()
);

fs.writeFileSync('frontend/src/views/LandingView.vue', vueContent);
console.log('Done!');
