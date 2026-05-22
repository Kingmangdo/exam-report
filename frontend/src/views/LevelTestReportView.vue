<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 인증 전 -->
    <div v-if="!verified" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div class="text-center mb-6">
          <img src="/logo.png" alt="독강영어 로고" class="h-32 w-32 object-contain rounded-full bg-white p-1 mx-auto mb-4 shadow-sm" />
          <h1 class="text-2xl font-bold text-primary mb-2">독강영어학원</h1>
          <p class="text-gray-600">레벨테스트 리포트 자세히 보기</p>
        </div>

        <div v-if="linkError" class="mb-4 bg-red-50 p-3 rounded-lg text-sm text-red-600 text-center">
          {{ linkError }}
        </div>

        <div v-if="!linkError" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">학생 이름</label>
            <input v-model="authForm.name" type="text" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="학생 이름을 입력하세요" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">학부모 핸드폰 뒷4자리</label>
            <input v-model="authForm.phone_last4" type="text" maxlength="4" pattern="[0-9]{4}" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="예: 4321" />
          </div>
          <div v-if="authError" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ authError }}</p>
          </div>
          <button @click="verifyAccess" :disabled="verifying" class="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {{ verifying ? '확인 중...' : '확인하기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 인증 후 - 성적표 -->
    <div v-else class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- 헤더 -->
        <div class="bg-primary text-white p-6 flex items-center justify-start space-x-6">
          <img src="/logo.png" alt="독강영어 로고" class="h-20 w-20 object-contain rounded-full bg-white p-1 shadow-md" />
          <div class="text-left">
            <h1 class="text-3xl font-bold mb-1">독강영어학원</h1>
            <p class="text-lg opacity-90 font-medium tracking-wide italic" style="font-family: 'Times New Roman', Times, serif;">Level Test Report</p>
          </div>
        </div>

        <div v-if="reportData" class="p-6">
          <!-- 학생 정보 -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div><span class="text-gray-500">이름:</span> <span class="font-bold">{{ reportData.student.name }}</span></div>
              <div><span class="text-gray-500">학교:</span> <span class="font-bold">{{ reportData.student.school || '-' }}</span></div>
              <div><span class="text-gray-500">학년:</span> <span class="font-bold">{{ reportData.student.grade || '-' }}</span></div>
            </div>
            <div class="mt-2 text-sm">
              <span class="text-gray-500">테스트 날짜:</span> <span class="font-bold">{{ reportData.score.test_date }}</span>
            </div>
          </div>

          <!-- 레이더 차트 + 점수 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="border rounded-lg p-4">
              <h4 class="text-sm font-bold text-gray-700 mb-3 text-center">영역별 성취도</h4>
              <canvas ref="radarChartCanvas" width="300" height="300"></canvas>
            </div>
            <div class="space-y-3">
              <h4 class="text-sm font-bold text-gray-700 mb-2">영역별 점수</h4>
              <div v-for="(part, idx) in validParts" :key="idx" class="border rounded-lg p-3">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-bold flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full inline-block" :style="{ backgroundColor: partColors[idx] }"></span>
                    {{ part.name }}
                  </span>
                  <span class="text-sm font-black" :style="{ color: partColors[idx] }">{{ part.score }}/{{ part.max_score || 100 }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div class="h-2 rounded-full transition-all" :style="{ width: ((part.score / (part.max_score || 100)) * 100) + '%', backgroundColor: partColors[idx] }"></div>
                </div>
                <p v-if="part.comment" class="text-xs text-gray-500 italic">{{ part.comment }}</p>
              </div>
            </div>
          </div>

          <!-- 총점/평균 -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <div class="text-xs text-blue-600 font-bold mb-1">총점</div>
                <div class="text-2xl font-black text-blue-900">{{ reportData.score.total_score }}</div>
              </div>
              <div>
                <div class="text-xs text-green-600 font-bold mb-1">평균</div>
                <div class="text-2xl font-black text-green-700">{{ reportData.score.average_score }}</div>
              </div>
            </div>
          </div>

          <!-- 종합 코멘트 -->
          <div v-if="reportData.score.overall_comment" class="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
            <h4 class="text-sm font-bold text-yellow-800 mb-2">💬 선생님 종합 코멘트</h4>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ reportData.score.overall_comment }}</p>
          </div>

          <!-- 영역별 코멘트 -->
          <div v-if="partsWithComments.length > 0" class="space-y-3">
            <h4 class="text-sm font-bold text-gray-700">📋 영역별 상세 코멘트</h4>
            <div v-for="(part, idx) in partsWithComments" :key="idx" class="bg-gray-50 p-3 rounded-lg border">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-3 h-3 rounded-full inline-block" :style="{ backgroundColor: partColors[validParts.indexOf(part)] }"></span>
                <span class="text-sm font-bold">{{ part.name }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ part.comment }}</p>
            </div>
          </div>
        </div>

        <!-- 푸터 -->
        <div class="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
          독강영어학원 | Level Test Report
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const token = route.params.token as string;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const api = axios.create({ baseURL: apiBaseUrl });

