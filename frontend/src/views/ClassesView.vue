<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">반 관리</h2>
      <button
        @click="openClassModal('create')"
        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
      >
        + 새 반 추가
      </button>
    </div>

    <!-- 반 리스트 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div
        v-for="item in classes"
        :key="item.id"
        class="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary hover:shadow-lg transition cursor-pointer"
        :class="{ 'ring-2 ring-primary': selectedClass?.id === item.id }"
        @click="selectClass(item)"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ item.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ item.teacher_name ? `담임: ${item.teacher_name}` : '담임 미지정' }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click.stop="openClassModal('edit', item)" class="text-gray-400 hover:text-primary">
              <span class="text-xs font-bold">수정</span>
            </button>
            <button @click.stop="deleteClass(item.id)" class="text-gray-400 hover:text-red-600">
              <span class="text-xs font-bold">삭제</span>
            </button>
          </div>
        </div>
        
        <div class="space-y-2 mb-4">
          <p class="text-sm text-gray-600"><span class="font-bold">진도:</span> {{ item.progress || '-' }}</p>
          <p class="text-sm text-gray-600"><span class="font-bold">교재:</span> {{ item.textbook || '-' }}</p>
          <p class="text-sm text-gray-600"><span class="font-bold">숙제:</span> {{ item.homework || '-' }}</p>
        </div>

        <div class="flex justify-between items-center text-xs text-gray-400">
          <span>등록 학생: {{ item.student_count || 0 }}명</span>
          <span>생성일: {{ item.created_at?.split('T')[0] }}</span>
        </div>
      </div>
    </div>

    <!-- 선택된 반의 학생 관리 및 학습 관리 -->
    <div v-if="selectedClass" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 왼쪽: 학생 목록 (너비 축소: 12개 중 4개 컬럼 사용) -->
      <div class="lg:col-span-4 bg-white rounded-lg shadow-lg overflow-hidden border flex flex-col">
        <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 class="text-md font-bold text-gray-800">학생 목록</h3>
          <button
            v-if="isAdmin"
            @click="openStudentAssignModal"
            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs"
          >
            추가/변경
          </button>
        </div>
        <div class="flex-1 overflow-y-auto max-h-[600px]">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-600 uppercase">이름</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-600 uppercase">학교/학년</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-600 uppercase">연락처</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-600 uppercase">최근상담</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in sortedClassStudents" :key="student.id" class="hover:bg-gray-50 cursor-pointer" @click="openCounselingModal(student)">
                <td class="px-4 py-4 whitespace-nowrap text-base font-bold text-gray-900">
                  {{ student.name }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-base text-gray-700 font-bold">
                  {{ student.school || '-' }}<br/>{{ student.grade || '-' }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div class="flex flex-col gap-1.5">
                    <span class="font-bold">학: {{ formatPhone(student.phone) }}</span>
                    <span class="font-extrabold text-blue-700">부: {{ formatPhone(student.parent_phone) }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-bold">
                  <div v-if="student.last_counseling_date" class="text-primary">
                    {{ student.last_counseling_date }}
                  </div>
                  <div v-else class="text-gray-300">-</div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="classStudents.length === 0" class="text-center py-8 text-gray-400 text-xs">
            배정된 학생 없음
          </div>
        </div>
      </div>

      <!-- 오른쪽: 반별 학습 관리 (너비 확대: 12개 중 8개 컬럼 사용) -->
      <div class="lg:col-span-8 bg-white rounded-lg shadow-lg overflow-hidden border">
        <div class="p-4 bg-primary text-white flex justify-between items-center">
          <h3 class="text-lg font-bold">{{ selectedClass.name }} 학습 관리</h3>
          <div class="flex items-center gap-2">
            <label class="text-xs opacity-90">선택 날짜:</label>
            <input v-model="learningLogDate" type="date" class="px-2 py-1 text-xs border rounded text-gray-800" @change="fetchLearningLog" />
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 min-h-[400px]">
          <!-- 최근 2주 기록 목록 (사이드바) -->
          <div class="md:col-span-1 border-r bg-gray-50 p-4 overflow-y-auto max-h-[600px]">
            <h4 class="text-sm font-bold text-gray-600 uppercase mb-4 px-1">최근 2주 기록</h4>
            <div class="space-y-2">
              <button
                v-for="date in recentLogDates"
                :key="date"
                @click="selectLogDate(date)"
                class="w-full text-left px-4 py-3 rounded-lg text-sm transition font-bold shadow-sm"
                :class="learningLogDate === date ? 'bg-primary text-white' : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-100'"
              >
                {{ formatDateWithDay(date) }}
              </button>
              <div v-if="recentLogDates.length === 0" class="text-center py-8 text-gray-400 text-xs">
                기록 없음
              </div>
            </div>
          </div>

          <!-- 입력 및 상세 내용 -->
          <div class="md:col-span-3 p-6 space-y-6">
            <div class="grid grid-cols-1 gap-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-base font-bold text-gray-700 mb-2">진도</label>
                  <input v-model="learningLog.progress" type="text" class="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary outline-none font-medium" placeholder="오늘 나간 진도를 입력하세요" />
                </div>
                <div>
                  <label class="block text-base font-bold text-gray-700 mb-2">교재</label>
                  <input v-model="learningLog.textbook" type="text" class="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary outline-none font-medium" placeholder="사용 중인 교재를 입력하세요" />
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label class="block text-base font-bold text-gray-700">오늘 내준 숙제</label>
                  <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-500 font-bold">숙제 검사 예정일:</label>
                    <input v-model="learningLog.homework_deadline" type="date" class="px-3 py-1.5 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-primary font-bold" />
                  </div>
                </div>
                <textarea v-model="learningLog.homework" rows="5" class="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none font-medium" placeholder="학생들에게 내준 숙제를 입력하세요"></textarea>
              </div>
              
              <!-- 이전 숙제 확인 영역 (추가) -->
              <div v-if="previousHomework" class="bg-orange-50 border border-orange-100 rounded-lg p-5 shadow-sm">
                <div class="flex justify-between items-center mb-3">
                  <h5 class="text-base font-bold text-orange-800 flex items-center gap-2">
                    <span class="text-xl">📋</span> 오늘 검사해야 할 숙제 ({{ previousHomework.log_date }} 부여)
                  </h5>
                </div>
                <div class="text-base text-gray-800 whitespace-pre-wrap bg-white/70 p-4 rounded-lg border border-orange-100 font-medium leading-relaxed">
                  {{ previousHomework.homework || '등록된 숙제가 없습니다.' }}
                </div>
              </div>
            </div>

            <div class="flex justify-end items-center gap-4 pt-4 border-t">
              <span v-if="saveStatus" class="text-sm text-green-600 font-bold animate-pulse">{{ saveStatus }}</span>
              <button 
                @click="saveLearningLog" 
                :disabled="savingLog"
                class="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition shadow-md disabled:opacity-50"
              >
                {{ savingLog ? '저장 중...' : '학습 내용 저장' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상담일지 모달 (반 관리에서 바로 사용) -->
    <div v-if="showCounselingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeCounselingModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800">{{ selectedStudentForCounseling?.name }} 학생 상담</h3>
          <button @click="closeCounselingModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <!-- 상담 입력 -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">상담 날짜</label>
              <input v-model="counselingForm.consultation_date" type="date" class="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">상담 분류</label>
              <select v-model="counselingForm.category" class="w-full px-3 py-2 border rounded text-sm">
                <option value="일반상담">일반상담</option>
                <option value="성적상담">성적상담</option>
                <option value="진로상담">진로상담</option>
                <option value="생활지도">생활지도</option>
              </select>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-xs text-gray-500 mb-1">상담 내용</label>
            <textarea v-model="counselingForm.content" rows="3" class="w-full px-3 py-2 border rounded text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="상담 내용을 입력하세요"></textarea>
          </div>
          <div class="flex justify-end">
            <button @click="saveCounselingLog" :disabled="savingCounseling || !counselingForm.content" class="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-dark transition disabled:opacity-50">
              {{ savingCounseling ? '저장 중...' : '상담 기록 저장' }}
            </button>
          </div>
        </div>

        <!-- 상담 내역 목록 -->
        <div class="flex-1 overflow-y-auto">
          <h4 class="text-sm font-bold text-gray-700 mb-3">상담 이력</h4>
          <div v-if="counselingLogs.length === 0" class="text-center py-8 text-gray-400 text-sm">
            등록된 상담 기록이 없습니다.
          </div>
          <div v-else class="space-y-4">
            <div v-for="log in counselingLogs" :key="log.id" class="border rounded-lg p-4 hover:bg-gray-50 transition">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{{ log.category }}</span>
                  <span class="text-xs text-gray-500 font-medium">{{ log.consultation_date }}</span>
                  <span class="text-xs text-gray-400">|</span>
                  <span class="text-xs text-gray-500">{{ log.counselor_name }} 선생님</span>
                </div>
                <button v-if="isAdmin || user.name === log.counselor_name" @click="deleteCounselingLog(log.id)" class="text-red-400 hover:text-red-600 text-xs">삭제</button>
              </div>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ log.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 반 등록/수정 모달 -->
    <div v-if="showClassModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeClassModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-xl font-bold mb-4">{{ classModalMode === 'create' ? '새 반 추가' : '반 정보 수정' }}</h3>
        <form @submit.prevent="saveClass" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">반 이름 <span class="text-red-500">*</span></label>
            <input v-model="classForm.name" type="text" required class="w-full px-4 py-2 border rounded-lg" placeholder="예: 중등 A반" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">담임 선생님</label>
            <input v-model="classForm.teacher_name" type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="선생님 이름" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">진도</label>
            <input v-model="classForm.progress" type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="현재 진도" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">교재</label>
            <input v-model="classForm.textbook" type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="사용 교재" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">숙제</label>
            <input v-model="classForm.homework" type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="오늘의 숙제" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea v-model="classForm.description" rows="2" class="w-full px-4 py-2 border rounded-lg" placeholder="반에 대한 설명 입력"></textarea>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="closeClassModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">취소</button>
            <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">{{ classModalMode === 'create' ? '등록' : '수정' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 학생 배정 모달 -->
    <div v-if="showStudentAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeStudentAssignModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <h3 class="text-xl font-bold mb-4">{{ selectedClass?.name }} 학생 배정</h3>
        <div class="mb-4">
          <input v-model="studentSearchSearch" type="text" placeholder="학생 이름 검색" class="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div class="flex-1 overflow-y-auto mb-4 border rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left">선택</th>
                <th class="px-4 py-2 text-left">이름</th>
                <th class="px-4 py-2 text-left">현재 반</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in filteredAllStudents" :key="s.id" class="hover:bg-gray-50">
                <td class="px-4 py-2">
                  <input type="checkbox" :value="s.id" v-model="selectedStudentIds" />
                </td>
                <td class="px-4 py-2 font-medium">{{ s.name }} ({{ s.school }})</td>
                <td class="px-4 py-2 text-xs text-gray-500">{{ s.class_name || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">{{ selectedStudentIds.length }}명 선택됨</p>
          <div class="flex space-x-3">
            <button type="button" @click="closeStudentAssignModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">취소</button>
            <button type="button" @click="assignStudents" class="px-4 py-2 bg-primary text-white rounded-lg">배정 완료</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { classApi, studentApi, counselingApi } from '../services/api';
import { getToday } from '../utils/date';
import type { Student } from '../types';

const classes = ref<any[]>([]);
const selectedClass = ref<any>(null);
const classStudents = ref<any[]>([]);
const allStudents = ref<Student[]>([]);
const loading = ref(false);

const learningLogDate = ref(getToday());
const learningLog = ref({
  progress: '',
  textbook: '',
  homework: '',
  homework_deadline: ''
});
const savingLog = ref(false);
const saveStatus = ref('');
const recentLogDates = ref<string[]>([]);
const previousHomework = ref<any>(null);

// 학생 정렬: 최근 상담일자 순 (상담일자가 없는 학생은 뒤로)
const sortedClassStudents = computed(() => {
  return [...classStudents.value].sort((a, b) => {
    const dateA = a.last_counseling_date || '0000-00-00';
    const dateB = b.last_counseling_date || '0000-00-00';
    return dateB.localeCompare(dateA);
  });
});

// 권한 확인
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = computed(() => user.role === 'admin');
const isCommon = computed(() => user.username?.startsWith('staff'));

// 상담 모달 관련
const showCounselingModal = ref(false);
const selectedStudentForCounseling = ref<Student | null>(null);
const counselingLogs = ref<any[]>([]);
const counselingForm = ref({
  category: '일반상담',
  content: '',
  consultation_date: getToday()
});
const savingCounseling = ref(false);

const formatPhone = (phone: string) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

const openCounselingModal = async (student: Student) => {
  if (isCommon.value) {
    alert('공통 계정은 상담 내역을 조회하거나 입력할 수 없습니다.');
    return;
  }
  selectedStudentForCounseling.value = student;
  showCounselingModal.value = true;
  fetchCounselingLogs(student.id);
};

const closeCounselingModal = () => {
  showCounselingModal.value = false;
  selectedStudentForCounseling.value = null;
  counselingLogs.value = [];
};

const fetchCounselingLogs = async (studentId: number) => {
  try {
    const res = await counselingApi.getLogs(studentId);
    if (res.data.success) counselingLogs.value = res.data.data || [];
  } catch (err) {
    console.error('상담 일지 로드 실패:', err);
  }
};

const saveCounselingLog = async () => {
  if (!selectedStudentForCounseling.value || !counselingForm.value.content) return;
  try {
    savingCounseling.value = true;
    await counselingApi.createLog({
      student_id: selectedStudentForCounseling.value.id,
      counselor_name: user.name,
      ...counselingForm.value
    });
    counselingForm.value.content = '';
    fetchCounselingLogs(selectedStudentForCounseling.value.id);
    
    // 상담 저장 후 목록의 상담일자 즉시 업데이트
    const studentIdx = classStudents.value.findIndex(s => s.id === selectedStudentForCounseling.value?.id);
    if (studentIdx !== -1) {
      classStudents.value[studentIdx].last_counseling_date = counselingForm.value.consultation_date;
    }
  } catch (err) {
    alert('상담 저장 중 오류가 발생했습니다.');
  } finally {
    savingCounseling.value = false;
  }
};

const deleteCounselingLog = async (id: number) => {
  if (!confirm('상담 기록을 삭제하시겠습니까?')) return;
  try {
    await counselingApi.deleteLog(id);
    if (selectedStudentForCounseling.value) fetchCounselingLogs(selectedStudentForCounseling.value.id);
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다.');
  }
};

const selectLogDate = (date: string) => {
  learningLogDate.value = date;
  fetchLearningLog();
};

const formatDateWithDay = (dateStr: string) => {
  if (!dateStr) return '';
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  // dateStr이 '26-01-31' 형식이면 '2026-01-31'로 변환
  const fullDateStr = dateStr.startsWith('20') ? dateStr : `20${dateStr}`;
  const date = new Date(fullDateStr);
  const dayName = days[date.getDay()];
  return `${dateStr} (${dayName})`;
};

const showClassModal = ref(false);
const classModalMode = ref<'create' | 'edit'>('create');
const classForm = ref({ 
  name: '', 
  teacher_name: '', 
  description: '',
  progress: '',
  textbook: '',
  homework: ''
});

const showStudentAssignModal = ref(false);
const studentSearchSearch = ref('');
const selectedStudentIds = ref<number[]>([]);

const filteredAllStudents = computed(() => {
  if (!studentSearchSearch.value) return allStudents.value;
  const search = studentSearchSearch.value.toLowerCase();
  return allStudents.value.filter(s => 
    s.name.toLowerCase().includes(search) || 
    (s.school && s.school.toLowerCase().includes(search))
  );
});

const fetchClasses = async () => {
  try {
    const response = await classApi.getAll();
    if (response.data.success) {
      classes.value = response.data.data || [];
    }
  } catch (err) {
    console.error('반 목록 로드 실패:', err);
  }
};

const fetchAllStudents = async () => {
  try {
    const response = await studentApi.getAll();
    if (response.data.success) {
      allStudents.value = response.data.data || [];
    }
  } catch (err) {
    console.error('전체 학생 로드 실패:', err);
  }
};

const selectClass = async (item: any) => {
  selectedClass.value = item;
  try {
    loading.value = true;
    const response = await classApi.getStudents(item.name);
    if (response.data.success) {
      const students = (response.data.data || []).filter((s: any) => 
        s.class_name?.split(',').map((c: string) => c.trim()).includes(item.name)
      );
      
      // 각 학생별 최근 상담일자 가져오기
      const studentsWithCounseling = await Promise.all(students.map(async (student: any) => {
        try {
          const logsRes = await counselingApi.getLogs(student.id);
          if (logsRes.data.success && logsRes.data.data.length > 0) {
            // 날짜순 정렬하여 가장 최근 날짜 추출
            const sortedLogs = logsRes.data.data.sort((a: any, b: any) => 
              b.consultation_date.localeCompare(a.consultation_date)
            );
            return { ...student, last_counseling_date: sortedLogs[0].consultation_date };
          }
        } catch (e) {
          console.error(`학생 ${student.name} 상담 로드 실패`, e);
        }
        return { ...student, last_counseling_date: null };
      }));
      
      classStudents.value = studentsWithCounseling;
    }
    await fetchLearningLog();
    await fetchRecentLogs();
  } catch (err) {
    console.error('반 학생 로드 실패:', err);
  } finally {
    loading.value = false;
  }
};

const fetchRecentLogs = async () => {
  if (!selectedClass.value) return;
  try {
    const response = await classApi.getRecentLogDates(selectedClass.value.id);
    if (response.data.success) {
      recentLogDates.value = response.data.data || [];
    }
  } catch (err) {
    console.error('최근 로그 날짜 로드 실패:', err);
  }
};

const fetchLearningLog = async () => {
  if (!selectedClass.value || !learningLogDate.value) return;
  try {
    const response = await classApi.getLearningLog(selectedClass.value.id, learningLogDate.value);
    if (response.data.success && response.data.data) {
      learningLog.value = {
        progress: response.data.data.progress || '',
        textbook: response.data.data.textbook || '',
        homework: response.data.data.homework || '',
        homework_deadline: response.data.data.homework_deadline || ''
      };
    } else {
      learningLog.value = {
        progress: '',
        textbook: '',
        homework: '',
        homework_deadline: ''
      };
    }
    await fetchPreviousHomework();
  } catch (err) {
    console.error('학습 로그 로드 실패:', err);
  }
};

const fetchPreviousHomework = async () => {
  if (!selectedClass.value || !learningLogDate.value) return;
  try {
    // 현재 날짜 이전에 등록된 로그 중, 숙제 검사 예정일이 오늘인 기록을 찾음
    const res = await classApi.getAllLogs(selectedClass.value.id);
    if (res.data.success) {
      const logs = res.data.data || [];
      // 오늘 검사해야 할 숙제 찾기 (마감일이 오늘인 것)
      const todayCheck = logs.find((l: any) => l.homework_deadline === learningLogDate.value);
      if (todayCheck) {
        previousHomework.value = todayCheck;
      } else {
        // 없으면 가장 최근 숙제 보여주기
        const lastLog = logs.find((l: any) => l.log_date < learningLogDate.value && l.homework);
        previousHomework.value = lastLog || null;
      }
    }
  } catch (err) {
    console.error('이전 숙제 로드 실패:', err);
  }
};

const saveLearningLog = async () => {
  if (!selectedClass.value || !learningLogDate.value) return;
  try {
    savingLog.value = true;
    saveStatus.value = '';
    await classApi.saveLearningLog(selectedClass.value.id, {
      log_date: learningLogDate.value,
      ...learningLog.value
    });
    saveStatus.value = '저장 완료!';
    await fetchRecentLogs(); // 최근 기록 목록 갱신
    setTimeout(() => {
      saveStatus.value = '';
    }, 3000);
  } catch (err) {
    console.error('학습 로그 저장 실패:', err);
    alert('저장 중 오류가 발생했습니다.');
  } finally {
    savingLog.value = false;
  }
};

const openClassModal = (mode: 'create' | 'edit', item?: any) => {
  classModalMode.value = mode;
  if (mode === 'edit' && item) {
    classForm.value = { 
      ...item,
      progress: item.progress || '',
      textbook: item.textbook || '',
      homework: item.homework || ''
    };
  } else {
    classForm.value = { 
      name: '', 
      teacher_name: '', 
      description: '',
      progress: '',
      textbook: '',
      homework: ''
    };
  }
  showClassModal.value = true;
};

const closeClassModal = () => {
  showClassModal.value = false;
};

const saveClass = async () => {
  try {
    if (classModalMode.value === 'create') {
      await classApi.create(classForm.value);
    } else {
      await classApi.update((classForm.value as any).id, classForm.value);
    }
    showClassModal.value = false;
    fetchClasses();
  } catch (err) {
    alert('반 정보 저장 중 오류가 발생했습니다.');
  }
};

const deleteClass = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까? 관련 데이터가 영향을 받을 수 있습니다.')) return;
  try {
    await classApi.delete(id);
    if (selectedClass.value?.id === id) selectedClass.value = null;
    fetchClasses();
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다.');
  }
};

const openStudentAssignModal = () => {
  if (!selectedClass.value) return;
  // 현재 반 학생들을 미리 선택된 상태로
  selectedStudentIds.value = classStudents.value.map(s => s.id);
  showStudentAssignModal.value = true;
};

const closeStudentAssignModal = () => {
  showStudentAssignModal.value = false;
};

const assignStudents = async () => {
  if (!selectedClass.value) return;
  
  try {
    loading.value = true;
    let updateCount = 0;
    
    // 체크된 모든 학생들에게 현재 반 이름을 추가/변경
    for (const student of allStudents.value) {
      const isSelected = selectedStudentIds.value.includes(student.id);
      const currentClasses = student.class_name?.split(',').map(c => c.trim()).filter(c => c) || [];
      const hasThisClass = currentClasses.includes(selectedClass.value.name);
      
      let newClasses = [...currentClasses];
      if (isSelected && !hasThisClass) {
        newClasses.push(selectedClass.value.name);
      } else if (!isSelected && hasThisClass) {
        newClasses = newClasses.filter(c => c !== selectedClass.value.name);
      }
      
      if (JSON.stringify(currentClasses.sort()) !== JSON.stringify(newClasses.sort())) {
        await studentApi.update(student.id, { class_name: newClasses.join(',') });
        updateCount++;
      }
    }
    
    alert('학생 배정이 완료되었습니다.');
    showStudentAssignModal.value = false;
    await fetchAllStudents();
    await selectClass(selectedClass.value);
  } catch (err: any) {
    console.error('학생 배정 중 오류:', err);
    alert('학생 배정 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchClasses();
  fetchAllStudents();
});
</script>
