import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('../views/LandingView.vue'),
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/admin',
    component: Layout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { adminOnly: true }
        },
        {
          path: 'daily-board',
          name: 'dailyBoard',
          component: () => import('../views/DailyBoardView.vue'),
          meta: { title: '독강 데일리 보드' }
        },
        {
          path: 'students',
        name: 'students',
        component: () => import('../views/StudentsView.vue'),
        meta: { adminOnly: true }
      },
      {
        path: 'classes',
        name: 'classes',
        component: () => import('../views/ClassesView.vue'),
        meta: { teacherOrAdmin: true }
      },
      {
        path: 'supplementary',
        name: 'supplementary-dashboard',
        component: () => import('../views/SupplementaryCalendarView.vue'),
        meta: { teacherOrAdmin: true }
      },
      {
        path: 'attendance',
        name: 'attendance',
        component: () => import('../views/AttendanceView.vue')
      },
      {
        path: 'soft-landing',
        name: 'soft-landing',
        component: () => import('../views/SoftLandingView.vue'),
        meta: { teacherOrAdmin: true }
      },
      {
        path: 'notification',
        name: 'notification',
        component: () => import('../views/NotificationView.vue'),
        meta: { adminOnly: true }
      },
      {
        path: 'scores/new',
        name: 'score-new',
        component: () => import('../views/ScoreNewView.vue')
      },
      {
        path: 'scores/standalone/new',
        name: 'standalone-score-new',
        component: () => import('../views/StandaloneScoreNewView.vue')
      },
      {
        path: 'scores/bimonthly/new',
        name: 'bimonthly-score-new',
        component: () => import('../views/BimonthlyScoreNewView.vue')
      },
      {
        path: 'scores',
        name: 'scores',
        component: () => import('../views/ScoresView.vue')
      },
      {
        path: 'scores/bimonthly',
        name: 'bimonthly-scores',
        component: () => import('../views/BimonthlyScoresView.vue')
      },
      {
        path: 'reservations',
        name: 'reservations',
        component: () => import('../views/ReservationsView.vue'),
        meta: { adminOnly: true }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { adminOnly: true }
      }
    ]
  },
  {
    path: '/classes',
    redirect: '/admin/classes'
  },
  {
    path: '/students',
    redirect: '/admin/students'
  },
  {
    path: '/attendance',
    redirect: '/admin/attendance'
  },
  {
    path: '/daily-board',
    redirect: '/admin/daily-board'
  },
  {
    path: '/supplementary',
    redirect: '/admin/supplementary'
  },
  {
    path: '/soft-landing',
    redirect: '/admin/soft-landing'
  },
  {
    path: '/notification',
    redirect: '/admin/notification'
  },
  {
    path: '/scores/new',
    redirect: '/admin/scores/new'
  },
  {
    path: '/scores/standalone/new',
    redirect: '/admin/scores/standalone/new'
  },
  {
    path: '/scores/bimonthly/new',
    redirect: '/admin/scores/bimonthly/new'
  },
  {
    path: '/scores',
    redirect: '/admin/scores'
  },
  {
    path: '/scores/bimonthly',
    redirect: '/admin/scores/bimonthly'
  },
  {
    path: '/reservations',
    redirect: '/admin/reservations'
  },
  {
    path: '/settings',
    redirect: '/admin/settings'
  },
  {
    path: '/report/:token',
    name: 'report',
    component: () => import('../views/ReportView.vue'),
    meta: { public: true }
  },
  {
    path: '/report/bimonthly/:token',
    name: 'bimonthly-report',
    component: () => import('../views/BimonthlyReportView.vue'),
    meta: { public: true }
  },
  {
    path: '/report/soft-landing/:token',
    name: 'soft-landing-report',
    component: () => import('../views/SoftLandingReportView.vue'),
    meta: { public: true }
  },
  {
    path: '/report/level-test/:token',
    name: 'level-test-report',
    component: () => import('../views/LevelTestReportView.vue'),
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 라우터 가드: 인증 및 권한 확인
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // 공용 페이지(랜딩, 로그인, 성적표 조회)는 통과
  if (to.meta.public) {
    // 단, 로그인 된 상태에서 로그인 페이지 접근 시 관리자 페이지로 (권한에 따라)
    if (token && to.path === '/login') {
      if (user?.role === 'admin') {
        return next('/admin');
      }
      return next('/admin/daily-board');
    }
    return next();
  }

  // 로그인 안되어 있으면 로그인 페이지로
  if (!token) {
    if (to.path.startsWith('/admin')) {
      return next('/login');
    }
    return next('/login');
  }

  const isStaff = user?.username?.startsWith('staff');
  const isTeacher = user?.role !== 'admin' && !isStaff;
  const isAdmin = user?.role === 'admin';

  // 관리자 전용 페이지 권한 확인
  if (to.meta.adminOnly && !isAdmin) {
    alert('관리자 권한이 필요합니다.');
    return next('/admin/daily-board');
  }

  // 스태프 전용 권한 확인 (강사 접근 불가)
  if (to.meta.staffOrAdmin && !isAdmin && !isStaff) {
    alert('접근 권한이 없습니다.');
    return next('/admin/daily-board');
  }

  // 강사 전용 권한 확인 (스태프 접근 불가)
  if ((to.meta.teacherOrAdmin || to.meta.excludeStaff) && !isAdmin && !isTeacher) {
    alert('접근 권한이 없습니다.');
    return next('/admin/daily-board');
  }

  // 관리자가 아닌 사용자가 /admin (대시보드)으로 접근 시 권한에 따라 리다이렉트
  if (to.path === '/admin' && !isAdmin) {
    return next('/admin/daily-board');
  }

  next();
});

// 페이지별 제목/검색 노출 설정
// - 랜딩('/')은 index.html 의 기본 title/description 을 그대로 사용(검색 노출 대상)
// - 그 외(로그인, 관리자 ERP, 학부모 성적표 링크)는 검색에 노출되지 않도록 noindex
const defaultTitle = document.title

const setRobots = (content: string) => {
  let el = document.querySelector('meta[name="robots"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'robots')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

router.afterEach((to) => {
  if (to.path === '/') {
    document.title = defaultTitle
    setRobots('index, follow')
    return
  }

  setRobots('noindex, nofollow')
  if (to.path.startsWith('/report')) {
    document.title = '독강영어 성적표'
  } else if (to.path === '/login') {
    document.title = '로그인 | 독강영어 ERP'
  } else {
    const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : ''
    document.title = pageTitle ? `${pageTitle} | 독강영어 ERP` : '독강영어 ERP'
  }
})

export default router
