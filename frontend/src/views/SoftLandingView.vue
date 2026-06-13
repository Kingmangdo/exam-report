<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">신입생 소프트랜딩</h2>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">데이터를 불러오는 중입니다...</p>
    </div>

    <div v-else>
      <!-- 요약 대시보드 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="text-xs font-medium text-gray-500 mb-1">전체 대상</h4>
          <p class="text-2xl font-bold text-primary">{{ summary.total }}<span class="text-sm text-gray-400 ml-1">명</span></p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="text-xs font-medium text-gray-500 mb-1">이번 주 예정</h4>
          <p class="text-2xl font-bold text-blue-600">{{ summary.thisWeek }}<span class="text-sm text-gray-400 ml-1">건</span></p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="text-xs font-medium text-gray-500 mb-1">지연 건수</h4>
          <p class="text-2xl font-bold text-red-600">{{ summary.delayed }}<span class="text-sm text-gray-400 ml-1">건</span></p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="text-xs font-medium text-gray-500 mb-1">고등 연계 추천</h4>
          <p class="text-2xl font-bold text-purple-600">{{ summary.recommended }}<span class="text-sm text-gray-400 ml-1">명</span></p>
        </div>
      </div>

      <!-- 필터 -->
      <div class="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div class="flex items-center gap-2">
          <label class="text-sm font-bold text-gray-700">학교급</label>
          <select v-model="filterSchoolLevel" class="px-3 py-1.5 border rounded text-sm focus:outline-none focus:border-primary">
            <option value="all">전체</option>
            <option value="middle">중등</option>
            <option value="high">고등</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-bold text-gray-700">상태</label>
          <select v-model="filterStatus" class="px-3 py-1.5 border rounded text-sm focus:outline-none focus:border-primary">
            <option value="all">전체보기</option>
            <option value="phase1">2주 대기</option>
            <option value="phase2">6주 대기</option>
            <option value="phase3">10주 대기</option>
            <option value="done">완료됨</option>
            <option value="delayed">상담 지연</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" v-model="showExcluded" class="rounded text-primary focus:ring-primary" />
            <span>제외된 학생 표시</span>
          </label>
        </div>
      </div>

      <!-- 메인 화면 분할 (목록 / 상세) -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 좌측: 학생 목록 -->
        <div class="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[600px]">
          <div class="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <h3 class="font-bold text-gray-700">대상 학생 목록</h3>
            <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{{ filteredStudents.length }}명</span>
          </div>
          <div class="flex-1 overflow-y-auto divide-y divide-gray-100">
            <div 
              v-for="student in filteredStudents" 
              :key="student.id"
              @click="selectStudent(student)"
              class="p-4 cursor-pointer hover:bg-blue-50 transition-colors"
              :class="{'bg-blue-50 border-l-4 border-primary': selectedStudent?.id === student.id}"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800">{{ student.name }}</span>
                  <span class="text-xs text-gray-500">{{ student.school }} {{ student.grade }}</span>
                </div>
                <!-- 상태 뱃지 표시 -->
                <span v-if="student.isExcluded" class="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">제외됨</span>
                <span v-else-if="student.statusBadge === '지연'" class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">지연</span>
                <span v-else-if="student.statusBadge === '완료'" class="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded font-bold">완료</span>
                <span v-else class="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">{{ student.statusBadge }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-gray-500">입학: {{ formatDate(student.created_at) }}</span>
                <div class="flex items-center gap-1">
                  <!-- 단계 진행 표시 (점 3개) -->
                  <div class="flex gap-1">
                    <div class="w-2 h-2 rounded-full" :class="getPhaseDotClass(student, 1)"></div>
                    <div class="w-2 h-2 rounded-full" :class="getPhaseDotClass(student, 2)"></div>
                    <div class="w-2 h-2 rounded-full" :class="getPhaseDotClass(student, 3)"></div>
                  </div>
                </div>
              </div>
              <!-- 고등 연계 추천 뱃지 -->
              <div v-if="student.isRecommended" class="mt-2 text-right">
                <span class="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">⭐ 고등 연계 추천</span>
              </div>
            </div>
            
            <div v-if="filteredStudents.length === 0" class="p-8 text-center text-gray-400">
              조건에 맞는 학생이 없습니다.
            </div>
          </div>
        </div>

        <!-- 우측: 상세 정보 패널 -->
        <div class="w-full lg:w-2/3">
          <div v-if="!selectedStudent" class="bg-white rounded-xl shadow-sm border h-full min-h-[400px] flex items-center justify-center text-gray-400">
            학생을 선택하면 상세 정보가 표시됩니다.
          </div>
          
          <div v-else class="bg-white rounded-xl shadow-sm border flex flex-col">
            <!-- 상단 헤더 -->
            <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-bold text-gray-800">{{ selectedStudent.name }}</h3>
                <span class="text-sm text-gray-500">{{ selectedStudent.school }} {{ selectedStudent.grade }}</span>
                <span class="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">입학일: {{ formatDate(selectedStudent.created_at) }}</span>
              </div>
              <button 
                @click="openExcludeModal" 
                class="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
              >
                {{ selectedStudent.isExcluded ? '제외 취소(복구)' : '소프트랜딩 제외' }}
              </button>
            </div>
            
            <!-- 입학 레벨 입력 (항상 표시) -->
            <div class="px-6 py-3 border-b flex items-center gap-4 bg-yellow-50">
              <span class="text-sm font-bold text-gray-700">📌 초기 입학 레벨:</span>
              <div class="flex-1 max-w-xs flex gap-2">
                <input 
                  type="text" 
                  v-model="initialLevel" 
                  placeholder="예: 중등 기초, B1 등"
                  class="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:border-primary"
                />
                <button 
                  @click="saveInitialLevel" 
                  class="px-3 py-1.5 bg-white border rounded text-sm hover:bg-gray-50 font-medium"
                >저장
                </button>
              </div>
            </div>

            <!-- 탭 (2주 / 6주 / 10주) -->
            <div class="flex border-b px-6 pt-4 space-x-6">
              <button 
                v-for="phase in [1, 2, 3]" :key="phase"
                @click="activePhase = phase"
                class="pb-2 text-sm font-bold border-b-2 transition-colors"
                :class="activePhase === phase ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
              >
                {{ phase === 1 ? '2주차' : phase === 2 ? '6주차' : '10주차' }} 상담
                <span v-if="getCheckpoint(phase)?.status === 'done'" class="text-green-500 ml-1">✓</span>
              </button>
            </div>

            <!-- 탭 내용 -->
            <div class="p-6 flex-1 overflow-y-auto">
              <!-- 제외된 학생 안내 -->
              <div v-if="selectedStudent.isExcluded" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                <strong>제외된 학생입니다.</strong> (사유: {{ selectedStudent.excludedReason }})
              </div>

              <!-- 상담 예정일 안내 -->
              <div class="flex items-center gap-2 mb-6">
                <span class="text-sm font-bold text-gray-700">예정일:</span>
                <span class="text-sm px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">
                  {{ formatDate(getScheduledDate(selectedStudent.created_at, activePhase)) }}
                </span>
                <span v-if="isDelayed(selectedStudent, activePhase)" class="text-xs text-red-500 font-bold ml-2">⚠️ 지연됨</span>
              </div>

              <!-- 평가 폼 -->
              <div class="space-y-6">
                <!-- 평가 항목 (1~5점) -->
                <div>
                  <h4 class="text-sm font-bold text-gray-800 mb-3 border-l-4 border-primary pl-2">항목별 평가</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div v-for="item in getCriteriaList(activePhase)" :key="item.key" class="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span class="text-sm text-gray-600">{{ item.label }}</span>
                      <select v-model.number="currentCheckpoint.ratings[item.key]" class="text-sm border p-1 rounded">
                        <option value="0">선택</option>
                        <option v-for="n in 5" :key="n" :value="n">{{ n }}점</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- 현재 성적 트래킹 (2,3단계) -->
                <div v-if="activePhase > 1">
                  <h4 class="text-sm font-bold text-gray-800 mb-3 border-l-4 border-primary pl-2">성적 트래킹</h4>
                  <div class="flex items-center gap-4">
                    <input type="number" v-model.number="currentCheckpoint.english_score" placeholder="현재 점수/레벨" class="px-3 py-2 border rounded text-sm w-32" />
                    <span v-if="initialLevel && currentCheckpoint.english_score" class="text-sm text-blue-600 font-bold">
                      💡 입학 대비 변화: {{ initialLevel }} ➡️ {{ currentCheckpoint.english_score }}
                    </span>
                  </div>
                </div>

                <!-- 중등부 전용 고등 연계 추천 (3단계) -->
                <div v-if="activePhase === 3 && isMiddleSchool(selectedStudent.grade)" class="bg-purple-50 p-4 rounded-lg">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="currentCheckpoint.high_school_readiness" class="w-4 h-4 text-purple-600 rounded" />
                    <span class="font-bold text-purple-800 text-sm">고등 연계 추천 (이 학생은 고등 과정까지 원활한 연계가 가능합니다)</span>
                  </label>
                </div>

                <!-- 메모 입력 -->
                <div>
                  <h4 class="text-sm font-bold text-gray-800 mb-3 border-l-4 border-primary pl-2">상담 메모</h4>
                  <div class="space-y-3">
                    <textarea v-model="currentCheckpoint.teacher_memo" rows="2" placeholder="교사용 메모 (내부용)" class="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary"></textarea>
                    <textarea v-model="currentCheckpoint.focus_memo" rows="2" placeholder="집중 케어 사항" class="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary"></textarea>
                    <textarea v-model="currentCheckpoint.parent_memo" rows="3" placeholder="학부모 상담 내용 (리포트에 활용됨)" class="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary"></textarea>
                  </div>
                </div>
                
                <!-- 상담 방법 및 상태 -->
                <div class="flex items-center justify-between pt-4 border-t">
                  <div class="flex items-center gap-2">
                    <select v-model="currentCheckpoint.consult_method" class="text-sm border px-3 py-2 rounded focus:outline-none">
                      <option value="">상담 방법</option>
                      <option value="전화상담">전화상담</option>
                      <option value="대면상담">대면상담</option>
                      <option value="카카오메시지">카카오메시지</option>
                    </select>
                    <select v-model="currentCheckpoint.status" class="text-sm border px-3 py-2 rounded focus:outline-none" :class="currentCheckpoint.status === 'done' ? 'bg-green-50 text-green-700 font-bold' : ''">
                      <option value="pending">진행 전</option>
                      <option value="done">상담 완료</option>
                    </select>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <button @click="saveCheckpoint" class="px-4 py-2 bg-gray-800 text-white rounded font-bold hover:bg-gray-700 transition text-sm">
                      저장하기
                    </button>
                    <button 
                      @click="openReportModal" 
                      class="px-4 py-2 bg-yellow-400 text-yellow-900 rounded font-bold hover:bg-yellow-500 transition text-sm flex items-center gap-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                      학부모 리포트 생성
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 제외 처리 모달 -->
    <div v-if="showExcludeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-[400px] max-w-full p-6">
        <h3 class="text-lg font-bold mb-4">{{ selectedStudent?.isExcluded ? '제외 취소 (복구)' : '소프트랜딩 대상 제외' }}</h3>
        
        <div v-if="!selectedStudent?.isExcluded">
          <p class="text-sm text-gray-600 mb-4">이 학생을 소프트랜딩 관리 대상에서 제외합니다.</p>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">제외 사유</label>
            <select v-model="excludeReason" class="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary mb-2">
              <option value="재입학생 (이미 적응 완료)">재입학생 (이미 적응 완료)</option>
              <option value="전학생">전학생</option>
              <option value="보호자 요청">보호자 요청</option>
              <option value="직접 입력">직접 입력...</option>
            </select>
            <input 
              v-if="excludeReason === '직접 입력'" 
              type="text" 
              v-model="excludeReasonCustom" 
              placeholder="사유를 입력하세요"
              class="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary" 
            />
          </div>
        </div>
        <div v-else>
          <p class="text-sm text-gray-600 mb-4">이 학생을 다시 소프트랜딩 관리 대상으로 복구하시겠습니까?</p>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button @click="showExcludeModal = false" class="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm font-bold">취소</button>
          <button @click="confirmExclusion" class="px-4 py-2 rounded text-white text-sm font-bold" :class="selectedStudent?.isExcluded ? 'bg-primary hover:bg-primary-dark' : 'bg-red-600 hover:bg-red-700'">
            {{ selectedStudent?.isExcluded ? '복구하기' : '제외하기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 학부모 리포트(알림톡) 생성 모달 -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-[500px] max-w-full flex flex-col max-h-[90vh]">
        <div class="p-6 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800">학부모 리포트 자동 생성</h3>
          <button @click="showReportModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1">
          <p class="text-sm text-gray-600 mb-4">
            입력하신 평가 내용과 메모를 바탕으로 카카오 알림톡(상담 안내 템플릿)으로 발송할 내용을 자동 생성했습니다. 수정 후 발송하세요.
          </p>
          <textarea 
            v-model="reportContent" 
            rows="10" 
            class="w-full p-4 border rounded-lg text-sm bg-yellow-50 focus:outline-none focus:border-yellow-400 font-medium leading-relaxed resize-none"
          ></textarea>
        </div>
        
        <div class="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button @click="showReportModal = false" class="px-4 py-2 border bg-white rounded text-gray-600 hover:bg-gray-100 text-sm font-bold">닫기</button>
          <button @click="copyReport" class="px-4 py-2 border border-primary text-primary bg-blue-50 rounded hover:bg-blue-100 text-sm font-bold transition">내용 복사</button>
          <button @click="sendAlimtalk" class="px-4 py-2 bg-[#FEE500] text-gray-900 rounded font-bold hover:bg-[#F4DC00] transition text-sm flex items-center gap-1">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-5.52 0-10 3.52-10 7.84 0 2.76 1.76 5.17 4.54 6.57-.4 1.48-1.5 5.3-.06 5.14 1.18-.14 4.58-3.08 6.44-4.32.36.03.72.05 1.08.05 5.52 0 10-3.52 10-7.84C24 6.52 19.52 3 12 3z"/></svg>
            알림톡 발송하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { softLandingApi, kakaoApi } from '../services/api';

// 상태 변수
const loading = ref(true);
const studentsRaw = ref<any[]>([]);
const filterSchoolLevel = ref('all');
const filterStatus = ref('all');
const showExcluded = ref(false);

const selectedStudent = ref<any>(null);
const activePhase = ref(1);
const initialLevel = ref('');
const currentCheckpoint = ref<any>({ ratings: {} });

const showExcludeModal = ref(false);
const excludeReason = ref('재입학생 (이미 적응 완료)');
const excludeReasonCustom = ref('');

const showReportModal = ref(false);
const reportContent = ref('');

// 중등 여부 판별 유틸
const isMiddleSchool = (grade: string) => {
  if (!grade) return false;
  return grade.includes('중') || grade.includes('M') || grade.includes('middle');
};

// 날짜 유틸
const addDays = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

const getScheduledDate = (enrolledAt: string, phase: number) => {
  const days = phase === 1 ? 14 : phase === 2 ? 42 : 70;
  return addDays(enrolledAt, days);
};

// 지연 판별
const isDelayed = (student: any, phase: number) => {
  const cp = student.checkpoints?.find((c: any) => c.phase === phase);
  if (cp?.status === 'done') return false;
  
  const scheduled = getScheduledDate(student.created_at, phase);
  const today = new Date().toISOString().split('T')[0];
  return scheduled < today;
};

// 학생별 현재 진행 단계 판별
const getCurrentPhaseAndStatus = (student: any) => {
  if (student.soft_landing_settings?.excluded) {
    return { phase: 0, badge: '제외됨', isDelayed: false };
  }
  
  const cps = student.checkpoints || [];
  const p1 = cps.find((c: any) => c.phase === 1);
  const p2 = cps.find((c: any) => c.phase === 2);
  const p3 = cps.find((c: any) => c.phase === 3);

  if (!p1 || p1.status !== 'done') {
    return { phase: 1, badge: '2주 예정', isDelayed: isDelayed(student, 1) };
  }
  if (!p2 || p2.status !== 'done') {
    return { phase: 2, badge: '6주 예정', isDelayed: isDelayed(student, 2) };
  }
  if (!p3 || p3.status !== 'done') {
    return { phase: 3, badge: '10주 예정', isDelayed: isDelayed(student, 3) };
  }
  return { phase: 4, badge: '완료', isDelayed: false };
};

// API 데이터 로딩 및 가공
const fetchStudents = async () => {
  loading.value = true;
  try {
    const res = await softLandingApi.getStudents();
    if (res.data.success) {
      studentsRaw.value = res.data.data.map(s => {
        const settings = s.soft_landing_settings || {};
        const checkpoints = s.soft_landing_checkpoints || [];
        const currentInfo = getCurrentPhaseAndStatus({ ...s, checkpoints, soft_landing_settings: settings });
        
        return {
          id: s.id,
          name: s.name,
          school: s.school,
          grade: s.grade,
          class_name: s.class_name || '',
          created_at: s.created_at,
          isExcluded: settings.excluded || false,
          excludedReason: settings.excluded_reason,
          initialLevel: settings.initial_level || '',
          checkpoints: checkpoints,
          currentPhase: currentInfo.phase,
          statusBadge: currentInfo.isDelayed ? '지연' : currentInfo.badge,
          isRecommended: checkpoints.some((c: any) => c.phase === 3 && c.high_school_readiness)
        };
      });
    }
  } catch (error) {
    console.error('소프트랜딩 대상 불러오기 실패:', error);
  } finally {
    loading.value = false;
  }
};

// 필터링 적용
const filteredStudents = computed(() => {
  return studentsRaw.value.filter(s => {
    // 1. 학교급
    if (filterSchoolLevel.value === 'middle' && !isMiddleSchool(s.grade)) return false;
    if (filterSchoolLevel.value === 'high' && isMiddleSchool(s.grade)) return false;
    
    // 2. 제외
    if (!showExcluded.value && s.isExcluded) return false;

    // 3. 상태
    if (filterStatus.value !== 'all') {
      if (filterStatus.value === 'phase1' && s.currentPhase !== 1) return false;
      if (filterStatus.value === 'phase2' && s.currentPhase !== 2) return false;
      if (filterStatus.value === 'phase3' && s.currentPhase !== 3) return false;
      if (filterStatus.value === 'done' && s.currentPhase !== 4) return false;
      if (filterStatus.value === 'delayed' && s.statusBadge !== '지연') return false;
    }
    
    return true;
  });
});

// 요약 계산
const summary = computed(() => {
  const nonExcluded = studentsRaw.value.filter(s => !s.isExcluded);
  
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const todayStr = today.toISOString().split('T')[0];
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  let thisWeek = 0;
  let delayed = 0;
  let recommended = 0;

  nonExcluded.forEach(s => {
    if (s.isRecommended) recommended++;
    if (s.statusBadge === '지연') delayed++;
    else if (s.currentPhase >= 1 && s.currentPhase <= 3) {
      const scheduled = getScheduledDate(s.created_at, s.currentPhase);
      if (scheduled >= todayStr && scheduled <= nextWeekStr) thisWeek++;
    }
  });

  return { total: nonExcluded.length, thisWeek, delayed, recommended };
});

// 점 표시 스타일
const getPhaseDotClass = (student: any, phase: number) => {
  const cp = student.checkpoints.find((c: any) => c.phase === phase);
  if (cp?.status === 'done') return 'bg-green-500'; // 완료
  if (isDelayed(student, phase)) return 'bg-red-500'; // 지연
  if (student.currentPhase === phase) return 'bg-blue-500'; // 진행중
  return 'bg-gray-300'; // 대기
};

// 학생 선택
const selectStudent = (student: any) => {
  selectedStudent.value = student;
  activePhase.value = Math.min(student.currentPhase || 1, 3);
  if (activePhase.value === 0) activePhase.value = 1; // 제외된 학생 기본값
  initialLevel.value = student.initialLevel;
  loadCheckpointForm();
};

const getCheckpoint = (phase: number) => {
  if (!selectedStudent.value) return null;
  return selectedStudent.value.checkpoints.find((c: any) => c.phase === phase);
};

const loadCheckpointForm = () => {
  const cp = getCheckpoint(activePhase.value);
  if (cp) {
    currentCheckpoint.value = { ...cp, ratings: { ...cp.ratings } };
  } else {
    currentCheckpoint.value = { 
      status: 'pending', 
      consult_method: '', 
      ratings: {}, 
      teacher_memo: '', 
      focus_memo: '', 
      parent_memo: '',
      english_score: null,
      high_school_readiness: false
    };
  }
};

watch(activePhase, () => loadCheckpointForm());

// 초기 레벨 저장
const saveInitialLevel = async () => {
  if (!selectedStudent.value) return;
  try {
    await softLandingApi.updateInitialLevel(selectedStudent.value.id, initialLevel.value);
    selectedStudent.value.initialLevel = initialLevel.value;
    alert('초기 레벨이 저장되었습니다.');
  } catch (error) {
    console.error('레벨 저장 실패', error);
  }
};

// 체크포인트 저장
const saveCheckpoint = async () => {
  if (!selectedStudent.value) return;
  try {
    await softLandingApi.upsertCheckpoint(selectedStudent.value.id, activePhase.value, currentCheckpoint.value);
    alert('상담 기록이 저장되었습니다.');
    await fetchStudents(); // 데이터 재로딩하여 상태 업데이트
    
    // 재선택 유지
    const updated = studentsRaw.value.find(s => s.id === selectedStudent.value.id);
    if (updated) selectStudent(updated);
  } catch (error) {
    console.error('체크포인트 저장 실패', error);
  }
};

// 제외 처리
const openExcludeModal = () => {
  excludeReason.value = '재입학생 (이미 적응 완료)';
  excludeReasonCustom.value = '';
  showExcludeModal.value = true;
};

const confirmExclusion = async () => {
  if (!selectedStudent.value) return;
  const isExcluding = !selectedStudent.value.isExcluded;
  const reason = excludeReason.value === '직접 입력' ? excludeReasonCustom.value : excludeReason.value;
  
  try {
    await softLandingApi.updateExclusion(selectedStudent.value.id, isExcluding, isExcluding ? reason : undefined);
    showExcludeModal.value = false;
    await fetchStudents();
    selectedStudent.value = null; // 선택 해제
  } catch (error) {
    console.error('제외 처리 실패', error);
  }
};

// 학부모 리포트 (알림톡 텍스트) 생성
const openReportModal = async () => {
  if (!selectedStudent.value) return;

  const phaseName = activePhase.value === 1 ? '2주차' : activePhase.value === 2 ? '6주차' : '10주차';
  const name = selectedStudent.value.name;
  
  try {
    const phoneLast4 = selectedStudent.value.parent_phone ? selectedStudent.value.parent_phone.slice(-4) : '0000';
    // 서버에 리포트 링크 생성 요청
    const res = await softLandingApi.generateReportLink(
      selectedStudent.value.id,
      activePhase.value,
      name,
      phoneLast4
    );

    if (res.data.success) {
      const linkUrl = window.location.origin + res.data.data.url;
      reportContent.value = `[신입생 소프트랜딩 ${phaseName} 안내]\n\n${name} 학생이 학원에 등원한 지 ${phaseName}가 되었습니다.\n학생의 학원 적응도와 종합적인 안내 리포트를 준비했습니다.\n\n아래 링크를 눌러 꼼꼼하게 작성된 우리 아이의 소프트랜딩 성적표를 확인해 보세요!\n\n▶ 리포트 확인하기\n${linkUrl}\n\n앞으로도 ${name} 학생이 목표를 이룰 수 있도록 최선을 다해 지도하겠습니다.\n감사합니다.`;
      showReportModal.value = true;
    } else {
      alert('리포트 링크 생성에 실패했습니다.');
    }
  } catch (error) {
    console.error('리포트 링크 생성 실패', error);
    alert('오류가 발생했습니다.');
  }
};

const copyReport = () => {
  navigator.clipboard.writeText(reportContent.value);
  alert('내용이 클립보드에 복사되었습니다. 카카오톡이나 문자로 붙여넣기 하세요.');
};

const sendAlimtalk = async () => {
  const name = selectedStudent.value.name;
  const content = reportContent.value;
  
  const isConfirm = confirm(`${name} 학부모님께 상담 안내 알림톡을 발송하시겠습니까?`);
  if (!isConfirm) return;
  
  try {
    const res = await kakaoApi.sendCounselingNotification({
      student_id: selectedStudent.value.id,
      class_name: selectedStudent.value.class_name || '신입생반',
      date: formatDate(new Date().toISOString()),
      content: content,
      targets: ['parent']
    });
    
    if (res.data.success) {
      alert('알림톡 발송 요청이 완료되었습니다.');
      // 발송 여부 기록 업데이트
      currentCheckpoint.value.parent_report_sent = true;
      await saveCheckpoint();
      showReportModal.value = false;
    } else {
      alert(`알림톡 발송에 실패했습니다: ${res.data.message}`);
    }
  } catch (error: any) {
    console.error('발송 에러', error);
    alert('발송 중 오류가 발생했습니다.');
  }
};

// 단계별 평가 항목 정의
const getCriteriaList = (phase: number) => {
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
};

onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
/* 커스텀 스크롤바 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>