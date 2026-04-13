<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 상단 네비게이션 -->
    <nav class="bg-primary text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-20">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="flex items-center space-x-4 hover:text-gray-200 transition">
              <img src="/logo.png" alt="독강영어 로고" class="h-16 w-16 object-contain rounded-full bg-white p-1 shadow-sm" />
              <span class="text-2xl font-bold">독강영어 학습관리 시스템</span>
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

    <!-- 오늘의 예약 알림 팝업 (원장님 전용) -->
    <div v-if="showReservationPopup && todayReservations.length > 0" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div class="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[90vw] overflow-hidden">
        <div class="bg-primary px-6 py-4 text-white">
          <h3 class="font-bold text-lg flex items-center gap-2">📅 오늘의 예약 안내</h3>
          <p class="text-blue-200 text-sm mt-1">오늘 {{ todayReservations.length }}건의 예약이 있습니다.</p>
        </div>
        <div class="p-6 max-h-[300px] overflow-y-auto space-y-3">
          <div v-for="(rsv, idx) in todayReservations" :key="idx" class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {{ rsv.time || '📋' }}
            </div>
            <div class="flex-1">
              <div class="font-bold text-sm text-gray-800">{{ rsv.student_name || rsv.name || '이름 없음' }}</div>
              <div class="text-xs text-gray-500">{{ rsv.purpose || rsv.type || '상담' }} · {{ rsv.parent_phone || '' }}</div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50">
          <button @click="showReservationPopup = false" class="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { reservationApi } from '../services/api';

const router = useRouter();
const route = useRoute();
const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;
const activeDropdown = ref('');
const showReservationPopup = ref(false);
const todayReservations = ref<any[]>([]);

const navItems = ref([
  { name: '대시보드', path: '/', adminOnly: true },
  { name: '독강 데일리 보드', path: '/daily-board', adminOnly: false },
  { name: '학생 관리', path: '/students', adminOnly: true },
  {
    name: '반 관리',
    path: '/classes',
    adminOnly: false,
    children: [
      { name: '반 관리', path: '/classes' },
      { name: '보강 관리', path: '/supplementary' }
    ]
  },
  { 
    name: '성적 입력', 
    path: '/scores-input', 
    adminOnly: false,
    children: [
      { name: 'Daily Report', path: '/scores/new' },
      { name: '성취평가', path: '/scores/bimonthly/new' }
    ]
  },
  { 
    name: '성적 발송', 
    path: '/scores-view', 
    adminOnly: false,
    children: [
      { name: 'Daily Report', path: '/scores' },
      { name: '성취평가', path: '/scores/bimonthly' }
    ]
  },
  { name: '출결 관리', path: '/attendance', adminOnly: false },
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

const checkTodayReservations = async () => {
  if (!user || user.role !== 'admin') return;
  try {
    const res = await reservationApi.getAll({ status: 'pending' });
    if (res.data.success) {
      const kstNow = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
      const todayStr = kstNow.toISOString().split('T')[0];
      const todays = (res.data.data || []).filter((r: any) => {
        const rDate = r.reservation_date || r.visit_date || '';
        return rDate.startsWith(todayStr);
      });
      if (todays.length > 0) {
        todayReservations.value = todays;
        showReservationPopup.value = true;
      }
    }
  } catch (e) { console.error(e); }
};

onMounted(() => {
  checkTodayReservations();
});
</script>

<style scoped>
.bg-primary {
  background-color: #1e3a8a;
}

.bg-primary-dark {
  background-color: #1e40af;
}
</style>