const verified = ref(false);
const verifying = ref(false);
const linkError = ref('');
const authError = ref('');
const reportData = ref<any>(null);
const radarChartCanvas = ref<HTMLCanvasElement | null>(null);
let radarChartInstance: any = null;

const partColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

const authForm = ref({
  name: '',
  phone_last4: ''
});

const validParts = computed(() => {
  if (!reportData.value) return [];
  return reportData.value.score.parts.filter((p: any) => p.name);
});

const partsWithComments = computed(() => {
  return validParts.value.filter((p: any) => p.comment);
});

const checkLink = async () => {
  try {
    const res = await api.get(`/reports/level-test/check/${token}`);
    if (!res.data.success) {
      linkError.value = '유효하지 않은 링크입니다.';
    } else if (res.data.data.expired) {
      linkError.value = '링크가 만료되었습니다.';
    }
  } catch (err: any) {
    linkError.value = err.response?.data?.message || '링크를 확인할 수 없습니다.';
  }
};

const verifyAccess = async () => {
  if (!authForm.value.name || !authForm.value.phone_last4) {
    authError.value = '이름과 연락처 뒷 4자리를 입력해주세요.';
    return;
  }
  verifying.value = true;
  authError.value = '';
  try {
    const verifyRes = await api.post(`/reports/level-test/verify/${token}`, {
      name: authForm.value.name,
      phone_last4: authForm.value.phone_last4
    });
    if (verifyRes.data.success) {
      // 인증 성공 → 데이터 로드
      const dataRes = await api.get(`/reports/level-test/${token}`);
      if (dataRes.data.success) {
        reportData.value = dataRes.data.data;
        verified.value = true;
        await nextTick();
        drawRadarChart();
      }
    }
  } catch (err: any) {
    authError.value = err.response?.data?.message || '인증에 실패했습니다.';
  } finally {
    verifying.value = false;
  }
};

const drawRadarChart = async () => {
  if (!radarChartCanvas.value || !reportData.value) return;

  const { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } = await import('chart.js');
  Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  const parts = validParts.value;
  const labels = parts.map((p: any) => p.name);
  const scores = parts.map((p: any) => {
    const max = p.max_score || 100;
    return max > 0 ? (p.score / max) * 100 : 0;
  });

  radarChartInstance = new Chart(radarChartCanvas.value, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: '점수',
        data: scores,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        pointBackgroundColor: partColors.slice(0, parts.length),
        pointBorderColor: '#fff',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, font: { size: 10 } },
          pointLabels: { font: { size: 12, weight: 'bold' } }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
};

onMounted(() => {
  checkLink();
});
</script>

<style scoped>
.bg-primary {
  background-color: #1e3a8a;
}
.text-primary {
  color: #1e3a8a;
}
.bg-primary-dark {
  background-color: #1e40af;
}
.focus\:ring-primary:focus {
  --tw-ring-color: #1e3a8a;
}
</style>
