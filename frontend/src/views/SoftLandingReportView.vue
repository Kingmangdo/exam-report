<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans relative pb-10">
    <!-- 인증 화면 -->
    <div v-if="!isAuthenticated" class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        <div class="text-center mb-8">
          <img src="/logo.png" alt="독강영어 로고" class="h-16 w-16 mx-auto mb-4 object-contain rounded-full shadow-sm" />
          <h2 class="text-2xl font-bold text-gray-800 tracking-tight">소프트랜딩 리포트 조회</h2>
          <p class="text-gray-500 mt-2 text-sm">학생 이름과 학부모님 연락처 뒷자리를 입력해주세요.</p>
        </div>

        <form @submit.prevent="handleAuth" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5">학생 이름</label>
            <input 
              type="text" 
              v-model="authForm.studentName"
              placeholder="예: 홍길동"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5">학부모 연락처 뒷 4자리</label>
            <input 
              type="text" 
              v-model="authForm.phoneLast4"
              placeholder="예: 1234"
              maxlength="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              required
            />
          </div>

          <div v-if="authError" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
            {{ authError }}
          </div>

          <button 
            type="submit" 
            class="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark transition shadow-md disabled:opacity-50 mt-4"
            :disabled="isAuthenticating"
          >
            {{ isAuthenticating ? '확인 중...' : '리포트 확인하기' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 로딩 화면 -->
    <div v-else-if="isLoading" class="flex-1 flex flex-col items-center justify-center p-4">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
      <p class="text-gray-500 font-medium animate-pulse">리포트를 불러오는 중입니다...</p>
    </div>

    <!-- 리포트 화면 -->
    <div v-else-if="reportData" class="flex-1 w-full max-w-2xl mx-auto md:py-8 print:py-0">

      <div class="bg-white md:rounded-2xl md:shadow-xl overflow-hidden print:shadow-none min-h-screen md:min-h-0 border-t-4 border-primary">
        
        <!-- 헤더 -->
        <div class="px-6 py-8 text-center bg-gray-50 relative overflow-hidden">
          <div class="relative z-10">
            <img src="/logo.png" alt="독강영어 로고" class="h-14 w-14 mx-auto mb-3 object-contain rounded-full shadow-sm bg-white p-1" />
            <h1 class="text-2xl font-extrabold text-gray-800 tracking-tight">신입생 소프트랜딩 리포트</h1>
            <p class="text-primary font-bold mt-2 text-lg">{{ phaseName }} 점검 결과</p>
          </div>
        </div>

        <!-- 학생 정보 -->
        <div class="px-8 py-6 border-b border-gray-100 flex flex-wrap justify-between items-center bg-white">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary font-bold text-2xl shadow-inner border border-blue-100">
              {{ reportData.student?.name?.charAt(0) || '?' }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ reportData.student?.name || '학생' }} <span class="text-base font-normal text-gray-500">학생</span></h2>
              <p class="text-sm text-gray-500 mt-0.5">{{ reportData.student?.school }} {{ reportData.student?.grade }}</p>
            </div>
          </div>
        </div>

        <!-- 주요 내용 -->
        <div class="p-8 space-y-10 bg-white">
          
          <!-- 학부모 상담 메모 (종합 코멘트) -->
          <section v-if="reportData?.checkpoint?.parent_memo">
            <h3 class="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-100">
              <span class="text-primary text-xl">💬</span> 담당 선생님의 코멘트
            </h3>
            <div class="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
              <p class="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">{{ reportData.checkpoint.parent_memo }}</p>
            </div>
          </section>

          <!-- 성적 트래킹 (6주차, 10주차) -->
          <section v-if="reportData.phase > 1 && reportData.student?.initialLevel && reportData?.checkpoint?.english_score">
            <h3 class="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-100">
              <span class="text-primary text-xl">📈</span> 영어 점수/레벨 변화
            </h3>
            <div class="flex items-center justify-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div class="text-center flex-1">
                <p class="text-xs text-gray-500 font-bold mb-1">입학 당시</p>
                <div class="text-lg font-extrabold text-gray-700 bg-white py-3 rounded-xl shadow-sm border border-gray-200">
                  {{ reportData.student.initialLevel }}
                </div>
              </div>
              <div class="text-gray-400 font-bold">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
              <div class="text-center flex-1">
                <p class="text-xs text-primary font-bold mb-1">현재 ({{ phaseName }})</p>
                <div class="text-lg font-extrabold text-primary bg-blue-50 py-3 rounded-xl shadow-sm border border-blue-200">
                  {{ reportData.checkpoint.english_score }}
                </div>
              </div>
            </div>
          </section>

          <!-- 항목별 평가 (방사형 차트) -->
          <section v-if="reportData?.checkpoint?.ratings && Object.keys(reportData.checkpoint.ratings).length > 0">
            <h3 class="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-100">
              <span class="text-primary text-xl">🎯</span> 세부 항목별 적응도 평가
            </h3>
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex justify-center items-center">
              <div class="w-full max-w-[320px] aspect-square relative mx-auto" style="height: 320px; width: 100%;">
                <canvas ref="radarChartRef"></canvas>
              </div>
            </div>
          </section>
          
          <div class="text-center text-sm text-gray-400 mt-10 pt-6 border-t">
            <p>본 리포트는 독강영어학원에서 학부모님께 제공하는 학생 관리 자료입니다.</p>
            <p class="mt-1 font-bold text-gray-500">독강영어학원</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 에러/예외 화면 -->
    <div v-else class="flex-1 flex flex-col items-center justify-center p-4">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md w-full">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">리포트를 불러올 수 없습니다</h3>
        <p class="text-gray-500 mb-6">{{ authError || '데이터를 불러오는 중 문제가 발생했거나, 유효하지 않은 링크입니다.' }}</p>
        <button @click="isAuthenticated = false; authError = ''" class="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
          돌아가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, shallowRef, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { softLandingApi } from '../services/api';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

const route = useRoute();
const token = route.params.token as string;

const isAuthenticated = ref(false);
const isAuthenticating = ref(false);
const authError = ref('');
const authForm = ref({
  studentName: '',
  phoneLast4: ''
});

const isLoading = ref(false);
const reportData = ref<any>(null);
const radarChartRef = ref<HTMLCanvasElement | null>(null);
const radarChart = shallowRef<Chart | null>(null);

const phaseName = computed(() => {
  if (!reportData.value) return '';
  const p = reportData.value.phase;
  return p === 1 ? '2주차' : p === 2 ? '6주차' : '10주차';
});

const criteriaList = computed(() => {
  if (!reportData.value) return [];
  const phase = reportData.value.phase;
  if (phase === 1) {
    return [
      { key: 'participation', label: '수업 참여도' },
      { key: 'homework', label: '과제 이행률' },
      { key: 'relationships', label: '교우 관계' },
      { key: 'understanding', label: '수업 이해도' }
    ];
  } else if (phase === 2) {
    return [
      { key: 'improvement', label: '학습 향상도' },
      { key: 'attitude', label: '수업 태도' },
      { key: 'self_directed', label: '자기주도성' },
      { key: 'relationships', label: '교우 관계' }
    ];
  } else {
    return [
      { key: 'overall_adaptation', label: '종합 적응도' },
      { key: 'achievement', label: '학습 성취도' },
      { key: 'attitude', label: '생활 태도' },
      { key: 'potential', label: '고등 연계성' }
    ];
  }
});

const getRatingColor = (score: number) => {
  if (!score) return 'text-gray-400';
  if (score >= 4) return 'text-primary';
  if (score >= 3) return 'text-green-600';
  return 'text-orange-500';
};

const getRatingBgColor = (score: number) => {
  if (!score) return 'bg-gray-300';
  if (score >= 4) return 'bg-primary';
  if (score >= 3) return 'bg-green-500';
  return 'bg-orange-400';
};

const handleAuth = async () => {
  try {
    isAuthenticating.value = true;
    authError.value = '';
    
    // 1. 토큰 및 정보 확인
    const verifyRes = await softLandingApi.verifyReportAccess(token, authForm.value.studentName, authForm.value.phoneLast4);
    
    if (!verifyRes.data.success) {
      authError.value = verifyRes.data.message || '인증에 실패했습니다.';
      isAuthenticating.value = false;
      return;
    }
    
    isAuthenticated.value = true;
    fetchReportData();
  } catch (error: any) {
    authError.value = error.response?.data?.message || '인증 중 오류가 발생했습니다. 학원으로 문의해 주세요.';
    isAuthenticating.value = false;
  }
};

const fetchReportData = async () => {
  try {
    isLoading.value = true;
    // URL 쿼리에 preview=true가 있는지 확인 (Vue Router의 query가 늦게 로딩될 수 있으므로 location.search도 확인)
    const isPreview = route.query.preview === 'true' || new URLSearchParams(window.location.search).get('preview') === 'true';
    
    // 미리보기 모드일 경우 이름과 전화번호 대신 token만으로 조회
    const res = await softLandingApi.getReportData(
      token, 
      isPreview ? '' : authForm.value.studentName, 
      isPreview ? '' : authForm.value.phoneLast4,
      isPreview
    );
    
    if (res.data.success) {
      reportData.value = res.data.data;
      await nextTick();
      renderRadarChart();
    }
  } catch (error: any) {
    console.error('리포트 조회 실패:', error);
    authError.value = error.response?.data?.message || '리포트 데이터를 불러오는데 실패했습니다.';
    isAuthenticated.value = false;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const isPreview = route.query.preview === 'true' || new URLSearchParams(window.location.search).get('preview') === 'true';
  if (isPreview) {
    isAuthenticated.value = true;
    fetchReportData();
  }
});

const renderRadarChart = () => {
  if (radarChart.value) {
    radarChart.value.destroy();
  }
  
  if (!radarChartRef.value) {
    console.error("Radar chart canvas not found.");
    return;
  }
  
  if (!reportData.value || !reportData.value.checkpoint || !reportData.value.checkpoint.ratings) {
    console.error("Ratings data is missing.");
    return;
  }

  const labels = criteriaList.value.map(c => c.label);
  const data = criteriaList.value.map(c => reportData.value.checkpoint.ratings[c.key] || 0);

  // 데이터가 모두 0이면 차트를 그리지 않음 (빈 박스 방지)
  if (data.every(val => val === 0)) {
    return;
  }

  radarChart.value = new Chart(radarChartRef.value, {
    type: 'radar',
    plugins: [ChartDataLabels],
    data: {
      labels: labels,
      datasets: [{
        label: '평가 점수 (5점 만점)',
        data: data,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(0,0,0,0.1)' },
          grid: { color: 'rgba(0,0,0,0.1)' },
          pointLabels: {
            font: { family: "'Pretendard', sans-serif", size: 13, weight: 'bold' },
            color: '#4B5563'
          },
          ticks: {
            display: true,
            stepSize: 1,
            max: 5,
            min: 0,
            color: '#9CA3AF',
            backdropColor: 'transparent',
            font: { size: 10 }
          }
        }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          color: '#1e3a8a',
          font: { weight: 'bold', size: 14 },
          align: 'end',
          anchor: 'end',
          formatter: (value) => value + '점'
        }
      }
    }
  });
};
</script>
