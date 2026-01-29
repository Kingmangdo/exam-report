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
        <p class="text-sm text-gray-600 mb-4 h-10 overflow-hidden">{{ item.description || '설명 없음' }}</p>
        <div class="flex justify-between items-center text-xs text-gray-400">
          <span>등록 학생: {{ item.student_count || 0 }}명</span>
          <span>생성일: {{ item.created_at?.split('T')[0] }}</span>
        </div>
      </div>
    </div>

    <!-- 선택된 반의 학생 관리 -->
    <div v-if="selectedClass" class="bg-white rounded-lg shadow-lg overflow-hidden border">
      <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">
          <span class="text-primary">{{ selectedClass.name }}</span> 학생 배정 관리
        </h3>
        <button
          @click="openStudentAssignModal"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
        >
          + 학생 추가/변경
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학교/학년</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학부모 연락처</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">모든 소속 반</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in classStudents" :key="student.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ student.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ student.school || '-' }} / {{ student.grade || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ student.parent_phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  v-for="c in student.class_name?.split(',')"
                  :key="c"
                  class="inline-block mr-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
                >
                  {{ c.trim() }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="classStudents.length === 0" class="text-center py-12 text-gray-400">
          이 반에 배정된 학생이 없습니다.
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
            <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea v-model="classForm.description" rows="3" class="w-full px-4 py-2 border rounded-lg" placeholder="반에 대한 설명 입력"></textarea>
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
import { classApi, studentApi } from '../services/api';
import type { Student } from '../types';

const classes = ref<any[]>([]);
const selectedClass = ref<any>(null);
const classStudents = ref<Student[]>([]);
const allStudents = ref<Student[]>([]);
const loading = ref(false);

const showClassModal = ref(false);
const classModalMode = ref<'create' | 'edit'>('create');
const classForm = ref({ name: '', teacher_name: '', description: '' });

const showStudentAssignModal = ref(false);
const studentSearchSearch = ref('');
const selectedStudentIds = ref<number[]>([]);

const filteredAllStudents = computed(() => {
  if (!studentSearchSearch.value) return allStudents.value;
  return allStudents.value.filter(s => s.name.includes(studentSearchSearch.value));
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
    const response = await classApi.getStudents(item.name);
    if (response.data.success) {
      classStudents.value = response.data.data || [];
    }
  } catch (err) {
    console.error('반 학생 로드 실패:', err);
  }
};

const openClassModal = (mode: 'create' | 'edit', item?: any) => {
  classModalMode.value = mode;
  if (mode === 'edit' && item) {
    classForm.value = { ...item };
  } else {
    classForm.value = { name: '', teacher_name: '', description: '' };
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
