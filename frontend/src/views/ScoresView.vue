<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">성적 조회</h2>

    <!-- 필터 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          v-model="filters.student_id"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @change="fetchScores"
        >
          <option value="">전체 학생</option>
          <option
            v-for="student in students"
            :key="student.id"
            :value="student.id"
          >
            {{ student.name }}
          </option>
        </select>

        <input
          v-model="filters.exam_date"
          type="text"
          placeholder="시험일자 (yy-mm-dd)"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="fetchScores"
        />

        <input
          v-model="filters.start_date"
          type="text"
          placeholder="시작일자 (yy-mm-dd)"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="fetchScores"
        />

        <input
          v-model="filters.end_date"
          type="text"
          placeholder="종료일자 (yy-mm-dd)"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="fetchScores"
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수업태도</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ score.attitude_score !== null ? score.attitude_score.toFixed(1) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
              {{ score.average_score !== null ? score.average_score.toFixed(1) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewReport(score.id)"
                class="text-primary hover:text-primary-dark mr-3"
              >
                보기
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

            <!-- 수업태도 -->
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <p class="font-semibold text-gray-800">수업태도</p>
              <p class="text-2xl font-bold text-primary">
                {{ reportData.score.attitude?.toFixed(1) || '0.0' }}점
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
          <div v-if="reportData.score.comment" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">코멘트</h3>
            <p class="text-gray-700">{{ reportData.score.comment }}</p>
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
import { ref, onMounted } from 'vue';
import { studentApi, scoreApi, reportApi } from '../services/api';
import type { Student, Score } from '../types';

const students = ref<Student[]>([]);
const scores = ref<Score[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const filters = ref({
  student_id: '',
  exam_date: '',
  start_date: '',
  end_date: ''
});

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
    if (filters.value.student_id) params.student_id = Number(filters.value.student_id);
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
const reportData = ref<any>(null);
const loadingReport = ref(false);

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
    student_id: '',
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
