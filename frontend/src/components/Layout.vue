<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 상단 네비게이션 -->
    <nav class="bg-primary text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold">독강영어학원 성적표 시스템</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="px-3 py-2 rounded hover:bg-primary-dark transition"
              active-class="bg-primary-dark"
            >
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 메인 컨텐츠 -->
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const navItems = ref([
  { name: '대시보드', path: '/' },
  { name: '학생 관리', path: '/students' },
  { name: '성적 입력', path: '/scores/new' },
  { name: '성적 조회', path: '/scores' },
  { name: '설정', path: '/settings' }
]);
</script>

<style scoped>
.bg-primary {
  background-color: #1e3a8a;
}

.bg-primary-dark {
  background-color: #1e40af;
}
</style>
