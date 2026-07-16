<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">대시보드</h2>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else class="space-y-6">
      <!-- 오늘의 종합 현황 카드 -->
      <div>
        <h3 class="text-sm font-bold text-gray-500 mb-3">오늘의 종합 현황</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <div class="bg-white rounded-xl shadow-sm border p-4 md:p-5">
            <h4 class="text-xs font-medium text-gray-500 mb-1">전체 학생</h4>
            <p class="text-xl md:text-2xl font-bold text-primary">{{ statistics?.total_students || 0 }}<span class="text-xs md:text-sm text-gray-400 ml-1">명</span></p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4 md:p-5">
            <h4 class="text-xs font-medium text-gray-500 mb-1">출석</h4>
            <p class="text-xl md:text-2xl font-bold text-green-600">{{ todayAttSummary.present }}<span class="text-xs md:text-sm text-gray-400 ml-1">명</span></p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4 md:p-5">
            <h4 class="text-xs font-medium text-gray-500 mb-1">결석</h4>
            <p class="text-xl md:text-2xl font-bold text-red-600">{{ todayAttSummary.absent }}<span class="text-xs md:text-sm text-gray-400 ml-1">명</span></p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4 md:p-5">
            <h4 class="text-xs font-medium text-gray-500 mb-1">지각</h4>
            <p class="text-xl md:text-2xl font-bold text-yellow-600">{{ todayAttSummary.late }}<span class="text-xs md:text-sm text-gray-400 ml-1">명</span></p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4 md:p-5">
            <h4 class="text-xs font-medium text-gray-500 mb-1">오늘 성적 입력</h4>
            <p class="text-xl md:text-2xl font-bold text-blue-600">{{ statistics?.today_scores || 0 }}<span class="text-xs md:text-sm text-gray-400 ml-1">건</span></p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4 md:p-5">
            <h4 class="text-xs font-medium text-gray-500 mb-1">오늘 성적 발송</h4>
            <p class="text-xl md:text-2xl font-bold text-purple-600">{{ statistics?.today_sends || 0 }}<span class="text-xs md:text-sm text-gray-400 ml-1">건</span></p>
          </div>
        </div>
      </div>

      <!-- 반별 출결 + 오늘 할일 요약 -->
      <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div class="bg-gray-50 px-5 py-3 border-b">
          <h3 class="font-bold text-gray-700 text-sm">반별 출결 + 오늘 할일 요약</h3>
        </div>
        <div v-if="classOverview.length === 0" class="p-8 text-center text-gray-400 text-sm">
          오늘 수업이 있는 반이 없습니다.
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="cls in classOverview" :key="cls.id" class="px-5 py-3 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50">
            <div class="w-[180px] font-bold text-sm text-gray-800 truncate">{{ cls.name }}</div>
            <div class="flex-1 flex items-center gap-3">
              <!-- 출결 바 -->
              <div class="flex items-center gap-2 w-[180px]">
                <div class="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div class="h-full bg-green-500 transition-all" :style="{ width: cls.presentPercent + '%' }"></div>
                  <div class="h-full bg-red-500 transition-all" :style="{ width: cls.absentPercent + '%' }"></div>
                </div>
                <span class="text-xs font-bold text-gray-600 w-[60px] text-right">{{ cls.present + cls.late }}/{{ cls.total }}</span>
              </div>
              
              <!-- 미등원/결석 명단 -->
              <div class="flex-1 flex flex-wrap gap-2 items-center">
                <div v-if="cls.missingNames.length > 0" class="flex items-center gap-1">
                  <span class="text-[10px] text-gray-400 font-medium">미등원:</span>
                  <span class="text-xs text-gray-500">{{ cls.missingNames.join(', ') }}</span>
                </div>
                <div v-if="cls.absentNames.length > 0" class="flex items-center gap-1 ml-2">
                  <span class="text-[10px] text-red-400 font-medium">결석:</span>
                  <span class="text-xs text-red-500 font-bold">{{ cls.absentNames.join(', ') }}</span>
                </div>
                <div v-if="cls.missingNames.length === 0 && cls.absentNames.length === 0" class="text-xs text-green-600 font-medium">
                  전원 등원 완료
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span v-if="cls.rtCount > 0" class="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">RT {{ cls.rtCount }}건</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 특이사항 (학습 경고) -->
      <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div class="bg-red-50 px-5 py-3 border-b flex justify-between items-center">
          <h3 class="font-bold text-red-700 text-sm flex items-center gap-2">
            🚨 오늘의 학습 경고 상황판
            <span v-if="alertItems.length > 0" class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{{ alertItems.length }}</span>
          </h3>
        </div>
        <div v-if="alertItems.length === 0" class="p-8 text-center text-gray-400 text-sm">
          확인하지 않은 학습 경고가 없습니다. 🎉
        </div>
        <div v-else class="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          <div v-for="warning in alertItems" :key="warning.id" class="px-5 py-4 hover:bg-red-50/50 transition">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 text-red-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-gray-900">{{ warning.student_id ? warning.student_name : '반 전체 알림' }}</span>
                  <span class="text-xs text-gray-500 border px-1.5 rounded bg-white">{{ warning.class_name }}</span>
                  <span class="text-xs text-gray-400">{{ warning.exam_date }}</span>
                </div>
                <p class="text-sm font-medium text-red-700">
                  {{ warning.student_id ? warning.message : `[반 전체] ${warning.message}` }}
                </p>
              </div>
              </div>
              <button 
                @click="acknowledgeWarning(warning.id)" 
                class="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 rounded text-xs font-bold hover:bg-gray-100 transition shadow-sm"
              >
                확인 (지우기)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { statisticsApi, attendanceApi, classApi, studentApi, dailyBoardApi, warningApi } from '../services/api';
