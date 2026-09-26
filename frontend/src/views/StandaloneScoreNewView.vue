<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">단독 성적 입력 (보강/혼합)</h2>
    </div>

    <!-- 학생 추가 영역 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- 왼쪽: 시험일자 및 개별 검색 -->
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">시험일자 <span class="text-red-500">*</span></label>
            <input v-model="examDateInput" type="date" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">1. 이름으로 개별 추가</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input 
                  v-model="searchQuery" 
                  @focus="showSearchDropdown = true"
                  type="text" 
                  placeholder="이름으로 학생 검색" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div v-if="showSearchDropdown && filteredAllStudents.length > 0" class="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                  <div 
                    v-for="student in filteredAllStudents" 
                    :key="student.id" 
                    @click="addStudent(student)"
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  >
                    <span class="font-bold">{{ student.name }}</span>
                    <span class="text-xs text-gray-500">{{ student.class_name || '미배정' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">반에 구애받지 않고 특정 학생을 개별적으로 추가할 수 있습니다.</p>
          </div>
        </div>

        <!-- 오른쪽: 반 단위로 불러오기 -->
        <div class="space-y-4 pt-0 md:border-l md:pl-8 border-gray-200">
          <label class="block text-sm font-bold text-gray-700 mb-2">2. 반 단위로 전체 불러오기</label>
          <div class="flex gap-2">
            <select v-model="selectedClassIdForLoad" class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">불러올 반을 선택하세요</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
            <button 
              @click="loadStudentsByClass" 
              :disabled="!selectedClassIdForLoad" 
              class="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
            >
              불러오기
            </button>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 mt-4 space-y-1">
            <p><strong class="text-gray-800">💡 보강 입력 권장 순서</strong></p>
            <p>① 위에서 보강할 <span class="font-bold text-blue-600">반 전체를 불러옵니다.</span></p>
            <p>② 목록에서 <span class="font-bold text-red-500">보강 미해당 학생의 [X]를 눌러 제외</span>합니다.</p>
            <p>③ 남은 학생들의 성적을 입력하고 저장합니다.</p>
          </div>
        </div>

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
                <select v-model="test.type" class="px-2 py-1 text-xs border rounded bg-white" @change="updateAllScoreForms">
                  <option value="pf">Clear / Clinic</option>
                  <option value="score">100점 만점</option>
                </select>
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

    <!-- 성적 입력 테이블 -->
    <div v-if="classStudents.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">
          단독 성적 입력 대상자 ({{ classStudents.length }}명)
        </h3>
        <button @click="classStudents = []; scoreForms = []" class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border rounded hover:bg-gray-50 transition">
          목록 비우기
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">학생명 및 반 선택</th>
              
              <!-- RT 테스트 컬럼들 -->
              <th v-for="(test, idx) in rtTestTypes" :key="'rt-h-'+idx" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                RT: {{ test.name || '미지정' }} ({{ test.type === 'pf' ? 'Clear/Clinic' : '100점' }})
              </th>

              <!-- 단어 테스트 컬럼들 -->
              <th v-for="(test, idx) in wordTestTypes" :key="'word-h-'+idx" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                단어: {{ test.name || '미지정' }} ({{ test.total || 0 }})
              </th>

              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">과제+태도점수</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">평균</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">코멘트</th>
              <th class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">저장</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(student, sIdx) in classStudents" :key="student.id" :class="scoreForms[sIdx]?.absent ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'">
              <!-- 학생명 및 반 선택 -->
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                <div class="flex flex-col gap-2">
                  <div class="flex justify-between items-center">
                    <span>{{ student.name || '이름없음' }} <span v-if="student.school" class="text-xs text-gray-500 font-normal">({{ student.school }})</span></span>
                    <button @click="removeStudentItem(sIdx)" class="text-gray-400 hover:text-red-500 text-lg leading-none" title="목록에서 제외">&times;</button>
                  </div>
                  <select v-model="scoreForms[sIdx].selected_class" class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-primary w-32" :disabled="scoreForms[sIdx]?.absent">
                    <option value="">(반을 선택하세요)</option>
                    <option v-for="cls in getStudentClasses(student)" :key="cls" :value="cls">{{ cls }}</option>
                  </select>
                  <button 
                    @click="toggleAbsent(sIdx)" 
                    class="text-[10px] px-2 py-1 rounded border transition w-fit mt-1"
                    :class="scoreForms[sIdx]?.absent ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300'"
                  >
                    결석
                  </button>
                </div>
              </td>

              <!-- RT 점수 입력 -->
              <td v-for="(test, tIdx) in rtTestTypes" :key="'rt-i-'+sIdx+'-'+tIdx" class="px-2 py-3 text-center">
                <template v-if="scoreForms[sIdx]?.rt_details?.[tIdx]">
                  <div class="flex flex-col items-center gap-1">
                    <div v-if="test.type === 'pf'" class="flex gap-1 justify-center">
                      <button @click="setRtPf(sIdx, tIdx, 'P')" :disabled="scoreForms[sIdx]?.absent || scoreForms[sIdx].rt_details[tIdx].exempt" class="px-2 h-8 text-xs font-bold rounded border transition disabled:opacity-50 disabled:cursor-not-allowed" :class="scoreForms[sIdx].rt_details[tIdx].correct === 'P' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-500'">Clear</button>
                      <button @click="setRtPf(sIdx, tIdx, 'F')" :disabled="scoreForms[sIdx]?.absent || scoreForms[sIdx].rt_details[tIdx].exempt" class="px-2 h-8 text-xs font-bold rounded border transition disabled:opacity-50 disabled:cursor-not-allowed" :class="scoreForms[sIdx].rt_details[tIdx].correct === 'F' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-200 hover:border-red-500'">Clinic</button>
                    </div>
                    <input v-else v-model.number="scoreForms[sIdx].rt_details[tIdx].correct" type="number" min="0" max="100" step="0.1" placeholder="점수" class="w-16 px-2 py-1 text-sm border rounded text-center disabled:bg-gray-200 disabled:cursor-not-allowed" :disabled="scoreForms[sIdx]?.absent || scoreForms[sIdx].rt_details[tIdx].exempt" @input="calculateScore(sIdx)" />
                    
                    <label class="flex items-center gap-1 mt-1 cursor-pointer">
                      <input type="checkbox" v-model="scoreForms[sIdx].rt_details[tIdx].exempt" @change="calculateScore(sIdx)" :disabled="scoreForms[sIdx]?.absent" class="w-3 h-3 text-gray-400 rounded focus:ring-0 cursor-pointer disabled:cursor-not-allowed" />
                      <span class="text-[10px] text-gray-500" :class="{'font-bold text-gray-700': scoreForms[sIdx].rt_details[tIdx].exempt}">해당없음</span>
                    </label>
                  </div>
                </template>
              </td>

              <!-- 단어 맞춘 문제 입력 -->
              <td v-for="(test, tIdx) in wordTestTypes" :key="'word-i-'+sIdx+'-'+tIdx" class="px-2 py-3 text-center">
                <div v-if="scoreForms[sIdx]?.word_details?.[tIdx]" class="flex flex-col items-center gap-1">
                  <input v-model.number="scoreForms[sIdx].word_details[tIdx].correct" type="number" min="0" :max="test.total" class="w-16 px-2 py-1 text-sm border rounded text-center disabled:bg-gray-200 disabled:cursor-not-allowed" :disabled="scoreForms[sIdx]?.absent || scoreForms[sIdx].word_details[tIdx].retest || scoreForms[sIdx].word_details[tIdx].exempt" @input="calculateScore(sIdx)" />
                  <label class="flex items-center gap-1 mt-1 cursor-pointer">
                    <input type="checkbox" v-model="scoreForms[sIdx].word_details[tIdx].exempt" @change="calculateScore(sIdx)" :disabled="scoreForms[sIdx]?.absent" class="w-3 h-3 text-gray-400 rounded focus:ring-0 cursor-pointer disabled:cursor-not-allowed" />
                    <span class="text-[10px] text-gray-500" :class="{'font-bold text-gray-700': scoreForms[sIdx].word_details[tIdx].exempt}">해당없음</span>
                  </label>
                </div>
              </td>

              <!-- 과제점수 (A, B, C, F) -->
              <td v-if="scoreForms[sIdx]" class="px-2 py-3 text-center">
                <div class="flex gap-1 justify-center">
                  <button v-for="grade in ['A', 'B', 'C', 'F']" :key="grade" @click="setAssignmentGrade(sIdx, grade)" :disabled="scoreForms[sIdx]?.absent" class="w-8 h-8 text-xs font-bold rounded-full border transition disabled:opacity-50 disabled:cursor-not-allowed" :class="scoreForms[sIdx].assignment_grade === grade ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200 hover:border-primary'">
                    {{ grade }}
                  </button>
                </div>
              </td>

              <!-- 평균 -->
              <td class="px-2 py-3 text-center text-sm font-semibold text-primary">
                {{ calculatedScores[sIdx]?.average !== null && calculatedScores[sIdx]?.average !== undefined ? calculatedScores[sIdx]?.average?.toFixed(1) : '-' }}
              </td>

              <!-- 코멘트 -->
              <td v-if="scoreForms[sIdx]" class="px-2 py-3">
                <textarea v-model="scoreForms[sIdx].comment" rows="1" placeholder="코멘트" class="w-40 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-200 disabled:cursor-not-allowed" :disabled="scoreForms[sIdx]?.absent" @input="onCommentInput(sIdx)"></textarea>
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
          <button @click="saveAllScores" :disabled="savingAll" class="px-8 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {{ savingAll ? '생성 중...' : '성적 저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 학생 없음 안내 -->
    <div v-if="classStudents.length === 0" class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      학생을 검색하여 추가하거나 반 전체를 불러오면 성적을 입력할 수 있습니다.
    </div>

    <!-- 알림 메시지 -->
    <div v-if="saveSuccessMessage" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      {{ saveSuccessMessage }}
    </div>

    <!-- 학습 경고 안내 커스텀 모달 (복사 지원) -->
    <div v-if="showWarningModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div class="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-red-700 flex items-center gap-2">
            ⚠️ 학습 및 난이도 경고 발생
          </h3>
          <button @click="showWarningModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-600 mb-4">성적 저장이 완료되었습니다.<br/>아래 경고 내역을 복사하여 원장님께 보고해 주세요.</p>
          
          <div class="bg-gray-50 p-4 rounded border text-sm text-gray-800 font-medium whitespace-pre-wrap select-all">
            {{ warningMessages.join('\n') }}
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button @click="showWarningModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-bold">닫기</button>
            <button @click="copyWarnings" class="px-4 py-2 bg-primary text-white rounded hover:bg-blue-800 font-bold flex items-center gap-2">
              <span>📋 텍스트 복사</span>
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { studentApi, scoreApi, warningApi } from '../services/api';
import { getToday } from '../utils/date';
import { normalizeClassName } from '../utils/string';
import type { Student } from '../types';

const selectedClass = ref<string>(''); // 더이상 반 선택은 안 하지만 기존 로직 호환 위해 둠
const searchQuery = ref('');
const showSearchDropdown = ref(false);

const filteredAllStudents = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return allStudents.value.filter(s => 
    !classStudents.value.find(cs => cs.id === s.id) && // 이미 추가된 학생 제외
    s.name?.toLowerCase().includes(query)
  );
});

