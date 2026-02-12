<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 상단 네비게이션 -->
    <nav class="bg-primary text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-20">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="flex items-center space-x-4 hover:text-gray-200 transition">
              <img src="/logo.png" alt="독강영어 로고" class="h-16 w-16 object-contain rounded-full bg-white p-1 shadow-sm" />
              <span class="text-2xl font-bold">독강영어학원 성적표 시스템</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              v-for="item in filteredNavItems"
              :key="item.path"
              :to="item.path"
              class="px-3 py-2 rounded hover:bg-primary-dark transition text-sm"
              active-class="bg-primary-dark"
            >
              {{ item.name }}
            </router-link>
            <button
              @click="handleLogout"
              class="px-3 py-2 rounded hover:bg-red-700 transition text-sm bg-red-600 ml-4"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 메인 컨텐츠 -->
    <main class="container mx-auto px-4 py-8">
      <div v-if="user" class="mb-4 text-right">
        <span class="text-sm text-gray-600 font-bold">
          {{ user.name }}님 ({{ user.role === 'admin' ? '관리자' : '강사' }}) 환영합니다.
        </span>
      </div>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;

const navItems = ref([
  { name: '대시보드', path: '/', adminOnly: true },
  { name: '학생 관리', path: '/students', adminOnly: true },
  { name: '반 관리', path: '/classes', adminOnly: false },
  { name: '성적 입력', path: '/scores/new', adminOnly: false },
  { name: '성적 조회', path: '/scores', adminOnly: false },
  { name: '설정', path: '/settings', adminOnly: true }
]);

const filteredNavItems = computed(() => {
  if (!user) return [];
  return navItems.value.filter(item => !item.adminOnly || user.role === 'admin');
});

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }
};
</script>

<style scoped>
.bg-primary {
  background-color: #1e3a8a;
}

.bg-primary-dark {
  background-color: #1e40af;
}
</style>
