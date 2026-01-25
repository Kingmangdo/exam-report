<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 인증 폼 -->
      <div v-if="!authenticated" class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-primary mb-2">독강영어학원</h1>
          <p class="text-gray-600">성적표 확인</p>
        </div>

        <form @submit.prevent="verifyAccess" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              학생 이름
            </label>
            <input
              v-model="authForm.student_name"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="학생 이름을 입력하세요"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              학부모 핸드폰 뒷4자리
            </label>
            <input
              v-model="authForm.phone_last4"
              type="text"
              required
              maxlength="4"
              pattern="[0-9]{4}"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="예: 4321"
            />
          </div>

          <div v-if="authError" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ authError }}</p>
          </div>

          <button
            type="submit"
            :disabled="authLoading"
            class="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
          >
            {{ authLoading ? '확인 중...' : '확인하기' }}
          </button>
        </form>
      </div>

      <!-- 성적표 -->
      <div v-else-if="reportData" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- 헤더 -->
        <div class="bg-primary text-white p-6 text-center">
          <h1 class="text-2xl font-bold mb-2">독강영어학원</h1>
          <p class="text-sm opacity-90">영어 성적표</p>
        </div>

        <!-- 학생 정보 -->
        <div class="p-6 border-b">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">학생 이름</p>
              <p class="text-lg font-semibold text-gray-800">{{ reportData.student.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">시험일자</p>
              <p class="text-lg font-semibold text-gray-800">{{ reportData.score.exam_date }}</p>
            </div>
          </div>
        </div>

        <!-- 성적 정보 -->
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">성적 정보</h2>
          
          <div class="space-y-4">
            <!-- RT점수 -->
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold text-gray-800">RT점수</p>
                <p class="text-sm text-gray-500">
                  {{ reportData.score.rt.correct }} / {{ reportData.score.rt.total }}
                </p>
              </div>
              <p class="text-2xl font-bold text-primary">{{ reportData.score.rt.score.toFixed(1) }}점</p>
            </div>

            <!-- 단어시험 -->
            <div class="flex justify-between items-center p-4 rounded-lg" :class="reportData.score.word.retest ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'">
              <div>
                <p class="font-semibold" :class="reportData.score.word.retest ? 'text-red-600' : 'text-gray-800'">
                  단어시험
                  <span v-if="reportData.score.word.retest" class="ml-2 text-red-600 font-bold">(재시험)</span>
                </p>
                <p class="text-sm text-gray-500">
                  {{ reportData.score.word.correct }} / {{ reportData.score.word.total }}
                </p>
              </div>
              <p class="text-2xl font-bold" :class="reportData.score.word.retest ? 'text-red-600' : 'text-primary'">
                {{ reportData.score.word.score.toFixed(1) }}점
              </p>
            </div>

            <!-- 과제점수 -->
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <p class="font-semibold text-gray-800">과제점수</p>
              <p class="text-2xl font-bold text-primary">{{ reportData.score.assignment.toFixed(1) }}점</p>
            </div>

            <!-- 수업태도 -->
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <p class="font-semibold text-gray-800">수업태도</p>
              <p class="text-2xl font-bold text-primary">{{ reportData.score.attitude.toFixed(1) }}점</p>
            </div>
          </div>

          <!-- 총점 및 평균 -->
          <div class="mt-6 p-6 bg-primary text-white rounded-lg">
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <p class="text-sm opacity-90">총점</p>
                <p class="text-3xl font-bold">{{ reportData.score.total.toFixed(1) }}점</p>
              </div>
              <div>
                <p class="text-sm opacity-90">평균</p>
                <p class="text-3xl font-bold">{{ reportData.score.average.toFixed(1) }}점</p>
              </div>
            </div>
            <div class="mt-4 text-center">
              <p class="text-sm opacity-90">반 평균: {{ reportData.score.class_average.toFixed(1) }}점</p>
            </div>
          </div>

          <!-- 이전 성적 비교 -->
          <div v-if="reportData.comparison" class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">이전 성적과 비교</h3>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">평균 점수:</span>
              <span
                class="font-bold"
                :class="{
                  'text-green-600': reportData.comparison.trend === 'up',
                  'text-red-600': reportData.comparison.trend === 'down',
                  'text-gray-600': reportData.comparison.trend === 'stable'
                }"
              >
                {{ reportData.comparison.average_diff > 0 ? '+' : '' }}{{ reportData.comparison.average_diff.toFixed(1) }}점
              </span>
              <span
                v-if="reportData.comparison.trend === 'up'"
                class="text-green-600 text-xl"
              >
                ↑
              </span>
              <span
                v-else-if="reportData.comparison.trend === 'down'"
                class="text-red-600 text-xl"
              >
                ↓
              </span>
              <span v-else class="text-gray-600 text-xl">→</span>
            </div>
          </div>

          <!-- 코멘트 -->
          <div v-if="reportData.score.comment" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">코멘트</h3>
            <p class="text-gray-700">{{ reportData.score.comment }}</p>
          </div>

          <!-- 종합 문구 -->
          <div v-if="reportData.general_comment" class="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">종합 문구</h3>
            <p class="text-gray-700">{{ reportData.general_comment }}</p>
          </div>
        </div>
      </div>

      <!-- 로딩 -->
      <div v-else-if="loading" class="text-center py-8">
        <p class="text-gray-500">로딩 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { reportApi } from '../services/api';
import type { ReportData } from '../types';

const route = useRoute();
const token = ref<string>(route.params.token as string);
const authenticated = ref(false);
const reportData = ref<ReportData | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const authLoading = ref(false);
const authError = ref<string | null>(null);

const authForm = ref({
  student_name: '',
  phone_last4: ''
});

const verifyAccess = async () => {
  try {
    authLoading.value = true;
    authError.value = null;

    const response = await reportApi.verifyAccess(
      token.value,
      authForm.value.student_name,
      authForm.value.phone_last4
    );

    if (response.data.success) {
      authenticated.value = true;
      await fetchReportData();
    } else {
      authError.value = response.data.message || '인증에 실패했습니다.';
    }
  } catch (err: any) {
    authError.value = err.response?.data?.message || '인증 중 오류가 발생했습니다.';
    console.error(err);
  } finally {
    authLoading.value = false;
  }
};

const fetchReportData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await reportApi.getReport(
      token.value,
      authForm.value.student_name,
      authForm.value.phone_last4
    );

    if (response.data.success && response.data.data) {
      reportData.value = response.data.data;
    } else {
      error.value = response.data.message || '성적표를 불러올 수 없습니다.';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '성적표를 불러오는 중 오류가 발생했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // 토큰이 없으면 에러
  if (!token.value) {
    error.value = '유효하지 않은 링크입니다.';
  }
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
