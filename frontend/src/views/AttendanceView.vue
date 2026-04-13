<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">출결 관리</h2>
    </div>

    <!-- 탭 -->
    <div class="flex border-b border-gray-200 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
        :class="activeTab === tab.id
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 탭1: 출결 현황 (캘린더) -->
    <div v-if="activeTab === 'status'" class="space-y-4">
      <div class="bg-white rounded-xl shadow-sm border p-6">
        <div class="flex items-center justify-between mb-6">
          <button @click="prevMonth" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold text-sm">&lt;</button>
          <h3 class="text-xl font-bold text-gray-800">{{ calendarYear }}년 {{ calendarMonth }}월</h3>
          <button @click="nextMonth" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold text-sm">&gt;</button>
        </div>

        <!-- 요일 헤더 -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div v-for="day in ['일','월','화','수','목','금','토']" :key="day" class="text-center text-xs font-bold text-gray-500 py-2">
            {{ day }}
          </div>
        </div>

        <!-- 달력 -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(cell, idx) in calendarCells"
            :key="idx"
            class="min-h-[90px] border rounded-lg p-1.5 relative cursor-pointer hover:bg-gray-50 transition"
            :class="{
              'bg-white': cell.day,
              'bg-gray-50': !cell.day,
              'ring-2 ring-primary': cell.isToday
            }"
            @click="cell.day && viewDateDetail(cell.dateStr)"
          >
            <div v-if="cell.day" class="text-xs font-bold mb-1" :class="{ 'text-red-500': cell.dayOfWeek === 0, 'text-blue-500': cell.dayOfWeek === 6 }">
              {{ cell.day }}
            </div>
            <div v-if="cell.day && cell.summary" class="space-y-0.5">
              <div v-if="cell.summary.present > 0" class="text-[10px] font-bold text-green-600 bg-green-50 rounded px-1 py-0.5 truncate">
                출석 {{ cell.summary.present }}명
              </div>
              <div v-if="cell.summary.absent > 0" class="text-[10px] font-bold text-red-600 bg-red-50 rounded px-1 py-0.5 truncate">
                결석 {{ cell.summary.absent }}명
              </div>
              <div v-if="cell.summary.late > 0" class="text-[10px] font-bold text-yellow-600 bg-yellow-50 rounded px-1 py-0.5 truncate">
                지각 {{ cell.summary.late }}명
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 날짜 클릭 시 상세 모달 -->
      <div v-if="selectedDateDetail" class="bg-white rounded-xl shadow-sm border p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800">{{ selectedDateDetail }} 출결 상세</h3>
          <button @click="selectedDateDetail = ''" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <div v-if="dateDetailLoading" class="text-center py-8 text-gray-500">로딩 중...</div>
        <div v-else-if="dateDetailData.length === 0" class="text-center py-8 text-gray-400">출결 기록이 없습니다.</div>
        <div v-else>
          <div v-for="(group, className) in dateDetailGrouped" :key="className" class="mb-4">
            <div class="font-bold text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-t-lg border-b">{{ className }}</div>
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in group" :key="row.student_id" class="border-b border-gray-100">
                  <td class="px-3 py-2 font-bold">{{ row.students?.name }}</td>
                  <td class="px-3 py-2">
                    <span :class="statusColor(row.status)" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ row.status }}</span>
                  </td>
                  <td class="px-3 py-2 text-gray-500 text-xs">
                    <span v-if="row.arrival_time">등원 {{ row.arrival_time }}</span>
                    <span v-if="row.departure_time"> | 하원 {{ row.departure_time }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 탭2: 출결 조회 (학생별 분석) -->
    <div v-if="activeTab === 'inquiry'" class="flex gap-6">
      <!-- 좌측: 반/학생 선택 -->
      <div class="w-[300px] flex-shrink-0 space-y-4">
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <select v-model="inquiryClassId" @change="onInquiryClassChange" class="w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-primary">
            <option value="">반 선택</option>
            <option v-for="cls in allClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
        </div>
        <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div class="p-3 bg-gray-50 border-b font-bold text-sm text-gray-700">학생 목록</div>
          <div class="max-h-[500px] overflow-y-auto">
            <div
              v-for="stu in inquiryStudents"
              :key="stu.id"
              @click="selectInquiryStudent(stu)"
              class="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition text-sm font-medium"
              :class="{ 'bg-blue-50 text-primary': inquirySelectedStudent?.id === stu.id }"
            >
              {{ stu.name }}
              <span class="text-xs text-gray-400 ml-1">{{ stu.school || '' }}</span>
            </div>
            <div v-if="inquiryStudents.length === 0" class="p-4 text-center text-gray-400 text-sm">
              반을 선택해주세요
            </div>
          </div>
        </div>
      </div>

      <!-- 우측: 학생 출결 분석 -->
      <div class="flex-1 space-y-4">
        <div v-if="!inquirySelectedStudent" class="bg-white rounded-xl shadow-sm border p-16 text-center text-gray-400">
          좌측에서 반과 학생을 선택해주세요
        </div>
        <template v-else>
          <!-- 학생 정보 + 종합 분석 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white rounded-xl shadow-sm border p-5">
              <h4 class="font-bold text-sm text-gray-500 mb-3">학생 정보</h4>
              <div class="space-y-2 text-sm">
                <div><span class="text-gray-500 w-16 inline-block">이름</span><span class="font-bold">{{ inquirySelectedStudent.name }}</span></div>
                <div><span class="text-gray-500 w-16 inline-block">학교</span><span class="font-bold">{{ inquirySelectedStudent.school || '-' }}</span></div>
                <div><span class="text-gray-500 w-16 inline-block">학년</span><span class="font-bold">{{ inquirySelectedStudent.grade || '-' }}</span></div>
                <div><span class="text-gray-500 w-16 inline-block">연락처</span><span class="font-bold">{{ inquirySelectedStudent.parent_phone || '-' }}</span></div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border p-5">
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-sm text-gray-500">종합 분석</h4>
                <div class="flex items-center gap-2">
                  <button @click="prevInquiryMonth" class="text-gray-400 hover:text-gray-600 text-sm font-bold">&lt;</button>
                  <span class="text-sm font-bold text-gray-700">{{ inquiryMonth }}</span>
                  <button @click="nextInquiryMonth" class="text-gray-400 hover:text-gray-600 text-sm font-bold">&gt;</button>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <div class="relative w-24 h-24">
                  <canvas ref="pieChartRef"></canvas>
                </div>
                <div class="space-y-1 text-sm">
                  <div class="flex items-center gap-2"><span class="w-3 h-3 bg-green-500 rounded-full inline-block"></span> 출석 <span class="font-bold">{{ inquiryStats.present }}일</span></div>
                  <div class="flex items-center gap-2"><span class="w-3 h-3 bg-red-500 rounded-full inline-block"></span> 결석 <span class="font-bold">{{ inquiryStats.absent }}일</span></div>
                  <div class="flex items-center gap-2"><span class="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span> 지각 <span class="font-bold">{{ inquiryStats.late }}일</span></div>
                  <div class="mt-2 font-bold text-primary">출석률 {{ inquiryStats.rate }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 월간 출결 그리드 -->
          <div class="bg-white rounded-xl shadow-sm border p-5">
            <h4 class="font-bold text-sm text-gray-500 mb-3">월간 출결 현황</h4>
            <div class="flex flex-wrap gap-1.5">
              <div
                v-for="d in inquiryMonthDays"
                :key="d.day"
                class="w-9 h-9 rounded-lg flex flex-col items-center justify-center text-xs border"
                :class="{
                  'bg-green-100 border-green-300 text-green-700': d.status === '등원' || d.status === '하원',
                  'bg-red-100 border-red-300 text-red-700': d.status === '결석',
                  'bg-yellow-100 border-yellow-300 text-yellow-700': d.status === '지각',
                  'bg-gray-50 border-gray-200 text-gray-400': !d.status
                }"
              >
                <span class="font-bold leading-none">{{ d.day }}</span>
                <span class="text-[8px] leading-none mt-0.5">{{ d.mark }}</span>
              </div>
            </div>
          </div>

          <!-- 등원 시간 차트 -->
          <div class="bg-white rounded-xl shadow-sm border p-5">
            <h4 class="font-bold text-sm text-gray-500 mb-3">등원 시간 분포</h4>
            <div class="h-48">
              <canvas ref="timeChartRef"></canvas>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 탭3: 관리자 출결 (일괄 입력) -->
    <div v-if="activeTab === 'admin'" class="space-y-4">
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <label class="text-sm font-bold text-gray-600">날짜</label>
            <input type="date" v-model="adminDate" @change="fetchAdminAttendance" class="px-3 py-2 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
            <button @click="setAdminToday" class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-bold">오늘</button>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-bold text-gray-600">반 필터</label>
            <select v-model="adminClassFilter" class="px-3 py-2 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-primary">
              <option value="">전체</option>
              <option v-for="cls in todayClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-bold text-gray-600">검색</label>
            <input type="text" v-model="adminSearch" placeholder="이름 검색" class="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-40" />
          </div>
          <div class="ml-auto text-sm text-gray-500">
            총 <span class="font-bold text-gray-800">{{ filteredAdminStudents.length }}</span>명
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div v-if="isAdminLoading" class="py-12 text-center text-gray-500">
          데이터를 불러오는 중입니다...
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-600 w-12">No.</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-600">반</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-600">이름</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-600">학교</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-600 w-24">등원</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-600 w-24">하원</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-600 w-24">지각</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-600 w-24">결석</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-600 w-32">시간</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, idx) in filteredAdminStudents" :key="`${item.classId}-${item.studentId}`" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-500">{{ idx + 1 }}</td>
                <td class="px-4 py-3 text-sm font-bold text-gray-700">{{ item.className }}</td>
                <td class="px-4 py-3 text-sm font-bold text-gray-900">{{ item.studentName }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ item.school || '-' }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="adminUpdateAttendance(item, '등원')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors w-16"
                    :class="item.arrival_time ? 'bg-green-500 text-white cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'"
                  >등원</button>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="adminUpdateAttendance(item, '하원')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors w-16"
                    :class="item.departure_time ? 'bg-blue-500 text-white cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'"
                  >하원</button>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="adminUpdateAttendance(item, '지각')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors w-16"
                    :class="item.status === '지각' ? 'bg-yellow-500 text-white cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'"
                  >지각</button>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="adminUpdateAttendance(item, '결석')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors w-16"
                    :class="item.status === '결석' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'"
                  >결석</button>
                </td>
                <td class="px-4 py-3 text-center text-xs text-gray-500">
                  <span v-if="item.arrival_time" class="text-green-600 font-bold">{{ item.arrival_time }}</span>
                  <span v-if="item.arrival_time && item.departure_time"> → </span>
                  <span v-if="item.departure_time" class="text-blue-600 font-bold">{{ item.departure_time }}</span>
                </td>
              </tr>
              <tr v-if="filteredAdminStudents.length === 0">
                <td colspan="9" class="px-4 py-12 text-center text-gray-400 text-sm">
                  {{ adminDate ? '오늘 수업이 있는 반이 없거나 학생이 없습니다.' : '날짜를 선택해주세요.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { attendanceApi, classApi, studentApi } from '../services/api';
import Chart from 'chart.js/auto';

const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;

const tabs = computed(() => {
  const baseTabs = [
    { id: 'status', label: '출결 현황' },
    { id: 'inquiry', label: '출결 조회' }
  ];
  if (user?.role === 'admin') {
    baseTabs.push({ id: 'admin', label: '관리자 출결' });
  }
  return baseTabs;
});
const activeTab = ref('status');

const allClasses = ref<any[]>([]);
const allStudents = ref<any[]>([]);

const getKstToday = () => {
  const d = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
  return d.toISOString().split('T')[0];
};

const getKstNow = () => new Date(new Date().getTime() + (9 * 60 * 60 * 1000));

// ──── 탭1: 출결 현황 (캘린더) ────
const calendarYear = ref(getKstNow().getUTCFullYear());
const calendarMonth = ref(getKstNow().getUTCMonth() + 1);
const monthlySummary = ref<Record<string, any>>({});
const selectedDateDetail = ref('');
const dateDetailLoading = ref(false);
const dateDetailData = ref<any[]>([]);

const calendarCells = computed(() => {
  const firstDay = new Date(calendarYear.value, calendarMonth.value - 1, 1);
  const lastDate = new Date(calendarYear.value, calendarMonth.value, 0).getDate();
  const startWeekday = firstDay.getDay();
  const today = getKstToday();
  const cells = [];

  for (let i = 0; i < startWeekday; i++) cells.push({ day: 0 });

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${calendarYear.value}-${String(calendarMonth.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d,
      dateStr,
      dayOfWeek: new Date(calendarYear.value, calendarMonth.value - 1, d).getDay(),
      isToday: dateStr === today,
      summary: monthlySummary.value[dateStr] || null
    });
  }
  return cells;
});

const dateDetailGrouped = computed(() => {
  const grouped: Record<string, any[]> = {};
  dateDetailData.value.forEach(row => {
    const cn = row.classes?.name || '미지정';
    if (!grouped[cn]) grouped[cn] = [];
    grouped[cn].push(row);
  });
  return grouped;
});

const prevMonth = () => {
  if (calendarMonth.value === 1) { calendarMonth.value = 12; calendarYear.value--; }
  else calendarMonth.value--;
  fetchMonthlySummary();
};
const nextMonth = () => {
  if (calendarMonth.value === 12) { calendarMonth.value = 1; calendarYear.value++; }
  else calendarMonth.value++;
  fetchMonthlySummary();
};

const fetchMonthlySummary = async () => {
  try {
    const m = `${calendarYear.value}-${String(calendarMonth.value).padStart(2, '0')}`;
    const res = await attendanceApi.getMonthlySummary(m);
    const map: Record<string, any> = {};
    if (res.data.success) {
      (res.data.data || []).forEach((s: any) => { map[s.date] = s; });
    }
    monthlySummary.value = map;
  } catch (e) { console.error(e); }
};

const viewDateDetail = async (dateStr: string) => {
  selectedDateDetail.value = dateStr;
  dateDetailLoading.value = true;
  try {
    const res = await attendanceApi.getByDate(dateStr);
    dateDetailData.value = res.data.success ? res.data.data : [];
  } catch (e) { console.error(e); }
  dateDetailLoading.value = false;
};

const statusColor = (status: string) => {
  if (status === '등원' || status === '하원') return 'bg-green-100 text-green-700';
  if (status === '결석') return 'bg-red-100 text-red-700';
  if (status === '지각') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
};

// ──── 탭2: 출결 조회 ────
const inquiryClassId = ref('');
const inquiryStudents = ref<any[]>([]);
const inquirySelectedStudent = ref<any>(null);
const inquiryMonth = ref(getKstToday().substring(0, 7));
const inquiryMonthData = ref<any[]>([]);
const pieChartRef = ref<HTMLCanvasElement | null>(null);
const timeChartRef = ref<HTMLCanvasElement | null>(null);
let pieChart: Chart | null = null;
let timeChart: Chart | null = null;

const inquiryStats = computed(() => {
  const data = inquiryMonthData.value;
  const present = data.filter(d => d.status === '등원' || d.status === '하원').length;
  const absent = data.filter(d => d.status === '결석').length;
  const late = data.filter(d => d.status === '지각').length;
  const total = present + absent + late;
  return {
    present, absent, late,
    rate: total > 0 ? Math.round((present + late) / total * 100) : 0
  };
});

const inquiryMonthDays = computed(() => {
  const ym = inquiryMonth.value.split('-');
  const y = parseInt(ym[0]), m = parseInt(ym[1]);
  const lastDay = new Date(y, m, 0).getDate();
  const dataMap: Record<string, any> = {};
  inquiryMonthData.value.forEach(d => { dataMap[d.attendance_date] = d; });

  const days = [];
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${inquiryMonth.value}-${String(d).padStart(2, '0')}`;
    const record = dataMap[dateStr];
    let mark = '-';
    let status = '';
    if (record) {
      status = record.status;
      if (record.status === '등원' || record.status === '하원') mark = 'O';
      else if (record.status === '결석') mark = 'X';
      else if (record.status === '지각') mark = '△';
    }
    days.push({ day: d, dateStr, status, mark });
  }
  return days;
});

const onInquiryClassChange = async () => {
  inquirySelectedStudent.value = null;
  if (!inquiryClassId.value) { inquiryStudents.value = []; return; }
  const cls = allClasses.value.find(c => c.id === parseInt(inquiryClassId.value as string));
  if (!cls) return;
  try {
    const res = await classApi.getStudents(cls.name);
    inquiryStudents.value = res.data.success ? (res.data.data || []).filter((s: any) => s.status !== 'withdrawn') : [];
  } catch (e) { console.error(e); }
};

const selectInquiryStudent = (stu: any) => {
  inquirySelectedStudent.value = stu;
  fetchInquiryData();
};

const prevInquiryMonth = () => {
  const d = new Date(inquiryMonth.value + '-01');
  d.setMonth(d.getMonth() - 1);
  inquiryMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  fetchInquiryData();
};
const nextInquiryMonth = () => {
  const d = new Date(inquiryMonth.value + '-01');
  d.setMonth(d.getMonth() + 1);
  inquiryMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  fetchInquiryData();
};

const fetchInquiryData = async () => {
  if (!inquirySelectedStudent.value) return;
  try {
    const res = await attendanceApi.getStudentMonthly(inquirySelectedStudent.value.id, inquiryMonth.value);
    inquiryMonthData.value = res.data.success ? res.data.data : [];
    await nextTick();
    renderPieChart();
    renderTimeChart();
  } catch (e) { console.error(e); }
};

const renderPieChart = () => {
  if (pieChart) pieChart.destroy();
  if (!pieChartRef.value) return;
  const s = inquiryStats.value;
  if (s.present + s.absent + s.late === 0) return;
  pieChart = new Chart(pieChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['출석', '결석', '지각'],
      datasets: [{
        data: [s.present, s.absent, s.late],
        backgroundColor: ['#22c55e', '#ef4444', '#eab308'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      cutout: '60%'
    }
  });
};

const renderTimeChart = () => {
  if (timeChart) timeChart.destroy();
  if (!timeChartRef.value) return;
  const timeSlots: Record<string, number> = {};
  inquiryMonthData.value.forEach(d => {
    if (d.arrival_time) {
      const hour = d.arrival_time.split(':')[0];
      const key = `${hour}시`;
      timeSlots[key] = (timeSlots[key] || 0) + 1;
    }
  });
  const labels = Object.keys(timeSlots).sort();
  if (labels.length === 0) return;
  timeChart = new Chart(timeChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '등원 횟수',
        data: labels.map(l => timeSlots[l]),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
};

// ──── 탭3: 관리자 출결 ────
const adminDate = ref(getKstToday());
const adminClassFilter = ref('');
const adminSearch = ref('');
const adminStudentList = ref<any[]>([]);
const isAdminLoading = ref(false);

const todayClasses = computed(() => {
  if (!adminDate.value) return allClasses.value;
  const d = new Date(adminDate.value + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const dayMap: Record<number, string[]> = {
    0: ['일'], 1: ['월'], 2: ['화'], 3: ['수'], 4: ['목'], 5: ['금'], 6: ['토']
  };
  const todayChars = dayMap[dayOfWeek] || [];
  return allClasses.value.filter(cls => {
    if (!cls.weekdays) return true;
    return todayChars.some(ch => cls.weekdays.includes(ch));
  });
});

const filteredAdminStudents = computed(() => {
  let list = adminStudentList.value;
  if (adminClassFilter.value) {
    list = list.filter(s => s.classId === parseInt(adminClassFilter.value as string));
  }
  if (adminSearch.value) {
    const q = adminSearch.value.toLowerCase();
    list = list.filter(s => s.studentName.toLowerCase().includes(q));
  }
  return list;
});

const setAdminToday = () => {
  adminDate.value = getKstToday();
  fetchAdminAttendance();
};

const fetchAdminAttendance = async () => {
  if (!adminDate.value) return;

  try {
    isAdminLoading.value = true;
    const res = await attendanceApi.getByDateOptimized(adminDate.value);
    
    if (!res.data.success) {
      adminStudentList.value = [];
      return;
    }

    const { attendance, students, classes } = res.data.data;
    
    // 출결 맵 생성
    const attMap: Record<string, any> = {};
    attendance.forEach((a: any) => {
      attMap[`${a.class_id}-${a.student_id}`] = a;
    });

    // 오늘 수업이 있는 반 필터링
    const d = new Date(adminDate.value + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const dayMap: Record<number, string[]> = {
      0: ['일'], 1: ['월'], 2: ['화'], 3: ['수'], 4: ['목'], 5: ['금'], 6: ['토']
    };
    const todayChars = dayMap[dayOfWeek] || [];
    
    const classesToShow = classes.filter((cls: any) => {
      if (!cls.weekdays) return true;
      return todayChars.some(ch => cls.weekdays.includes(ch));
    });

    const list: any[] = [];
    classesToShow.forEach((cls: any) => {
      // 해당 반 학생 필터링
      const classStudents = students.filter((s: any) => {
        if (!s.class_name) return false;
        return s.class_name.split(',').map((cn: string) => cn.trim()).includes(cls.name);
      });

      classStudents.forEach((stu: any) => {
        const key = `${cls.id}-${stu.id}`;
        const att = attMap[key];
        list.push({
          classId: cls.id,
          className: cls.name,
          studentId: stu.id,
          studentName: stu.name,
          school: stu.school,
          status: att?.status || '',
          arrival_time: att?.arrival_time || '',
          departure_time: att?.departure_time || ''
        });
      });
    });

    adminStudentList.value = list;
  } catch (e) { 
    console.error(e); 
    adminStudentList.value = [];
  } finally {
    isAdminLoading.value = false;
  }
};

const adminUpdateAttendance = async (item: any, status: string) => {
  // 이미 등원 상태에서 등원 재클릭 방지
  if (item.arrival_time && status === '등원') return;
  // 이미 하원 상태에서 하원 재클릭 방지
  if (item.departure_time && status === '하원') return;
  // 하원 완료 후 등원 불가
  if (item.departure_time && status === '등원') return;

  // 결석 토글
  if (status === '결석' && item.status === '결석') {
    status = '취소';
  } else if (item.status === '결석' && status !== '결석') {
    alert('결석 처리된 학생입니다. 결석을 한 번 더 눌러 취소한 후 처리해주세요.');
    return;
  }

  try {
    const res = await attendanceApi.update({
      class_id: item.classId,
      student_id: item.studentId,
      attendance_date: adminDate.value,
      status
    });
    if (res.data.success) {
      const d = res.data.data;
      if (status === '취소') {
        item.status = '';
        item.arrival_time = '';
        item.departure_time = '';
      } else {
        item.status = d.status;
        item.arrival_time = d.arrival_time || item.arrival_time;
        item.departure_time = d.departure_time || item.departure_time;
      }
    }
  } catch (e) {
    console.error(e);
    alert('출결 처리에 실패했습니다.');
  }
};

// ──── 초기 로드 ────
onMounted(async () => {
  try {
    const [clsRes, stuRes] = await Promise.all([
      classApi.getAll(),
      studentApi.getAll({ status: 'active' })
    ]);
    allClasses.value = clsRes.data.success ? clsRes.data.data : [];
    allStudents.value = stuRes.data.success ? stuRes.data.data : [];
  } catch (e) { console.error(e); }

  fetchMonthlySummary();
  fetchAdminAttendance();
});

watch(activeTab, () => {
  if (activeTab.value === 'status') fetchMonthlySummary();
  if (activeTab.value === 'admin') fetchAdminAttendance();
});
</script>

<style scoped>
.text-primary { color: #1e3a8a; }
.bg-primary { background-color: #1e3a8a; }
.border-primary { border-color: #1e3a8a; }
.focus\:ring-primary:focus { --tw-ring-color: #1e3a8a; }
</style>
