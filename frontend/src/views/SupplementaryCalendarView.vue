<template>
  <div class="max-w-9xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg border p-4 md:p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          🗓 보강 캘린더
        </h3>
        <span class="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-bold">
          이 달 보강 {{ monthlySessions.length }}건
        </span>
      </div>

      <div v-if="loading" class="py-8 text-center text-gray-400 text-sm">
        보강 일정 불러오는 중...
      </div>
      <div v-else>
        <!-- 요일 헤더 -->
        <div class="grid grid-cols-7 text-center text-xs font-bold text-gray-500 mb-2">
          <div v-for="(dow, idx) in weekdays" :key="idx">
            {{ dow }}
          </div>
        </div>

        <!-- 날짜 그리드 -->
        <div class="grid grid-cols-7 gap-1 md:gap-2 mb-4">
          <button
            v-for="day in calendarDays"
            :key="day.date"
            type="button"
            class="border rounded-lg min-h-[80px] md:min-h-[100px] p-1.5 md:p-2 flex flex-col text-left hover:bg-gray-50 transition"
            :class="[
              day.isToday ? 'border-blue-500' : 'border-gray-200',
              !day.inCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
            ]"
            @click="openDayModal(day)"
          >
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-xs md:text-sm font-bold"
                :class="
                  day.isToday
                    ? 'text-blue-600'
                    : day.isHoliday
                      ? 'text-red-500'
                      : 'text-gray-800'
                "
              >
                {{ day.day }}
              </span>
              <span
                v-if="day.sessions.length > 0"
                class="text-[10px] md:text-[11px] text-purple-700 font-bold"
              >
                {{ day.sessions.length }}건
              </span>
            </div>
            <div class="space-y-0.5 md:space-y-1 overflow-hidden">
              <div
                v-for="(s, idx) in day.sessions.slice(0, 2)"
                :key="s.id + '-' + idx"
                class="text-[10px] md:text-xs px-1 py-0.5 rounded bg-purple-50 text-purple-700 truncate"
              >
                {{ formatTimeShort(s.session_date) }}
                · {{ s.class_name || '-' }}
                <span v-if="s.content" class="text-[10px] md:text-[11px] text-purple-900">
                  · {{ (s.content || '').slice(0, 10) }}
                </span>
              </div>
              <div
                v-if="day.sessions.length > 2"
                class="text-[10px] md:text-[11px] text-gray-400"
              >
                외 {{ day.sessions.length - 2 }}건
              </div>
            </div>
          </button>
        </div>

        <!-- 달 이동 네비게이션 (하단 가운데) -->
        <div class="flex justify-center items-center gap-3 mt-2">
          <button
            class="px-3 py-1 text-xs md:text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="goToday"
          >
            오늘
          </button>
          <button
            class="px-3 py-1 text-xs md:text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="changeMonth(-1)"
          >
            이전
          </button>
          <span class="text-xs md:text-sm font-bold text-gray-800">
            {{ currentYear }}년 {{ currentMonth + 1 }}월
          </span>
          <button
            class="px-3 py-1 text-xs md:text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="changeMonth(1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>

    <!-- 날짜 선택 시 보강 등록 모달 -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">
          {{ selectedDateLabel }} 보강 등록
        </h3>

        <div class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">날짜</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">시간</label>
              <div class="flex gap-2">
                <select
                  v-model="timeHour"
                  class="w-1/2 px-3 py-2 border rounded-lg text-sm"
                >
                  <option v-for="h in 24" :key="h" :value="String(h - 1).padStart(2, '0')">
                    {{ String(h - 1).padStart(2, '0') }}시
                  </option>
                </select>
                <select
                  v-model="timeMinute"
                  class="w-1/2 px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="00">00분</option>
                  <option value="30">30분</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">반</label>
              <select
                v-model="form.class_id"
                class="w-full px-3 py-2 border rounded-lg"
                @change="onClassChange"
              >
                <option value="">반 선택</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                  {{ cls.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">담임 선생님</label>
              <select
                v-model="form.teacher_name"
                class="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">선택 안 함</option>
                <option
                  v-for="t in teacherOptions"
                  :key="t"
                  :value="t"
                >
                  {{ t }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-purple-700 mb-1">새 보강 등록</h4>
            <label class="block text-xs font-medium text-gray-600 mb-1">보강 내용</label>
            <input
              v-model="form.content"
              type="text"
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="예: 모의고사 해설 / 문법 보충"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-medium text-gray-600">학생 선택</label>
              <span class="text-[11px] text-gray-500">
                선택 {{ selectedStudentIds.length }}명
              </span>
            </div>
            <div class="border rounded-lg bg-white max-h-56 overflow-y-auto">
              <div
                v-if="!form.class_id"
                class="py-6 text-center text-xs text-gray-400"
              >
                먼저 반을 선택해주세요.
              </div>
              <div
                v-else-if="availableStudents.length === 0"
                class="py-6 text-center text-xs text-gray-400"
              >
                해당 반에 등록된 학생이 없습니다.
              </div>
              <div
                v-else
                v-for="stu in availableStudents"
                :key="stu.id"
                class="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                @click="toggleStudentSelection(stu.id)"
              >
                <input
                  type="checkbox"
                  class="w-4 h-4 mr-2 text-purple-600 rounded"
                  :checked="selectedStudentIds.includes(stu.id)"
                  @change.stop="toggleStudentSelection(stu.id)"
                />
                <span class="text-sm">
                  {{ stu.name }}
                  <span class="text-[11px] text-gray-400 ml-1">
                    ({{ stu.class_name || '반 없음' }})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- 출결 관리 (이 날짜의 기존 보강이 있을 때만) -->
          <div
            v-if="selectedDaySessions.length > 0"
            class="mt-4 pt-4 border-t"
          >
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-medium text-gray-600">
                기존 보강 출결 관리
              </label>
              <span class="text-[11px] text-gray-400">
                {{ selectedDaySessions.length }}개 보강
              </span>
            </div>

            <!-- 세션 선택 버튼 -->
            <div class="flex gap-2 mb-3 overflow-x-auto pb-1">
              <button
                v-for="session in selectedDaySessions"
                :key="session.id"
                type="button"
                class="px-3 py-1.5 rounded-full text-[11px] border font-medium whitespace-nowrap"
                :class="
                  selectedAttendanceSession && selectedAttendanceSession.id === session.id
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                "
                @click="selectAttendanceSession(session)"
              >
                {{ formatTimeShort(session.session_date) }} · {{ session.class_name || '반' }}
              </button>
            </div>

            <!-- 선택된 세션의 정보 + 학생 출결 리스트 -->
            <div
              v-if="selectedAttendanceSession"
              class="border rounded-lg bg-gray-50 p-2 max-h-64 overflow-y-auto"
            >
              <!-- 선택된 기존 보강 기본 정보 -->
              <div class="mb-2 text-[11px] text-gray-700 bg-white rounded px-2 py-1 border border-gray-200">
                <div class="font-semibold text-gray-900">
                  {{ formatTimeShort(selectedAttendanceSession.session_date) }}
                  · {{ selectedAttendanceSession.class_name || '반' }}
                </div>
                <div class="mt-0.5 text-gray-600">
                  {{ selectedAttendanceSession.content || '보강 내용 없음' }}
                  <span
                    v-if="selectedAttendanceSession.teacher_name"
                    class="ml-1 text-gray-400"
                  >
                    / 담임: {{ selectedAttendanceSession.teacher_name }}
                  </span>
                </div>
              </div>

              <div
                v-if="
                  !selectedAttendanceSession.supplementary_students ||
                  selectedAttendanceSession.supplementary_students.length === 0
                "
                class="py-4 text-center text-[11px] text-gray-400"
              >
                참여 학생이 없습니다.
              </div>
              <div
                v-else
                class="space-y-1.5 text-[11px]"
              >
                <div
                  v-for="stu in selectedAttendanceSession.supplementary_students"
                  :key="stu.student_id"
                  class="flex items-center gap-2 bg-white rounded px-2 py-1"
                >
                  <span class="w-24 font-semibold text-gray-800 truncate">
                    {{ stu.students?.name || '학생' }}
                  </span>
                  <select
                    v-model="attendanceMap[stu.student_id].status"
                    class="px-2 py-1 border rounded text-[11px]"
                  >
                    <option value="pending">미정</option>
                    <option value="present">출석</option>
                    <option value="absent">결석</option>
                  </select>
                  <input
                    v-if="attendanceMap[stu.student_id].status === 'absent'"
                    v-model="attendanceMap[stu.student_id].reason"
                    type="text"
                    class="flex-1 px-2 py-1 border rounded text-[11px]"
                    placeholder="결석 사유 (필수)"
                  />
                </div>
              </div>
            </div>

            <!-- 출결 저장 및 알림톡 발송 버튼 -->
            <div
              v-if="selectedAttendanceSession"
              class="flex justify-end gap-2 mt-3"
            >
              <button
                type="button"
                class="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-[11px] font-bold hover:bg-blue-600 disabled:opacity-60"
                :disabled="sendingAlimtalk"
                @click="sendAlimtalk"
              >
                {{ sendingAlimtalk ? '발송 중...' : '보강 알림톡 발송' }}
              </button>
              <button
                type="button"
                class="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 disabled:opacity-60"
                :disabled="attendanceSaving"
                @click="saveAttendance"
              >
                {{ attendanceSaving ? '출결 저장 중...' : '출결 저장' }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            type="button"
            class="px-4 py-2 text-xs rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
            @click="closeModal"
          >
            닫기
          </button>
          <button
            type="button"
            class="px-5 py-2 text-xs rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-60 shadow-sm"
            :disabled="savingSession"
            @click="saveSession"
          >
            {{ savingSession ? '저장 중...' : '보강 등록' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { supplementaryApi, classApi, studentApi, kakaoApi } from '../services/api';

const loading = ref(false);
const monthlySessions = ref<any[]>([]);

// 달력 기준 년/월
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth()); // 0-based

// 요일 표시
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

// YYYY-MM-DD (로컬 기준) 포맷터
const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

// 대한민국 주요 양력 공휴일 (해당 연도 기준)
// * 설/추석 등 음력 공휴일은 필요 시 연도별로 직접 추가하는 방식으로 확장 가능
const holidaySet = computed(() => {
  const y = currentYear.value;
  return new Set<string>([
    `${y}-01-01`, // 신정
    `${y}-03-01`, // 삼일절
    `${y}-05-05`, // 어린이날
    `${y}-06-06`, // 현충일
    `${y}-07-17`, // 제헌절 (요청에 따라 휴일 처리)
    `${y}-08-15`, // 광복절
    `${y}-09-24`, // 추석 연휴 (요청: 9/24)
    `${y}-09-25`, // 추석 연휴 (요청: 9/25)
    `${y}-10-03`, // 개천절
    `${y}-10-09`, // 한글날
    `${y}-12-25` // 성탄절
  ]);
});

// 캘린더용 날짜 배열
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekday = firstDay.getDay(); // 0~6
  const totalDays = lastDay.getDate();

  const days: any[] = [];

  // 앞쪽 빈 칸 (이전 달)
  for (let i = 0; i < startWeekday; i++) {
    const date = new Date(year, month, i - startWeekday + 1);
    days.push(buildDay(date, false));
  }

  // 이번 달
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    days.push(buildDay(date, true));
  }

  // 뒷쪽 빈 칸 (다음 달) - 전체를 6주(42칸)로 맞추기 위해
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].dateObj as Date;
    const date = new Date(last);
    date.setDate(date.getDate() + 1);
    days.push(buildDay(date, false));
  }

  return days;
});

const buildDay = (date: Date, inCurrentMonth: boolean) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const key = formatDateKey(date); // 로컬 기준 YYYY-MM-DD
  const todayKey = formatDateKey(new Date());
  const isToday = key === todayKey;
  const weekday = date.getDay();
  const isHoliday = weekday === 0 || holidaySet.value.has(key); // 일요일 or 지정 공휴일

  const sessions = monthlySessions.value.filter((s: any) =>
    (s.session_date || '').startsWith(key)
  );

  return {
    date: key,
    dateObj: date,
    year,
    month,
    day,
    inCurrentMonth,
    isToday,
    isHoliday,
    sessions
  };
};

