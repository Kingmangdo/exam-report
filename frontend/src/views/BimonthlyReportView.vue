<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 인증 폼 -->
      <div v-if="!authenticated" class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div class="text-center mb-6">
          <img src="/logo.png" alt="독강영어 로고" class="h-32 w-32 object-contain rounded-full bg-white p-1 mx-auto mb-4 shadow-sm" />
          <h1 class="text-2xl font-bold text-primary mb-2">독강영어학원</h1>
          <p class="text-gray-600">성취평가 리포트 자세히 보기</p>
        </div>

        <form @submit.prevent="verifyAccess" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">학생 이름</label>
            <input v-model="authForm.student_name" type="text" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="학생 이름을 입력하세요" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">학부모 핸드폰 뒷4자리</label>
            <input v-model="authForm.phone_last4" type="text" required maxlength="4" pattern="[0-9]{4}" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="예: 4321" />
          </div>
          <div v-if="authError" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ authError }}</p>
          </div>
          <button type="submit" :disabled="authLoading" class="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {{ authLoading ? '확인 중...' : '확인하기' }}
          </button>
        </form>
      </div>

      <!-- 성적표 -->
      <div v-else-if="reportData" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- 헤더 -->
        <div class="bg-primary text-white p-6 flex items-center justify-start space-x-6">
          <img src="/logo.png" alt="독강영어 로고" class="h-20 w-20 object-contain rounded-full bg-white p-1 shadow-md" />
          <div class="text-left">
            <h1 class="text-3xl font-bold mb-1">독강영어학원</h1>
            <p class="text-lg opacity-90 font-medium tracking-wide italic" style="font-family: 'Times New Roman', Times, serif;">Bimonthly Test Report</p>
          </div>
        </div>

        <!-- 학생 정보 -->
        <div class="p-6 border-b bg-gray-50">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500 block text-xs">학생 이름</span>
              <span class="font-bold text-lg text-gray-800">{{ reportData.student.name }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs">반</span>
              <span class="font-bold text-gray-800">{{ reportData.student.class_name || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs">학교 / 학년</span>
              <span class="font-bold text-gray-800">{{ reportData.student.school || '-' }} / {{ reportData.student.grade || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs">시험일</span>
              <span class="font-bold text-gray-800">{{ reportData.score.exam_date }}</span>
            </div>
          </div>
        </div>

        <!-- 레이더 차트 + 영역별 상세 -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 좌측: 레이더 차트 -->
            <div>
              <h4 class="text-base font-bold text-gray-800 mb-3">🔷 영역별 성취도</h4>
              <div class="w-full h-[300px] flex items-center justify-center">
                <Radar v-if="radarData" :data="radarData" :options="radarOptions" />
              </div>
            </div>

            <!-- 우측: 영역별 점수 바 -->
            <div>
              <h4 class="text-base font-bold text-gray-800 mb-3">📊 영역별 상세 성적</h4>
              <div class="space-y-3">
                <div v-for="(part, idx) in (reportData.score.parts || []).filter((p: any) => p.max_score > 0)" :key="idx" class="flex items-center gap-3">
                  <span class="text-xs font-bold text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: partColors[idx] }">{{ idx + 1 }}</span>
                  <span class="w-[90px] text-sm font-bold text-gray-700 truncate">{{ part.name }}</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" :style="{ width: getPercent(part.score, part.max_score) + '%', backgroundColor: partColors[idx] }"></div>
                    <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                      {{ part.score }} / {{ part.max_score }} ({{ getPercent(part.score, part.max_score).toFixed(0) }}%)
                    </span>
                  </div>
                </div>
              </div>

              <!-- 학생점수 & 반평균 -->
              <div class="grid grid-cols-2 gap-3 mt-6">
                <div class="bg-blue-50 p-3 rounded-xl text-center border border-blue-100" :class="{'col-span-2': reportData.score.show_class_average === false}">
                  <div class="text-xs text-blue-600 font-bold mb-1">학생점수</div>
                  <div class="text-2xl font-black text-blue-900">{{ reportData.score.total_score }}</div>
                  <div class="text-xs text-blue-400">/ {{ maxScore }}</div>
                </div>
                <div v-if="reportData.score.show_class_average !== false" class="bg-purple-50 p-3 rounded-xl text-center border border-purple-100">
                  <div class="text-xs text-purple-600 font-bold mb-1">반 평균</div>
                  <div class="text-2xl font-black text-purple-700">{{ reportData.class_average?.class_average?.toFixed(1) || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 성적 트렌드 -->
        <div v-if="trendData && trendData.labels.length > 1" class="px-6 pb-4">
          <h4 class="text-base font-bold text-gray-800 mb-3">📈 최근 성적 트렌드</h4>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div class="w-full h-[350px]">
              <Bar :data="trendData" :options="trendOptions" :plugins="[ChartDataLabels]" />
            </div>
            <p class="text-xs text-gray-400 mt-2 text-center">* 동일한 영역만 비교 표시됩니다</p>
          </div>
        </div>

        <!-- 코멘트 -->
        <div v-if="reportData.score.comment" class="px-6 pb-6">
          <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div class="text-xs text-yellow-700 font-bold mb-1">💬 선생님 코멘트</div>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ reportData.score.comment }}</p>
          </div>
        </div>
      </div>

      <!-- 로딩 -->
      <div v-else-if="loading" class="text-center py-8">
        <p class="text-gray-500">로딩 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p class="text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { kakaoApi } from '../services/api';
import { Radar, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(RadialLinearScale, PointElement, LineElement, BarElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

const partColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

const route = useRoute();
const token = ref<string>(route.params.token as string);
const authenticated = ref(false);
const reportData = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const authLoading = ref(false);
const authError = ref<string | null>(null);

const authForm = ref({ student_name: '', phone_last4: '' });

const maxScore = computed(() => {
  if (!reportData.value?.score?.parts) return 0;
  return reportData.value.score.parts.reduce((s: number, p: any) => s + (p.max_score || 0), 0);
});

const getPercent = (score: number, max: number): number => {
  if (!max || max === 0) return 0;
  return (score / max) * 100;
};

const getAvgColor = (avg: number): string => {
  if (avg >= 90) return 'text-blue-600';
  if (avg >= 70) return 'text-green-600';
  if (avg >= 50) return 'text-orange-600';
  return 'text-red-600';
};

const dateToMonth = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return parseInt(parts[1], 10) + '월';
  }
  return dateStr;
};

// 레이더 차트 - max_score > 0인 영역만 표시
const radarData = computed(() => {
  if (!reportData.value?.score?.parts) return null;
  const parts = reportData.value.score.parts.filter((p: any) => p.max_score > 0);
  if (parts.length === 0) return null;
  return {
    labels: parts.map((p: any) => p.name),
    datasets: [{
      label: reportData.value.student.name,
      data: parts.map((p: any) => (p.score / p.max_score * 100)),
      backgroundColor: 'rgba(30, 58, 138, 0.15)',
      borderColor: 'rgba(30, 58, 138, 1)',
      borderWidth: 2,
      pointBackgroundColor: partColors.slice(0, parts.length),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 7,
      pointHoverRadius: 9
    }]
  };
});

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: { display: true, color: 'rgba(0,0,0,0.1)' },
      suggestedMin: 0, suggestedMax: 100,
      ticks: { stepSize: 20, font: { size: 10 }, backdropColor: 'transparent' },
      pointLabels: { font: { size: 13, weight: 'bold' as const }, color: partColors },
      grid: { color: 'rgba(0,0,0,0.08)' }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw?.toFixed(1)}점` } }
  }
};

// 트렌드 차트
const trendData = computed(() => {
  if (!reportData.value?.recent_scores || reportData.value.recent_scores.length < 2) return null;
  const currentParts = (reportData.value.score.parts || []).map((p: any) => p.name);
  const recentScores = [...reportData.value.recent_scores].sort((a: any, b: any) => a.exam_date.localeCompare(b.exam_date)).slice(-3);
  if (recentScores.length < 2) return null;

  const commonParts: string[] = currentParts.filter((name: string) =>
    recentScores.every((score: any) => (score.parts || []).some((p: any) => p.name === name))
  );
  if (commonParts.length === 0) return null;

  const labels = recentScores.map((s: any) => dateToMonth(s.exam_date));
  const datasets = commonParts.map((partName: string, idx: number) => {
    const colorIdx = currentParts.indexOf(partName);
    const color = partColors[colorIdx >= 0 ? colorIdx : idx] || partColors[idx % 5];
    const data = recentScores.map((score: any) => {
      const part = (score.parts || []).find((p: any) => p.name === partName);
      return part && part.max_score > 0 ? Math.round(part.score / part.max_score * 100 * 10) / 10 : 0;
    });
    return {
      label: partName, data,
      backgroundColor: color + 'CC', borderColor: color, borderWidth: 1, borderRadius: 4,
      barPercentage: 0.7, categoryPercentage: 0.8
    };
  });
  return { labels, datasets };
});

const trendOptions = {
  responsive: true, 
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 10,
      bottom: 50,
      left: 10,
      right: 10
    }
  },
  scales: {
    y: { 
      beginAtZero: true, 
      max: 110, 
      ticks: { 
        stepSize: 20, 
        font: { size: 11 },
        callback: function(value: any) {
          if (value > 100) return '';
          return value + '%';
        }
      }, 
      grid: { 
        color: function(context: any) {
          if (context.tick && context.tick.value === 110) {
            return 'transparent';
          }
          return 'rgba(0,0,0,0.06)';
        }
      }
    },
    x: { 
      ticks: { font: { size: 12, weight: 'bold' as const } }, 
      grid: { display: false }
    }
  },
  plugins: {
    legend: { 
      display: true, 
      position: 'bottom' as const,
      align: 'center' as const,
      padding: {
        top: 30,
        bottom: 10
      },
      labels: { 
        font: { size: 11, weight: 'bold' as const }, 
        usePointStyle: true, 
        pointStyle: 'rectRounded',
        boxWidth: 14,
        boxHeight: 14
      } 
    },
    tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%` } },
    datalabels: {
      display: true, anchor: 'end' as const, align: 'top' as const,
      font: { size: 10, weight: 'bold' as const }, color: '#333',
      formatter: (value: number) => value !== undefined ? value.toFixed(1) + '%' : ''
    }
  }
};

const verifyAccess = async () => {
  try {
    authLoading.value = true;
    authError.value = null;
    const response = await kakaoApi.verifyBimonthlyAccess(token.value, authForm.value.student_name, authForm.value.phone_last4);
    if (response.data.success) {
      authenticated.value = true;
      await fetchReportData();
    } else {
      authError.value = response.data.message || '인증에 실패했습니다.';
    }
  } catch (err: any) {
    authError.value = err.response?.data?.message || '인증 중 오류가 발생했습니다.';
  } finally {
    authLoading.value = false;
  }
};

const fetchReportData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await kakaoApi.getBimonthlyReport(token.value, authForm.value.student_name, authForm.value.phone_last4);
    if (response.data.success && response.data.data) {
      reportData.value = response.data.data;
    } else {
      error.value = response.data.message || '성적표를 불러올 수 없습니다.';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '성적표를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!token.value) error.value = '유효하지 않은 링크입니다.';
});
</script>

<style scoped>
.text-primary { color: #1e3a8a; }
.bg-primary { background-color: #1e3a8a; }
.bg-primary-dark { background-color: #1e40af; }
</style>
