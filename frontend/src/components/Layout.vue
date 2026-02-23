<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 상단 네비게이션 -->
    <nav class="bg-primary text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-20">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="flex items-center space-x-4 hover:text-gray-200 transition">
              <img src="/logo.png" alt="독강영어 로고" class="h-16 w-16 object-contain rounded-full bg-white p-1 shadow-sm" />
              <span class="text-2xl font-bold">독강영어 관리 리포트</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <template v-for="item in filteredNavItems" :key="item.path">
              <!-- 드롭다운 메뉴 -->
              <div v-if="item.children" class="relative" @mouseenter="openDropdown(item.path)" @mouseleave="closeDropdown(item.path)">
                <button
                  class="px-3 py-2 rounded hover:bg-primary-dark transition text-sm flex items-center gap-1"
                  :class="{ 'bg-primary-dark': isChildActive(item) }"
                >
                  {{ item.name }}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div
                  v-show="activeDropdown === item.path"
                  class="absolute top-full left-0 mt-0 bg-white rounded-lg shadow-xl border py-1 min-w-[180px] z-50"
                >
                  <router-link
                    v-for="child in item.children"
                    :key="child.path"
                    :to="child.path"
                    class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary font-medium transition"
                    active-class="bg-blue-50 text-primary"
                    @click="activeDropdown = ''"
                  >
                    {{ child.name }}
                  </router-link>
                </div>
              </div>
              <!-- 일반 메뉴 -->
              <router-link
                v-else
                :to="item.path"
                class="px-3 py-2 rounded hover:bg-primary-dark transition text-sm"
                active-class="bg-primary-dark"
              >
                {{ item.name }}
              </router-link>
            </template>
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
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;
const activeDropdown = ref('');

const navItems = ref([
  { name: '대시보드', path: '/', adminOnly: true },
  { name: '학생 관리', path: '/students', adminOnly: true },
  { name: '반 관리', path: '/classes', adminOnly: false },
  { 
    name: '성적 입력', 
    path: '/scores-input', 
    adminOnly: false,
    children: [
      { name: 'Daily Report', path: '/scores/new' },
      { name: '바이먼슬리 테스트', path: '/scores/bimonthly/new' }
    ]
  },
  { 
    name: '성적 발송', 
    path: '/scores-view', 
    adminOnly: false,
    children: [
      { name: 'Daily Report', path: '/scores' },
      { name: '바이먼슬리 테스트', path: '/scores/bimonthly' }
    ]
  },
  { name: '예약 관리', path: '/reservations', adminOnly: true },
  { name: '설정', path: '/settings', adminOnly: true }
]);

const filteredNavItems = computed(() => {
  if (!user) return [];
  return navItems.value.filter(item => !item.adminOnly || user.role === 'admin');
});

const isChildActive = (item: any) => {
  if (!item.children) return false;
  return item.children.some((child: any) => route.path === child.path);
};

const openDropdown = (path: string) => {
  activeDropdown.value = path;
};

const closeDropdown = (path: string) => {
  if (activeDropdown.value === path) {
    activeDropdown.value = '';
  }
};

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
