<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 인증 폼 -->
      <div v-if="!authenticated" class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div class="text-center mb-6">
          <img src="/logo.png" alt="독강영어 로고" class="h-32 w-32 object-contain rounded-full bg-white p-1 mx-auto mb-4 shadow-sm" />
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
        <div class="bg-primary text-white p-6 flex items-center justify-center space-x-6">
          <img src="/logo.png" alt="독강영어 로고" class="h-20 w-20 object-contain rounded-full bg-white p-1 shadow-md" />
          <div class="text-left">
            <h1 class="text-3xl font-bold mb-1">독강영어학원</h1>
            <p class="text-lg opacity-90 font-medium tracking-wide">Daily Report</p>
          </div>
        </div>

        <!-- 학생 정보 -->
        <div class="p-6 border-b">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-500">학생 이름</p>
              <p class="text-lg font-semibold text-gray-800">{{ reportData.student.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">반</p>
              <p class="text-lg font-semibold text-gray-800">{{ reportData.student.class_name || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">시험일자</p>
              <p class="text-lg font-semibold text-gray-800">{{ reportData.score.exam_date }}</p>
            </div>
          </div>
        </div>

        <!-- 평균 및 반 평균 (상단으로 이동) -->
        <div class="mx-6 mt-6 p-6 bg-primary text-white rounded-lg shadow-md">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <p class="text-sm opacity-90">평균 점수</p>
              <p class="text-3xl font-bold">{{ reportData.score.average.toFixed(1) }}점</p>
            </div>
            <div>
              <p class="text-sm opacity-90">반 평균</p>
              <p class="text-3xl font-bold">{{ reportData.score.class_average.toFixed(1) }}점</p>
            </div>
          </div>
        </div>

        <!-- 성적 정보 -->
        <div class="p-6 relative">
          <div class="relative z-10">
            <h2 class="text-xl font-bold text-gray-800 mb-4">성적 정보</h2>
            
            <div class="space-y-4">
              <!-- RT 테스트 상세 -->
              <div v-if="reportData.score.rt_details && reportData.score.rt_details.length > 0">
                <div class="flex justify-between items-end mb-2">
                  <p class="text-sm font-bold text-gray-600">RT 테스트 상세</p>
                  <p class="text-sm font-bold text-primary">RT 평균: {{ reportData.score.rt.score.toFixed(1) }}점</p>
                </div>
                <div class="grid grid-cols-1 gap-2">
                  <div v-for="(rt, idx) in reportData.score.rt_details" :key="'rt-'+idx" class="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p class="font-semibold text-gray-800">{{ rt.name || `RT ${idx + 1}` }}</p>
                      <p class="text-sm text-gray-500">{{ rt.correct }} / {{ rt.total || 10 }}</p>
                    </div>
                    <p class="text-2xl font-bold text-primary">
                      {{ (Number(rt.total) || 0) > 0 ? ((Number(rt.correct) / Number(rt.total)) * 100).toFixed(1) : '0.0' }}점
                    </p>
                  </div>
                </div>
              </div>
              <!-- RT 합산 (상세가 없을 경우 대비) -->
              <div v-else class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-semibold text-gray-800">RT점수 (평균)</p>
                  <p class="text-sm text-gray-500">
                    {{ reportData.score.rt.correct }} / {{ reportData.score.rt.total }}
                  </p>
                </div>
                <p class="text-2xl font-bold text-primary">{{ reportData.score.rt.score.toFixed(1) }}점</p>
              </div>

              <!-- 단어 테스트 상세 -->
              <div v-if="reportData.score.word_details && reportData.score.word_details.length > 0">
                <div class="flex justify-between items-end mb-2">
                  <p class="text-sm font-bold text-gray-600">단어 테스트 상세</p>
                  <p class="text-sm font-bold text-primary">단어 평균: {{ reportData.score.word.score.toFixed(1) }}점</p>
                </div>
                <div class="grid grid-cols-1 gap-2">
                  <div v-for="(word, idx) in reportData.score.word_details" :key="'word-'+idx" 
                    class="flex justify-between items-center p-4 rounded-lg border"
                    :class="word.retest || ((Number(word.total) || 0) > 0 && (Number(word.correct) / Number(word.total)) * 100 <= 84) ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'"
                  >
                    <div>
                      <p class="font-semibold" :class="word.retest || ((Number(word.total) || 0) > 0 && (Number(word.correct) / Number(word.total)) * 100 <= 84) ? 'text-red-600' : 'text-gray-800'">
                        {{ word.name || `단어 ${idx + 1}` }}
                        <span v-if="word.retest || ((Number(word.total) || 0) > 0 && (Number(word.correct) / Number(word.total)) * 100 <= 84)" class="ml-2 text-red-600 font-bold">(재시험)</span>
                      </p>
                      <p class="text-sm text-gray-500">{{ word.correct }} / {{ word.total || 50 }}</p>
                    </div>
                    <p class="text-2xl font-bold" :class="word.retest || ((Number(word.total) || 0) > 0 && (Number(word.correct) / Number(word.total)) * 100 <= 84) ? 'text-red-600' : 'text-primary'">
                      {{ (Number(word.total) || 0) > 0 ? ((Number(word.correct) / Number(word.total)) * 100).toFixed(1) : '0.0' }}점
                    </p>
                  </div>
                </div>
              </div>
              <!-- 단어 합산 (상세가 없을 경우 대비) -->
              <div v-else class="flex justify-between items-center p-4 rounded-lg" :class="reportData.score.word.retest ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'">
                <div>
                  <p class="font-semibold" :class="reportData.score.word.retest ? 'text-red-600' : 'text-gray-800'">
                    단어시험 (평균)
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
              <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="font-semibold text-gray-800">과제점수</p>
                <p class="text-2xl font-bold text-primary">{{ reportData.score.assignment.toFixed(1) }}점</p>
              </div>
            </div>

            <!-- 최근 3주 트렌드 -->
            <div class="mt-6 p-6 bg-white border rounded-lg">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-800">최근 3주 트렌드</h3>
                  <p class="text-sm text-gray-500">주 2회 기준 최근 6회 성적</p>
                </div>
                <div v-if="trendScores.length > 0" class="text-right">
                  <p class="text-xs text-gray-500">3주 평균</p>
                  <p class="text-lg font-bold text-primary">{{ threeWeekAverage.toFixed(1) }}점</p>
                </div>
              </div>

              <div v-if="trendScores.length > 0" class="bg-gray-50 rounded-lg p-4 h-48">
                <Line :data="trendChartData" :options="trendChartOptions" />
              </div>
              <div v-else class="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                최근 성적 데이터가 부족합니다.
              </div>

              <div v-if="trendScores.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-500">최고 평균</p>
                  <p class="text-lg font-bold text-gray-800">{{ threeWeekHigh.toFixed(1) }}점</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-500">최저 평균</p>
                  <p class="text-lg font-bold text-gray-800">{{ threeWeekLow.toFixed(1) }}점</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-500">이번 평균</p>
                  <p class="text-lg font-bold text-gray-800">{{ reportData.score.average.toFixed(1) }}점</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-500">변화(직전 대비)</p>
                  <p class="text-lg font-bold" :class="trendColor(averageDelta.trend)">
                    {{ formatDelta(averageDelta.diff) }}
                  </p>
                </div>
              </div>

              <div v-if="trendScores.length > 1" class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                <div class="p-3 bg-white border rounded-lg">
                  <p class="text-xs text-gray-500">RT 점수</p>
                  <p class="text-base font-semibold" :class="trendColor(rtDelta.trend)">
                    {{ formatDelta(rtDelta.diff) }}
                  </p>
                </div>
                <div class="p-3 bg-white border rounded-lg">
                  <p class="text-xs text-gray-500">단어 점수</p>
                  <p class="text-base font-semibold" :class="trendColor(wordDelta.trend)">
                    {{ formatDelta(wordDelta.diff) }}
                  </p>
                </div>
                <div class="p-3 bg-white border rounded-lg">
                  <p class="text-xs text-gray-500">과제 점수</p>
                  <p class="text-base font-semibold" :class="trendColor(assignmentDelta.trend)">
                    {{ formatDelta(assignmentDelta.diff) }}
                  </p>
                </div>
                <div class="p-3 bg-white border rounded-lg">
                  <p class="text-xs text-gray-500">총점</p>
                  <p class="text-base font-semibold" :class="trendColor(totalDelta.trend)">
                    {{ formatDelta(totalDelta.diff) }}
                  </p>
                </div>
                <div class="p-3 bg-white border rounded-lg">
                  <p class="text-xs text-gray-500">평균</p>
                  <p class="text-base font-semibold" :class="trendColor(averageDelta.trend)">
                    {{ formatDelta(averageDelta.diff) }}
                  </p>
                </div>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { reportApi } from '../services/api';
import type { ReportData } from '../types';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

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

const trendScores = computed(() => {
  const scores = reportData.value?.recent_scores ?? [];
  return [...scores].sort((a, b) => a.exam_date.localeCompare(b.exam_date));
});

const threeWeekAverage = computed(() => {
  if (trendScores.value.length === 0) return 0;
  const sum = trendScores.value.reduce((acc, item) => acc + (item.average_score || 0), 0);
  return Math.round((sum / trendScores.value.length) * 10) / 10;
});

const threeWeekHigh = computed(() => {
  if (trendScores.value.length === 0) return 0;
  return Math.max(...trendScores.value.map(item => item.average_score || 0));
});

const threeWeekLow = computed(() => {
  if (trendScores.value.length === 0) return 0;
  return Math.min(...trendScores.value.map(item => item.average_score || 0));
});

const getDelta = (current: number, previous: number) => {
  const diff = Math.round((current - previous) * 10) / 10;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';
  return { diff, trend };
};

const latestPair = computed(() => {
  if (trendScores.value.length < 2) return null;
  const previous = trendScores.value[trendScores.value.length - 2];
  const current = trendScores.value[trendScores.value.length - 1];
  return { previous, current };
});

const rtDelta = computed(() => {
  if (!latestPair.value) return { diff: 0, trend: 'stable' as const };
  return getDelta(latestPair.value.current.rt_score, latestPair.value.previous.rt_score);
});

const wordDelta = computed(() => {
  if (!latestPair.value) return { diff: 0, trend: 'stable' as const };
  return getDelta(latestPair.value.current.word_score, latestPair.value.previous.word_score);
});

const assignmentDelta = computed(() => {
  if (!latestPair.value) return { diff: 0, trend: 'stable' as const };
  return getDelta(latestPair.value.current.assignment_score, latestPair.value.previous.assignment_score);
});

const attitudeDelta = computed(() => {
  if (!latestPair.value) return { diff: 0, trend: 'stable' as const };
  return getDelta(latestPair.value.current.attitude_score, latestPair.value.previous.attitude_score);
});

const totalDelta = computed(() => {
  if (!latestPair.value) return { diff: 0, trend: 'stable' as const };
  return getDelta(latestPair.value.current.total_score, latestPair.value.previous.total_score);
});

const averageDelta = computed(() => {
  if (!latestPair.value) return { diff: 0, trend: 'stable' as const };
  return getDelta(latestPair.value.current.average_score, latestPair.value.previous.average_score);
});

const trendChartData = computed(() => ({
  labels: trendScores.value.map(item => item.exam_date),
  datasets: [
    {
      label: '평균',
      data: trendScores.value.map(item => item.average_score || 0),
      borderColor: '#1e3a8a',
      backgroundColor: 'rgba(30, 58, 138, 0.12)',
      tension: 0.35,
      fill: true,
      pointRadius: 3
    },
    {
      label: '반 평균',
      data: trendScores.value.map(item => item.class_average || 0),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      tension: 0.35,
      fill: false,
      pointRadius: 2
    }
  ]
}));

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        boxWidth: 12,
        boxHeight: 12
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
};

const trendColor = (trend: 'up' | 'down' | 'stable') => {
  if (trend === 'up') return 'text-green-600';
  if (trend === 'down') return 'text-red-600';
  return 'text-gray-600';
};

const formatDelta = (diff: number) => {
  if (diff > 0) return `▲ +${diff.toFixed(1)}점`;
  if (diff < 0) return `▼ ${diff.toFixed(1)}점`;
  return '— 0.0점';
};

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
