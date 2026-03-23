<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">성취평가 성적 발송</h2>

    <!-- 필터 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">반 선택</label>
          <select v-model="filters.class_name" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" @change="fetchScores">
            <option value="">전체 반</option>
            <option v-for="cls in classList" :key="cls" :value="cls">{{ cls }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">시험일자</label>
          <input v-model="filters.exam_date" type="date" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" @change="fetchScores" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">학생 이름 검색</label>
          <input v-model="searchName" type="text" placeholder="이름 입력" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>
      <!-- 일괄 액션 -->
      <div class="mt-4 flex justify-between items-center">
        <div class="flex gap-2">
          <button
            v-if="selectedIds.length > 0"
            @click="sendBulkKakao"
            class="px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition font-bold text-sm"
          >
            선택 알림톡 발송 ({{ selectedIds.length }})
          </button>
          <button
            v-if="selectedIds.length > 0"
            @click="deleteSelectedScores"
            class="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition font-bold text-sm"
          >
            선택 삭제 ({{ selectedIds.length }})
          </button>
          <button
            v-if="isAdmin"
            @click="downloadExcel"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center gap-2 text-sm"
          >
            <span>📊 엑셀 다운로드</span>
          </button>
        </div>
        <div class="text-sm text-gray-500">
          조회된 성적: <span class="font-bold text-primary">{{ filteredScores.length }}</span>건
        </div>
      </div>
    </div>

    <!-- 결과 목록 -->
    <div v-if="filteredScores.length > 0" class="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div class="p-4 border-b bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-800">조회 결과 ({{ filteredScores.length }}건)</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-3 text-center">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              </th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500">학생명</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500">반</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500">시험일</th>
              <th v-for="(pName, idx) in partNames" :key="idx" class="px-3 py-3 text-center text-xs font-bold" :style="{ color: partColors[idx] }">{{ pName }}</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500">총점</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500">평균</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500">발송 상태</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="score in filteredScores" :key="score.id" class="hover:bg-gray-50" :class="{ 'bg-blue-50': selectedIds.includes(score.id) }">
              <td class="px-3 py-3 text-center">
                <input type="checkbox" v-model="selectedIds" :value="score.id" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              </td>
              <td class="px-4 py-3 text-sm font-bold text-gray-900">{{ score.student_name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ score.class_name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ score.exam_date }}</td>
              <td v-for="(part, idx) in (score.parts || [])" :key="idx" class="px-3 py-3 text-center text-sm">
                <span class="font-bold" :class="getScoreColor(part.score, part.max_score)">{{ part.score }}</span>
                <span class="text-xs text-gray-400">/{{ part.max_score }}</span>
              </td>
              <td class="px-4 py-3 text-center text-sm font-bold" :class="getAvgColor(score.average_score)">{{ score.total_score }}</td>
              <td class="px-4 py-3 text-center text-sm font-bold" :class="getAvgColor(score.average_score)">{{ score.average_score?.toFixed(1) }}</td>
              <td class="px-4 py-3 text-center text-sm">
                <span v-if="getSendStatus(score.id) === 'success'" class="text-green-600 font-bold">발송완료</span>
                <span v-else-if="getSendStatus(score.id) === 'fail'" class="text-red-500">발송실패</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 text-center whitespace-nowrap">
                <button @click="openReport(score)" class="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-blue-800 transition font-bold mr-1">
                  📊 성적표
                </button>
                <button @click="sendKakao(score)" class="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition font-bold mr-1">
                  알림톡
                </button>
                <button @click="copyReportLink(score)" class="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition font-bold">
                  🔗 URL
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      조회된 성적이 없습니다. 필터를 선택해주세요.
    </div>

    <!-- ==================== 성적표 모달 ==================== -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto" ref="reportEl">
        <!-- 헤더 -->
        <div class="bg-primary text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <img src="/logo.png" alt="독강영어 로고" class="h-20 w-20 object-contain rounded-full bg-white p-1 shadow-md" />
            <div class="text-left">
              <h1 class="text-3xl font-bold mb-1">독강영어학원</h1>
              <p class="text-lg opacity-90 font-medium tracking-wide italic" style="font-family: 'Times New Roman', Times, serif;">Bimonthly Test Report</p>
            </div>
          </div>
          <button @click="showReportModal = false" class="text-white hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>

        <!-- 학생 정보 -->
        <div class="p-6 border-b bg-gray-50">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500 block text-xs">학생 이름</span>
              <span class="font-bold text-lg text-gray-800">{{ selectedScore?.student_name }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs">반</span>
              <span class="font-bold text-gray-800">{{ selectedScore?.class_name }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs">학교 / 학년</span>
              <span class="font-bold text-gray-800">{{ selectedScore?.student_school || '-' }} / {{ selectedScore?.student_grade || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs">시험일</span>
              <span class="font-bold text-gray-800">{{ selectedScore?.exam_date }}</span>
            </div>
          </div>
        </div>

        <!-- 레이더 차트(왼쪽) + 영역별 상세(오른쪽) -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 좌측: 5각형 레이더 차트 -->
            <div>
              <h4 class="text-base font-bold text-gray-800 mb-3">🔷 영역별 성취도</h4>
              <div class="w-full h-[300px] flex items-center justify-center">
                <Radar v-if="radarData" :data="radarData" :options="radarOptions" />
              </div>
            </div>

            <!-- 우측: 영역별 점수 바 (각각 다른 색상) -->
            <div>
              <h4 class="text-base font-bold text-gray-800 mb-3">📊 영역별 상세 성적</h4>
              <div class="space-y-3">
                <div v-for="(part, idx) in (selectedScore?.parts || []).filter((p: any) => p.max_score > 0)" :key="idx" class="flex items-center gap-3">
                  <span class="text-xs font-bold text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: partColors[idx] }">{{ idx + 1 }}</span>
                  <span class="w-[90px] text-sm font-bold text-gray-700 truncate">{{ part.name }}</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500" 
                      :style="{ width: getPercent(part.score, part.max_score) + '%', backgroundColor: partColors[idx] }"
                    ></div>
                    <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                      {{ part.score }} / {{ part.max_score }} ({{ getPercent(part.score, part.max_score).toFixed(0) }}%)
                    </span>
                  </div>
                </div>
              </div>

              <!-- 학생점수 & 반평균 -->
              <div class="grid grid-cols-2 gap-3 mt-6">
                <div class="bg-blue-50 p-3 rounded-xl text-center border border-blue-100" :class="{'col-span-2': !editShowClassAverage}">
                  <div class="text-xs text-blue-600 font-bold mb-1">학생점수</div>
                  <div class="text-2xl font-black text-blue-900">{{ selectedScore?.total_score }}</div>
                  <div class="text-xs text-blue-400">/ {{ selectedScore?.parts?.reduce((s: number, p: any) => s + (p.max_score || 0), 0) || 0 }}</div>
                </div>
                <div v-if="editShowClassAverage" class="bg-purple-50 p-3 rounded-xl text-center border border-purple-100">
                  <div class="text-xs text-purple-600 font-bold mb-1">반 평균</div>
                  <div class="text-2xl font-black text-purple-700">
                    {{ editManualClassAverage !== null ? editManualClassAverage : (classAverage?.class_average?.toFixed(1) || '-') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 성적 트렌드 (최근 3개월) -->
        <div v-if="trendData && trendData.labels.length > 1" class="px-6 pb-4">
          <h4 class="text-base font-bold text-gray-800 mb-3">📈 최근 성적 트렌드 (영역별 비교)</h4>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div class="w-full h-[350px]">
              <Bar :data="trendData" :options="trendOptions" :plugins="[ChartDataLabels]" />
            </div>
            <p class="text-xs text-gray-400 mt-2 text-center">* 동일한 영역만 비교 표시됩니다 (막대 위 숫자 = 실제 점수)</p>
          </div>
        </div>
        <div v-else-if="trendLoading" class="px-6 pb-4">
          <div class="bg-gray-50 p-4 rounded-xl text-center text-gray-500 text-sm">트렌드 데이터를 불러오는 중...</div>
        </div>

        <!-- 코멘트 표시 -->
        <div v-if="selectedScore?.comment" class="px-6 pb-2">
          <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div class="text-xs text-yellow-700 font-bold mb-1">💬 선생님 코멘트</div>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedScore.comment }}</p>
          </div>
        </div>

        <!-- 코멘트 입력/수정 -->
        <div class="px-6 pb-4">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-bold text-gray-600">✏️ 코멘트 작성 / 수정</label>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  <label class="flex items-center cursor-pointer">
                    <div class="relative">
                      <input type="checkbox" v-model="editShowClassAverage" class="sr-only" />
                      <div class="block bg-gray-300 w-8 h-4 rounded-full" :class="{'bg-primary': editShowClassAverage}"></div>
                      <div class="dot absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition" :class="{'transform translate-x-4': editShowClassAverage}"></div>
                    </div>
                    <div class="ml-2 text-xs font-bold text-gray-600">반 평균 표시</div>
                  </label>
                  <div v-if="editShowClassAverage" class="flex items-center gap-1 border-l pl-2 ml-1">
                    <input 
                      type="number" 
                      v-model="editManualClassAverage" 
                      step="0.1"
                      class="w-16 px-1 py-0.5 text-xs border rounded text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span class="text-xs text-gray-500">점</span>
                  </div>
                </div>
                <button
                  @click="saveComment"
                  :disabled="commentSaving"
                  class="px-4 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-blue-800 transition font-bold disabled:opacity-50"
                >
                  {{ commentSaving ? '저장 중...' : '코멘트 저장' }}
                </button>
              </div>
            </div>
            <textarea 
              v-model="editComment" 
              rows="3" 
              placeholder="학생에게 전달할 코멘트를 입력하세요..." 
              class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            ></textarea>
          </div>
        </div>

        <!-- 모달 하단 버튼 -->
        <div class="px-6 pb-6 flex justify-between items-center">
          <button
            @click="copyReportLinkFromModal"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-bold shadow-sm text-sm"
          >
            🔗 성적표 링크 복사
          </button>
          <button
            @click="showReportModal = false"
            class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>

    <!-- 토스트 -->
    <div v-if="toastMsg" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-bold">
      {{ toastMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { studentApi, bimonthlyApi, kakaoApi, aiApi } from '../services/api';
import * as XLSX from 'xlsx';

const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;
const isAdmin = user?.role === 'admin';

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

// 5개 파트별 고유 색상
const partColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

const allStudents = ref<any[]>([]);
const scores = ref<any[]>([]);
const filters = ref({ class_name: '', exam_date: '' });
const searchName = ref('');
const showReportModal = ref(false);
const selectedScore = ref<any>(null);
const trendLoading = ref(false);
const editComment = ref('');
const editShowClassAverage = ref(true);
const editManualClassAverage = ref<number | null>(null);
const commentSaving = ref(false);
const aiCommentLoading = ref(false);
const classAverage = ref<any>(null);
const selectedIds = ref<number[]>([]);
const sendStatusMap = ref<Record<number, string>>({});
const toastMsg = ref('');

// 트렌드용 이전 성적 데이터
const studentHistory = ref<any[]>([]);

const isAllSelected = computed(() => {
  return filteredScores.value.length > 0 && selectedIds.value.length === filteredScores.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = filteredScores.value.map((s: any) => s.id);
  }
};

const classList = computed(() => {
  const set = new Set<string>();
  allStudents.value.forEach(s => {
    if (s.class_name && typeof s.class_name === 'string') {
      s.class_name.split(',').forEach((c: string) => {
        const trimmed = c.trim();
        if (trimmed && trimmed !== 'undefined' && trimmed !== 'null') set.add(trimmed);
      });
    }
  });
  return Array.from(set).sort();
});

const partNames = computed(() => {
  if (scores.value.length === 0) return [];
  const first = scores.value[0];
  return (first.parts || []).map((p: any) => p.name || '');
});

const filteredScores = computed(() => {
  if (!searchName.value) return scores.value;
  return scores.value.filter(s => s.student_name?.includes(searchName.value));
});

// ============ 발송 상태 ============
const getSendStatus = (scoreId: number): string => {
  return sendStatusMap.value[scoreId] || '';
};

const fetchSendStatus = async () => {
  if (!filters.value.class_name || !filters.value.exam_date) return;
  try {
    const res = await kakaoApi.getBimonthlySendStatus(filters.value.class_name, filters.value.exam_date);
    if (res.data.success && res.data.data) {
      const map: Record<number, string> = {};
      res.data.data.forEach((item: any) => {
        map[item.bimonthly_score_id] = item.send_status;
      });
      sendStatusMap.value = map;
    }
  } catch (err) {
    console.error('발송 상태 조회 실패:', err);
  }
};

// ============ 날짜 → 월 변환 ============
const dateToMonth = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const month = parseInt(parts[1], 10);
    return `${month}월`;
  }
  return dateStr;
};

// ============ 레이더 차트 ============
// max_score > 0인 영역만 표시
const radarData = computed(() => {
  if (!selectedScore.value?.parts) return null;
  const parts = selectedScore.value.parts.filter((p: any) => p.max_score > 0);
  if (parts.length === 0) return null;
  const labels = parts.map((p: any) => p.name);
  const data = parts.map((p: any) => (p.score / p.max_score * 100));
  
  return {
    labels,
    datasets: [
      {
        label: selectedScore.value.student_name,
        data,
        backgroundColor: 'rgba(30, 58, 138, 0.15)',
        borderColor: 'rgba(30, 58, 138, 1)',
        borderWidth: 2,
        pointBackgroundColor: partColors.slice(0, parts.length),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 7,
        pointHoverRadius: 9
      }
    ]
  };
});

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: { display: true, color: 'rgba(0,0,0,0.1)' },
      suggestedMin: 0,
      suggestedMax: 100,
      ticks: {
        stepSize: 20,
        font: { size: 10 },
        backdropColor: 'transparent'
      },
      pointLabels: {
        font: { size: 13, weight: 'bold' as const },
        color: partColors
      },
      grid: { color: 'rgba(0,0,0,0.08)' }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.raw?.toFixed(1)}점`
      }
    }
  }
};

// ============ 트렌드 차트 ============
const trendData = computed(() => {
  if (!selectedScore.value || studentHistory.value.length === 0) return null;

  const currentPartNames = (selectedScore.value.parts || []).map((p: any) => p.name);

  const recentScores = [...studentHistory.value]
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .slice(-3);

  if (recentScores.length < 2) return null;

  const commonParts: string[] = currentPartNames.filter((name: string) => {
    return recentScores.every(score => 
      (score.parts || []).some((p: any) => p.name === name)
    );
  });

  if (commonParts.length === 0) return null;

  const labels = recentScores.map(s => dateToMonth(s.exam_date));

  const datasets = commonParts.map((partName, idx) => {
    const colorIdx = currentPartNames.indexOf(partName);
    const color = partColors[colorIdx >= 0 ? colorIdx : idx] || partColors[idx % 5];
    
    const data = recentScores.map(score => {
      const part = (score.parts || []).find((p: any) => p.name === partName);
      if (part && part.max_score > 0) {
        return Math.round(part.score / part.max_score * 100 * 10) / 10;
      }
      return 0;
    });

    return {
      label: partName,
      data,
      backgroundColor: color + 'CC',
      borderColor: color,
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.7,
      categoryPercentage: 0.8
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
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          return `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`;
        }
      }
    },
    datalabels: {
      display: true,
      anchor: 'end' as const,
      align: 'top' as const,
      font: { size: 10, weight: 'bold' as const },
      color: '#333',
      formatter: (value: number) => {
        return value !== undefined ? value.toFixed(1) + '%' : '';
      }
    }
  }
};

// ============ 코멘트 저장 ============
const saveComment = async () => {
  if (!selectedScore.value) return;
  commentSaving.value = true;
  try {
    await bimonthlyApi.create({
      student_id: selectedScore.value.student_id,
      exam_date: selectedScore.value.exam_date,
      class_name: selectedScore.value.class_name,
      parts: selectedScore.value.parts,
      total_score: selectedScore.value.total_score,
      average_score: selectedScore.value.average_score,
      comment: editComment.value,
      show_class_average: editShowClassAverage.value,
      manual_class_average: editShowClassAverage.value ? editManualClassAverage.value : null
    });
    selectedScore.value.comment = editComment.value;
    selectedScore.value.show_class_average = editShowClassAverage.value;
    selectedScore.value.manual_class_average = editShowClassAverage.value ? editManualClassAverage.value : null;
    
    const found = scores.value.find((s: any) => s.id === selectedScore.value.id);
    if (found) {
      found.comment = editComment.value;
      found.show_class_average = editShowClassAverage.value;
      found.manual_class_average = editShowClassAverage.value ? editManualClassAverage.value : null;
    }
    showToast('저장되었습니다!');
  } catch (err: any) {
    console.error('저장 실패:', err);
    alert('저장 실패: ' + (err.response?.data?.message || err.message));
  } finally {
    commentSaving.value = false;
  }
};

// const generateAiComment = async () => {
//   if (!selectedScore.value) return;
//   aiCommentLoading.value = true;
//   try {
//     const res = await aiApi.generateBimonthlyComment({
//       student_name: selectedScore.value.student_name,
//       class_name: selectedScore.value.class_name,
//       exam_date: selectedScore.value.exam_date,
//       average_score: selectedScore.value.average_score,
//       parts: selectedScore.value.parts || [],
//       previous_comment: editComment.value || selectedScore.value.comment || ''
//     });
// 
//     if (res.data.success && res.data.data?.comment) {
//       editComment.value = res.data.data.comment;
//       showToast('AI 코멘트 초안이 생성되었습니다.');
//     } else {
//       alert('AI 코멘트 생성 실패: ' + (res.data.message || '알 수 없는 오류'));
//     }
//   } catch (err: any) {
//     alert('AI 코멘트 생성 실패: ' + (err.response?.data?.message || err.message));
//   } finally {
//     aiCommentLoading.value = false;
//   }
// };

// ============ 데이터 조회 ============
const downloadExcel = () => {
  if (filteredScores.value.length === 0) {
    alert('다운로드할 성적 데이터가 없습니다.');
    return;
  }

  const excelData = filteredScores.value.map(score => {
    const row: any = {
      '날짜': score.exam_date,
      '반': score.class_name,
      '학생명': score.student_name,
    };

    // 파트별 점수
    if (score.parts && Array.isArray(score.parts)) {
      score.parts.forEach((part: any, idx: number) => {
        row[part.name || `파트${idx + 1}`] = part.score;
      });
    }

    row['총점'] = score.total_score;
    row['평균'] = score.average_score !== null ? score.average_score.toFixed(1) : '-';
    
    const status = getSendStatus(score.id);
    row['발송 상태'] = status === 'success' ? '발송완료' : (status === 'fail' ? '발송실패' : '미발송');
    
    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // 컬럼 너비 자동 조정
  const colWidths = [
    { wch: 15 }, // 날짜
    { wch: 15 }, // 반
    { wch: 15 }, // 학생명
  ];
  
  partNames.value.forEach(() => colWidths.push({ wch: 10 })); // 파트별 점수
  
  colWidths.push({ wch: 10 }); // 총점
  colWidths.push({ wch: 10 }); // 평균
  colWidths.push({ wch: 15 }); // 발송상태

  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, '성취평가');
  
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const fileName = `성취평가_${dateStr}.xlsx`;
  
  XLSX.writeFile(wb, fileName);
};

const fetchScores = async () => {
  try {
    const params: any = {};
    if (filters.value.class_name) params.class_name = filters.value.class_name;
    if (filters.value.exam_date) params.exam_date = filters.value.exam_date;
    
    const res = await bimonthlyApi.getAll(params);
    if (res.data.success) {
      scores.value = res.data.data || [];
      selectedIds.value = [];
    }
    // 발송 상태도 함께 조회
    await fetchSendStatus();
  } catch (err) {
    console.error('성취평가 성적 조회 실패:', err);
  }
};

const openReport = async (score: any) => {
  selectedScore.value = score;
  editComment.value = score.comment || '';
  editShowClassAverage.value = score.show_class_average !== false;
  showReportModal.value = true;
  classAverage.value = null;
  
  try {
    if (score.class_name && score.exam_date) {
      const avgRes = await bimonthlyApi.getClassAverage(score.class_name, score.exam_date);
      if (avgRes.data.success) {
        classAverage.value = avgRes.data.data;
        // 수동 입력값이 있으면 그것을, 없으면 실제 계산된 평균을 기본값으로 세팅
        editManualClassAverage.value = score.manual_class_average !== null && score.manual_class_average !== undefined 
          ? score.manual_class_average 
          : (avgRes.data.data?.class_average || 0);
      }
    }
  } catch (err) {
    console.error('반평균 조회 실패:', err);
  }
  
  trendLoading.value = true;
  try {
    const res = await bimonthlyApi.getAll({ student_id: score.student_id });
    if (res.data.success) {
      studentHistory.value = res.data.data || [];
    }
  } catch (err) {
    console.error('학생 성적 이력 조회 실패:', err);
    studentHistory.value = [];
  } finally {
    trendLoading.value = false;
  }
};

// ============ 알림톡 발송 ============
const sendKakao = async (score: any) => {
  if (!confirm(`${score.student_name} 학생의 학부모님께 성취평가 성적표 알림톡을 발송하시겠습니까?`)) return;
  try {
    const response = await kakaoApi.sendBimonthlyReport(score.id);
    alert(`알리고 응답: ${response.data.message}`);
    if (response.data.success) {
      sendStatusMap.value[score.id] = 'success';
    } else {
      sendStatusMap.value[score.id] = 'fail';
    }
  } catch (err: any) {
    alert(`발송 오류: ${err.response?.data?.message || err.message}`);
    sendStatusMap.value[score.id] = 'fail';
  }
};

const sendBulkKakao = async () => {
  if (!confirm(`선택한 ${selectedIds.value.length}명에게 성취평가 알림톡을 발송하시겠습니까?`)) return;
  let successCount = 0;
  let failCount = 0;

  for (const id of selectedIds.value) {
    try {
      const response = await kakaoApi.sendBimonthlyReport(id);
      if (response.data.success) {
        successCount++;
        sendStatusMap.value[id] = 'success';
      } else {
        failCount++;
        sendStatusMap.value[id] = 'fail';
      }
    } catch (err) {
      failCount++;
      sendStatusMap.value[id] = 'fail';
    }
  }

  alert(`발송 완료\n성공: ${successCount}건\n실패: ${failCount}건`);
  selectedIds.value = [];
};

// ============ URL 복사 ============
const copyReportLink = async (score: any) => {
  try {
    const response = await kakaoApi.generateBimonthlyLink(score.id);
    if (response.data.success) {
      const fullUrl = `${window.location.origin}/report/bimonthly/${response.data.data.token}`;
      await navigator.clipboard.writeText(fullUrl);
      showToast('성적표 링크가 클립보드에 복사되었습니다!');
    }
  } catch (err: any) {
    alert('링크 생성 실패: ' + (err.response?.data?.message || err.message));
  }
};

const copyReportLinkFromModal = async () => {
  if (!selectedScore.value) return;
  await copyReportLink(selectedScore.value);
};

// ============ 삭제 ============
const deleteSelectedScores = async () => {
  if (!confirm(`선택한 ${selectedIds.value.length}건의 성적을 삭제하시겠습니까?`)) return;
  try {
    for (const id of selectedIds.value) {
      await bimonthlyApi.delete(id);
    }
    showToast('선택한 성적이 삭제되었습니다.');
    selectedIds.value = [];
    fetchScores();
  } catch (err: any) {
    alert('삭제 중 오류가 발생했습니다.');
  }
};

// ============ 유틸리티 ============
const getPercent = (score: number, max: number): number => {
  if (!max || max === 0) return 0;
  return (score / max) * 100;
};

const getScoreColor = (score: number, max: number): string => {
  const pct = getPercent(score, max);
  if (pct >= 90) return 'text-blue-600';
  if (pct >= 70) return 'text-green-600';
  if (pct >= 50) return 'text-orange-600';
  return 'text-red-600';
};

const getAvgColor = (avg: number): string => {
  if (avg >= 90) return 'text-blue-600';
  if (avg >= 70) return 'text-green-600';
  if (avg >= 50) return 'text-orange-600';
  return 'text-red-600';
};

const showToast = (msg: string) => {
  toastMsg.value = msg;
  setTimeout(() => toastMsg.value = '', 3000);
};

onMounted(async () => {
  const res = await studentApi.getAll();
  if (res.data.success) allStudents.value = res.data.data;
});
</script>

<style scoped>
.bg-primary {
  background-color: #1e3a8a;
}
</style>