// 월간 데이터 로드
const fetchMonthlySessions = async () => {
  try {
    loading.value = true;
    const year = currentYear.value;
    const month = currentMonth.value;

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const res = await supplementaryApi.getDashboardSessions(
      start.toISOString(),
      end.toISOString()
    );

    if (!res.data.success) {
      monthlySessions.value = [];
      return;
    }

    const list = res.data.data || [];
    list.sort(
      (a: any, b: any) =>
        new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
    );
    monthlySessions.value = list;
  } catch (err) {
    console.error('보강 캘린더 데이터 로드 실패:', err);
  } finally {
    loading.value = false;
  }
};

const changeMonth = (delta: number) => {
  const newMonth = currentMonth.value + delta;
  const date = new Date(currentYear.value, newMonth, 1);
  currentYear.value = date.getFullYear();
  currentMonth.value = date.getMonth();
  fetchMonthlySessions();
};

const goToday = () => {
  const now = new Date();
  currentYear.value = now.getFullYear();
  currentMonth.value = now.getMonth();
  fetchMonthlySessions();
};

const formatTimeShort = (dateStr: string) => {
  const d = new Date(dateStr);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// ========== 날짜 선택 / 보강 등록 모달 ==========
const showModal = ref(false);
const selectedDate = ref('');

const classes = ref<any[]>([]);
const availableStudents = ref<any[]>([]);
const selectedStudentIds = ref<number[]>([]);

// 담임 선생님 목록 (기본 리스트 + 모든 반에서 teacher_name 모아서 사용)
const teacherOptions = computed(() => {
  const baseTeachers = ['첼시원장', '댄T', '마이크T'];
  const names = new Set<string>(baseTeachers);
  classes.value.forEach((c: any) => {
    if (c.teacher_name) {
      names.add(c.teacher_name);
    }
  });
  return Array.from(names);
});

// 출결 관리용: 선택된 날짜의 세션들 + 현재 출결 관리 중인 세션
const selectedDaySessions = ref<any[]>([]);
const selectedAttendanceSession = ref<any | null>(null);
const attendanceMap = ref<Record<number, { status: 'pending' | 'present' | 'absent'; reason: string }>>({});
const attendanceSaving = ref(false);
const sendingAlimtalk = ref(false);

const form = ref<{
  class_id: number | '';
  date: string;
  time: string;
  content: string;
  teacher_name: string;
}>({
  class_id: '',
  date: '',
  time: '14:00',
  content: '',
  teacher_name: ''
});

// 시간 선택 (30분 단위 전용)
const timeHour = ref('14');
const timeMinute = ref<'00' | '30'>('00');

const savingSession = ref(false);

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return '';

  // 'YYYY-MM-DD' 문자열을 로컬 Date 로 변환 (UTC 파싱으로 인한 -1일 오차 방지)
  const parts = selectedDate.value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return selectedDate.value;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${y}-${m}-${day} (${dow})`;
});

const openDayModal = (day: any) => {
  selectedDate.value = day.date;
  form.value.date = day.date;
  timeHour.value = '14';
  timeMinute.value = '00';
  form.value.time = '14:00';
  form.value.content = '';
  form.value.class_id = '';
  form.value.teacher_name = '';
  selectedStudentIds.value = [];
  availableStudents.value = [];

  // 출결 관리용 데이터 초기화
  selectedDaySessions.value = day.sessions || [];
  if (selectedDaySessions.value.length > 0) {
    selectAttendanceSession(selectedDaySessions.value[0]);
  } else {
    selectedAttendanceSession.value = null;
    attendanceMap.value = {};
  }

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const fetchClasses = async () => {
  try {
    const res = await classApi.getAll();
    if (res.data.success) {
      classes.value = res.data.data || [];
    }
  } catch (err) {
    console.error('반 목록 로드 실패:', err);
  }
};

const onClassChange = async () => {
  selectedStudentIds.value = [];
  availableStudents.value = [];
  if (!form.value.class_id) return;

  try {
    const cls = classes.value.find((c: any) => c.id === form.value.class_id);
    if (!cls) return;

    // 반을 선택하면 기본 담임 선생님을 그 반의 teacher_name 으로 설정
    form.value.teacher_name = cls.teacher_name || '';
    const res = await studentApi.getAll({ class_name: cls.name });
    if (res.data.success) {
      availableStudents.value = res.data.data || [];
    }
  } catch (err) {
    console.error('학생 목록 로드 실패:', err);
  }
};

const toggleStudentSelection = (id: number) => {
  const idx = selectedStudentIds.value.indexOf(id);
  if (idx === -1) selectedStudentIds.value.push(id);
  else selectedStudentIds.value.splice(idx, 1);
};

const selectAttendanceSession = (session: any) => {
  selectedAttendanceSession.value = session;
  const map: Record<number, { status: 'pending' | 'present' | 'absent'; reason: string }> = {};
  (session.supplementary_students || []).forEach((s: any) => {
    map[s.student_id] = {
      status: (s.attendance_status as 'pending' | 'present' | 'absent') || 'pending',
      reason: s.absent_reason || ''
    };
  });
  attendanceMap.value = map;
};

const saveAttendance = async () => {
  if (!selectedAttendanceSession.value) return;
  const session = selectedAttendanceSession.value;
  const students = session.supplementary_students || [];

  // 결석인데 사유 없는 학생이 있는지 먼저 체크
  for (const stu of students) {
    const entry = attendanceMap.value[stu.student_id];
    if (!entry) continue;
    if (entry.status === 'absent' && !entry.reason.trim()) {
      alert(`'${stu.students?.name || '학생'}' 결석 사유를 입력해주세요.`);
      return;
    }
  }

  try {
    attendanceSaving.value = true;

    for (const stu of students) {
      const entry = attendanceMap.value[stu.student_id];
      if (!entry) continue;

      await supplementaryApi.updateAttendance(session.id, stu.student_id, {
        attendance_status: entry.status,
        absent_reason: entry.status === 'absent' ? entry.reason.trim() : undefined
      });
    }

    // 저장 후, 월간 데이터 다시 불러와서 화면에도 반영
    await fetchMonthlySessions();

    // 현재 선택된 날짜에 해당하는 세션 목록 재계산
    if (selectedDate.value) {
      const key = selectedDate.value;
      const sessionsForDate = monthlySessions.value.filter((s: any) =>
        (s.session_date || '').startsWith(key)
      );
      selectedDaySessions.value = sessionsForDate;

      const updated = sessionsForDate.find((s: any) => s.id === session.id);
      if (updated) {
        selectAttendanceSession(updated);
      }
    }

    alert('출결이 저장되었습니다.');
  } catch (err: any) {
    console.error('출결 저장 실패:', err);
    alert(err.response?.data?.message || '출결 저장 중 오류가 발생했습니다.');
  } finally {
    attendanceSaving.value = false;
  }
};

const sendAlimtalk = async () => {
  if (!selectedAttendanceSession.value) return;
  
  const session = selectedAttendanceSession.value;
  const studentCount = (session.supplementary_students || []).length;
  
  if (studentCount === 0) {
    alert('보강 참여 학생이 없습니다.');
    return;
  }
  
  if (!confirm(`보강 알림톡을 ${studentCount}명에게 발송하시겠습니까?`)) {
    return;
  }
  
  try {
    sendingAlimtalk.value = true;
    const res = await kakaoApi.sendSupplementaryNotification(session.id);
    
    if (res.data.success) {
      const { successCount, failCount } = res.data.data;
      alert(`보강 알림톡 발송 완료\n성공: ${successCount}건, 실패: ${failCount}건`);
    } else {
      alert(`알림톡 발송 실패: ${res.data.message || '알 수 없는 오류'}`);
    }
  } catch (err: any) {
    console.error('알림톡 발송 오류:', err);
    alert(`알림톡 발송 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
  } finally {
    sendingAlimtalk.value = false;
  }
};

