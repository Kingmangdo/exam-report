import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes: RouteRecordRaw[] = [
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
        component: () => import('../views/SettingsView.vue')
      }
    ]
  },
  {
    path: '/report/:token',
    name: 'report',
    component: () => import('../views/ReportView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
