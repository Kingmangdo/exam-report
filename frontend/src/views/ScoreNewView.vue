<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">성적 입력</h2>

    <!-- 반 선택 및 날짜, 공통 설정 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 반 및 날짜 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">반 선택 <span class="text-red-500">*</span></label>
            <select v-model="selectedClass" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" @change="onClassChange">
              <option value="">반을 선택하세요</option>
              <option v-for="className in classList" :key="className" :value="className">{{ className }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">시험일자 <span class="text-red-500">*</span></label>
            <input v-model="examDateInput" type="date" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <!-- 테스트 종류 관리 (RT, 단어) -->
        <div class="space-y-4 border-l pl-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm font-bold text-gray-700">RT 테스트 설정</label>
              <button @click="addTestType('rt')" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100">+ 추가</button>
            </div>
            <div v-for="(test, idx) in rtTestTypes" :key="idx" class="flex items-center gap-2 mb-2">
              <input v-model="test.name" type="text" placeholder="테스트명" class="flex-1 px-2 py-1 text-xs border rounded" />
              <input v-model.number="test.total" type="number" placeholder="총 문제" class="w-16 px-2 py-1 text-xs border rounded" @input="updateGlobalTotals" />
              <button @click="removeTestType('rt', idx)" class="text-red-500 text-xs">삭제</button>
            </div>
          </div>
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm font-bold text-gray-700">단어 테스트 설정</label>
              <button @click="addTestType('word')" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100">+ 추가</button>
            </div>
            <div v-for="(test, idx) in wordTestTypes" :key="idx" class="flex items-center gap-2 mb-2">
              <input v-model="test.name" type="text" placeholder="테스트명" class="flex-1 px-2 py-1 text-xs border rounded" />
              <input v-model.number="test.total" type="number" placeholder="총 문제" class="w-16 px-2 py-1 text-xs border rounded" @input="updateGlobalTotals" />
              <button @click="removeTestType('word', idx)" class="text-red-500 text-xs">삭제</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 성적 입력 테이블 -->
    <div v-if="selectedClass && classStudents.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">
          {{ selectedClass }} 성적 입력 ({{ classStudents.length }}명)
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">학생명</th>
              
              <!-- RT 테스트 컬럼들 -->
              <th v-for="(test, idx) in rtTestTypes" :key="'rt-h-'+idx" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                RT: {{ test.name || '미지정' }} ({{ test.total || 0 }})
              </th>

              <!-- 단어 테스트 컬럼들 -->
              <th v-for="(test, idx) in wordTestTypes" :key="'word-h-'+idx" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                단어: {{ test.name || '미지정' }} ({{ test.total || 0 }})
              </th>

              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">과제점수</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">평균</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">코멘트</th>
              <th class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">저장</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(student, sIdx) in classStudents" :key="student.id" class="hover:bg-gray-50">
              <!-- 학생명 -->
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                {{ student.name || '이름없음' }}
              </td>

              <!-- RT 맞춘 문제 입력 -->
              <td v-for="(test, tIdx) in rtTestTypes" :key="'rt-i-'+sIdx+'-'+tIdx" class="px-2 py-3 text-center">
                <input v-if="scoreForms[sIdx]?.rt_details?.[tIdx]" v-model.number="scoreForms[sIdx].rt_details[tIdx].correct" type="number" min="0" :max="test.total" class="w-16 px-2 py-1 text-sm border rounded text-center" @input="calculateScore(sIdx)" />
              </td>

              <!-- 단어 맞춘 문제 입력 -->
              <td v-for="(test, tIdx) in wordTestTypes" :key="'word-i-'+sIdx+'-'+tIdx" class="px-2 py-3 text-center">
                <div v-if="scoreForms[sIdx]?.word_details?.[tIdx]" class="flex flex-col items-center gap-1">
                  <input v-model.number="scoreForms[sIdx].word_details[tIdx].correct" type="number" min="0" :max="test.total" class="w-16 px-2 py-1 text-sm border rounded text-center disabled:bg-gray-100" :disabled="scoreForms[sIdx].word_details[tIdx].retest" @input="calculateScore(sIdx)" />
                  <button @click="toggleRetest(sIdx, tIdx)" class="text-[10px] px-1 rounded border" :class="scoreForms[sIdx].word_details[tIdx].retest ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 border-gray-200'">재시험</button>
                </div>
              </td>

              <!-- 과제점수 (A, B, C, F) -->
              <td v-if="scoreForms[sIdx]" class="px-2 py-3 text-center">
                <div class="flex gap-1 justify-center">
                  <button v-for="grade in ['A', 'B', 'C', 'F']" :key="grade" @click="setAssignmentGrade(sIdx, grade)" class="w-8 h-8 text-xs font-bold rounded-full border transition" :class="scoreForms[sIdx].assignment_grade === grade ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200 hover:border-primary'">
                    {{ grade }}
                  </button>
                </div>
              </td>

              <!-- 평균 -->
              <td class="px-2 py-3 text-center text-sm font-semibold text-primary">
                {{ calculatedScores[sIdx]?.average?.toFixed(1) || '-' }}
              </td>

              <!-- 코멘트 -->
              <td v-if="scoreForms[sIdx]" class="px-2 py-3">
                <textarea v-model="scoreForms[sIdx].comment" rows="1" placeholder="코멘트" class="w-40 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary" @input="onCommentInput(sIdx)"></textarea>
              </td>

              <!-- 개별 저장 -->
              <td class="px-2 py-3 text-center">
                <button 
                  @click="saveSingleScore(sIdx)" 
                  :disabled="savingSingle[sIdx]"
                  class="px-3 py-1 text-xs font-bold rounded-lg transition"
                  :class="savedSingle[sIdx] ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-dark disabled:opacity-50'"
                >
                  {{ savingSingle[sIdx] ? '...' : savedSingle[sIdx] ? '✓' : '저장' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 하단 버튼 영역 -->
      <div class="p-4 border-t bg-gray-50 flex justify-end items-center">
        <div class="flex gap-2">
          <button @click="resetAllScores" class="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">전체 초기화</button>
          <button @click="saveDraftAll" class="px-4 py-2 text-sm bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 transition">임시저장</button>
          <button @click="saveAllScores" :disabled="savingAll" class="px-8 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {{ savingAll ? '생성 중...' : '성적표 생성' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 반 선택 안내 -->
    <div v-else-if="!selectedClass" class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      반을 선택하면 해당 반 학생들의 성적을 입력할 수 있습니다.
    </div>

    <!-- 학생 없음 -->
    <div v-else class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      선택한 반에 등록된 학생이 없습니다.
    </div>

    <!-- 알림 메시지 -->
    <div v-if="saveSuccessMessage" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
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

const rtTestTypes = ref<Array<{ name: string; total: number | null }>>([{ name: 'RT 1', total: null }]);
const wordTestTypes = ref<Array<{ name: string; total: number | null }>>([{ name: '단어 1', total: null }]);

const allStudents = ref<Student[]>([]);
const classStudents = ref<Student[]>([]);
const scoreForms = ref<any[]>([]);
const calculatedScores = ref<any[]>([]);
const savingAll = ref(false);
const savingSingle = ref<Record<number, boolean>>({});
const savedSingle = ref<Record<number, boolean>>({});
const saveSuccessMessage = ref<string>('');

const assignmentMap: Record<string, number> = { 'A': 100, 'B': 85, 'C': 70, 'F': 50 };

const addTestType = (type: 'rt' | 'word') => {
  if (type === 'rt') {
    rtTestTypes.value.push({ name: `RT ${rtTestTypes.value.length + 1}`, total: null });
  } else {
    wordTestTypes.value.push({ name: `단어 ${wordTestTypes.value.length + 1}`, total: null });
  }
  updateAllScoreForms();
};

const removeTestType = (type: 'rt' | 'word', index: number) => {
  if (type === 'rt') {
    rtTestTypes.value.splice(index, 1);
  } else {
    wordTestTypes.value.splice(index, 1);
  }
  updateAllScoreForms();
};

const updateAllScoreForms = () => {
  scoreForms.value.forEach((form, sIdx) => {
    // RT details sync
    while (form.rt_details.length < rtTestTypes.value.length) {
      form.rt_details.push({ correct: 0, name: '', total: 0 });
    }
    if (form.rt_details.length > rtTestTypes.value.length) form.rt_details.splice(rtTestTypes.value.length);
    
    // Word details sync
    while (form.word_details.length < wordTestTypes.value.length) {
      form.word_details.push({ correct: 0, retest: false, name: '', total: 0 });
    }
    if (form.word_details.length > wordTestTypes.value.length) form.word_details.splice(wordTestTypes.value.length);
    
    calculateScore(sIdx);
  });
};

const setAssignmentGrade = (sIdx: number, grade: string) => {
  scoreForms.value[sIdx].assignment_grade = grade;
  scoreForms.value[sIdx].assignment_score = assignmentMap[grade];
  calculateScore(sIdx);
};

const toggleRetest = (sIdx: number, tIdx: number) => {
  const form = scoreForms.value[sIdx];
  const detail = form.word_details[tIdx];
  detail.retest = !detail.retest;
  if (detail.retest) detail.correct = 0;
  calculateScore(sIdx);
  
  // 재시험 코멘트 자동 추가/제거 (수동 편집하지 않은 경우에만)
  if (!form.commentManuallyEdited) {
    const hasAnyRetest = form.word_details.some((d: any) => d.retest);
    const currentComment = (form.comment || '').trim();
    if (hasAnyRetest) {
      if (!currentComment.includes(retestComment)) {
        form.comment = currentComment ? `${currentComment} ${retestComment}` : retestComment;
      }
    } else {
      // 재시험 해제 시 자동생성 코멘트만 제거
      if (currentComment === retestComment) {
        form.comment = '';
      }
    }
  }
};

const onCommentInput = (sIdx: number) => {
  // 사용자가 직접 코멘트를 수정하면 자동생성 비활성화
  scoreForms.value[sIdx].commentManuallyEdited = true;
};

const calculateScore = (sIdx: number) => {
  const form = scoreForms.value[sIdx];
  
  // RT 평균 점수
  let rtSum = 0;
  rtTestTypes.value.forEach((test, tIdx) => {
    if (test.total > 0) {
      rtSum += (form.rt_details[tIdx].correct / test.total) * 100;
    }
  });
  const rtAvg = rtTestTypes.value.length > 0 ? rtSum / rtTestTypes.value.length : 0;

  // 단어 평균 점수
  let wordSum = 0;
  let retestFound = false;
  wordTestTypes.value.forEach((test, tIdx) => {
    const detail = form.word_details[tIdx];
    if (detail.retest) {
      retestFound = true;
    } else if (test.total > 0) {
      const score = (detail.correct / test.total) * 100;
      wordSum += score;
      // 85점 미만이면 재시험으로 분류
      if (score < 85) {
        retestFound = true;
      }
    }
  });
  const wordAvg = wordTestTypes.value.length > 0 ? wordSum / wordTestTypes.value.length : 0;

  // 85점 미만인 경우 코멘트 자동 추가 (수동 편집하지 않은 경우에만)
  if (!form.commentManuallyEdited) {
    const currentComment = (form.comment || '').trim();
    if (retestFound) {
      // 재시험 코멘트가 없으면 추가
      if (!currentComment.includes(retestComment)) {
        form.comment = currentComment ? `${currentComment} ${retestComment}` : retestComment;
      }
    } else {
      // 재시험이 없으면 자동생성 코멘트만 제거
      const commentWithoutRetest = currentComment.replace(new RegExp(retestComment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim();
      if (commentWithoutRetest !== currentComment) {
        form.comment = commentWithoutRetest;
      }
    }
  }

  // 총점 및 평균 (RT, 단어, 과제 3개 항목)
  const total = rtAvg + wordAvg + (form.assignment_score || 0);
  const average = total / 3;

  calculatedScores.value[sIdx] = {
    rtScore: rtAvg,
    wordScore: wordAvg,
    total: Math.round(total * 100) / 100,
    average: Math.round(average * 100) / 100
  };
};

const updateGlobalTotals = () => {
  scoreForms.value.forEach((_, sIdx) => calculateScore(sIdx));
};

const onClassChange = () => {
  if (!selectedClass.value) {
    classStudents.value = [];
    scoreForms.value = [];
    return;
  }
  classStudents.value = allStudents.value
    .filter(s => {
      if (!s.class_name || typeof s.class_name !== 'string') return false;
      return s.class_name.split(',').map(c => c.trim()).includes(selectedClass.value);
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  scoreForms.value = classStudents.value.map(() => ({
    rt_details: rtTestTypes.value.map(t => ({ correct: 0, name: t.name, total: t.total })),
    word_details: wordTestTypes.value.map(t => ({ correct: 0, retest: false, name: t.name, total: t.total })),
    assignment_grade: '',
    assignment_score: 0,
    comment: '',
    commentManuallyEdited: false
  }));
  
  calculatedScores.value = classStudents.value.map(() => ({ total: 0, average: 0 }));
  loadExistingScores();
};

const loadExistingScores = async () => {
  // 테스트 종류 초기화 (기본값으로)
  rtTestTypes.value = [{ name: 'RT 1', total: null }];
  wordTestTypes.value = [{ name: '단어 1', total: null }];

  // 상태 초기화 (시험일자 변경 시 기본값으로)
  scoreForms.value = classStudents.value.map(() => ({
    rt_details: rtTestTypes.value.map(t => ({ correct: 0, name: t.name, total: t.total })),
    word_details: wordTestTypes.value.map(t => ({ correct: 0, retest: false, name: t.name, total: t.total })),
    assignment_grade: '',
    assignment_score: 0,
    comment: '',
    commentManuallyEdited: false
  }));
  calculatedScores.value = classStudents.value.map(() => ({ 
    rtScore: 0, 
    wordScore: 0, 
    total: 0, 
    average: 0 
  }));

  const draftKey = `scoreDraft:${selectedClass.value}:${examDate.value}`;

  // 서버 데이터 확인 (서버 데이터 우선)
  try {
    const res = await scoreApi.getAll({ class_name: selectedClass.value, exam_date: examDate.value });
    if (res.data.success && res.data.data.length > 0) {
      const data = res.data.data;
      
      // 서버에 저장된 데이터가 있으면 임시저장 삭제 (서버가 최신)
      localStorage.removeItem(draftKey);
      
      // 첫 번째 성적 데이터에서 테스트 종류 복원 (있다면)
      const firstScore = data[0];
      if (firstScore.rt_details?.length) {
        rtTestTypes.value = firstScore.rt_details.map((d: any, i: number) => ({ 
          name: d.name || `RT ${i+1}`, 
          total: d.total !== undefined ? d.total : null
        }));
      }
      if (firstScore.word_details?.length) {
        wordTestTypes.value = firstScore.word_details.map((d: any, i: number) => ({ 
          name: d.name || `단어 ${i+1}`, 
          total: d.total !== undefined ? d.total : null
        }));
      }

      classStudents.value.forEach((student, sIdx) => {
        const score = data.find((s: any) => s.student_id === student.id);
        if (score) {
          scoreForms.value[sIdx] = {
            rt_details: score.rt_details?.length ? score.rt_details : rtTestTypes.value.map(() => ({ correct: 0 })),
            word_details: score.word_details?.length ? score.word_details : wordTestTypes.value.map(() => ({ correct: 0, retest: false })),
            assignment_score: score.assignment_score || 0,
            assignment_grade: Object.keys(assignmentMap).find(k => assignmentMap[k] === score.assignment_score) || '',
            comment: score.comment || '',
            commentManuallyEdited: true  // 서버에서 불러온 데이터는 항상 수동편집 취급 (자동 덮어쓰기 방지)
          };
          calculateScore(sIdx);
        }
      });
      return;
    }
  } catch (err) {
    console.error('기존 성적 로드 실패', err);
  }

  // 서버에 데이터가 없을 때만 임시저장 확인
  const draft = localStorage.getItem(draftKey);
  if (draft) {
    try {
      const parsed = JSON.parse(draft);
      if (parsed.rtTestTypes) rtTestTypes.value = parsed.rtTestTypes;
      if (parsed.wordTestTypes) wordTestTypes.value = parsed.wordTestTypes;
      if (parsed.scoreForms) {
        if (parsed.scoreForms.length === classStudents.value.length) {
          scoreForms.value = parsed.scoreForms;
        } else {
          localStorage.removeItem(draftKey);
        }
      }
      scoreForms.value.forEach((form, i) => {
        while (form.rt_details.length < rtTestTypes.value.length) {
          form.rt_details.push({ correct: 0, name: '', total: 0 });
        }
        if (form.rt_details.length > rtTestTypes.value.length) form.rt_details.splice(rtTestTypes.value.length);
        while (form.word_details.length < wordTestTypes.value.length) {
          form.word_details.push({ correct: 0, retest: false, name: '', total: 0 });
        }
        if (form.word_details.length > wordTestTypes.value.length) form.word_details.splice(wordTestTypes.value.length);
        calculateScore(i);
      });
    } catch (e) {
      console.error('임시저장 데이터 로드 실패:', e);
      localStorage.removeItem(draftKey);
    }
  }
};

const saveDraftAll = () => {
  const key = `scoreDraft:${selectedClass.value}:${examDate.value}`;
  localStorage.setItem(key, JSON.stringify({
    rtTestTypes: rtTestTypes.value,
    wordTestTypes: wordTestTypes.value,
    scoreForms: scoreForms.value
  }));
  showToast('임시저장 되었습니다.');
};

const saveSingleScore = async (sIdx: number) => {
  savingSingle.value[sIdx] = true;
  savedSingle.value[sIdx] = false;
  try {
    const student = classStudents.value[sIdx];
    const form = scoreForms.value[sIdx];

    const finalRtDetails = form.rt_details.map((d: any, idx: number) => ({
      ...d,
      name: rtTestTypes.value[idx]?.name || `RT ${idx + 1}`,
      total: Number(rtTestTypes.value[idx]?.total) || 0
    }));

    const finalWordDetails = form.word_details.map((d: any, idx: number) => ({
      ...d,
      name: wordTestTypes.value[idx]?.name || `단어 ${idx + 1}`,
      total: Number(wordTestTypes.value[idx]?.total) || 0
    }));

    const payload = {
      student_id: student.id,
      exam_date: examDate.value,
      class_name: selectedClass.value,
      rt_total: rtTestTypes.value.reduce((acc, t) => acc + (Number(t.total) || 0), 0),
      rt_correct: form.rt_details.reduce((acc: number, d: any) => acc + (Number(d.correct) || 0), 0),
      word_total: wordTestTypes.value.reduce((acc, t) => acc + (Number(t.total) || 0), 0),
      word_correct: form.word_details.reduce((acc: number, d: any) => acc + (Number(d.correct) || 0), 0),
      rt_details: finalRtDetails,
      word_details: finalWordDetails,
      assignment_score: Number(form.assignment_score) || 0,
      comment: form.comment || ''
    };

    await scoreApi.create(payload);
    // 개별 저장 후 임시저장 데이터 삭제 (다음 로드 시 서버 데이터 우선)
    localStorage.removeItem(`scoreDraft:${selectedClass.value}:${examDate.value}`);
    savedSingle.value[sIdx] = true;
    showToast(`${student.name} 성적이 저장되었습니다.`);
    setTimeout(() => { savedSingle.value[sIdx] = false; }, 2000);
  } catch (err: any) {
    console.error('개별 저장 오류:', err.response?.data || err.message);
    alert(`저장 실패: ${err.response?.data?.message || err.message}`);
  } finally {
    savingSingle.value[sIdx] = false;
  }
};

const saveAllScores = async () => {
  if (!confirm('모든 학생의 성적표를 생성하시겠습니까?')) return;
  savingAll.value = true;
  try {
    // 순차적으로 저장하여 서버 부하 및 충돌 방지
    for (let i = 0; i < classStudents.value.length; i++) {
      const student = classStudents.value[i];
      const form = scoreForms.value[i];
      
      // 상세 정보에 현재 설정된 이름과 총 문제 수 주입
      const finalRtDetails = form.rt_details.map((d: any, idx: number) => ({
        ...d,
        name: rtTestTypes.value[idx]?.name || `RT ${idx + 1}`,
        total: Number(rtTestTypes.value[idx]?.total) || 0
      }));
      
      const finalWordDetails = form.word_details.map((d: any, idx: number) => ({
        ...d,
        name: wordTestTypes.value[idx]?.name || `단어 ${idx + 1}`,
        total: Number(wordTestTypes.value[idx]?.total) || 0
      }));
      
      const payload = {
        student_id: student.id,
        exam_date: examDate.value,
        class_name: selectedClass.value,
        rt_total: rtTestTypes.value.reduce((acc, t) => acc + (Number(t.total) || 0), 0),
        rt_correct: form.rt_details.reduce((acc: number, d: any) => acc + (Number(d.correct) || 0), 0),
        word_total: wordTestTypes.value.reduce((acc, t) => acc + (Number(t.total) || 0), 0),
        word_correct: form.word_details.reduce((acc: number, d: any) => acc + (Number(d.correct) || 0), 0),
        rt_details: finalRtDetails,
        word_details: finalWordDetails,
        assignment_score: Number(form.assignment_score) || 0,
        comment: form.comment || ''
      };
      
      console.log('저장 시도 데이터:', payload);
      await scoreApi.create(payload);
    }
    
    localStorage.removeItem(`scoreDraft:${selectedClass.value}:${examDate.value}`);
    showToast('모든 성적이 저장되었습니다.');
  } catch (err: any) {
    console.error('성적 저장 오류 상세:', err.response?.data || err.message);
    const errorMsg = err.response?.data?.message || err.message;
    alert(`저장 중 오류가 발생했습니다: ${errorMsg}`);
  } finally {
    savingAll.value = false;
  }
};

const resetAllScores = () => {
  if (!confirm('정말 초기화하시겠습니까? 입력 중인 모든 데이터가 삭제됩니다.')) return;
  
  // 현재 반의 임시저장 데이터 삭제
  const key = `scoreDraft:${selectedClass.value}:${examDate.value}`;
  localStorage.removeItem(key);
  
  // 테스트 종류 초기화
  rtTestTypes.value = [{ name: 'RT 1', total: null }];
  wordTestTypes.value = [{ name: '단어 1', total: null }];
  
  // 입력 폼 및 계산 결과 초기화
  scoreForms.value = classStudents.value.map(() => ({
    rt_details: rtTestTypes.value.map(() => ({ correct: 0 })),
    word_details: wordTestTypes.value.map(() => ({ correct: 0, retest: false })),
    assignment_grade: '',
    assignment_score: 0,
    comment: '',
    commentManuallyEdited: false
  }));
  
  calculatedScores.value = classStudents.value.map(() => ({ 
    rtScore: 0, 
    wordScore: 0, 
    total: 0, 
    average: 0 
  }));
  
  showToast('데이터가 초기화되었습니다.');
};

const showToast = (msg: string) => {
  saveSuccessMessage.value = msg;
  setTimeout(() => saveSuccessMessage.value = '', 3000);
};

const fetchStudents = async () => {
  try {
    const res = await studentApi.getAll();
    if (res.data.success) allStudents.value = res.data.data;
  } catch (err) {
    console.error('학생 목록 로드 실패:', err);
    allStudents.value = [];
  }
};

const classList = computed(() => {
  const set = new Set<string>();
  allStudents.value.forEach(s => {
    if (s.class_name && typeof s.class_name === 'string') {
      s.class_name.split(',').forEach(c => {
        const trimmed = c.trim();
        if (trimmed && trimmed !== 'undefined' && trimmed !== 'null') {
          set.add(trimmed);
        }
      });
    }
  });
  return Array.from(set).filter(name => name && name.length > 0).sort();
});

const toDateInputValue = (v: string) => v ? `20${v}` : '';
const toExamDateValue = (v: string) => v ? v.slice(2) : '';
const examDateInput = computed({
  get: () => toDateInputValue(examDate.value),
  set: (v) => examDate.value = toExamDateValue(v)
});

onMounted(fetchStudents);
watch(examDate, loadExistingScores);
</script>

<style scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type='number'] { -moz-appearance: textfield; }
.sticky { position: sticky; }
</style>
