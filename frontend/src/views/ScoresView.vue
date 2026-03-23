<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">성적 발송</h2>

    <!-- 필터 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">반 선택</label>
          <select
            v-model="filters.class_name"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            @change="fetchScores"
          >
            <option value="">전체 반</option>
            <option v-for="className in classList" :key="className" :value="className">{{ className }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">시험일자</label>
          <input
            v-model="examDateInput"
            type="date"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            @change="fetchScores"
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">학생 이름 검색</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="이름 입력"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            @input="handleSearchInput"
          />
        </div>
      </div>
      <div class="mt-4 flex justify-between items-center">
        <div class="flex gap-2">
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            필터 초기화
          </button>
          <button
            v-if="selectedIds.length > 0"
            @click="deleteSelectedScores"
            class="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition font-bold"
          >
            선택 삭제 ({{ selectedIds.length }})
          </button>
          <button
            v-if="selectedIds.length > 0"
            @click="sendBulkKakao"
            class="px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition font-bold"
          >
            선택 알림톡 발송 ({{ selectedIds.length }})
          </button>
          <button
            v-if="isAdmin"
            @click="downloadExcel"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center gap-2"
          >
            <span>📊 현재 목록 엑셀</span>
          </button>
          <button
            v-if="isAdmin"
            @click="downloadMonthlyExcel"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center gap-2"
          >
            <span>📅 월별 엑셀 다운로드</span>
          </button>
        </div>
        <div class="text-sm text-gray-500">
          조회된 성적: <span class="font-bold text-primary">{{ scores.length }}</span>건
        </div>
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
            <th class="px-4 py-3 text-center">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
            
            <!-- RT 테스트 동적 컬럼 -->
            <template v-if="maxRtCount > 0">
              <th v-for="n in maxRtCount" :key="'rt-h-'+n" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                RT {{ n }}
              </th>
            </template>
            <th v-else class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RT</th>

            <!-- 단어 테스트 동적 컬럼 -->
            <template v-if="maxWordCount > 0">
              <th v-for="n in maxWordCount" :key="'word-h-'+n" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                단어 {{ n }}
              </th>
            </template>
            <th v-else class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">단어</th>

            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">과제</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">발송 상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">성적 미리보기</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="score in scores" :key="score.id" class="hover:bg-gray-50" :class="{ 'bg-blue-50': selectedIds.includes(score.id) }">
            <td class="px-4 py-4 text-center">
              <input
                type="checkbox"
                v-model="selectedIds"
                :value="score.id"
                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ score.exam_date }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ score.student_name || '-' }}
            </td>

            <!-- RT 상세 점수 -->
            <template v-if="maxRtCount > 0">
              <td v-for="n in maxRtCount" :key="'rt-d-'+score.id+'-'+n" class="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                <template v-if="score.rt_details && score.rt_details[n-1]">
                  {{ ((score.rt_details[n-1].correct / (score.rt_details[n-1].total || 10)) * 100).toFixed(1) }}
                </template>
                <template v-else>-</template>
              </td>
            </template>
            <td v-else class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ score.rt_score !== null ? score.rt_score.toFixed(1) : '-' }}
            </td>

            <!-- 단어 상세 점수 -->
            <template v-if="maxWordCount > 0">
              <td v-for="n in maxWordCount" :key="'word-d-'+score.id+'-'+n" class="px-4 py-4 whitespace-nowrap text-sm text-center"
                :class="score.word_details && score.word_details[n-1] && (score.word_details[n-1].retest || (score.word_details[n-1].correct / (score.word_details[n-1].total || 50)) * 100 <= 84) ? 'text-red-600 font-bold' : 'text-gray-500'"
              >
                <template v-if="score.word_details && score.word_details[n-1]">
                  {{ ((score.word_details[n-1].correct / (score.word_details[n-1].total || 50)) * 100).toFixed(1) }}
                  <span v-if="score.word_details[n-1].retest || (score.word_details[n-1].correct / (score.word_details[n-1].total || 50)) * 100 <= 84" class="text-[10px] block">(재시험)</span>
                </template>
                <template v-else>-</template>
              </td>
            </template>
            <td v-else class="px-6 py-4 whitespace-nowrap text-sm" :class="score.word_score <= 84 ? 'text-red-600 font-bold' : 'text-gray-500'">
              {{ score.word_score !== null ? score.word_score.toFixed(1) : '-' }}
              <span v-if="score.word_score <= 84" class="text-red-600">(재시험)</span>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ score.assignment_score !== null ? score.assignment_score.toFixed(1) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
              {{ score.average_score !== null ? score.average_score.toFixed(1) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span v-if="score.kakao_status === 'success'" class="text-green-600 font-bold">발송완료</span>
              <span v-else-if="score.kakao_status === 'fail'" class="text-red-500">발송실패</span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewReport(score.id)"
                class="text-primary hover:text-primary-dark mr-3"
              >
                미리보기
              </button>
              <button
                @click="sendKakao(score.id)"
                class="text-green-600 hover:text-green-800 mr-3"
              >
                알림톡 발송
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
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <!-- 모달 헤더 -->
        <div class="bg-primary text-white p-6 flex items-center justify-start space-x-6 relative">
          <img src="/logo.png" alt="독강영어 로고" class="h-20 w-20 object-contain rounded-full bg-white p-1 shadow-md" />
          <div class="text-left font-serif">
            <h1 class="text-3xl font-bold mb-1">독강영어학원</h1>
            <p class="text-lg opacity-90 font-medium tracking-wide italic" style="font-family: 'Times New Roman', Times, serif;">Daily Report</p>
          </div>
          <button
            @click="showReportModal = false"
            class="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <!-- 성적표 내용 -->
        <div v-if="reportData" class="p-6 relative">
          <div class="relative z-10">
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

            <!-- 평균 및 반 평균 (상단으로 이동) -->
            <div class="p-6 bg-primary text-white rounded-lg mb-6 shadow-md">
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p class="text-sm opacity-90">평균 점수</p>
                  <p class="text-3xl font-bold">{{ reportData.score.average?.toFixed(1) || '0.0' }}점</p>
                </div>
                <div>
                  <p class="text-sm opacity-90">반 평균</p>
                  <p class="text-3xl font-bold">{{ reportData.score.class_average?.toFixed(1) || '0.0' }}점</p>
                </div>
              </div>
            </div>

            <!-- 성적 정보 -->
            <div class="space-y-4 mb-6">
              <!-- RT점수 상세 -->
              <div v-if="reportData.score.rt_details && reportData.score.rt_details.length > 0">
                <div class="flex justify-between items-end mb-2">
                  <p class="text-sm font-bold text-gray-600">RT 테스트 상세</p>
                  <p class="text-sm font-bold text-primary">RT 평균: {{ reportData.score.rt?.score?.toFixed(1) || '0.0' }}점</p>
                </div>
                <div class="grid grid-cols-1 gap-2">
                  <div v-for="(rt, idx) in reportData.score.rt_details" :key="'rt-'+idx" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p class="font-semibold text-gray-800 text-sm">{{ rt.name || `RT ${idx + 1}` }}</p>
                      <p class="text-xs text-gray-500">{{ rt.correct }} / {{ rt.total || 10 }}</p>
                    </div>
                    <p class="text-lg font-bold text-primary">
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
                    {{ reportData.score.rt?.correct || '-' }} / {{ reportData.score.rt?.total || '-' }}
                  </p>
                </div>
                <p class="text-2xl font-bold text-primary">
                  {{ reportData.score.rt?.score?.toFixed(1) || '0.0' }}점
                </p>
              </div>

              <!-- 단어시험 상세 -->
              <div v-if="reportData.score.word_details && reportData.score.word_details.length > 0">
                <div class="flex justify-between items-end mb-2">
                  <p class="text-sm font-bold text-gray-600">단어 테스트 상세</p>
                  <p class="text-sm font-bold text-primary">단어 평균: {{ reportData.score.word?.score?.toFixed(1) || '0.0' }}점</p>
                </div>
                <div class="grid grid-cols-1 gap-2">
                  <div v-for="(word, idx) in reportData.score.word_details" :key="'word-'+idx" 
                    class="flex justify-between items-center p-3 rounded-lg border"
                    :class="word.retest || ((Number(word.total) || 0) > 0 && (Number(word.correct) / Number(word.total)) * 100 <= 84) ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'"
                  >
                    <div>
                      <p class="font-semibold text-sm" :class="word.retest || ((Number(word.total) || 0) > 0 && (Number(word.correct) / Number(word.total)) * 100 <= 84) ? 'text-red-600' : 'text-gray-800'">
                        {{ word.name || `단어 ${idx + 1}` }}
                        <span v-if="word.retest || ((Number(word.total) || 0) > 0 && (Number(word.correct) / Number(word.total)) * 100 <= 84)" class="ml-1 text-[10px] font-bold">(재시험)</span>
                      </p>
                      <p class="text-xs text-gray-500">{{ word.correct }} / {{ word.total || 50 }}</p>
                    </div>
                    <p class="text-lg font-bold" :class="word.retest || ((Number(word.total) || 0) > 0 && (Number(word.correct) / Number(word.total)) * 100 <= 84) ? 'text-red-600' : 'text-primary'">
                      {{ (Number(word.total) || 0) > 0 ? ((Number(word.correct) / Number(word.total)) * 100).toFixed(1) : '0.0' }}점
                    </p>
                  </div>
                </div>
                <!-- 누적 정답수 표시 -->
                <div class="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                  <p class="text-sm font-bold text-gray-800 text-center" style="font-size: 1.1rem;">
                    {{ reportData.student.name }} 학생이 독강영어와 암기한 단어: 총 {{ reportData.score.word?.cumulative_correct || 0 }}개 ✏️
                  </p>
                </div>
              </div>
              <!-- 단어 합산 (상세가 없을 경우 대비) -->
              <div v-else
                class="flex justify-between items-center p-4 rounded-lg"
                :class="reportData.score.word?.retest ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'"
              >
                <div>
                  <p
                    class="font-semibold"
                    :class="reportData.score.word?.retest ? 'text-red-600' : 'text-gray-800'"
                  >
                    단어시험 (평균)
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
              <!-- 누적 정답수 표시 (상세가 없을 경우) -->
              <div v-if="!reportData.score.word_details || reportData.score.word_details.length === 0" class="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                <p class="text-sm font-bold text-gray-800 text-center" style="font-size: 1.1rem;">
                  {{ reportData.student.name }} 학생이 독강영어와 암기한 단어: 총 {{ reportData.score.word?.cumulative_correct || 0 }}개 ✏️
                </p>
              </div>

              <!-- 과제점수 -->
              <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="font-semibold text-gray-800">과제점수</p>
                <p class="text-2xl font-bold text-primary">
                  {{ reportData.score.assignment?.toFixed(1) || '0.0' }}점
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
        </div>

        <!-- 로딩 -->
        <div v-else-if="loadingReport" class="p-8 text-center">
          <p class="text-gray-500">로딩 중...</p>
        </div>

        <!-- 모달 닫기 버튼 -->
        <div class="p-4 border-t flex justify-between items-center bg-gray-50">
          <button
            @click="copyReportLink"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-bold shadow-sm"
          >
            <span>🔗 성적표 링크 복사</span>
          </button>
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
import { ref, onMounted, computed, watch } from 'vue';
import { studentApi, scoreApi, reportApi, kakaoApi } from '../services/api';
import type { Student, Score, ReportData } from '../types';
import { normalizeClassName } from '../utils/string';
import * as XLSX from 'xlsx';

const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;
const isAdmin = user?.role === 'admin';

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
const selectedIds = ref<number[]>([]);

const isAllSelected = computed(() => {
  return scores.value.length > 0 && selectedIds.value.length === scores.value.length;
});

const maxRtCount = computed(() => {
  return Math.max(0, ...scores.value.map(s => s.rt_details?.length || 0));
});

const maxWordCount = computed(() => {
  return Math.max(0, ...scores.value.map(s => s.word_details?.length || 0));
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = scores.value.map(s => s.id);
  }
};

const filters = ref({
  search: '',
  exam_date: getToday(), // 오늘 날짜로 초기화
  class_name: '',
  start_date: '',
  end_date: ''
});

// 날짜 변환 헬퍼 (yy-mm-dd <-> yyyy-mm-dd)
const toDateInputValue = (v: string) => v ? `20${v}` : '';
const toExamDateValue = (v: string) => v ? v.slice(2) : '';

const examDateInput = computed({
  get: () => toDateInputValue(filters.value.exam_date),
  set: (v) => {
    filters.value.exam_date = toExamDateValue(v);
  }
});

// 오늘 날짜 가져오기 함수 (기존 utils/date 활용 또는 직접 정의)
function getToday() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

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

const classList = computed(() => {
  const set = new Set<string>();
  students.value.forEach(s => {
    if (s.class_name && typeof s.class_name === 'string') {
      s.class_name.split(',').forEach(c => {
        const normalized = normalizeClassName(c);
        if (normalized && normalized !== 'undefined' && normalized !== 'null') {
          set.add(normalized);
        }
      });
    }
  });
  return Array.from(set).filter(name => name && name.length > 0).sort();
});

const fetchScores = async () => {
  try {
    loading.value = true;
    error.value = null;
    const params: any = {};
    if (filters.value.search) params.student_name = filters.value.search;
    if (filters.value.exam_date) params.exam_date = filters.value.exam_date;
    if (filters.value.class_name) params.class_name = filters.value.class_name;
    if (filters.value.start_date) params.start_date = filters.value.start_date;
    if (filters.value.end_date) params.end_date = filters.value.end_date;

    const response = await scoreApi.getAll(params);
    if (response.data.success && response.data.data) {
      scores.value = response.data.data;
      selectedIds.value = []; // 데이터 로드 시 선택 해제
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
const displayComment = computed(() => {
  if (!reportData.value) return '';
  return (reportData.value.score.comment || '').trim();
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

const sendKakao = async (scoreId: number) => {
  if (!confirm('해당 학생의 학부모님께 성적표 알림톡을 발송하시겠습니까?')) return;
  
  try {
    const response = await kakaoApi.sendReport(scoreId);
    alert(`알리고 응답: ${response.data.message}`);
    
    // 발송 후 상태 즉시 반영
    const targetScore = scores.value.find(s => s.id === scoreId);
    if (targetScore) {
      targetScore.kakao_status = response.data.success ? 'success' : 'fail';
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || '알림톡 발송 중 시스템 오류가 발생했습니다.';
    alert(`시스템 오류: ${errorMsg}`);
    // 실패 시에도 상태 반영
    const targetScore = scores.value.find(s => s.id === scoreId);
    if (targetScore) {
      targetScore.kakao_status = 'fail';
    }
  }
};

const sendBulkKakao = async () => {
  if (!confirm(`선택한 ${selectedIds.value.length}명의 학생에게 알림톡을 발송하시겠습니까?`)) return;

  let successCount = 0;
  let failCount = 0;

  for (const id of selectedIds.value) {
    try {
      const response = await kakaoApi.sendReport(id);
      const targetScore = scores.value.find(s => s.id === id);
      if (response.data.success) {
        successCount++;
        if (targetScore) targetScore.kakao_status = 'success';
      } else {
        failCount++;
        if (targetScore) targetScore.kakao_status = 'fail';
      }
    } catch (err) {
      failCount++;
      const targetScore = scores.value.find(s => s.id === id);
      if (targetScore) targetScore.kakao_status = 'fail';
    }
  }

  alert(`발송 완료\n성공: ${successCount}건\n실패: ${failCount}건`);
  selectedIds.value = [];
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

const deleteSelectedScores = async () => {
  if (!confirm(`선택한 ${selectedIds.value.length}건의 성적을 모두 삭제하시겠습니까?`)) return;

  try {
    loading.value = true;
    // 순차적으로 삭제 처리
    for (const id of selectedIds.value) {
      await scoreApi.delete(id);
    }
    alert('선택한 성적이 모두 삭제되었습니다.');
    selectedIds.value = [];
    fetchScores();
  } catch (err: any) {
    alert('일부 성적 삭제 중 오류가 발생했습니다.');
    console.error(err);
    fetchScores();
  } finally {
    loading.value = false;
  }
};

const copyReportLink = async () => {
  if (!reportData.value) return;
  
  try {
    const response = await reportApi.generateLink(reportData.value.score.id);
    if (response.data.success) {
      const fullUrl = `${window.location.origin}/report/${response.data.data.token}`;
      await navigator.clipboard.writeText(fullUrl);
      alert('성적표 링크가 클립보드에 복사되었습니다.\n원하는 곳에 붙여넣기(Ctrl+V) 하세요.');
    }
  } catch (err: any) {
    alert('링크 생성 및 복사에 실패했습니다.');
    console.error('Link copy error:', err);
  }
};

const downloadExcel = () => {
  if (scores.value.length === 0) {
    alert('다운로드할 성적 데이터가 없습니다.');
    return;
  }

  const excelData = scores.value.map(score => {
    const row: any = {
      '날짜': score.exam_date,
      '학생명': score.student_name || '-',
    };

    // RT 점수
    if (maxRtCount.value > 0) {
      for (let i = 0; i < maxRtCount.value; i++) {
        if (score.rt_details && score.rt_details[i]) {
          const pct = ((score.rt_details[i].correct / (score.rt_details[i].total || 10)) * 100).toFixed(1);
          row[`RT ${i + 1}`] = `${pct}%`;
        } else {
          row[`RT ${i + 1}`] = '-';
        }
      }
    } else {
      row['RT'] = score.rt_score !== null ? score.rt_score.toFixed(1) : '-';
    }

    // 단어 점수
    if (maxWordCount.value > 0) {
      for (let i = 0; i < maxWordCount.value; i++) {
        if (score.word_details && score.word_details[i]) {
          const pct = ((score.word_details[i].correct / (score.word_details[i].total || 50)) * 100).toFixed(1);
          const isRetest = score.word_details[i].retest || Number(pct) <= 84;
          row[`단어 ${i + 1}`] = `${pct}%${isRetest ? ' (재시험)' : ''}`;
        } else {
          row[`단어 ${i + 1}`] = '-';
        }
      }
    } else {
      row['단어'] = score.word_score !== null ? `${score.word_score.toFixed(1)}${score.word_score <= 84 ? ' (재시험)' : ''}` : '-';
    }

    row['과제'] = score.assignment_score !== null ? score.assignment_score.toFixed(1) : '-';
    row['평균'] = score.average_score !== null ? score.average_score.toFixed(1) : '-';
    row['발송 상태'] = score.kakao_status === 'success' ? '발송완료' : (score.kakao_status === 'fail' ? '발송실패' : '미발송');
    
    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // 컬럼 너비 자동 조정
  const colWidths = [
    { wch: 15 }, // 날짜
    { wch: 15 }, // 학생명
  ];
  
  if (maxRtCount.value > 0) {
    for (let i = 0; i < maxRtCount.value; i++) colWidths.push({ wch: 10 });
  } else {
    colWidths.push({ wch: 10 });
  }

  if (maxWordCount.value > 0) {
    for (let i = 0; i < maxWordCount.value; i++) colWidths.push({ wch: 15 });
  } else {
    colWidths.push({ wch: 15 });
  }

  colWidths.push({ wch: 10 }); // 과제
  colWidths.push({ wch: 10 }); // 평균
  colWidths.push({ wch: 15 }); // 발송상태

  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
  
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const fileName = `DailyReport_${dateStr}.xlsx`;
  
  XLSX.writeFile(wb, fileName);
};

const downloadMonthlyExcel = async () => {
  const monthStr = prompt('다운로드할 연월을 입력하세요 (예: 2026-03)', new Date().toISOString().substring(0, 7));
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    if (monthStr) alert('올바른 형식(YYYY-MM)으로 입력해주세요.');
    return;
  }

  try {
    const [year, month] = monthStr.split('-');
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const startDate = `${monthStr}-01`;
    const endDate = `${monthStr}-${lastDay}`;

    const params: any = { start_date: startDate, end_date: endDate };
    if (filters.value.class_name) params.class_name = filters.value.class_name;

    const response = await scoreApi.getAll(params);
    if (response.data.success && response.data.data) {
      const monthlyScores = response.data.data;
      
      if (monthlyScores.length === 0) {
        alert('해당 월에 저장된 성적 데이터가 없습니다.');
        return;
      }

      const excelData = monthlyScores.map((score: any) => {
        const row: any = {
          '날짜': score.exam_date,
          '학생명': score.student_name || '-',
        };

        // RT 점수
        if (maxRtCount.value > 0) {
          for (let i = 0; i < maxRtCount.value; i++) {
            if (score.rt_details && score.rt_details[i]) {
              const pct = ((score.rt_details[i].correct / (score.rt_details[i].total || 10)) * 100).toFixed(1);
              row[`RT ${i + 1}`] = `${pct}%`;
            } else {
              row[`RT ${i + 1}`] = '-';
            }
          }
        } else {
          row['RT'] = score.rt_score !== null ? score.rt_score.toFixed(1) : '-';
        }

        // 단어 점수
        if (maxWordCount.value > 0) {
          for (let i = 0; i < maxWordCount.value; i++) {
            if (score.word_details && score.word_details[i]) {
              const pct = ((score.word_details[i].correct / (score.word_details[i].total || 50)) * 100).toFixed(1);
              const isRetest = score.word_details[i].retest || Number(pct) <= 84;
              row[`단어 ${i + 1}`] = `${pct}%${isRetest ? ' (재시험)' : ''}`;
            } else {
              row[`단어 ${i + 1}`] = '-';
            }
          }
        } else {
          row['단어'] = score.word_score !== null ? `${score.word_score.toFixed(1)}${score.word_score <= 84 ? ' (재시험)' : ''}` : '-';
        }

        row['과제'] = score.assignment_score !== null ? score.assignment_score.toFixed(1) : '-';
        row['평균'] = score.average_score !== null ? score.average_score.toFixed(1) : '-';
        row['발송 상태'] = score.kakao_status === 'success' ? '발송완료' : (score.kakao_status === 'fail' ? '발송실패' : '미발송');
        
        return row;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [{ wch: 15 }, { wch: 15 }];
      if (maxRtCount.value > 0) {
        for (let i = 0; i < maxRtCount.value; i++) colWidths.push({ wch: 10 });
      } else {
        colWidths.push({ wch: 10 });
      }
      if (maxWordCount.value > 0) {
        for (let i = 0; i < maxWordCount.value; i++) colWidths.push({ wch: 15 });
      } else {
        colWidths.push({ wch: 15 });
      }
      colWidths.push({ wch: 10 }, { wch: 10 }, { wch: 15 });
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
      const fileName = `DailyReport_월별_${monthStr.replace('-', '')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    }
  } catch (error) {
    console.error('월별 엑셀 다운로드 실패:', error);
    alert('데이터를 불러오는데 실패했습니다.');
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    exam_date: '',
    class_name: '',
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
