<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">성적 입력</h2>

    <!-- 반 선택 및 날짜 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 반 선택 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            반 선택 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedClass"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            @change="onClassChange"
          >
            <option value="">반을 선택하세요</option>
            <option
              v-for="className in classList"
              :key="className"
              :value="className"
            >
              {{ className }}
            </option>
          </select>
        </div>

        <!-- 날짜 선택 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            시험일자 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="examDateInput"
            type="date"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p class="text-xs text-gray-500 mt-1">캘린더에서 날짜를 선택하세요</p>
        </div>
      </div>
    </div>

    <!-- 성적 입력 테이블 -->
    <div v-if="selectedClass && classStudents.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-800">
          {{ selectedClass }} 성적 입력 ({{ classStudents.length }}명)
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                학생명
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" colspan="2">
                RT점수
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" colspan="2">
                단어시험
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                과제점수
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                수업태도
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                총점
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                평균
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                코멘트
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                저장
              </th>
            </tr>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left text-xs text-gray-600 sticky left-0 bg-gray-100 z-10"></th>
              <th class="px-2 py-2 text-center text-xs text-gray-600">총 문제</th>
              <th class="px-2 py-2 text-center text-xs text-gray-600">맞춘 문제</th>
              <th class="px-2 py-2 text-center text-xs text-gray-600">총 문제</th>
              <th class="px-2 py-2 text-center text-xs text-gray-600">맞춘 문제</th>
              <th class="px-2 py-2 text-center text-xs text-gray-600">(0-100)</th>
              <th class="px-2 py-2 text-center text-xs text-gray-600">(0-100)</th>
              <th class="px-2 py-2 text-center text-xs text-gray-600"></th>
              <th class="px-2 py-2 text-center text-xs text-gray-600"></th>
              <th class="px-2 py-2 text-center text-xs text-gray-600"></th>
              <th class="px-2 py-2 text-center text-xs text-gray-600"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(student, index) in classStudents"
              :key="student.id"
              class="hover:bg-gray-50"
            >
              <!-- 학생명 -->
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                {{ student.name }}
              </td>

              <!-- RT점수 -->
              <td class="px-2 py-3">
                <input
                  v-model.number="scoreForms[index].rt_total"
                  type="number"
                  min="0"
                  placeholder="총 문제"
                  class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  @keydown.up.prevent
                  @keydown.down.prevent
                  @input="calculateScore(index)"
                />
              </td>
              <td class="px-2 py-3">
                <input
                  v-model.number="scoreForms[index].rt_correct"
                  type="number"
                  min="0"
                  placeholder="맞춘 문제"
                  class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  @keydown.up.prevent
                  @keydown.down.prevent
                  @input="calculateScore(index)"
                />
              </td>

              <!-- 단어시험 -->
              <td class="px-2 py-3">
                <input
                  v-model.number="scoreForms[index].word_total"
                  type="number"
                  min="0"
                  placeholder="총 문제"
                  class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                  :disabled="scoreForms[index].word_retest"
                  @keydown.up.prevent
                  @keydown.down.prevent
                  @input="calculateScore(index)"
                />
              </td>
              <td class="px-2 py-3">
                <input
                  v-model.number="scoreForms[index].word_correct"
                  type="number"
                  min="0"
                  placeholder="맞춘 문제"
                  class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                  :disabled="scoreForms[index].word_retest"
                  @keydown.up.prevent
                  @keydown.down.prevent
                  @input="calculateScore(index)"
                />
                <button
                  type="button"
                  @click="toggleWordRetest(index)"
                  class="mt-2 w-20 px-2 py-1 text-xs rounded border transition"
                  :class="scoreForms[index].word_retest ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
                >
                  {{ scoreForms[index].word_retest ? '재시험 해제' : '재시험' }}
                </button>
              </td>

              <!-- 과제점수 -->
              <td class="px-2 py-3">
                <input
                  v-model.number="scoreForms[index].assignment_score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  @keydown.up.prevent
                  @keydown.down.prevent
                  @input="calculateScore(index)"
                />
              </td>

              <!-- 수업태도 -->
              <td class="px-2 py-3">
                <input
                  v-model.number="scoreForms[index].attitude_score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  @keydown.up.prevent
                  @keydown.down.prevent
                  @input="calculateScore(index)"
                />
              </td>

              <!-- 총점 -->
              <td class="px-2 py-3 text-center text-sm font-semibold text-gray-700">
                {{ calculatedScores[index]?.total?.toFixed(1) || '-' }}
              </td>

              <!-- 평균 -->
              <td class="px-2 py-3 text-center text-sm font-semibold text-primary">
                {{ calculatedScores[index]?.average?.toFixed(1) || '-' }}
              </td>

              <!-- 코멘트 -->
              <td class="px-2 py-3">
                <textarea
                  v-model="scoreForms[index].comment"
                  rows="2"
                  placeholder="코멘트를 입력하세요"
                  class="w-56 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>
              </td>

              <!-- 임시저장 / 저장 버튼 -->
              <td class="px-2 py-3 text-center">
                <div class="flex flex-col gap-1">
                  <button
                    type="button"
                    @click="saveDraft(index)"
                    class="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                  >
                    임시저장
                  </button>
                  <button
                    @click="saveStudentScore(index, student.id)"
                    :disabled="saving[index]"
                    class="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ saving[index] ? '저장중...' : '저장' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 일괄 저장 버튼 -->
      <div class="p-4 border-t bg-gray-50 flex justify-end space-x-3">
        <button
          @click="resetAllScores"
          class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          전체 초기화
        </button>
        <button
          @click="saveAllScores"
          :disabled="savingAll"
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
        >
          {{ savingAll ? '저장 중...' : '전체 저장' }}
        </button>
      </div>
    </div>

    <!-- 반 선택 안내 -->
    <div v-else-if="!selectedClass" class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-500">반을 선택하면 해당 반 학생들의 성적을 입력할 수 있습니다.</p>
    </div>

    <!-- 학생 없음 -->
    <div v-else class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-500">선택한 반에 등록된 학생이 없습니다.</p>
    </div>

    <!-- 저장 성공 알림 -->
    <div
      v-if="saveSuccessMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
    >
      {{ saveSuccessMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { studentApi, scoreApi } from '../services/api';
import { getToday } from '../utils/date';
import type { Student } from '../types';

const selectedClass = ref<string>('');
const examDate = ref<string>(getToday());
const retestComment = '단어 테스트 점수 미흡으로 남아서 응시 후 귀가 예정입니다.';
const allStudents = ref<Student[]>([]);
const classStudents = ref<Student[]>([]);
const scoreForms = ref<Array<{
  rt_total?: number;
  rt_correct?: number;
  word_total?: number;
  word_correct?: number;
  assignment_score?: number;
  attitude_score?: number;
  word_retest?: boolean;
  comment?: string;
}>>([]);

const saving = ref<Record<number, boolean>>({});
const savingAll = ref(false);
const saveSuccessMessage = ref<string>('');

const getDraftKey = () => {
  if (!selectedClass.value || !examDate.value) return '';
  return `scoreDraft:${selectedClass.value}:${examDate.value}`;
};

const resetScoreForms = () => {
  scoreForms.value = classStudents.value.map(() => ({
    rt_total: undefined,
    rt_correct: undefined,
    word_total: undefined,
    word_correct: undefined,
    assignment_score: undefined,
    attitude_score: undefined,
    word_retest: false,
    comment: ''
  }));

  calculatedScores.value = classStudents.value.map(() => ({
    rtScore: 0,
    wordScore: 0,
    total: 0,
    average: 0
  }));
};

const loadDraftScores = () => {
  const key = getDraftKey();
  if (!key || typeof window === 'undefined') return false;
  const raw = window.localStorage.getItem(key);
  if (!raw) return false;
  try {
    const draft = JSON.parse(raw);
    if (!Array.isArray(draft)) return false;
    if (draft.length !== classStudents.value.length) return false;
    scoreForms.value = draft.map((item: any) => ({
      rt_total: item.rt_total ?? undefined,
      rt_correct: item.rt_correct ?? undefined,
      word_total: item.word_total ?? undefined,
      word_correct: item.word_correct ?? undefined,
      assignment_score: item.assignment_score ?? undefined,
      attitude_score: item.attitude_score ?? undefined,
      word_retest: Boolean(item.word_retest),
      comment: item.comment || ''
    }));
    scoreForms.value.forEach((_, index) => calculateScore(index));
    return true;
  } catch {
    return false;
  }
};

const clearDraftScores = () => {
  const key = getDraftKey();
  if (!key || typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
};

// 반 목록 (중복 반 고려)
const classList = computed(() => {
  const classesSet = new Set<string>();
  allStudents.value.forEach(student => {
    // 중복 반 지원: classes 배열 또는 class_name 문자열
    if ((student as any).classes && Array.isArray((student as any).classes)) {
      (student as any).classes.forEach((c: string) => {
        if (c) classesSet.add(c);
      });
    } else if (student.class_name) {
      // 기존 데이터 호환성: 콤마로 구분된 문자열
      student.class_name.split(',').forEach(c => {
        const trimmed = c.trim();
        if (trimmed) classesSet.add(trimmed);
      });
    }
  });
  return Array.from(classesSet).sort();
});

// 계산된 점수들
const calculatedScores = ref<Array<{
  rtScore: number;
  wordScore: number;
  total: number;
  average: number;
}>>([]);

const toDateInputValue = (value: string) => {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length !== 3) return '';
  const [yy, mm, dd] = parts;
  if (!yy || !mm || !dd) return '';
  return `20${yy}-${mm}-${dd}`;
};

const toExamDateValue = (value: string) => {
  if (!value) return '';
  const [yyyy, mm, dd] = value.split('-');
  if (!yyyy || !mm || !dd) return '';
  return `${yyyy.slice(-2)}-${mm}-${dd}`;
};

const examDateInput = computed({
  get: () => toDateInputValue(examDate.value),
  set: (value: string) => {
    examDate.value = toExamDateValue(value);
  }
});

// 점수 계산
const calculateScore = (index: number) => {
  const form = scoreForms.value[index];
  
  // RT 점수 계산
  const rtScore = form.rt_total && form.rt_correct !== undefined
    ? Math.round((form.rt_correct / form.rt_total) * 100 * 100) / 100
    : 0;

  // 단어시험 점수 계산 (재시험이면 입력 생략)
  const wordScore = form.word_retest
    ? 0
    : form.word_total && form.word_correct !== undefined
      ? Math.round((form.word_correct / form.word_total) * 100 * 100) / 100
      : 0;

  // 총점 및 평균
  const total = rtScore + wordScore + (form.assignment_score || 0) + (form.attitude_score || 0);
  const average = total / 4;

  const normalizedComment = (form.comment || '').trim();
  if (form.word_retest) {
    if (!normalizedComment.includes(retestComment)) {
      form.comment = normalizedComment
        ? `${normalizedComment} ${retestComment}`
        : retestComment;
    }
  } else {
    if (wordScore > 0 && wordScore <= 84) {
      if (!normalizedComment.includes(retestComment)) {
        form.comment = normalizedComment
          ? `${normalizedComment} ${retestComment}`
          : retestComment;
      }
    } else if (normalizedComment === retestComment) {
      form.comment = '';
    }
  }

  calculatedScores.value[index] = {
    rtScore,
    wordScore,
    total: Math.round(total * 100) / 100,
    average: Math.round(average * 100) / 100
  };
};

// 반 변경 시
const onClassChange = () => {
  if (!selectedClass.value) {
    classStudents.value = [];
    scoreForms.value = [];
    calculatedScores.value = [];
    return;
  }

  // 선택한 반의 학생 목록 (중복 반 고려)
  classStudents.value = allStudents.value
    .filter(s => {
      // 중복 반 지원
      if ((s as any).classes && Array.isArray((s as any).classes)) {
        return (s as any).classes.includes(selectedClass.value);
      } else if (s.class_name) {
        // 기존 데이터 호환성
        return s.class_name.split(',').map(c => c.trim()).includes(selectedClass.value);
      }
      return false;
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // 성적 입력 폼 초기화
  resetScoreForms();

  // 기존 성적 불러오기 (선택사항)
  loadExistingScores();
};

// 기존 성적 불러오기
const loadExistingScores = async () => {
  if (!examDate.value || !selectedClass.value) return;

  // 0. 먼저 현재 입력 폼을 초기화 (날짜 변경 시 기존 데이터 잔류 방지)
  resetScoreForms();

  // 1. 임시저장(Draft)이 있는지 먼저 확인
  const loadedDraft = loadDraftScores();
  if (loadedDraft) return;

  // 2. 임시저장이 없으면 서버에서 기존 성적 가져오기
  try {
    const response = await scoreApi.getAll({
      class_name: selectedClass.value,
      exam_date: examDate.value
    });

    if (response.data.success && response.data.data) {
      const existingScores = response.data.data;

      classStudents.value.forEach((student, index) => {
        // 같은 반의 성적만 찾기
        const existing = existingScores.find((s: any) =>
          s.student_id === student.id && s.class_name === selectedClass.value
        );
        if (existing) {
          scoreForms.value[index] = {
            rt_total: existing.rt_total || undefined,
            rt_correct: existing.rt_correct || undefined,
            word_total: existing.word_total || undefined,
            word_correct: existing.word_correct || undefined,
            assignment_score: existing.assignment_score || 0,
            attitude_score: existing.attitude_score || 0,
            word_retest: Boolean(existing.comment && existing.comment.includes(retestComment)),
            comment: existing.comment || ''
          };
          calculateScore(index);
        }
      });
    }
  } catch (err) {
    console.error('기존 성적 불러오기 실패:', err);
  }
};

// 학생별 성적 저장
const saveStudentScore = async (index: number, studentId: number) => {
  try {
    saving.value[index] = true;

    const form = scoreForms.value[index];
    const scoreData: any = {
      student_id: studentId,
      exam_date: examDate.value,
      class_name: selectedClass.value, // 선택한 반 저장
      assignment_score: form.assignment_score || 0,
      attitude_score: form.attitude_score || 0,
      comment: form.comment || ''
    };

    if (form.rt_total && form.rt_correct !== undefined) {
      scoreData.rt_total = form.rt_total;
      scoreData.rt_correct = form.rt_correct;
    }

    if (form.word_total && form.word_correct !== undefined) {
      scoreData.word_total = form.word_total;
      scoreData.word_correct = form.word_correct;
    }

    await scoreApi.create(scoreData);
    
    saveSuccessMessage.value = `${classStudents.value[index].name} 학생의 성적이 저장되었습니다.`;
    setTimeout(() => {
      saveSuccessMessage.value = '';
    }, 3000);
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.response?.data?.error || '저장 중 오류가 발생했습니다.';
    alert(errorMessage);
    console.error('성적 저장 에러:', err);
  } finally {
    saving.value[index] = false;
  }
};

// 임시 저장
const saveDraft = (index: number) => {
  if (!selectedClass.value || !examDate.value) {
    alert('반과 시험일자를 먼저 선택해주세요.');
    return;
  }

  if (typeof window === 'undefined') return;
  const key = getDraftKey();
  if (!key) return;

  window.localStorage.setItem(key, JSON.stringify(scoreForms.value));
  saveSuccessMessage.value = `${classStudents.value[index].name} 학생의 성적이 임시저장되었습니다.`;
  setTimeout(() => {
    saveSuccessMessage.value = '';
  }, 3000);
};

// 전체 저장
const saveAllScores = async () => {
  if (!confirm(`선택한 반의 모든 학생 성적을 저장하시겠습니까?`)) return;

  try {
    savingAll.value = true;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < classStudents.value.length; i++) {
      try {
        await saveStudentScore(i, classStudents.value[i].id);
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`학생 ${classStudents.value[i].name} 저장 실패:`, err);
      }
    }

    if (failCount === 0) {
      clearDraftScores();
    }

    saveSuccessMessage.value = `${successCount}명 저장 완료${failCount > 0 ? `, ${failCount}명 실패` : ''}`;
    setTimeout(() => {
      saveSuccessMessage.value = '';
    }, 5000);
  } catch (err) {
    console.error('전체 저장 에러:', err);
  } finally {
    savingAll.value = false;
  }
};

// 전체 초기화
const resetAllScores = () => {
  if (!confirm('입력한 모든 성적을 초기화하시겠습니까?')) return;

  resetScoreForms();
};

const toggleWordRetest = (index: number) => {
  const form = scoreForms.value[index];
  form.word_retest = !form.word_retest;
  if (form.word_retest) {
    form.word_total = undefined;
    form.word_correct = undefined;
  }
  calculateScore(index);
};

// 학생 목록 불러오기
const fetchStudents = async () => {
  try {
    const response = await studentApi.getAll();
    if (response.data.success && response.data.data) {
      allStudents.value = response.data.data;
    }
  } catch (err) {
    console.error('학생 목록 불러오기 실패:', err);
  }
};

// 날짜 변경 시 기존 성적 불러오기
watch(examDate, () => {
  if (selectedClass.value) {
    loadExistingScores();
  }
});

onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
.text-primary {
  color: #1e3a8a;
}

.bg-primary {
  background-color: #1e3a8a;
}

.bg-primary-dark {
  background-color: #1e40af;
}

/* 숫자 입력 스피너 숨김 */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

/* 테이블 스크롤 시 학생명 고정 */
.sticky {
  position: sticky;
}
</style>
