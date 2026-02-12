<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">대시보드</h2>

    <!-- 통계 카드 -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">전체 학생</h3>
        <p class="text-3xl font-bold text-primary">{{ statistics?.total_students || 0 }}명</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">오늘 등원 총원</h3>
        <p class="text-3xl font-bold text-blue-600">{{ statistics?.attending_students || 0 }}명</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">오늘 입력 성적</h3>
        <p class="text-3xl font-bold text-green-600">{{ statistics?.today_scores || 0 }}건</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">오늘 발송 성적</h3>
        <p class="text-3xl font-bold text-purple-600">{{ statistics?.today_sends || 0 }}건</p>
      </div>
    </div>

    <!-- 빠른 작업 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">빠른 작업</h3>
      <div class="flex flex-wrap gap-4">
        <router-link
          to="/scores/new"
          class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          성적 입력하기
        </router-link>
        <router-link
          to="/students"
          class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          학생 관리
        </router-link>
        <router-link
          to="/scores"
          class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          성적 조회
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { statisticsApi } from '../services/api';
import type { Statistics } from '../types';

const statistics = ref<Statistics | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchStatistics = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await statisticsApi.getOverall();
    if (response.data.success && response.data.data) {
      statistics.value = response.data.data;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '통계를 불러오는 중 오류가 발생했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStatistics();
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