import type { Statistics } from '../types';

const statistics = ref<Statistics | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const todayAttendance = ref<any[]>([]);
const allClasses = ref<any[]>([]);
const allStudents = ref<any[]>([]);
const homeworkDue = ref<any[]>([]);
const rtDue = ref<any[]>([]);
const consecutiveAbsent = ref<any[]>([]);
const globalMemo = ref('');

const getKstToday = () => {
  const d = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
  return d.toISOString().split('T')[0];
};

const todayAttSummary = computed(() => {
  const data = todayAttendance.value;
  return {
    present: data.filter(d => d.status === '등원' || d.status === '하원').length,
    absent: data.filter(d => d.status === '결석').length,
    late: data.filter(d => d.status === '지각').length
  };
});

const classOverview = computed(() => {
  const today = getKstToday();
  const d = new Date(today + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const dayMap: Record<number, string[]> = { 0: ['일'], 1: ['월'], 2: ['화'], 3: ['수'], 4: ['목'], 5: ['금'], 6: ['토'] };
  const todayChars = dayMap[dayOfWeek] || [];

  const todayClasses = allClasses.value.filter(cls => {
    if (!cls.weekdays) return false;
    return todayChars.some(ch => cls.weekdays.includes(ch));
  });

  const attByClass: Record<number, any[]> = {};
  todayAttendance.value.forEach(a => {
    if (!attByClass[a.class_id]) attByClass[a.class_id] = [];
    attByClass[a.class_id].push(a);
  });

  return todayClasses.map(cls => {
    // 해당 반의 전체 학생 목록
    const classStudents = allStudents.value.filter(s => 
      s.class_name && s.class_name.split(',').map((cn: string) => cn.trim()).includes(cls.name)
    );
    const total = classStudents.length || 0;

    const att = attByClass[cls.id] || [];
    const present = att.filter(a => a.status === '등원' || a.status === '하원').length;
    const absent = att.filter(a => a.status === '결석').length;
    const late = att.filter(a => a.status === '지각').length;
    
    // 미등원 학생 (출결 기록이 아예 없는 학생)
    const checkedStudentIds = att.map(a => a.student_id);
    const missingStudents = classStudents.filter(s => !checkedStudentIds.includes(s.id));
    const missingNames = missingStudents.map(s => s.name);
    
    // 결석 학생 이름
    const absentNames = att.filter(a => a.status === '결석').map(a => a.students?.name || '알 수 없음');

    const rtCount = rtDue.value.filter(r => {
      const cn = r.classes?.name || r.class_name;
      return cn === cls.name;
    }).length;

    return {
      id: cls.id,
      name: cls.name,
      present, absent, late, total,
      presentPercent: total > 0 ? Math.round((present + late) / total * 100) : 0,
      absentPercent: total > 0 ? Math.round(absent / total * 100) : 0,
      latePercent: 0, // 바에서는 출석(초록) + 지각(노랑) + 결석(빨강)으로 표시하거나 단순화
      missingNames,
      absentNames,
      rtCount
    };
  });
});

const alertItems = ref<any[]>([]);

const loadWarnings = async () => {
  try {
    const res = await warningApi.getUnacknowledged();
    if (res.data.success) {
      alertItems.value = res.data.data || [];
    }
  } catch (err) {
    console.error('학습 경고 불러오기 실패:', err);
  }
};

const acknowledgeWarning = async (id: number) => {
  try {
    const res = await warningApi.acknowledge(id);
    if (res.data.success) {
      alertItems.value = alertItems.value.filter(item => item.id !== id);
    }
  } catch (err) {
    console.error('경고 확인 처리 실패:', err);
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    const today = getKstToday();

    const [statRes, attRes, clsRes, absRes, stuRes, boardRes] = await Promise.all([
      statisticsApi.getOverall(),
      attendanceApi.getByDate(today),
      classApi.getAll(),
      attendanceApi.getConsecutiveAbsent(3),
      studentApi.getAll({ status: 'active' }),
      dailyBoardApi.getBoard(today)
    ]);

    if (statRes.data.success) statistics.value = statRes.data.data;
    todayAttendance.value = attRes.data.success ? attRes.data.data : [];
    allClasses.value = clsRes.data.success ? clsRes.data.data : [];
    consecutiveAbsent.value = absRes.data.success ? absRes.data.data : [];
    allStudents.value = stuRes.data.success ? (stuRes.data.data || []) : [];
    
    if (boardRes.data.success && boardRes.data.data) {
      globalMemo.value = boardRes.data.data.global_memo || '';
    }

    try {
      const hwRes = await classApi.getHomeworkDue(today);
      homeworkDue.value = hwRes.data.success ? hwRes.data.data : [];
    } catch (e) { console.error(e); }

    // 학습 경고 로드
    await loadWarnings();

  } catch (err: any) {
    error.value = err.response?.data?.message || '데이터를 불러오는 중 오류가 발생했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.text-primary { color: #1e3a8a; }
.bg-primary { background-color: #1e3a8a; }
.bg-primary-dark { background-color: #1e40af; }
</style>