// 시간 시/분 선택이 바뀔 때마다 form.time 을 "HH:MM" 형식으로 동기화
watch(
  [timeHour, timeMinute],
  () => {
    const h = timeHour.value.padStart(2, '0');
    const m = timeMinute.value;
    form.value.time = `${h}:${m}`;
  },
  { immediate: true }
);

const saveSession = async () => {
  if (!form.value.class_id) {
    alert('반을 선택해주세요.');
    return;
  }
  if (!form.value.date || !form.value.time) {
    alert('보강 날짜와 시간을 모두 입력해주세요.');
    return;
  }
  if (!form.value.content.trim()) {
    alert('보강 내용을 입력해주세요.');
    return;
  }

  try {
    savingSession.value = true;
    const dateTime = `${form.value.date}T${form.value.time}:00+09:00`;
    const res = await supplementaryApi.createSession({
      class_id: form.value.class_id,
      session_date: dateTime,
      content: form.value.content.trim(),
      teacher_name: form.value.teacher_name || null,
      student_ids: selectedStudentIds.value
    });
    if (res.data.success) {
      alert('보강 일정이 등록되었습니다.');
      await fetchMonthlySessions();
      closeModal();
    } else {
      alert(res.data.message || '보강 등록에 실패했습니다.');
    }
  } catch (err: any) {
    alert(err.response?.data?.message || '보강 등록 중 오류가 발생했습니다.');
  } finally {
    savingSession.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchMonthlySessions(), fetchClasses()]);
});
</script>

<style scoped>
</style>