const selectedClassIdForLoad = ref<number | string>('');
const loadStudentsByClass = () => {
  if (!selectedClassIdForLoad.value) return;
  const targetClass = classes.value.find(c => c.id === selectedClassIdForLoad.value);
  if (!targetClass) return;

  // 해당 반 학생 필터링
  const studentsInClass = allStudents.value.filter(s => {
    if (!s.class_name) return false;
    return s.class_name.split(',').map((cn: string) => cn.trim()).includes(targetClass.name);
  });

  if (studentsInClass.length === 0) {
    alert('해당 반에 등록된 학생이 없습니다.');
    return;
  }

  // 기존 목록에 없는 학생만 추가
  let addedCount = 0;
  studentsInClass.forEach(student => {
    if (!classStudents.value.some(cs => cs.id === student.id)) {
      classStudents.value.push(student);
      scoreForms.value.push(createEmptyForm(student));
      addedCount++;
    }
  });

  if (addedCount > 0) {
    alert(`해당 반 학생 ${addedCount}명이 명단에 추가되었습니다.\n아래 명단에서 보강 미해당 학생을 [X] 버튼으로 제외하세요.`);
  } else {
    alert('이미 명단에 모두 추가된 학생들입니다.');
  }
};

const addStudent = (student: Student) => {
  classStudents.value.push(student);
  const studentClasses = getStudentClasses(student);
  const defaultClass = studentClasses.length === 1 ? studentClasses[0] : '';
  
  scoreForms.value.push({
    rt_details: rtTestTypes.value.map(t => ({ correct: 0, name: t.name, type: t.type, total: t.total, exempt: false })),
    word_details: wordTestTypes.value.map(t => ({ correct: 0, retest: false, name: t.name, total: t.total, exempt: false })),
    assignment_grade: '',
    assignment_score: 0,
    comment: '',
    commentManuallyEdited: false,
    absent: false,
    selected_class: defaultClass
  });
  calculatedScores.value.push({ total: 0, average: 0, rtScore: 0, wordScore: 0 });
  
  searchQuery.value = '';
  showSearchDropdown.value = false;
};

