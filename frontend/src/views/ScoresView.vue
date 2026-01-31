<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">성적 조회</h2>

    <!-- 필터 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="학생 이름 검색"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="handleSearchInput"
        />

        <input
          v-model="filters.exam_date"
          type="text"
          placeholder="시험일자 (yy-mm-dd)"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="handleSearchInput"
        />

        <input
          v-model="filters.start_date"
          type="text"
          placeholder="시작일자 (yy-mm-dd)"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="handleSearchInput"
        />

        <input
          v-model="filters.end_date"
          type="text"
          placeholder="종료일자 (yy-mm-dd)"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="handleSearchInput"
        />
      </div>
      <div class="mt-4">
        <button
          @click="resetFilters"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          필터 초기화
        </button>
      </div>
    </div>

    <!-- 성적 목록 -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RT</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">단어</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">과제</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">성적 미리보기</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="score in scores" :key="score.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ score.exam_date }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ score.student_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ score.rt_score !== null ? score.rt_score.toFixed(1) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm" :class="score.word_score <= 84 ? 'text-red-600 font-bold' : 'text-gray-500'">
              {{ score.word_score !== null ? score.word_score.toFixed(1) : '-' }}
              <span v-if="score.word_score <= 84" class="text-red-600">(재시험)</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ score.assignment_score !== null ? score.assignment_score.toFixed(1) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
              {{ score.average_score !== null ? score.average_score.toFixed(1) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewReport(score.id)"
                class="text-primary hover:text-primary-dark mr-3"
              >
                미리보기
              </button>
              <button
                @click="deleteScore(score.id)"
                class="text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="scores.length === 0" class="text-center py-8 text-gray-500">
        조회된 성적이 없습니다.
      </div>
    </div>

    <!-- 성적표 미리보기 모달 -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showReportModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- 모달 헤더 -->
        <div class="bg-primary text-white p-4 flex justify-between items-center">
          <h3 class="text-xl font-bold">성적표 미리보기</h3>
          <button
            @click="showReportModal = false"
            class="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <!-- 성적표 내용 -->
        <div v-if="reportData" class="p-6">
          <!-- 학생 정보 -->
          <div class="mb-6 border-b pb-4">
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

          <!-- 성적 정보 -->
          <div class="space-y-4 mb-6">
            <!-- RT점수 -->
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold text-gray-800">RT점수</p>
                <p class="text-sm text-gray-500">
                  {{ reportData.score.rt?.correct || '-' }} / {{ reportData.score.rt?.total || '-' }}
                </p>
              </div>
              <p class="text-2xl font-bold text-primary">
                {{ reportData.score.rt?.score?.toFixed(1) || '0.0' }}점
              </p>
            </div>

            <!-- 단어시험 -->
            <div
              class="flex justify-between items-center p-4 rounded-lg"
              :class="reportData.score.word?.retest ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'"
            >
              <div>
                <p
                  class="font-semibold"
                  :class="reportData.score.word?.retest ? 'text-red-600' : 'text-gray-800'"
                >
                  단어시험
                  <span v-if="reportData.score.word?.retest" class="ml-2 text-red-600 font-bold">(재시험)</span>
                </p>
                <p class="text-sm text-gray-500">
                  {{ reportData.score.word?.correct || '-' }} / {{ reportData.score.word?.total || '-' }}
                </p>
              </div>
              <p
                class="text-2xl font-bold"
                :class="reportData.score.word?.retest ? 'text-red-600' : 'text-primary'"
              >
                {{ reportData.score.word?.score?.toFixed(1) || '0.0' }}점
              </p>
            </div>

            <!-- 과제점수 -->
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <p class="font-semibold text-gray-800">과제점수</p>
              <p class="text-2xl font-bold text-primary">
                {{ reportData.score.assignment?.toFixed(1) || '0.0' }}점
              </p>
            </div>
          </div>

          <!-- 총점 및 평균 -->
          <div class="p-6 bg-primary text-white rounded-lg mb-6">
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <p class="text-sm opacity-90">총점</p>
                <p class="text-3xl font-bold">{{ reportData.score.total?.toFixed(1) || '0.0' }}점</p>
              </div>
              <div>
                <p class="text-sm opacity-90">평균</p>
                <p class="text-3xl font-bold">{{ reportData.score.average?.toFixed(1) || '0.0' }}점</p>
              </div>
            </div>
            <div class="mt-4 text-center">
              <p class="text-sm opacity-90">
                반 평균: {{ reportData.score.class_average?.toFixed(1) || '0.0' }}점
              </p>
            </div>
          </div>

          <!-- 최근 3주 트렌드 -->
          <div class="mb-6 p-6 bg-white border rounded-lg">
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
                <p class="text-lg font-bold text-gray-800">{{ reportData.score.average?.toFixed(1) || '0.0' }}점</p>
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
          <div v-if="reportData.comparison" class="mb-6 p-4 bg-blue-50 rounded-lg">
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
                {{ reportData.comparison.average_diff > 0 ? '+' : '' }}{{ reportData.comparison.average_diff?.toFixed(1) || '0.0' }}점
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
          <div v-if="displayComment" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">코멘트</h3>
            <p class="text-gray-700">{{ displayComment }}</p>
          </div>

          <!-- 종합 문구 -->
          <div v-if="reportData.general_comment" class="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">종합 문구</h3>
            <p class="text-gray-700">{{ reportData.general_comment }}</p>
          </div>
        </div>

        <!-- 로딩 -->
        <div v-else-if="loadingReport" class="p-8 text-center">
          <p class="text-gray-500">로딩 중...</p>
        </div>

        <!-- 모달 닫기 버튼 -->
        <div class="p-4 border-t flex justify-end">
          <button
            @click="showReportModal = false"
            class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { studentApi, scoreApi, reportApi } from '../services/api';
import type { Student, Score, ReportData } from '../types';
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

const students = ref<Student[]>([]);
const scores = ref<Score[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const filters = ref({
  search: '',
  exam_date: '',
  start_date: '',
  end_date: ''
});

// 검색 디바운스용 타이머
let searchTimer: any = null;

const handleSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchScores();
  }, 500); // 0.5초 대기 후 검색
};

