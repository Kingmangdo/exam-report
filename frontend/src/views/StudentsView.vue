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
          placeholder="이름 또는 학부모 이름 검색"
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학년</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">반 (중복 가능)</th>
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
              {{ student.grade || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span v-if="student.classes && student.classes.length > 0">
                <span
                  v-for="(className, idx) in student.classes"
                  :key="idx"
                  class="inline-block mr-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {{ className }}
                </span>
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ student.parent_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatPhone(student.parent_phone) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">학년</label>
              <input
                v-model="form.grade"
                type="text"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { studentApi, excelApi } from '../services/api';
import type { Student } from '../types';

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
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '학생명단_양식.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    alert(err.response?.data?.message || '양식 다운로드 중 오류가 발생했습니다.');
    console.error(err);
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
