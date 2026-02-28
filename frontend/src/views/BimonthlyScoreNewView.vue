<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">바이먼슬리 테스트 성적 입력</h2>

    <!-- 반 선택 및 시험 설정 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 좌측: 반/날짜 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">반 선택 <span class="text-red-500">*</span></label>
            <select v-model="selectedClass" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" @change="onClassChange">
              <option value="">반을 선택하세요</option>
              <option v-for="cls in classList" :key="cls" :value="cls">{{ cls }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">시험일자 <span class="text-red-500">*</span></label>
            <input v-model="examDate" type="date" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <!-- 우측: 5개 파트 설정 (드롭다운) -->
        <div class="border-l pl-6">
          <h4 class="text-sm font-bold text-gray-700 mb-3">📋 시험 파트 설정 (5개 영역)</h4>
          <div class="space-y-2">
            <div v-for="(part, idx) in partSettings" :key="idx" class="flex items-center gap-2">
              <span class="text-xs font-bold text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: partColors[idx] }">{{ idx + 1 }}</span>
              <select 
                v-model="part.name" 
                class="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary outline-none font-medium"
              >
                <option value="">영역 선택</option>
                <option v-for="opt in availablePartOptions(idx)" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <div class="flex items-center gap-1">
                <span class="text-xs text-gray-500">총점:</span>
                <input 
                  v-model.number="part.max_score" 
                  type="number" 
                  min="1" 
                  class="w-20 px-2 py-1.5 text-sm border rounded-lg text-center focus:ring-1 focus:ring-primary outline-none" 
                />
              </div>
            </div>
          </div>
          <div class="mt-3 p-2 bg-gray-50 rounded-lg text-sm">
            <span class="font-bold text-gray-700">총 만점: {{ totalMaxScore }}점</span>
            <span class="text-gray-400 ml-3">( {{ partSettings.map(p => p.max_score || 0).join(' + ') }} )</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 성적 입력 테이블 -->
    <div v-if="selectedClass && classStudents.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">
          {{ selectedClass }} 바이먼슬리 성적 입력 ({{ classStudents.length }}명)
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase sticky left-0 bg-gray-50 z-10 w-[120px]">학생명</th>
              <th 
                v-for="(part, idx) in partSettings" 
                :key="'h-'+idx" 
                class="px-3 py-3 text-center text-xs font-bold uppercase"
                :style="{ color: partColors[idx] }"
              >
                <div>{{ part.name || `파트${idx+1}` }}</div>
                <div class="text-[10px] text-gray-400 font-normal">
                  (만점: {{ part.max_score || 0 }}점)
                </div>
              </th>
              <th class="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase">총점</th>
              <th class="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase">평균</th>
              <th class="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase w-[200px]">코멘트</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(student, sIdx) in classStudents" :key="student.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-white z-10">
                {{ student.name }}
              </td>
              <td v-for="(part, pIdx) in partSettings" :key="'s-'+sIdx+'-'+pIdx" class="px-3 py-3 text-center">
                <input 
                  v-model.number="scoreForms[sIdx].parts[pIdx].score" 
                  type="number" 
                  min="0" 
                  :max="part.max_score || 9999" 
                  class="w-20 px-2 py-1.5 text-sm border rounded-lg text-center focus:ring-1 focus:ring-primary outline-none" 
                  @input="calculateScore(sIdx)" 
                />
              </td>
              <td class="px-3 py-3 text-center">
                <span class="text-sm font-bold" :class="getTotalScoreColor(sIdx)">
                  {{ getTotalScore(sIdx) }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <span class="text-sm font-bold" :class="getAverageColor(sIdx)">
                  {{ getAveragePercent(sIdx) }}
                </span>
              </td>
              <td class="px-3 py-3">
                <textarea 
                  v-model="scoreForms[sIdx].comment" 
                  rows="1" 
                  placeholder="코멘트" 
                  class="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-4 border-t bg-gray-50 flex justify-end items-center gap-3">
        <button @click="resetAll" class="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">전체 초기화</button>
        <button @click="saveAllScores" :disabled="saving" class="px-8 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-50">
          {{ saving ? '생성 중...' : '성적표 생성' }}
        </button>
      </div>
    </div>

    <div v-else-if="!selectedClass" class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      반을 선택하면 학생들의 바이먼슬리 테스트 성적을 입력할 수 있습니다.
    </div>
    <div v-else class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      선택한 반에 등록된 학생이 없습니다.
    </div>

    <div v-if="toastMsg" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-bold">
      {{ toastMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { studentApi, bimonthlyApi } from '../services/api';

// 10개 사전 정의 영역 (드롭다운용)
const PART_OPTIONS = [
  'Listening',
  'Grammar',
  'Reading',
  'Vocabulary',
  'Writing',
  'Speaking',
  'Pronunciation',
  'Comprehension',
  'Composition',
  'Translation'
];

// 5개 파트별 고유 색상
const partColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

const selectedClass = ref('');
const examDate = ref(getTodayFull());
const allStudents = ref<any[]>([]);
const classStudents = ref<any[]>([]);
const scoreForms = ref<any[]>([]);
const saving = ref(false);
const toastMsg = ref('');

const partSettings = ref([
  { name: 'Listening', max_score: 100 },
  { name: 'Grammar', max_score: 100 },
  { name: 'Reading', max_score: 100 },
  { name: 'Vocabulary', max_score: 100 },
  { name: 'Writing', max_score: 100 }
]);

// 이미 선택된 영역은 다른 파트에서 선택 불가
const availablePartOptions = (currentIdx: number) => {
  const selected = partSettings.value
    .map((p, i) => i !== currentIdx ? p.name : '')
    .filter(n => n);
  return PART_OPTIONS.filter(opt => !selected.includes(opt));
};

function getTodayFull(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const totalMaxScore = computed(() => {
  return partSettings.value.reduce((sum, p) => sum + (p.max_score || 0), 0);
});

const classList = computed(() => {
  const set = new Set<string>();
  allStudents.value.forEach(s => {
    if (s.class_name && typeof s.class_name === 'string') {
      s.class_name.split(',').forEach((c: string) => {
        const trimmed = c.trim();
        if (trimmed && trimmed !== 'undefined' && trimmed !== 'null') set.add(trimmed);
      });
    }
  });
  return Array.from(set).sort();
});

const onClassChange = () => {
  if (!selectedClass.value) {
    classStudents.value = [];
    scoreForms.value = [];
    return;
  }
  classStudents.value = allStudents.value
    .filter(s => s.class_name?.split(',').map((c: string) => c.trim()).includes(selectedClass.value))
    .sort((a, b) => a.name.localeCompare(b.name));
  initScoreForms();
  loadExistingScores();
};

const initScoreForms = () => {
  scoreForms.value = classStudents.value.map(() => ({
    parts: partSettings.value.map(() => ({ score: 0 })),
    comment: ''
  }));
};

const loadExistingScores = async () => {
  try {
    const res = await bimonthlyApi.getAll({ class_name: selectedClass.value, exam_date: examDate.value });
    if (res.data.success && res.data.data.length > 0) {
      const data = res.data.data;
      const first = data[0];
      if (first.parts?.length === 5) {
        partSettings.value = first.parts.map((p: any) => ({
          name: p.name || '',
          // 기존 데이터 호환성: max_score가 없으면 total_questions * points_per_question으로 계산
          max_score: p.max_score || ((p.total_questions || 0) * (p.points_per_question || 0))
        }));
      }
      classStudents.value.forEach((student, sIdx) => {
        const score = data.find((s: any) => s.student_id === student.id);
        if (score && score.parts) {
          scoreForms.value[sIdx] = {
            parts: score.parts.map((p: any) => ({ 
              // 기존 데이터 호환성: score가 없으면 correct * points_per_question으로 계산
              score: p.score || ((p.correct || 0) * (p.points_per_question || 0))
            })),
            comment: score.comment || ''
          };
        }
      });
    }
  } catch (err) {
    console.error('기존 바이먼슬리 성적 로드 실패:', err);
  }
};

const getPartScore = (sIdx: number, pIdx: number): number => {
  return scoreForms.value[sIdx]?.parts[pIdx]?.score || 0;
};

const getTotalScore = (sIdx: number): number => {
  let total = 0;
  partSettings.value.forEach((_, pIdx) => { total += getPartScore(sIdx, pIdx); });
  return total;
};

const getAveragePercent = (sIdx: number): string => {
  const total = getTotalScore(sIdx);
  const max = totalMaxScore.value;
  if (max === 0) return '0.0';
  return (total / max * 100).toFixed(1);
};

const getTotalScoreColor = (sIdx: number): string => {
  const pct = parseFloat(getAveragePercent(sIdx));
  if (pct >= 90) return 'text-blue-600';
  if (pct >= 70) return 'text-green-600';
  if (pct >= 50) return 'text-orange-600';
  return 'text-red-600';
};
const getAverageColor = (sIdx: number): string => getTotalScoreColor(sIdx);
const calculateScore = (_sIdx: number) => {};

const resetAll = () => {
  if (!confirm('정말 초기화하시겠습니까?')) return;
  initScoreForms();
  showToast('초기화되었습니다.');
};

const saveAllScores = async () => {
  if (!selectedClass.value || !examDate.value) { alert('반과 시험일자를 선택해주세요.'); return; }
  if (!confirm('모든 학생의 성적표를 생성하시겠습니까?')) return;
  saving.value = true;
  try {
    for (let i = 0; i < classStudents.value.length; i++) {
      const student = classStudents.value[i];
      const form = scoreForms.value[i];
      const parts = partSettings.value.map((part, pIdx) => ({
        name: part.name,
        max_score: part.max_score || 0,
        score: form.parts[pIdx]?.score || 0
      }));
      await bimonthlyApi.create({
        student_id: student.id,
        exam_date: examDate.value,
        class_name: selectedClass.value,
        parts,
        total_score: getTotalScore(i),
        average_score: parseFloat(getAveragePercent(i)),
        comment: form.comment || ''
      });
    }
    showToast('모든 바이먼슬리 성적이 저장되었습니다!');
  } catch (err: any) {
    console.error('저장 오류:', err);
    alert(`저장 중 오류: ${err.response?.data?.message || err.message}`);
  } finally { saving.value = false; }
};

const showToast = (msg: string) => {
  toastMsg.value = msg;
  setTimeout(() => toastMsg.value = '', 3000);
};

onMounted(async () => {
  const res = await studentApi.getAll();
  if (res.data.success) allStudents.value = res.data.data;
});

watch(examDate, () => {
  if (selectedClass.value) { initScoreForms(); loadExistingScores(); }
});
</script>

<style scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type='number'] { -moz-appearance: textfield; }
</style>
