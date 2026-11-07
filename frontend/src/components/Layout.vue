<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 상단 네비게이션 -->
    <nav class="bg-primary text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16 md:h-20">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="flex items-center space-x-2 md:space-x-4 hover:text-gray-200 transition">
              <img src="/logo.png" alt="독강영어 로고" class="h-10 w-10 md:h-16 md:w-16 object-contain rounded-full bg-white p-1 shadow-sm" />
              <span class="text-lg md:text-2xl font-bold truncate">독강영어 학습관리</span>
            </router-link>
          </div>
          
          <!-- 모바일 메뉴 햄버거 버튼 -->
          <div class="md:hidden">
            <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-white focus:outline-none p-2">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- PC 메뉴 -->
          <div class="hidden md:flex items-center space-x-2 lg:space-x-4">
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

        <!-- 모바일 메뉴 드롭다운 -->
        <div v-show="isMobileMenuOpen" class="md:hidden pb-4">
          <div class="flex flex-col space-y-2 mt-2 bg-primary-dark rounded-lg p-2">
            <template v-for="item in filteredNavItems" :key="'mobile-'+item.path">
              <div v-if="item.children" class="flex flex-col">
                <div class="px-3 py-2 text-sm font-bold text-gray-300">{{ item.name }}</div>
                <router-link
                  v-for="child in item.children"
                  :key="'mobile-'+child.path"
                  :to="child.path"
                  class="pl-6 pr-3 py-2 rounded hover:bg-blue-800 transition text-sm text-white"
                  active-class="bg-blue-800"
                  @click="isMobileMenuOpen = false"
                >
                  - {{ child.name }}
                </router-link>
              </div>
              <router-link
                v-else
                :to="item.path"
                class="px-3 py-2 rounded hover:bg-blue-800 transition text-sm text-white"
                active-class="bg-blue-800"
                @click="isMobileMenuOpen = false"
              >
                {{ item.name }}
              </router-link>
            </template>
            <button
              @click="handleLogout"
              class="px-3 py-2 mt-2 rounded transition text-sm bg-red-600 hover:bg-red-700 text-white text-left"
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
            {{ user.name }}님 ({{ user.role === 'admin' ? '원장' : (user.username?.startsWith('staff') ? '스태프' : '강사') }}) 환영합니다.
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
              <div class="font-bold text-sm text-gray-800">
                <span v-if="rsv.name && rsv.name.startsWith('[홈페이지]')" class="text-xs bg-red-100 text-red-600 px-1 rounded mr-1">NEW</span>
                {{ rsv.name || rsv.student_name || '이름 없음' }}
              </div>
              <div class="text-xs text-gray-500">{{ rsv.grade || rsv.purpose || rsv.type || '상담' }} · {{ rsv.parent_phone || '' }}</div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50 flex gap-2">
          <button @click="showReservationPopup = false" class="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition">닫기</button>
          <button @click="router.push('/admin/reservations'); showReservationPopup = false" class="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition">예약 관리로 이동</button>
        </div>
      </div>
    </div>

    <!-- 신규 상담 문의 팝업 -->
    <div v-if="showNewInquiryPopup" class="fixed bottom-6 right-6 z-[9999] animate-bounce">
      <div class="bg-indigo-600 text-white rounded-2xl shadow-2xl p-5 w-80 border-4 border-indigo-200 cursor-pointer hover:bg-indigo-700 transition relative overflow-hidden" @click="router.push('/admin/reservations'); showNewInquiryPopup = false">
        <div class="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        <div class="flex items-start gap-4">
          <div class="bg-white text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner">
            📬
          </div>
          <div class="flex-1">
            <h3 class="font-black text-lg mb-1">새로운 상담 문의!</h3>
            <p class="text-indigo-100 text-sm leading-tight">홈페이지에서 <b class="text-yellow-300 text-base">{{ newInquiries.length }}건</b>의 신규 문의가 접수되었습니다.</p>
            <p class="text-xs text-indigo-200 mt-2">클릭하여 예약 관리로 이동 ➔</p>
          </div>
        </div>
        <button @click.stop="showNewInquiryPopup = false" class="absolute top-2 right-2 text-indigo-200 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
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
const isMobileMenuOpen = ref(false);
const showReservationPopup = ref(false);
const todayReservations = ref<any[]>([]);
const showNewInquiryPopup = ref(false);
const newInquiries = ref<any[]>([]);