const fetchStudents = async () => {
  try {
    const response = await studentApi.getAll();
    if (response.data.success && response.data.data) {
      students.value = response.data.data;
    }
  } catch (err) {
    console.error('학생 목록 불러오기 실패:', err);
  }
};

const fetchScores = async () => {
  try {
    loading.value = true;
    error.value = null;
    const params: any = {};
    if (filters.value.search) params.student_name = filters.value.search;
    if (filters.value.exam_date) params.exam_date = filters.value.exam_date;
    if (filters.value.start_date) params.start_date = filters.value.start_date;
    if (filters.value.end_date) params.end_date = filters.value.end_date;

    const response = await scoreApi.getAll(params);
    if (response.data.success && response.data.data) {
      scores.value = response.data.data;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '성적 목록을 불러오는 중 오류가 발생했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const showReportModal = ref(false);
const reportData = ref<ReportData | null>(null);
const loadingReport = ref(false);
const retestComment = '단어 테스트 점수 미흡으로 남아서 응시 후 귀가 예정입니다.';

const displayComment = computed(() => {
  if (!reportData.value) return '';
  const baseComment = (reportData.value.score.comment || '').trim();
  const wordScore = reportData.value.score.word?.score ?? 0;
  const needsRetest = wordScore > 0 && wordScore <= 84;
  if (needsRetest && !baseComment.includes(retestComment)) {
    return baseComment ? `${baseComment} ${retestComment}` : retestComment;
  }
  return baseComment;
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
  return { diff: 0, trend: 'stable' as const };
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

const viewReport = async (scoreId: number) => {
  try {
    loadingReport.value = true;
    const response = await reportApi.preview(scoreId);
    if (response.data.success && response.data.data) {
      reportData.value = response.data.data;
      showReportModal.value = true;
    } else {
      alert('성적표를 불러올 수 없습니다.');
    }
  } catch (err: any) {
    alert(err.response?.data?.message || '성적표 미리보기 실패');
    console.error('성적표 미리보기 실패:', err);
  } finally {
    loadingReport.value = false;
  }
};

const deleteScore = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    await scoreApi.delete(id);
    fetchScores();
  } catch (err: any) {
    alert(err.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    console.error(err);
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    exam_date: '',
    start_date: '',
    end_date: ''
  };
  fetchScores();
};

onMounted(() => {
  fetchStudents();
  fetchScores();
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