const getStudentClasses = (student: Student) => {
  if (!student.class_name) return [];
  return student.class_name.split(',').map(c => c.trim()).filter(c => c);
};

const removeStudent = (idx: number) => {
  classStudents.value.splice(idx, 1);
  scoreForms.value.splice(idx, 1);
  calculatedScores.value.splice(idx, 1);
  savingSingle.value = {};
  savedSingle.value = {};
};

// ... clicking outside dropdown to close ...
const handleClickOutside = (e: MouseEvent) => {
  const el = e.target as HTMLElement;
  if (!el.closest('.relative')) {
    showSearchDropdown.value = false;
  }
};
onMounted(() => {
  fetchStudents();
  document.addEventListener('click', handleClickOutside);
});
const examDate = ref<string>(getToday());
const retestComment = '단어 테스트 점수 미흡으로 남아서 응시 후 귀가 예정입니다.';
const clinicComment = '오늘 우리 학생은 Review Test 오답 보완을 위해 Clinic을 진행했습니다. 밀착 감독하에 틀린 문제를 스스로 다시 풀며 취약한 오답 요인을 꼼꼼하게 정리해 Clear했습니다.';

const rtTestTypes = ref<Array<{ name: string; type: 'score' | 'pf' }>>([{ name: 'RT 1', type: 'pf' }]);
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
      rtTestTypes.value.push({ name: `RT ${rtTestTypes.value.length + 1}`, type: 'pf' });
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
        form.rt_details.push({ correct: 0, name: '', type: 'pf', total: 100, exempt: false });
      }
    if (form.rt_details.length > rtTestTypes.value.length) form.rt_details.splice(rtTestTypes.value.length);
    
    // Word details sync
    while (form.word_details.length < wordTestTypes.value.length) {
      form.word_details.push({ correct: 0, retest: false, name: '', total: 0, exempt: false });
    }
    if (form.word_details.length > wordTestTypes.value.length) form.word_details.splice(wordTestTypes.value.length);
    
    calculateScore(sIdx);
  });
};