const navItems = ref([
  { name: '대시보드', path: '/admin', staffOrAdmin: true },
  { name: '독강 데일리 보드', path: '/admin/daily-board', teacherOrAdmin: true },
  { name: '출결 관리', path: '/admin/attendance' },
  {
    name: '학생/반 관리',
    path: '/manage-students',
    children: [
      { name: '학생 관리', path: '/admin/students', staffOrAdmin: true },
      { name: '반 관리', path: '/admin/classes', teacherOrAdmin: true },
      { name: '보강 관리', path: '/admin/supplementary', teacherOrAdmin: true },
      { name: '신입생 소프트랜딩', path: '/admin/soft-landing', teacherOrAdmin: true }
    ]
  },
  { 
    name: '성적 관리', 
    path: '/manage-scores', 
    teacherOrAdmin: true,
    children: [
      { name: '성적 입력 (단체)', path: '/admin/scores/new', teacherOrAdmin: true },
      { name: '성적 입력 (단독/보강)', path: '/admin/scores/standalone/new', teacherOrAdmin: true },
      { name: '성적 입력 (성취)', path: '/admin/scores/bimonthly/new', teacherOrAdmin: true },
      { name: '성적 발송 (Daily)', path: '/admin/scores', teacherOrAdmin: true },
      { name: '성적 발송 (성취)', path: '/admin/scores/bimonthly', teacherOrAdmin: true }
    ]
  },
  {
    name: '학원 관리',
    path: '/manage-academy',
    staffOrAdmin: true,
    children: [
      { name: '예약 관리', path: '/admin/reservations', staffOrAdmin: true },
      { name: '알림톡 발송', path: '/admin/notification', staffOrAdmin: true }
    ]
  },
  { name: '설정', path: '/admin/settings', adminOnly: true }
]);

const filteredNavItems = computed(() => {
  if (!user) return [];
  const isAdmin = user.role === 'admin';
  const isStaff = user.username?.startsWith('staff');
  const isTeacher = user.role !== 'admin' && !isStaff;

  return navItems.value
    .map(item => {
      const newItem = { ...item };
      if (newItem.children) {
        newItem.children = newItem.children.filter(child => {
          if (child.adminOnly && !isAdmin) return false;
          if (child.staffOrAdmin && !isAdmin && !isStaff) return false;
          if ((child.teacherOrAdmin || child.excludeStaff) && !isAdmin && !isTeacher) return false;
          return true;
        });
      }
      return newItem;
    })
    .filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.staffOrAdmin && !isAdmin && !isStaff) return false;
      if ((item.teacherOrAdmin || item.excludeStaff) && !isAdmin && !isTeacher) return false;
      if (item.children && item.children.length === 0) return false;
      return true;
    });
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
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.username?.startsWith('staff');
  if (!user || (!isAdmin && !isStaff)) return;
  try {
    const res = await reservationApi.getAll({ status: '예약' }); // existing check
    // Actually we can just get all without status and filter them
    const allRes = await reservationApi.getAll();
    if (allRes.data.success) {
      const allData = allRes.data.data || [];
      
      // 1. 오늘 예정된 방문/상담 예약 확인 (기존 기능)
      const kstNow = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
      const todayStr = kstNow.toISOString().split('T')[0];
      const todays = allData.filter((r: any) => {
        if (r.status !== '예약') return false;
        const rDate = r.reservation_date || r.visit_date || '';
        return rDate.startsWith(todayStr);
      });
      if (todays.length > 0) {
        todayReservations.value = todays;
        showReservationPopup.value = true;
      }

      // 2. 새로운 상담 문의 (신규문의) 확인: 이름이 '[홈페이지]'로 시작하는 예약들
      const newInq = allData.filter((r: any) => r.name && r.name.startsWith('[홈페이지]'));
      if (newInq.length > 0) {
        newInquiries.value = newInq;
        showNewInquiryPopup.value = true;
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
