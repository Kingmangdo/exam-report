<template>
  <div>
    <h2 class="text-3xl font-bold text-gray-800 mb-6">예약자 명단 관리</h2>

    <!-- 상단: 필터 + 추가 버튼 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm text-gray-500 mb-1">상태</label>
          <select v-model="filterStatus" class="text-base px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" @change="fetchReservations">
            <option value="">전체</option>
            <option value="예약">예약</option>
            <option value="방문완료">방문완료</option>
            <option value="입학">입학</option>
            <option value="취소">취소</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">기간 조회</label>
          <select v-model="filterPeriod" class="text-base px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" @change="fetchReservations">
            <option value="recent">최근 3주</option>
            <option value="all">전체 내역</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">이름 검색</label>
          <input v-model="searchName" type="text" placeholder="이름 입력" class="text-base px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div class="ml-auto">
          <button @click="openCreateModal" class="text-base px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition font-bold">
            + 예약 등록
          </button>
        </div>
      </div>
    </div>

    <!-- 예약자 목록 테이블 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-3 text-left text-sm font-bold text-gray-500">예약자명</th>
              <th class="px-3 py-3 text-left text-sm font-bold text-gray-500">방문일시</th>
              <th class="px-3 py-3 text-left text-sm font-bold text-gray-500">학교</th>
              <th class="px-3 py-3 text-center text-sm font-bold text-gray-500">학년</th>
              <th class="px-3 py-3 text-center text-sm font-bold text-gray-500">학생 연락처</th>
              <th class="px-3 py-3 text-center text-sm font-bold text-gray-500">학부모 연락처</th>
              <th class="px-3 py-3 text-center text-sm font-bold text-gray-500">영어 성적</th>
              <th class="px-3 py-3 text-left text-sm font-bold text-gray-500">기타</th>
              <th class="px-3 py-3 text-center text-sm font-bold text-gray-500">상태</th>
              <th class="px-3 py-3 text-center text-sm font-bold text-gray-500">안내 발송</th>
              <th class="px-3 py-3 text-center text-sm font-bold text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="r in filteredReservations" :key="r.id" class="hover:bg-gray-50">
              <td class="px-3 py-3 text-base font-bold text-gray-900">{{ r.name }}</td>
              <td class="px-3 py-3 text-base text-gray-600">{{ formatDateTime(r.visit_date) }}</td>
              <td class="px-3 py-3 text-base text-gray-600">{{ r.school || '-' }}</td>
              <td class="px-3 py-3 text-base text-gray-600 text-center">{{ r.grade || '-' }}</td>
              <td class="px-3 py-3 text-base text-gray-600 text-center">{{ r.student_phone || '-' }}</td>
              <td class="px-3 py-3 text-base text-gray-600 text-center">{{ r.parent_phone || '-' }}</td>
              <td class="px-3 py-3 text-base text-gray-600 text-center">{{ r.recent_english_score || '-' }}</td>
              <td class="px-3 py-3 text-base text-gray-500 max-w-[180px] truncate">{{ r.notes || '-' }}</td>
              <td class="px-3 py-3 text-center">
                <span class="px-2 py-1 text-sm rounded-full font-bold"
                  :class="{
                    'bg-blue-100 text-blue-700': r.status === '예약',
                    'bg-green-100 text-green-700': r.status === '방문완료',
                    'bg-purple-100 text-purple-700': r.status === '입학',
                    'bg-gray-100 text-gray-500': r.status === '취소'
                  }"
                >{{ r.status }}</span>
              </td>
              <td class="px-3 py-3 text-center whitespace-nowrap">
                <template v-if="getSendStatus(r.id) === 'success'">
                  <span class="px-2 py-1 text-sm bg-green-100 text-green-700 rounded-full font-bold">발송완료</span>
                </template>
                <template v-else-if="getSendStatus(r.id) === 'sending'">
                  <span class="px-2 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full font-bold">발송중...</span>
                </template>
                <template v-else-if="getSendStatus(r.id) === 'fail'">
                  <div class="flex flex-col items-center gap-1">
                    <span class="px-2 py-1 text-sm bg-red-100 text-red-600 rounded-full font-bold">발송실패</span>
                    <button @click="sendNotification(r)" class="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition font-bold">재발송</button>
                  </div>
                </template>
                <template v-else>
                  <button @click="sendNotification(r)" :disabled="!r.parent_phone" class="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                    📩 발송
                  </button>
                </template>
              </td>
              <td class="px-3 py-3 text-center whitespace-nowrap">
                <button @click="openEditModal(r)" class="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-bold mr-1">수정</button>
                <button @click="openLevelTestModal(r)" class="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition font-bold mr-1">레벨테스트</button>
                <button v-if="r.status !== '입학'" @click="enrollStudent(r)" class="px-2 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition font-bold mr-1">입학</button>
                <button @click="deleteReservation(r.id)" class="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition font-bold">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredReservations.length === 0" class="p-8 text-center text-gray-500 text-lg">
        예약자가 없습니다.
      </div>
    </div>

    <!-- ========== 예약 등록/수정 모달 ========== -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold text-gray-800">{{ editingId ? '예약 수정' : '예약 등록' }}</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">예약자명 <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="이름" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">방문일시 <span class="text-red-500">*</span></label>
            <div class="flex gap-3 items-center">
              <div class="flex-1 relative">
                <input v-model="form.visit_date_only" type="date" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <span v-if="form.visit_date_only" class="absolute right-10 top-1/2 -translate-y-1/2 text-sm font-bold text-primary pointer-events-none">
                  ({{ getDayName(form.visit_date_only) }})
                </span>
              </div>
              <select v-model="form.visit_time" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="" disabled>시간 선택</option>
                <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">학교</label>
              <input v-model="form.school" type="text" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="학교명" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">학년</label>
              <input v-model="form.grade" type="text" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="예: 중1" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">학생 연락처</label>
              <input v-model="form.student_phone" type="tel" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="010-0000-0000" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">학부모 연락처</label>
              <input v-model="form.parent_phone" type="tel" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="010-0000-0000" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">최근 영어 성적</label>
            <input v-model="form.recent_english_score" type="text" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="예: 90점, 상위 20%" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">기타</label>
            <textarea v-model="form.notes" rows="3" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="특이사항, 메모 등"></textarea>
          </div>
          <div v-if="editingId">
            <label class="block text-sm font-bold text-gray-700 mb-1">상태</label>
            <select v-model="form.status" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="예약">예약</option>
              <option value="방문완료">방문완료</option>
              <option value="입학">입학</option>
              <option value="취소">취소</option>
            </select>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button @click="showFormModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">취소</button>
          <button @click="saveReservation" :disabled="saving" class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-50">
            {{ saving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 레벨테스트 모달 ========== -->
    <div v-if="showLevelTestModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-xl">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold">레벨테스트 성적 입력</h3>
              <p class="text-blue-200 text-sm">{{ selectedReservation?.name }} ({{ selectedReservation?.school || '-' }} / {{ selectedReservation?.grade || '-' }})</p>
            </div>
            <button @click="showLevelTestModal = false" class="text-white hover:text-gray-300 text-2xl">&times;</button>
          </div>
        </div>

        <div class="p-6">
          <!-- 테스트 날짜 -->
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-1">테스트 날짜</label>
            <input v-model="levelTestForm.test_date" type="date" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <!-- 영역별 점수 + 코멘트 입력 -->
          <div class="space-y-4 mb-6">
            <h4 class="text-base font-bold text-gray-800">📋 영역별 점수 및 코멘트</h4>
            <div v-for="(part, idx) in levelTestForm.parts" :key="idx" class="border rounded-lg p-4 bg-gray-50">
              <div class="flex items-center gap-3 mb-3">
                <span class="text-xs font-bold text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: partColors[idx] }">{{ idx + 1 }}</span>
                <input v-model="part.name" type="text" class="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-primary outline-none font-medium" placeholder="영역명 입력" />
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">점수:</span>
                  <input v-model.number="part.score" type="number" min="0" class="w-16 px-2 py-2 text-sm border rounded-lg text-center focus:ring-1 focus:ring-primary outline-none" />
                  <span class="text-xs text-gray-400">/</span>
                  <input v-model.number="part.max_score" type="number" min="1" class="w-16 px-2 py-2 text-sm border rounded-lg text-center focus:ring-1 focus:ring-primary outline-none" placeholder="만점" />
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-500">코멘트</label>
                <textarea v-model="part.comment" rows="2" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none mt-1" :placeholder="`${part.name || '영역'} 관련 코멘트를 입력하세요`"></textarea>
              </div>
            </div>
          </div>

          <!-- 총괄 코멘트 -->
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-1">💬 종합 코멘트</label>
            <textarea v-model="levelTestForm.overall_comment" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="종합적인 레벨테스트 결과에 대한 코멘트를 입력하세요..."></textarea>
          </div>

          <!-- 요약 -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <div class="text-center">
              <div class="text-xs text-blue-600 font-bold mb-1">총점</div>
              <div class="text-2xl font-black text-blue-900">{{ levelTestTotalScore }}</div>
              <div class="text-xs text-blue-400">/ {{ levelTestForm.parts.filter((p: any) => p.name).reduce((sum, p) => sum + (p.max_score || 100), 0) }}</div>
            </div>
          </div>

          <!-- 성적표 링크 -->
          <div v-if="currentLevelTestId" class="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-bold text-green-800">📄 레벨테스트 성적표</h4>
                <p class="text-xs text-green-600 mt-1">저장된 성적표를 미리보기하거나 링크를 생성할 수 있습니다.</p>
              </div>
              <div class="flex gap-2">
                <button @click="previewLevelTestReport" class="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition font-bold">
                  📊 미리보기
                </button>
                <button @click="generateLevelTestLink" class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold">
                  🔗 링크 생성
                </button>
              </div>
            </div>
            <div v-if="levelTestReportUrl" class="mt-3 flex items-center gap-2">
              <input :value="levelTestReportUrl" readonly class="flex-1 px-3 py-1.5 text-xs border rounded bg-white text-gray-700" />
              <button @click="copyReportUrl" class="px-3 py-1.5 text-xs bg-gray-700 text-white rounded hover:bg-gray-800 transition font-bold">
                복사
              </button>
            </div>
          </div>
        </div>

        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button @click="showLevelTestModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">취소</button>
          <button @click="saveLevelTest" :disabled="levelTestSaving" class="px-8 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-50">
            {{ levelTestSaving ? '저장 중...' : '레벨테스트 저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 레벨테스트 성적표 미리보기 모달 ========== -->
    <div v-if="showReportPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div class="bg-primary text-white p-6 rounded-t-xl flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <img src="/logo.png" alt="독강영어 로고" class="h-20 w-20 object-contain rounded-full bg-white p-1 shadow-md" />
            <div class="text-left">
              <h1 class="text-3xl font-bold mb-1">독강영어학원</h1>
              <p class="text-lg opacity-90 font-medium tracking-wide italic" style="font-family: 'Times New Roman', Times, serif;">Level Test Report</p>
            </div>
          </div>
          <button @click="showReportPreview = false" class="text-white hover:text-gray-300 text-2xl">&times;</button>
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
          <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- 레이더 차트 -->
            <div class="border rounded-lg p-4">
              <h4 class="text-sm font-bold text-gray-700 mb-3 text-center">영역별 성취도</h4>
              <canvas ref="radarChartCanvas" width="300" height="300"></canvas>
            </div>
            <!-- 영역별 상세 -->
            <div class="space-y-3">
              <h4 class="text-sm font-bold text-gray-700 mb-2">영역별 점수</h4>
              <div v-for="(part, idx) in reportData.score.parts.filter((p: any) => p.name)" :key="idx" class="border rounded-lg p-3">
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
            <div class="text-center">
              <div class="text-xs text-blue-600 font-bold mb-1">총점</div>
              <div class="text-2xl font-black text-blue-900">{{ reportData.score.total_score }}</div>
            </div>
          </div>

          <!-- 종합 코멘트 -->
          <div v-if="reportData.score.overall_comment" class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 class="text-sm font-bold text-yellow-800 mb-2">💬 종합 코멘트</h4>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ reportData.score.overall_comment }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 토스트 -->
    <div v-if="toastMsg" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[70] font-bold">
      {{ toastMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { reservationApi, kakaoApi } from '../services/api';

const partColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

const reservations = ref<any[]>([]);
const filterStatus = ref('');
const filterPeriod = ref('recent');
const searchName = ref('');
const showFormModal = ref(false);
const showLevelTestModal = ref(false);
const showReportPreview = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const levelTestSaving = ref(false);
const toastMsg = ref('');
const selectedReservation = ref<any>(null);
const currentLevelTestId = ref<number | null>(null);
const levelTestReportUrl = ref('');
const reportData = ref<any>(null);
const radarChartCanvas = ref<HTMLCanvasElement | null>(null);
let radarChartInstance: any = null;

// 안내 발송 관련
const sendStatusMap = ref<Record<number, string>>({});  // reservation_id -> 'success' | 'fail' | 'sending'

// 30분 단위 타임슬롯 생성 (09:00 ~ 21:00)
const timeSlots = (() => {
  const slots: string[] = [];
  for (let h = 9; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 21) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

const getDayName = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[d.getDay()];
};

const form = ref({
  name: '',
  visit_date_only: '',
  visit_time: '',
  school: '',
  grade: '',
  student_phone: '',
  parent_phone: '',
  recent_english_score: '',
  notes: '',
  status: '예약'
});

const levelTestForm = ref({
  test_date: getTodayFull(),
  parts: [
    { name: 'Listening', score: 0, comment: '' },
    { name: 'Grammar', score: 0, comment: '' },
    { name: 'Reading', score: 0, comment: '' },
    { name: 'Vocabulary', score: 0, comment: '' },
    { name: 'Writing', score: 0, comment: '' }
  ] as any[],
  overall_comment: ''
});

function getTodayFull(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const levelTestTotalScore = computed(() => {
  return levelTestForm.value.parts
    .filter((p: any) => p.name)
    .reduce((sum: number, p: any) => sum + (p.score || 0), 0);
});

const levelTestAvgScore = computed(() => {
  const validParts = levelTestForm.value.parts.filter((p: any) => p.name);
  if (validParts.length === 0) return '0.0';
  const total = validParts.reduce((sum: number, p: any) => sum + (p.score || 0), 0);
  const totalMax = validParts.reduce((sum: number, p: any) => sum + (p.max_score || 100), 0);
  return totalMax > 0 ? ((total / totalMax) * 100).toFixed(1) : '0.0';
});

const filteredReservations = computed(() => {
  if (!searchName.value) return reservations.value;
  return reservations.value.filter(r => r.name?.includes(searchName.value));
});

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const dayName = DAY_NAMES[d.getDay()];
  return `${yyyy}-${mm}-${dd}(${dayName}) ${hh}:${mi}`;
};

const fetchReservations = async () => {
  try {
    const params: any = {};
    if (filterStatus.value) params.status = filterStatus.value;
    
    if (filterPeriod.value === 'recent') {
      const today = new Date();
      // 3주 전 (21일 전) 날짜
      const threeWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 21);
      params.start_date = threeWeeksAgo.toISOString().split('T')[0];
    }
    
    const res = await reservationApi.getAll(params);
    if (res.data.success) {
      reservations.value = res.data.data || [];
    }
  } catch (err) {
    console.error('예약 조회 실패:', err);
  }
};

const openCreateModal = () => {
  editingId.value = null;
  form.value = { name: '', visit_date_only: '', visit_time: '', school: '', grade: '', student_phone: '', parent_phone: '', recent_english_score: '', notes: '', status: '예약' };
  showFormModal.value = true;
};

const openEditModal = (r: any) => {
  editingId.value = r.id;
  let dateOnly = '';
  let timeOnly = '';
  if (r.visit_date) {
    const d = new Date(r.visit_date);
    dateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    timeOnly = `${String(d.getHours()).padStart(2, '0')}:${d.getMinutes() >= 30 ? '30' : '00'}`;
  }
  form.value = {
    name: r.name || '',
    visit_date_only: dateOnly,
    visit_time: timeOnly,
    school: r.school || '',
    grade: r.grade || '',
    student_phone: r.student_phone || '',
    parent_phone: r.parent_phone || '',
    recent_english_score: r.recent_english_score || '',
    notes: r.notes || '',
    status: r.status || '예약'
  };
  showFormModal.value = true;
};

const saveReservation = async () => {
  if (!form.value.name || !form.value.visit_date_only || !form.value.visit_time) {
    alert('예약자명, 방문날짜, 방문시간은 필수입니다.');
    return;
  }
  saving.value = true;
  try {
    // 날짜 + 시간을 합쳐서 visit_date로 전송 (KST 타임존 명시)
    const payload = {
      name: form.value.name,
      visit_date: `${form.value.visit_date_only}T${form.value.visit_time}:00+09:00`,
      school: form.value.school,
      grade: form.value.grade,
      student_phone: form.value.student_phone,
      parent_phone: form.value.parent_phone,
      recent_english_score: form.value.recent_english_score,
      notes: form.value.notes,
      status: form.value.status
    };

    if (editingId.value) {
      await reservationApi.update(editingId.value, payload);
      showToast('예약이 수정되었습니다.');
    } else {
      await reservationApi.create(payload);
      showToast('예약이 등록되었습니다.');
    }
    showFormModal.value = false;
    fetchReservations();
  } catch (err: any) {
    alert('저장 실패: ' + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
};

const deleteReservation = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await reservationApi.delete(id);
    showToast('삭제되었습니다.');
    fetchReservations();
  } catch (err: any) {
    alert('삭제 실패: ' + (err.response?.data?.message || err.message));
  }
};

// ========== 입학 처리 ==========
const enrollStudent = async (r: any) => {
  if (!confirm(`${r.name} 학생을 입학 처리하시겠습니까?\n학생 관리에 자동 등록됩니다.`)) return;
  try {
    const res = await reservationApi.enroll(r.id);
    if (res.data.success) {
      showToast(res.data.message || `${r.name} 학생이 등록되었습니다.`);
      fetchReservations();
    }
  } catch (err: any) {
    alert('입학 처리 실패: ' + (err.response?.data?.message || err.message));
  }
};

// ========== 레벨테스트 ==========
const openLevelTestModal = async (r: any) => {
  selectedReservation.value = r;
  currentLevelTestId.value = null;
  levelTestReportUrl.value = '';
  levelTestForm.value = {
    test_date: getTodayFull(),
    parts: [
      { name: '', score: 0, max_score: 100, comment: '' },
      { name: '', score: 0, max_score: 100, comment: '' },
      { name: '', score: 0, max_score: 100, comment: '' },
      { name: '', score: 0, max_score: 100, comment: '' },
      { name: '', score: 0, max_score: 100, comment: '' }
    ],
    overall_comment: ''
  };

  try {
    const res = await reservationApi.getLevelTest(r.id);
    if (res.data.success && res.data.data) {
      const data = res.data.data;
      currentLevelTestId.value = data.id;
      levelTestForm.value.test_date = data.test_date || getTodayFull();
      levelTestForm.value.overall_comment = data.overall_comment || '';
      if (data.parts && data.parts.length > 0) {
        levelTestForm.value.parts = data.parts.map((p: any) => ({
          name: p.name || '',
          score: p.score || 0,
          max_score: p.max_score || 100,
          comment: p.comment || ''
        }));
      }
    }
  } catch (err) {
    // 기존 데이터 없음
  }

  showLevelTestModal.value = true;
};

const saveLevelTest = async () => {
  if (!selectedReservation.value) return;
  levelTestSaving.value = true;
  try {
    const validParts = levelTestForm.value.parts.filter((p: any) => p.name);
    const totalScore = validParts.reduce((sum: number, p: any) => sum + (p.score || 0), 0);
    const totalMax = validParts.reduce((sum: number, p: any) => sum + (p.max_score || 100), 0);
    const avgScore = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

    const res = await reservationApi.saveLevelTest({
      reservation_id: selectedReservation.value.id,
      test_date: levelTestForm.value.test_date,
      parts: levelTestForm.value.parts,
      total_score: totalScore,
      average_score: Math.round(avgScore * 10) / 10,
      overall_comment: levelTestForm.value.overall_comment
    });
    if (res.data.success && res.data.data) {
      currentLevelTestId.value = res.data.data.id;
    }
    showToast('레벨테스트 결과가 저장되었습니다!');
  } catch (err: any) {
    alert('저장 실패: ' + (err.response?.data?.message || err.message));
  } finally {
    levelTestSaving.value = false;
  }
};

// ========== 레벨테스트 성적표 미리보기 ==========
const previewLevelTestReport = async () => {
  if (!currentLevelTestId.value) return;
  try {
    const res = await reservationApi.getReportPreview(currentLevelTestId.value);
    if (res.data.success && res.data.data) {
      reportData.value = res.data.data;
      showReportPreview.value = true;
      await nextTick();
      drawRadarChart();
    }
  } catch (err: any) {
    alert('미리보기 실패: ' + (err.response?.data?.message || err.message));
  }
};

// ========== 레벨테스트 링크 생성 ==========
const generateLevelTestLink = async () => {
  if (!currentLevelTestId.value || !selectedReservation.value) return;
  const parentPhone = selectedReservation.value.parent_phone || '';
  const phoneLast4 = parentPhone.slice(-4) || '0000';

  try {
    const res = await reservationApi.generateReportLink(
      currentLevelTestId.value,
      selectedReservation.value.name,
      phoneLast4
    );
    if (res.data.success && res.data.data) {
      const token = res.data.data.token;
      levelTestReportUrl.value = `${window.location.origin}/report/level-test/${token}`;
      showToast('성적표 링크가 생성되었습니다!');
    }
  } catch (err: any) {
    alert('링크 생성 실패: ' + (err.response?.data?.message || err.message));
  }
};

const copyReportUrl = () => {
  if (!levelTestReportUrl.value) return;
  navigator.clipboard.writeText(levelTestReportUrl.value);
  showToast('링크가 복사되었습니다!');
};

// ========== 레이더 차트 ==========
const drawRadarChart = async () => {
  if (!radarChartCanvas.value || !reportData.value) return;

  const { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } = await import('chart.js');
  Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  const validParts = reportData.value.score.parts.filter((p: any) => p.name);
  const labels = validParts.map((p: any) => p.name);
  const scores = validParts.map((p: any) => {
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
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: partColors.slice(0, validParts.length),
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

// ========== 안내 발송 ==========
const getSendStatus = (reservationId: number): string => {
  return sendStatusMap.value[reservationId] || '';
};

const fetchSendStatus = async () => {
  try {
    const res = await kakaoApi.getReservationSendStatus();
    if (res.data.success && res.data.data) {
      const map: Record<number, string> = {};
      res.data.data.forEach((item: any) => {
        map[item.reservation_id] = item.send_status;
      });
      sendStatusMap.value = map;
    }
  } catch (err) {
    console.error('발송 상태 조회 실패:', err);
  }
};

const sendNotification = async (r: any) => {
  if (!r.parent_phone) {
    alert('학부모 연락처가 등록되지 않았습니다.');
    return;
  }
  if (!confirm(`${r.name} 학부모님에게 방문 예약 안내 알림톡을 발송하시겠습니까?`)) return;

  sendStatusMap.value[r.id] = 'sending';
  try {
    const res = await kakaoApi.sendReservationNotification(r.id);
    if (res.data.success) {
      sendStatusMap.value[r.id] = 'success';
      showToast(`${r.name} 학부모님에게 안내 알림톡이 발송되었습니다.`);
    } else {
      sendStatusMap.value[r.id] = 'fail';
      showToast(`발송 실패: ${res.data.message}`);
    }
  } catch (err: any) {
    sendStatusMap.value[r.id] = 'fail';
    alert('발송 실패: ' + (err.response?.data?.message || err.message));
  }
};

const showToast = (msg: string) => {
  toastMsg.value = msg;
  setTimeout(() => toastMsg.value = '', 3000);
};

onMounted(() => {
  fetchReservations();
  fetchSendStatus();
});
</script>

<style scoped>
.bg-primary {
  background-color: #1e3a8a;
}
</style>
