import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: 'students',
        name: 'students',
        component: () => import('../views/StudentsView.vue')
      },
      {
        path: 'classes',
        name: 'classes',
        component: () => import('../views/ClassesView.vue')
      },
      {
        path: 'scores/new',
        name: 'score-new',
        component: () => import('../views/ScoreNewView.vue')
      },
      {
        path: 'scores',
        name: 'scores',
        component: () => import('../views/ScoresView.vue')
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
    path: '/report/:token',
    name: 'report',
    component: () => import('../views/ReportView.vue'),
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

  // 공용 페이지(로그인, 성적표 조회)는 통과
  if (to.meta.public) {
    return next();
  }

  // 로그인 안되어 있으면 로그인 페이지로
  if (!token) {
    return next('/login');
  }

  // 관리자 전용 페이지 권한 확인
  if (to.meta.adminOnly && user?.role !== 'admin') {
    alert('관리자 권한이 필요합니다.');
    return next('/');
  }

  next();
});

export default router
