<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-primary">독강영어학원 ERP</h1>
        <p class="text-gray-500 mt-2">시스템 로그인이 필요합니다</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">아이디</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="아이디를 입력하세요"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-50"
        >
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <div class="mt-8 pt-6 border-t text-center">
        <button
          @click="initAdmin"
          class="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          최초 관리자 계정 생성 (테스트용)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '../services/api';

const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  try {
    loading.ref = true;
    error.value = '';
    
    const response = await authApi.login({
      username: username.value,
      password: password.value
    });

    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/');
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '로그인에 실패했습니다.';
  } finally {
    loading.ref = false;
  }
};

const initAdmin = async () => {
  if (!confirm('이미 계정이 있으면 생성되지 않습니다. 초기 관리자(admin / admin-password-1234)를 생성하시겠습니까?')) return;
  try {
    const response = await authApi.initAdmin();
    alert(response.data.message);
  } catch (err: any) {
    alert(err.response?.data?.message || '이미 계정이 존재하거나 오류가 발생했습니다.');
  }
};
</script>
