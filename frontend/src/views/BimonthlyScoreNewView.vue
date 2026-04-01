<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">성취평가 성적 입력</h2>

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

        <!-- 우측: 파트 설정 (3~5개 영역) -->
        <div class="border-l pl-6">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-bold text-gray-700">📋 시험 파트 설정 ({{ partSettings.length }}개 영역)</h4>
            <button 
              v-if="partSettings.length < 5"
              @click="addPart"
              class="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-blue-800 transition font-bold"
            >
              + 추가
            </button>
          </div>
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
              <button 
                v-if="partSettings.length > 3"
                @click="removePart(idx)"
                class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-bold"
              >
                삭제
              </button>
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
      <!-- 일괄 설정 패널 (개선안 1) -->
      <div class="p-5 border-b bg-blue-50/50">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📝 {{ selectedClass }} 성적 입력 ({{ classStudents.length }}명)</span>
          </h3>
        </div>
        
        <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <h4 class="text-sm font-bold text-blue-800 mb-3 flex items-center gap-1">
            <span>⚙️ 성적표 반평균 표시 설정 (일괄 적용)</span>
          </h4>
          
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            <!-- 1. 표시 여부 토글 -->
            <div class="flex-1">
              <label class="flex items-center cursor-pointer mb-1">
                <div class="relative">
                  <input type="checkbox" v-model="bulkShowClassAverage" class="sr-only" />
                  <div class="block bg-gray-300 w-10 h-6 rounded-full transition-colors" :class="{'bg-blue-500': bulkShowClassAverage}"></div>
                  <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform" :class="{'transform translate-x-4': bulkShowClassAverage}"></div>
                </div>
                <div class="ml-3 text-sm font-bold" :class="bulkShowClassAverage ? 'text-blue-700' : 'text-gray-500'">
                  {{ bulkShowClassAverage ? '반평균 노출 (ON)' : '반평균 숨김 (OFF)' }}
                </div>
              </label>
              <p class="text-xs text-gray-500 ml-13 mt-1">
                <span v-if="bulkShowClassAverage">학부모 성적표와 알림톡에 반평균이 표시됩니다.</span>
                <span v-else>성적표에 반평균이 숨겨지고, 알림톡엔 '집계중'으로 나갑니다.</span>
              </p>
            </div>

            <!-- 2. 점수 입력 (ON일 때만 활성화) -->
            <div class="flex-1 border-l pl-6" :class="{'opacity-50 pointer-events-none': !bulkShowClassAverage}">
              <div class="text-sm font-bold text-gray-700 mb-2">표시할 평균 점수</div>
              <div class="flex items-center gap-2">
                <select 
                  v-model="bulkManualClassAverageType"
                  class="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  :disabled="!bulkShowClassAverage"
                >
                  <option value="auto">자동 계산 (실제 평균)</option>
                  <option value="manual">수동 입력</option>
                </select>
                
                <div v-if="bulkManualClassAverageType === 'manual'" class="flex items-center gap-1">
                  <input 
                    type="number" 
                    v-model="bulkManualClassAverage" 
                    step="0.1"
                    placeholder="점수"
                    class="w-20 px-2 py-1.5 text-sm border rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span class="text-sm text-gray-600 font-medium">점</span>
                </div>
              </div>
            </div>

            <!-- 3. 일괄 적용 버튼 -->
            <div class="flex items-end justify-end">
              <button 
                @click="applyBulkSettings"
                class="px-6 py-2.5 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-700 transition shadow-sm flex items-center gap-2"
              >
                <span>👇 아래 학생들에게 일괄 적용</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase sticky left-0 bg-gray-50 z-10 w-[120px]">학생명</th>
              <th 
                v-for="(part, idx) in partSettings.filter(p => p.max_score > 0)" 
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
              <th class="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase w-[160px]">성적표 반평균 노출</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(student, sIdx) in classStudents" :key="student.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-white z-10">
                {{ student.name }}
              </td>
              <template v-for="(part, filteredIdx) in partSettings.filter(p => p.max_score > 0)" :key="'s-'+sIdx+'-'+filteredIdx">
                <td class="px-3 py-3 text-center">
                  <input 
                    v-model.number="scoreForms[sIdx].parts[getOriginalPartIndex(filteredIdx)].score" 
                    type="number" 
                    min="0" 
                    :max="part.max_score || 9999" 
                    class="w-20 px-2 py-1.5 text-sm border rounded-lg text-center focus:ring-1 focus:ring-primary outline-none" 
                    @input="calculateScore(sIdx)" 
                  />
                </td>
              </template>
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
                  rows="2" 
                  placeholder="코멘트" 
                  class="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                ></textarea>
              </td>
              <!-- 개별 설정 (개선안 2) -->
              <td class="px-3 py-3">
                <div class="flex flex-col items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <label class="flex items-center cursor-pointer w-full justify-center">
                    <div class="relative">
                      <input type="checkbox" v-model="scoreForms[sIdx].show_class_average" class="sr-only" />
                      <div class="block bg-gray-300 w-8 h-4 rounded-full transition-colors" :class="{'bg-blue-500': scoreForms[sIdx].show_class_average}"></div>
                      <div class="dot absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition-transform" :class="{'transform translate-x-4': scoreForms[sIdx].show_class_average}"></div>
                    </div>
                    <span class="ml-2 text-xs font-bold" :class="scoreForms[sIdx].show_class_average ? 'text-blue-700' : 'text-gray-500'">
                      {{ scoreForms[sIdx].show_class_average ? '노출' : '숨김' }}
                    </span>
                  </label>
                  
                  <div v-if="scoreForms[sIdx].show_class_average" class="flex items-center gap-1 w-full justify-center">
                    <span class="text-[10px] text-gray-500">✏️</span>
                    <input 
                      type="number" 
                      v-model="scoreForms[sIdx].manual_class_average" 
                      step="0.1"
                      placeholder="자동"
                      class="w-16 px-1 py-0.5 text-xs border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      title="수동으로 점수를 입력하면 이 점수가 표시됩니다. 비워두면 자동 계산됩니다."
                    />
                    <span class="text-[10px] text-gray-500 font-medium">점</span>
                  </div>
                  <div v-else class="text-[10px] text-gray-400 font-medium italic">
                    (집계중 표시)
                  </div>
                </div>
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
      반을 선택하면 학생들의 성취평가 성적을 입력할 수 있습니다.
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
import { normalizeClassName } from '../utils/string';

