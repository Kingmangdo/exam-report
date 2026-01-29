<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">학생 관리</h2>
      <div class="flex space-x-3">
        <button
          @click="downloadTemplate"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          📥 Excel 양식 다운로드
        </button>
        <label
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          📤 Excel 업로드
          <input
            type="file"
            accept=".xlsx,.xls"
            @change="handleFileUpload"
            class="hidden"
          />
        </label>
        <button
          @click="openModal('create')"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          + 학생 등록
        </button>
      </div>
    </div>

    <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="학생 이름 검색"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="fetchStudents"
        />
        <select
          v-model="filters.class_name"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @change="fetchStudents"
        >
          <option value="">전체 반</option>
          <option
            v-for="className in availableClasses"
            :key="className"
            :value="className"
          >
            {{ className }}
          </option>
        </select>
        <select
          v-model="filters.grade"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @change="fetchStudents"
        >
          <option value="">전체 학년</option>
          <option value="1">1학년</option>
          <option value="2">2학년</option>
          <option value="3">3학년</option>
        </select>
        <button
          @click="resetFilters"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          초기화
        </button>
      </div>
    </div>

    <!-- 일괄 반 이동 모달 -->
    <div
      v-if="showClassMoveModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showClassMoveModal = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">반 일괄 이동</h3>
        <p class="text-sm text-gray-600 mb-4">
          선택한 {{ selectedStudents.length }}명의 학생을 이동할 반을 선택하세요.
        </p>
        <div class="space-y-3 mb-4">
          <div v-for="className in availableClasses" :key="className" class="flex items-center">
            <input
              :id="`class-${className}`"
              type="checkbox"
              :value="className"
              v-model="targetClasses"
              class="mr-2"
            />
            <label :for="`class-${className}`" class="text-sm text-gray-700">
              {{ className }}
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="class-new"
              type="checkbox"
              v-model="showNewClassInput"
              class="mr-2"
            />
            <label for="class-new" class="text-sm text-gray-700">새 반 추가</label>
          </div>
          <input
            v-if="showNewClassInput"
            v-model="newClassName"
            type="text"
            placeholder="반 이름 입력 (예: D반)"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="showClassMoveModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            취소
          </button>
          <button
            @click="moveStudentsToClasses"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            이동
          </button>
        </div>
      </div>
    </div>

    <!-- 학생 목록 -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- 일괄 작업 버튼 -->
      <div v-if="selectedStudents.length > 0" class="p-4 bg-blue-50 border-b flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">
          {{ selectedStudents.length }}명 선택됨
        </span>
        <button
          @click="openClassMoveModal"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          반 이동
        </button>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left">
              <input
                type="checkbox"
                @change="toggleSelectAll"
                :checked="selectedStudents.length === students.length && students.length > 0"
                class="rounded border-gray-300"
              />
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학교/학년</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">반/담임</th>
            <th v-if="isAdmin" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수강료</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학부모 이름</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학부모 연락처</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                :value="student.id"
                v-model="selectedStudents"
                class="rounded border-gray-300"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ student.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ student.school || '-' }} / {{ student.grade || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex flex-col">
                <span v-if="student.classes && student.classes.length > 0">
                  <span
                    v-for="(className, idx) in student.classes"
                    :key="idx"
                    class="inline-block mr-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {{ className }}
                  </span>
                </span>
                <span v-else>-</span>
                <span class="text-xs text-gray-400 mt-1">{{ student.teacher_name ? `담임: ${student.teacher_name}` : '' }}</span>
              </div>
            </td>
            <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
              ₩{{ (student.monthly_tuition || 0).toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ student.parent_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatPhone(student.parent_phone) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="openCounselingModal(student)"
                class="text-green-600 hover:text-green-800 mr-3"
              >
                상담
              </button>
              <button
                @click="openModal('edit', student)"
                class="text-primary hover:text-primary-dark mr-3"
              >
                수정
              </button>
              <button
                @click="deleteStudent(student.id)"
                class="text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="students.length === 0" class="text-center py-8 text-gray-500">
        등록된 학생이 없습니다.
      </div>
    </div>

    <!-- 학생 등록/수정 모달 -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">
          {{ modalMode === 'create' ? '학생 등록' : '학생 수정' }}
        </h3>

        <form @submit.prevent="saveStudent">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                학생 이름 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학교</label>
              <input
                v-model="form.school"
                type="text"
                placeholder="학교명 입력"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학년</label>
              <input
                v-model="form.grade"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">담임 선생님</label>
              <input
                v-model="form.teacher_name"
                type="text"
                placeholder="선생님 성함 입력"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div v-if="isAdmin">
              <label class="block text-sm font-medium text-gray-700 mb-1">매월 수강료</label>
              <input
                v-model.number="form.monthly_tuition"
                type="number"
                placeholder="수강료 금액(원) 입력"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">반 (중복 선택 가능)</label>
              <div class="space-y-2">
                <div v-for="className in availableClasses" :key="className" class="flex items-center">
                  <input
                    :id="`form-class-${className}`"
                    type="checkbox"
                    :value="className"
                    v-model="form.classes"
                    class="mr-2 rounded border-gray-300"
                  />
                  <label :for="`form-class-${className}`" class="text-sm text-gray-700">
                    {{ className }}
                  </label>
                </div>
                <div class="flex items-center mt-2">
                  <input
                    id="form-class-new"
                    type="checkbox"
                    v-model="showNewClassInput"
                    class="mr-2 rounded border-gray-300"
                  />
                  <label for="form-class-new" class="text-sm text-gray-700">새 반 추가</label>
                </div>
                <input
                  v-if="showNewClassInput"
                  v-model="newClassName"
                  type="text"
                  placeholder="반 이름 입력 (예: D반)"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  @keyup.enter="addNewClass"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학생 연락처</label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학부모 이름</label>
              <input
                v-model="form.parent_name"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                학부모 연락처 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.parent_phone"
                type="tel"
                required
                placeholder="01012345678"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              {{ modalMode === 'create' ? '등록' : '수정' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 상담일지 모달 -->
    <div
      v-if="showCounselingModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeCounselingModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div class="p-4 border-b bg-green-600 text-white flex justify-between items-center rounded-t-lg">
          <h3 class="text-xl font-bold">{{ selectedStudentForCounseling?.name }} 학생 상담일지</h3>
          <button @click="closeCounselingModal" class="text-2xl font-bold">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <!-- 상담 입력 폼 -->
          <div class="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-gray-700 mb-3">새 상담 기록</h4>
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">상담자</label>
                <input v-model="counselingForm.counselor_name" type="text" class="w-full px-3 py-2 text-sm border rounded" placeholder="선생님 성함" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">상담 유형</label>
                <select v-model="counselingForm.category" class="w-full px-3 py-2 text-sm border rounded">
                  <option value="일반상담">일반상담</option>
                  <option value="학습상담">학습상담</option>
                  <option value="진학상담">진학상담</option>
                  <option value="생활상담">생활상담</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="block text-xs text-gray-500 mb-1">상담 내용</label>
              <textarea v-model="counselingForm.content" rows="3" class="w-full px-3 py-2 text-sm border rounded" placeholder="상담 내용을 입력하세요"></textarea>
            </div>
            <div class="flex justify-end">
              <button @click="saveCounselingLog" class="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                기록 저장
              </button>
            </div>
          </div>

          <!-- 상담 히스토리 -->
          <div>
            <h4 class="font-bold text-gray-700 mb-4">상담 히스토리 ({{ counselingLogs.length }}건)</h4>
            <div v-if="counselingLogs.length === 0" class="text-center py-8 text-gray-400 text-sm">
              기록된 상담 내역이 없습니다.
            </div>
            <div v-else class="space-y-4">
              <div v-for="log in counselingLogs" :key="log.id" class="border-l-4 border-green-500 bg-white p-4 shadow-sm rounded-r-lg border-y border-r">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">{{ log.category }}</span>
                    <span class="text-xs text-gray-500">{{ log.consultation_date }}</span>
                  </div>
                  <button @click="deleteCounselingLog(log.id)" class="text-red-400 hover:text-red-600 text-xs">삭제</button>
                </div>
                <p class="text-sm text-gray-800 whitespace-pre-wrap mb-2">{{ log.content }}</p>
                <div class="text-right">
                  <span class="text-xs text-gray-400">작성자: {{ log.counselor_name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t bg-gray-50 text-right rounded-b-lg">
          <button @click="closeCounselingModal" class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { studentApi, excelApi, counselingApi } from '../services/api';
import type { Student } from '../types';

const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;
const isAdmin = user?.role === 'admin';

const students = ref<Student[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const form = ref<Partial<Student & { classes: string[] }>>({ classes: [] });
const filters = ref({
  search: '',
  class_name: '',
  grade: ''
});
const selectedStudents = ref<number[]>([]);
const showClassMoveModal = ref(false);
const targetClasses = ref<string[]>([]);
const showNewClassInput = ref(false);
const newClassName = ref('');
const availableClasses = ref<string[]>([]);

// 상담일지 관련 상태
const showCounselingModal = ref(false);
const selectedStudentForCounseling = ref<Student | null>(null);
const counselingLogs = ref<any[]>([]);
const counselingForm = ref({
  counselor_name: '',
  category: '일반상담',
  content: '',
  consultation_date: new Date().toISOString().split('T')[0]
});

const openCounselingModal = async (student: Student) => {
  selectedStudentForCounseling.value = student;
  showCounselingModal.value = true;
  await fetchCounselingLogs(student.id);
};

const closeCounselingModal = () => {
  showCounselingModal.value = false;
  selectedStudentForCounseling.value = null;
  counselingLogs.value = [];
  counselingForm.value = {
    counselor_name: '',
    category: '일반상담',
    content: '',
    consultation_date: new Date().toISOString().split('T')[0]
  };
};

const fetchCounselingLogs = async (studentId: number) => {
  try {
    const response = await counselingApi.getLogs(studentId);
    if (response.data.success) {
      counselingLogs.value = response.data.data;
    }
  } catch (err) {
    console.error('상담일지 로드 실패:', err);
  }
};

const saveCounselingLog = async () => {
  if (!selectedStudentForCounseling.value) return;
  if (!counselingForm.value.counselor_name || !counselingForm.value.content) {
    alert('상담자와 내용을 입력해주세요.');
    return;
  }

  try {
    const response = await counselingApi.createLog({
      student_id: selectedStudentForCounseling.value.id,
      ...counselingForm.value
    });
    if (response.data.success) {
      alert('상담 기록이 저장되었습니다.');
      counselingForm.value.content = '';
      await fetchCounselingLogs(selectedStudentForCounseling.value.id);
    }
  } catch (err) {
    alert('상담 기록 저장 중 오류가 발생했습니다.');
  }
};

const deleteCounselingLog = async (id: number) => {
  if (!confirm('상담 기록을 삭제하시겠습니까?')) return;
  try {
    const response = await counselingApi.deleteLog(id);
    if (response.data.success && selectedStudentForCounseling.value) {
      await fetchCounselingLogs(selectedStudentForCounseling.value.id);
    }
  } catch (err) {
    alert('상담 기록 삭제 중 오류가 발생했습니다.');
  }
};

const formatPhone = (phone: string) => {
  if (!phone) return '-';
  if (phone.length === 11) {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

const fetchStudents = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await studentApi.getAll(filters.value);
    if (response.data.success && response.data.data) {
      students.value = response.data.data;
      // 사용 가능한 반 목록 업데이트
      updateAvailableClasses();
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '학생 목록을 불러오는 중 오류가 발생했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 사용 가능한 반 목록 업데이트
const updateAvailableClasses = () => {
  const classesSet = new Set<string>();
  students.value.forEach(student => {
    if (student.classes && student.classes.length > 0) {
      student.classes.forEach(c => classesSet.add(c));
    } else if (student.class_name) {
      // 기존 데이터 호환성
      student.class_name.split(',').forEach(c => {
        const trimmed = c.trim();
        if (trimmed) classesSet.add(trimmed);
      });
    }
  });
  availableClasses.value = Array.from(classesSet).sort();
};

// 전체 선택/해제
const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    selectedStudents.value = students.value.map(s => s.id);
  } else {
    selectedStudents.value = [];
  }
};

// 반 이동 모달 열기
const openClassMoveModal = () => {
  if (selectedStudents.value.length === 0) {
    alert('이동할 학생을 선택해주세요.');
    return;
  }
  targetClasses.value = [];
  showNewClassInput.value = false;
  newClassName.value = '';
  showClassMoveModal.value = true;
};

// 새 반 추가
const addNewClass = () => {
  if (newClassName.value.trim()) {
    const className = newClassName.value.trim();
    if (!availableClasses.value.includes(className)) {
      availableClasses.value.push(className);
      availableClasses.value.sort();
    }
    if (!targetClasses.value.includes(className)) {
      targetClasses.value.push(className);
    }
    newClassName.value = '';
    showNewClassInput.value = false;
  }
};

// 학생 일괄 반 이동
const moveStudentsToClasses = async () => {
  if (targetClasses.value.length === 0 && !newClassName.value.trim()) {
    alert('이동할 반을 선택하거나 입력해주세요.');
    return;
  }

  let finalClasses = [...targetClasses.value];
  if (newClassName.value.trim()) {
    finalClasses.push(newClassName.value.trim());
  }

  if (finalClasses.length === 0) {
    alert('이동할 반을 선택해주세요.');
    return;
  }

  try {
    const response = await studentApi.updateClasses(selectedStudents.value, finalClasses);
    if (response.data.success) {
      alert(`${response.data.data.count}명의 학생 반이 변경되었습니다.`);
      showClassMoveModal.value = false;
      selectedStudents.value = [];
      fetchStudents();
    } else {
      alert(response.data.message || '반 이동 중 오류가 발생했습니다.');
    }
  } catch (err: any) {
    alert(err.response?.data?.message || '반 이동 중 오류가 발생했습니다.');
    console.error(err);
  }
};

const openModal = (mode: 'create' | 'edit', student?: Student) => {
  modalMode.value = mode;
  if (mode === 'edit' && student) {
    form.value = {
      ...student,
      classes: (student as any).classes || (student.class_name ? student.class_name.split(',').map(c => c.trim()).filter(c => c) : [])
    };
  } else {
    form.value = { classes: [] };
  }
  showNewClassInput.value = false;
  newClassName.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  form.value = { classes: [] };
  showNewClassInput.value = false;
  newClassName.value = '';
};

const saveStudent = async () => {
  try {
    // 새 반 추가 처리
    if (showNewClassInput.value && newClassName.value.trim()) {
      const className = newClassName.value.trim();
      if (!form.value.classes) form.value.classes = [];
      if (!form.value.classes.includes(className)) {
        form.value.classes.push(className);
      }
      if (!availableClasses.value.includes(className)) {
        availableClasses.value.push(className);
        availableClasses.value.sort();
      }
    }

    const studentData: any = {
      name: form.value.name,
      grade: form.value.grade,
      school: form.value.school,
      teacher_name: form.value.teacher_name,
      monthly_tuition: form.value.monthly_tuition || 0,
      class_name: form.value.classes || [],
      phone: form.value.phone,
      parent_name: form.value.parent_name,
      parent_phone: form.value.parent_phone
    };

    if (modalMode.value === 'create') {
      await studentApi.create(studentData);
    } else if (form.value.id) {
      await studentApi.update(form.value.id, studentData);
    }
    closeModal();
    fetchStudents();
  } catch (err: any) {
    alert(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    console.error(err);
  }
};

const deleteStudent = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    await studentApi.delete(id);
    fetchStudents();
  } catch (err: any) {
    alert(err.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    console.error(err);
  }
};

const resetFilters = () => {
  filters.value = { search: '', class_name: '', grade: '' };
  fetchStudents();
};

// Excel 양식 다운로드
const downloadTemplate = async () => {
  try {
    const response = await excelApi.downloadTemplate();
    
    // Axios response.data가 Blob인지 확인 (api.ts에서 responseType: 'blob' 설정 필요)
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 서버에서 보낸 파일명 추출 시도
    const contentDisposition = response.headers['content-disposition'];
    let fileName = '학생명단_양식.xlsx';
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, '').replace('UTF-8\'\'', ''));
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    // 메모리 해제
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('Download error:', err);
    alert('양식 다운로드 중 오류가 발생했습니다.');
  }
};

// Excel 파일 업로드
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 파일 확장자 확인
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    alert('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
    return;
  }

  if (!confirm(`"${file.name}" 파일을 업로드하여 학생을 일괄 등록하시겠습니까?`)) {
    target.value = '';
    return;
  }

  try {
    const response = await excelApi.uploadStudents(file);
    
    if (response.data.success) {
      const { total, success, skipped, failed, details } = response.data.data || {};
      
      let message = `업로드 완료!\n\n`;
      message += `총 ${total}명 중\n`;
      message += `✅ 성공: ${success}명\n`;
      if (skipped > 0) message += `⏭️ 건너뜀: ${skipped}명\n`;
      if (failed > 0) message += `❌ 실패: ${failed}명\n`;
      
      if (details?.failed.length > 0) {
        message += `\n실패한 항목:\n`;
        details.failed.forEach((item: any) => {
          message += `- ${item.name}: ${item.reason}\n`;
        });
      }
      
      alert(message);
      fetchStudents(); // 학생 목록 새로고침
    } else {
      alert(response.data.message || '업로드 중 오류가 발생했습니다.');
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Excel 파일 업로드 중 오류가 발생했습니다.';
    alert(errorMessage);
    console.error('Excel 업로드 에러:', err);
  } finally {
    target.value = ''; // 파일 입력 초기화
  }
};

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
</style>
