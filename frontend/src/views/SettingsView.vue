<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">설정 관리</h2>

    <!-- 종합 문구 관리 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">종합 문구 관리</h3>
      <p class="text-sm text-gray-500 mb-4">
        성적표 하단에 표시될 종합 문구를 입력하세요. 원장님이 직접 입력하실 수 있습니다.
      </p>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          종합 문구
        </label>
        <textarea
          v-model="commentForm.value"
          rows="4"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="예: 이번 달도 열심히 노력해주세요!"
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button
          @click="saveComment"
          :disabled="saving"
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
        >
          {{ saving ? '저장 중...' : '저장하기' }}
        </button>
      </div>
    </div>

    <!-- 저장 성공 알림 -->
    <div
      v-if="saveSuccess"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
    >
      저장되었습니다!
    </div>

    <!-- 사용자 계정 관리 (관리자 전용) -->
    <div v-if="isAdmin" class="bg-white rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">사용자 계정 관리</h3>
      <p class="text-sm text-gray-500 mb-6">
        강사 및 공통 계정의 권한을 관리하고 비밀번호를 초기화할 수 있습니다.
      </p>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">아이디</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">권한</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ user.username }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.name }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-bold"
                  :class="user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ user.role === 'admin' ? '관리자' : '강사' }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-center font-medium">
                <button
                  @click="openUserEditModal(user)"
                  class="text-primary hover:text-primary-dark mr-3"
                >
                  수정
                </button>
                <button
                  v-if="user.username !== 'admin'"
                  @click="deleteUser(user.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  삭제
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 사용자 수정 모달 -->
    <div v-if="showUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-xl font-bold mb-4">사용자 정보 수정</h3>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input :value="userForm.username" type="text" disabled class="w-full px-4 py-2 border rounded-lg bg-gray-50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input v-model="userForm.name" type="text" required class="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">권한</label>
            <select v-model="userForm.role" class="w-full px-4 py-2 border rounded-lg">
              <option value="admin">관리자</option>
              <option value="instructor">강사</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호 변경 (입력 시 변경)</label>
            <input v-model="userForm.password" type="password" class="w-full px-4 py-2 border rounded-lg" placeholder="새 비밀번호 입력" />
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="closeUserModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">취소</button>
            <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">저장</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { settingsApi, authApi } from '../services/api';

const commentForm = ref({
  value: ''
});
const saving = ref(false);
const saveSuccess = ref(false);

// 사용자 관리 관련
const users = ref<any[]>([]);
const isAdmin = computed(() => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return false;
  const user = JSON.parse(userJson);
  return user.role === 'admin';
});

const showUserModal = ref(false);
const userForm = ref({
  id: 0,
  username: '',
  name: '',
  role: '',
  password: ''
});

const fetchComment = async () => {
  try {
    const response = await settingsApi.getComment();
    if (response.data.success && response.data.data) {
      commentForm.value.value = response.data.data.value || '';
    }
  } catch (err) {
    console.error('종합 문구 불러오기 실패:', err);
  }
};

const fetchUsers = async () => {
  if (!isAdmin.value) return;
  try {
    const response = await authApi.getAllUsers();
    if (response.data.success) {
      users.value = response.data.data || [];
    }
  } catch (err) {
    console.error('사용자 목록 불러오기 실패:', err);
  }
};

const saveComment = async () => {
  try {
    saving.value = true;
    await settingsApi.setComment(commentForm.value.value);
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err: any) {
    alert(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    console.error(err);
  } finally {
    saving.value = false;
  }
};

const openUserEditModal = (user: any) => {
  userForm.value = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    password: ''
  };
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
};

const saveUser = async () => {
  try {
    const payload: any = {
      name: userForm.value.name,
      role: userForm.value.role
    };
    if (userForm.value.password) {
      payload.password = userForm.value.password;
    }
    
    await authApi.updateUser(userForm.value.id, payload);
    saveSuccess.value = true;
    showUserModal.value = false;
    fetchUsers();
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err: any) {
    alert(err.response?.data?.message || '사용자 정보 저장 중 오류가 발생했습니다.');
  }
};

const deleteUser = async (id: number) => {
  if (!confirm('정말 이 계정을 삭제하시겠습니까?')) return;
  try {
    await authApi.deleteUser(id);
    fetchUsers();
    alert('계정이 삭제되었습니다.');
  } catch (err: any) {
    alert(err.response?.data?.message || '삭제 중 오류가 발생했습니다.');
  }
};

onMounted(() => {
  fetchComment();
  fetchUsers();
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