// 10개 사전 정의 영역 (드롭다운용)
const PART_OPTIONS = [
  '문법',
  '듣기',
  '구문',
  '독해',
  '서술형',
  '어휘',
  '킬러문항',
  '빈순삽',
  '주제목요',
  '도표장문'
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

const bulkShowClassAverage = ref(true);
const bulkManualClassAverageType = ref('auto');
const bulkManualClassAverage = ref<number | null>(null);

const applyBulkSettings = () => {
  if (classStudents.value.length === 0) return;
  
  scoreForms.value.forEach(form => {
    form.show_class_average = bulkShowClassAverage.value;
    if (bulkShowClassAverage.value && bulkManualClassAverageType.value === 'manual') {
      form.manual_class_average = bulkManualClassAverage.value;
    } else {
      form.manual_class_average = null;
    }
  });
  
  showToast('현재 목록의 모든 학생에게 일괄 적용되었습니다.');
};

const partSettings = ref([
  { name: '', max_score: 0 },
  { name: '', max_score: 0 },
  { name: '', max_score: 0 }
]);

// 영역 추가
const addPart = () => {
  if (partSettings.value.length < 5) {
    partSettings.value.push({ name: '', max_score: 0 });
    // scoreForms도 업데이트
    if (classStudents.value.length > 0) {
      scoreForms.value.forEach(form => {
        form.parts.push({ score: 0 });
      });
    }
  }
};

// 영역 삭제
const removePart = (idx: number) => {
  if (partSettings.value.length > 3) {
    partSettings.value.splice(idx, 1);
    // scoreForms도 업데이트
    if (classStudents.value.length > 0) {
      scoreForms.value.forEach(form => {
        form.parts.splice(idx, 1);
      });
    }
  }
};

// 이미 선택된 영역은 다른 파트에서 선택 불가
const availablePartOptions = (currentIdx: number) => {
  const selected = partSettings.value
    .map((p, i) => i !== currentIdx ? p.name : '')
    .filter(n => n);
  return PART_OPTIONS.filter(opt => !selected.includes(opt));
};

// 필터링된 인덱스를 원본 partSettings 인덱스로 변환
const getOriginalPartIndex = (filteredIdx: number): number => {
  const filtered = partSettings.value.filter(p => p.max_score > 0);
  if (filteredIdx >= filtered.length) return filteredIdx;
  const targetPart = filtered[filteredIdx];
  return partSettings.value.findIndex(p => p === targetPart);
};

function getTodayFull(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const totalMaxScore = computed(() => {
  return partSettings.value
    .filter(p => p.max_score > 0)
    .reduce((sum, p) => sum + (p.max_score || 0), 0);
});

const classList = computed(() => {
  const set = new Set<string>();
  allStudents.value.forEach(s => {
    if (s.class_name && typeof s.class_name === 'string') {
      s.class_name.split(',').forEach((c: string) => {
        const normalized = normalizeClassName(c);
        if (normalized && normalized !== 'undefined' && normalized !== 'null') set.add(normalized);
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
    .filter(s => s.class_name?.split(',').map((c: string) => normalizeClassName(c)).includes(normalizeClassName(selectedClass.value)))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // 반 변경 시 일괄 설정 초기화
  bulkShowClassAverage.value = true;
  bulkManualClassAverageType.value = 'auto';
  bulkManualClassAverage.value = null;
  
  initScoreForms();
  loadExistingScores();
};

const initScoreForms = () => {
  scoreForms.value = classStudents.value.map(() => ({
    parts: partSettings.value.map(() => ({ score: 0 })),
    comment: '',
    show_class_average: true,
    manual_class_average: null
  }));
};

const loadExistingScores = async () => {
  try {
    const res = await bimonthlyApi.getAll({ class_name: selectedClass.value, exam_date: examDate.value });
    if (res.data.success && res.data.data.length > 0) {
      const data = res.data.data;
      const first = data[0];
      if (first.parts && first.parts.length >= 3) {
        partSettings.value = first.parts.map((p: any) => ({
          name: p.name || '',
          // 기존 데이터 호환성: max_score가 없으면 total_questions * points_per_question으로 계산
          max_score: p.max_score || ((p.total_questions || 0) * (p.points_per_question || 0))
        }));
      }
      classStudents.value.forEach((student, sIdx) => {
        const score = data.find((s: any) => s.student_id === student.id);
        if (score && score.parts) {
          // 기존 데이터의 파트 개수와 현재 설정된 파트 개수 맞추기
          const mappedParts = partSettings.value.map((partSetting) => {
            const existingPart = score.parts.find((p: any) => p.name === partSetting.name);
            return {
              score: existingPart ? (existingPart.score || ((existingPart.correct || 0) * (existingPart.points_per_question || 0))) : 0
            };
          });
          
          scoreForms.value[sIdx] = {
            parts: mappedParts,
            comment: score.comment || '',
            show_class_average: score.show_class_average !== false,
            manual_class_average: score.manual_class_average !== undefined ? score.manual_class_average : null
          };
        }
      });
    }
  } catch (err) {
    console.error('기존 성취평가 성적 로드 실패:', err);
  }
};

const getPartScore = (sIdx: number, pIdx: number): number => {
  return scoreForms.value[sIdx]?.parts[pIdx]?.score || 0;
};

const getTotalScore = (sIdx: number): number => {
  let total = 0;
  partSettings.value.forEach((part, pIdx) => { 
    if (part.max_score > 0) {
      total += getPartScore(sIdx, pIdx); 
    }
  });
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
      // max_score > 0인 영역만 저장
      const parts = partSettings.value
        .map((part, pIdx) => ({
          name: part.name,
          max_score: part.max_score || 0,
          score: form.parts[pIdx]?.score || 0
        }))
        .filter(p => p.max_score > 0);
      await bimonthlyApi.create({
        student_id: student.id,
        exam_date: examDate.value,
        class_name: selectedClass.value,
        parts,
        total_score: getTotalScore(i),
        average_score: parseFloat(getAveragePercent(i)),
        comment: form.comment || '',
        show_class_average: form.show_class_average !== false,
        manual_class_average: form.manual_class_average !== undefined ? form.manual_class_average : null
      });
    }
    showToast('모든 성취평가 성적이 저장되었습니다!');
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
  const res = await studentApi.getAll({ status: 'active' });
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