const toggleAbsent = (sIdx: number) => {
  const form = scoreForms.value[sIdx];
  form.absent = !form.absent;
  
  if (form.absent) {
    // 결석 처리 시 모든 점수 0으로 초기화
    form.rt_details.forEach((d: any) => { d.correct = 0; d.exempt = false; });
    form.word_details.forEach((d: any) => { d.correct = 0; d.retest = false; d.exempt = false; });
    form.assignment_grade = '';
    form.assignment_score = 0;
  }
  
  calculateScore(sIdx);
};

// 학생 완전 제외 버튼 (X)
const removeStudentItem = (sIdx: number) => {
  classStudents.value.splice(sIdx, 1);
  scoreForms.value.splice(sIdx, 1);
};

  const setAssignmentGrade = (sIdx: number, grade: string) => {
    scoreForms.value[sIdx].assignment_grade = grade;
    scoreForms.value[sIdx].assignment_score = assignmentMap[grade];
    calculateScore(sIdx);
  };

  const setRtPf = (sIdx: number, tIdx: number, val: 'P' | 'F') => {
    scoreForms.value[sIdx].rt_details[tIdx].correct = val;
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
  
  // 결석 처리된 경우 모든 점수를 0으로 설정
  if (form.absent) {
    calculatedScores.value[sIdx] = {
      rtScore: 0,
      wordScore: 0,
      total: 0,
      average: 0,
      rtAllPf: false
    };
    return;
  }
  
  // RT 평균 점수 계산 로직 변경 (Clear/Clinic은 점수 합산에서 제외, 해당없음은 전체에서 제외)
  let rtSum = 0;
  let rtScoreTestCount = 0;
  let rtClinicFound = false;
  let rtValidTestsCount = 0;
  let rtAllPf = false;
  let rtClearCount = 0;

  rtTestTypes.value.forEach((test, tIdx) => {
    const detail = form.rt_details[tIdx];
    if (detail?.exempt) return; // 해당없음 무시
    
    rtValidTestsCount++;
    let score = 0; 
    const val = detail?.correct; 
    if (test.type === 'pf') { 
      // pf 타입은 평균 점수 계산에서 제외
      if (val === 'F') { rtClinicFound = true; } 
      else if (val === 'P') { rtClearCount++; }
    } else { 
      score = Number(val) || 0; 
      if (score < 50) rtClinicFound = true;
      rtSum += score; 
      rtScoreTestCount++;
    }
  });

  rtAllPf = rtValidTestsCount > 0 && rtTestTypes.value.every((test, tIdx) => form.rt_details[tIdx]?.exempt || test.type === 'pf');
  
  let rtAvg = 0;
  if (rtScoreTestCount > 0) {
    rtAvg = rtSum / rtScoreTestCount; // 100점 만점인 테스트들끼리만 평균
  } else if (rtAllPf || rtValidTestsCount === 0) {
    rtAvg = null; // 모두 pf 테스트인 경우나 모두 해당없음인 경우 RT 평균은 계산하지 않음 (null로 표시)
  }

  // 단어 평균 점수
  let wordSum = 0;
  let retestFound = false;
  let wordValidTestsCount = 0;
  wordTestTypes.value.forEach((test, tIdx) => {
    const detail = form.word_details[tIdx];
    if (detail?.exempt) return; // 해당없음 무시
    
    wordValidTestsCount++;
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
  const wordAvg = wordValidTestsCount > 0 ? wordSum / wordValidTestsCount : 0;

  // 85점 미만인 경우 및 RT Clinic인 경우 코멘트 자동 추가 (수동 편집하지 않은 경우에만)
  if (!form.commentManuallyEdited) {
    let currentComment = (form.comment || '').trim();
    
    if (retestFound) {
      // 재시험 코멘트가 없으면 추가
      if (!currentComment.includes(retestComment)) {
        currentComment = currentComment ? `${currentComment}\n${retestComment}` : retestComment;
      }
    } else {
      // 재시험이 없으면 자동생성 코멘트만 제거
      currentComment = currentComment.replace(new RegExp(retestComment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim();
    }

    if (rtClinicFound) {
      // 클리닉 코멘트가 없으면 추가
      if (!currentComment.includes(clinicComment)) {
        currentComment = currentComment ? `${currentComment}\n${clinicComment}` : clinicComment;
      }
    } else {
      currentComment = currentComment.replace(new RegExp(clinicComment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim();
    }

    form.comment = currentComment;
  }

  // 총점 및 평균 (RT가 null인 경우 분모를 2로 조정)
  let total = wordAvg + (form.assignment_score || 0);
  let average = 0;
  if (rtAvg !== null) {
    total += rtAvg;
    average = total / 3;
  } else {
    average = total / 2;
  }

  calculatedScores.value[sIdx] = {
    rtScore: rtAvg === null ? null : rtAvg,
    wordScore: wordAvg,
    total: Math.round(total * 100) / 100,
    average: Math.round(average * 100) / 100,
    rtAllPf: rtAllPf,
    rtClinicFound: rtClinicFound,
    rtClearCount: rtClearCount
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
      return s.class_name.split(',').map(c => normalizeClassName(c)).includes(normalizeClassName(selectedClass.value));
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    scoreForms.value = classStudents.value.map(() => ({
      rt_details: rtTestTypes.value.map(t => ({ correct: 0, name: t.name, type: t.type, total: t.total, exempt: false })),
      word_details: wordTestTypes.value.map(t => ({ correct: 0, retest: false, name: t.name, total: t.total, exempt: false })),
    assignment_grade: '',
    assignment_score: 0,
    comment: '',
    commentManuallyEdited: false,
    absent: false
  }));
  
  calculatedScores.value = classStudents.value.map(() => ({ total: 0, average: 0 }));
  loadExistingScores();
};

const loadExistingScores = () => {
  // 단독 성적 입력은 기존 데이터를 불러오지 않고 날짜 변경 시 폼만 초기화합니다.
  rtTestTypes.value = [{ name: 'RT 1', type: 'pf' }];
  wordTestTypes.value = [{ name: '단어 1', total: null }];

  scoreForms.value = classStudents.value.map(() => ({
    rt_details: rtTestTypes.value.map(t => ({ correct: 0, name: t.name, type: t.type, total: 100, exempt: false })),
    word_details: wordTestTypes.value.map(t => ({ correct: 0, retest: false, name: t.name, total: t.total, exempt: false })),
    assignment_grade: '',
    assignment_score: 0,
    comment: '',
    commentManuallyEdited: false,
    absent: false
  }));
  calculatedScores.value = classStudents.value.map(() => ({ 
    rtScore: 0, 
    wordScore: 0, 
    total: 0, 
    average: 0 
  }));
};

const saveDraftAll = async () => {
  // 단독 성적 입력은 임시 저장을 지원하지 않습니다.
};

const warningMessages = ref<string[]>([]);
const showWarningModal = ref(false);

const copyWarnings = async () => {
  const textToCopy = warningMessages.value.join('\n');
  try {
    await navigator.clipboard.writeText(textToCopy);
    alert('복사되었습니다! 원장님께 카톡으로 바로 붙여넣기(Ctrl+V) 해주세요.');
  } catch (err) {
    alert('복사에 실패했습니다. 텍스트를 직접 드래그해서 복사해 주세요.');
  }
};

const saveSingleScore = async (sIdx: number) => {
  if (!scoreForms.value[sIdx].selected_class) {
    alert('저장하려는 학생의 반을 선택해주세요.');
    return;
  }
  
  savingSingle.value[sIdx] = true;
  savedSingle.value[sIdx] = false;
  try {
    const student = classStudents.value[sIdx];
    const form = scoreForms.value[sIdx];

        const finalRtDetails = form.rt_details.map((d: any, idx: number) => ({
          ...d,
          name: rtTestTypes.value[idx]?.name || `RT ${idx + 1}`,
          type: rtTestTypes.value[idx]?.type || 'score',
          total: 100 // RT는 항상 100점 만점
        }));

    const finalWordDetails = form.word_details.map((d: any, idx: number) => ({
      ...d,
      name: wordTestTypes.value[idx]?.name || `단어 ${idx + 1}`,
      total: Number(wordTestTypes.value[idx]?.total) || 0
    }));

      const payload = {
        student_id: student.id,
        exam_date: examDate.value,
        class_name: form.selected_class || null, // 단독 보강시에도 선택한 반 전송
        rt_total: rtTestTypes.value.length * 100,
        rt_correct: form.rt_details.reduce((acc: number, d: any, idx: number) => { 
          if (d.exempt) return acc;
          const test = rtTestTypes.value[idx]; 
          if (test?.type === 'pf') { return acc + (d.correct === 'P' ? 100 : 0); } 
          return acc + (Number(d.correct) || 0); 
        }, 0),
        rt_all_pf: calculatedScores.value[sIdx]?.rtAllPf || false,
        word_total: wordTestTypes.value.reduce((acc, t, idx) => form.word_details[idx]?.exempt ? acc : acc + (Number(t.total) || 0), 0),
        word_correct: form.word_details.reduce((acc: number, d: any) => d.exempt ? acc : acc + (Number(d.correct) || 0), 0),
        rt_details: finalRtDetails,
        word_details: finalWordDetails,
        assignment_score: Number(form.assignment_score) || 0,
        comment: form.comment || '',
        is_absent: form.absent,
        is_standalone: true // 단독 보강 플래그
      };

    await scoreApi.create(payload);
    
// Draft delete skip
      
      // 비동기 계산을 위해 백엔드가 경고를 생성할 시간을 약간 줍니다 (1.5초)
      setTimeout(async () => {
        try {
          const warnRes = await warningApi.getActive();
          if (warnRes.data.success && warnRes.data.data) {
            const newWarnings = warnRes.data.data.filter((w: any) => w.exam_date === examDate.value && w.class_name === selectedClass.value);
            if (newWarnings.length > 0) {
              // 중복 텍스트 완벽하게 걸러내기
              const uniqueSet = new Set<string>();
              newWarnings.forEach((w: any) => {
                if (w.student_name) {
                  uniqueSet.add(`⚠️ [학생경고] ${w.student_name} - ${w.message}`);
                } else {
                  // 반전체경고 문구 포맷팅
                  uniqueSet.add(`🚨 [반전체경고] ${w.class_name} ${w.message}`);
                }
              });
              warningMessages.value = Array.from(uniqueSet);
              showWarningModal.value = true;
            } else {
              showToast(`${student.name} 성적이 저장되었습니다.`);
            }
          } else {
            showToast(`${student.name} 성적이 저장되었습니다.`);
          }
        } catch (e) {
          showToast(`${student.name} 성적이 저장되었습니다.`);
        }
      }, 1500);

      setTimeout(() => { savedSingle.value[sIdx] = false; }, 3000);
    } catch (err: any) {
    console.error('개별 저장 오류:', err.response?.data || err.message);
    alert(`저장 실패: ${err.response?.data?.message || err.message}`);
  } finally {
    savingSingle.value[sIdx] = false;
  }
};

const saveAllScores = async () => {
  for (let i = 0; i < classStudents.value.length; i++) {
    if (!scoreForms.value[i].selected_class) {
      alert(`${classStudents.value[i].name} 학생의 반을 선택해주세요.`);
      return;
    }
  }

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
        type: rtTestTypes.value[idx]?.type || 'score',
        total: 100 // RT는 항상 100점 만점
      }));
      
      const finalWordDetails = form.word_details.map((d: any, idx: number) => ({
        ...d,
        name: wordTestTypes.value[idx]?.name || `단어 ${idx + 1}`,
        total: Number(wordTestTypes.value[idx]?.total) || 0
      }));
      
// scoreapi.create 호출 부분 찾아서 저장 로직 확인
      const payload = {
        student_id: student.id,
        exam_date: examDate.value,
        class_name: form.selected_class || null,
        rt_total: rtTestTypes.value.length * 100,
        rt_correct: form.rt_details.reduce((acc: number, d: any, idx: number) => { 
          if (d.exempt) return acc;
          const test = rtTestTypes.value[idx]; 
          if (test?.type === 'pf') { return acc + (d.correct === 'P' ? 100 : 0); } 
          return acc + (Number(d.correct) || 0); 
        }, 0),
        rt_all_pf: calculatedScores.value[i]?.rtAllPf || false, // 백엔드에서 평균 산출 시 사용
        word_total: wordTestTypes.value.reduce((acc, t, idx) => form.word_details[idx]?.exempt ? acc : acc + (Number(t.total) || 0), 0),
        word_correct: form.word_details.reduce((acc: number, d: any) => d.exempt ? acc : acc + (Number(d.correct) || 0), 0),
        rt_details: finalRtDetails,
        word_details: finalWordDetails,
        assignment_score: Number(form.assignment_score) || 0,
        comment: form.comment || '',
        is_absent: form.absent, // 결석 여부 명시적 전송
        is_standalone: true
      };
      
      console.log('저장 시도 데이터:', payload);
      await scoreApi.create(payload);
    }
    
// Delete draft skip
    
    // 전체 저장 완료 후 1.5초 대기 후 경고 체크
    setTimeout(async () => {
      try {
        const warnRes = await warningApi.getActive();
        if (warnRes.data.success && warnRes.data.data) {
          const newWarnings = warnRes.data.data.filter((w: any) => w.exam_date === examDate.value && w.class_name === selectedClass.value);
          if (newWarnings.length > 0) {
            // 중복 텍스트 완벽하게 걸러내기
            const uniqueSet = new Set<string>();
            newWarnings.forEach((w: any) => {
              if (w.student_name) {
                uniqueSet.add(`⚠️ [학생경고] ${w.student_name} - ${w.message}`);
              } else {
                // 반전체경고 문구 포맷팅
                uniqueSet.add(`🚨 [반전체경고] ${w.class_name} ${w.message}`);
              }
            });
            warningMessages.value = Array.from(uniqueSet);
            showWarningModal.value = true;
          } else {
            showToast('모든 성적이 저장되었습니다.');
          }
        } else {
          showToast('모든 성적이 저장되었습니다.');
        }
      } catch (e) {
        showToast('모든 성적이 저장되었습니다.');
      }
    }, 1500);

  } catch (err: any) {
    console.error('성적 저장 오류 상세:', err.response?.data || err.message);
    const errorMsg = err.response?.data?.message || err.message;
    alert(`저장 중 오류가 발생했습니다: ${errorMsg}`);
  } finally {
    savingAll.value = false;
  }
};

// delete draft functionality
const resetAllScores = async () => {
  if (!confirm('정말 초기화하시겠습니까? 입력 중인 모든 데이터가 삭제됩니다.')) return;
  
    // 테스트 종류 초기화
    rtTestTypes.value = [{ name: 'RT 1', type: 'pf' }];
    wordTestTypes.value = [{ name: '단어 1', total: null }];

  // 입력 폼 및 계산 결과 초기화
    scoreForms.value = classStudents.value.map(() => ({
      rt_details: rtTestTypes.value.map(t => ({ correct: 0, type: t.type, total: 100, exempt: false })),
      word_details: wordTestTypes.value.map(() => ({ correct: 0, retest: false, exempt: false })),
    assignment_grade: '',
    assignment_score: 0,
    comment: '',
    commentManuallyEdited: false,
    absent: false
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
    const res = await studentApi.getAll({ status: 'active' });
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
        const normalized = normalizeClassName(c);
        if (normalized && normalized !== 'undefined' && normalized !== 'null') {
          set.add(normalized);
        }
      });
    }
  });
  return Array.from(set).sort();
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
