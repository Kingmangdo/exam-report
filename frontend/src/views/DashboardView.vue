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
      <!-- 특이사항 (학습 경고) - 최상단 배치 -->
      <div v-if="user?.role === 'admin'" class="bg-white rounded-xl shadow-sm border overflow-hidden ring-2 ring-red-500 ring-opacity-50">
        <div class="bg-red-50 px-5 py-3 border-b flex justify-between items-center">
          <h3 class="font-bold text-red-700 text-sm flex items-center gap-2">
            🚨 집중 케어 대상 (학습 경고)
            <span v-if="alertItems.length > 0" class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{{ alertItems.length }}</span>
          </h3>
        </div>
        <div v-if="alertItems.length === 0" class="p-8 text-center text-gray-400 text-sm">
          현재 집중 케어 대상이 없습니다. 🎉
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-bold text-gray-600 w-24">날짜</th>
                <th class="px-4 py-3 text-left font-bold text-gray-600 w-32">반 이름</th>
                <th class="px-4 py-3 text-left font-bold text-gray-600 w-24">학생 이름</th>
                <th class="px-4 py-3 text-left font-bold text-gray-600">등락 추이</th>
                <th class="px-4 py-3 text-left font-bold text-gray-600 w-48">담당 선생님 지정</th>
                <th class="px-4 py-3 text-left font-bold text-gray-600 w-64">선생님 관리 상황</th>
                <th class="px-4 py-3 text-center font-bold text-gray-600 w-20">완료</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="warning in alertItems" :key="warning.id" class="hover:bg-red-50/20 transition group">
                <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ formatDateShort(warning.exam_date) }}</td>
                <td class="px-4 py-3 font-medium text-gray-700">{{ warning.class_name }}</td>
                <td class="px-4 py-3 font-bold text-gray-900">{{ warning.student_name || '반 전체' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2 group-hover:bg-yellow-50 p-1 -ml-1 rounded transition">
                    <input 
                      v-model="warning.edited_message" 
                      type="text" 
                      class="flex-1 bg-transparent border-none focus:ring-0 p-0 text-red-600 font-medium text-sm w-full"
                      @blur="saveAdminSettings(warning)"
                      @keyup.enter="saveAdminSettings(warning)"
                    />
                    <svg class="w-4 h-4 text-gray-300 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-3">
                    <label v-for="t in teachersList" :key="t" class="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        :value="t" 
                        v-model="warning.assigned_teachers" 
                        @change="saveAdminSettings(warning)"
                        class="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <span class="text-xs text-gray-700" :class="{ 'font-bold text-primary': warning.assigned_teachers.includes(t) }">{{ t }}</span>
                    </label>
                  </div>
                </td>
                <td class="px-4 py-3 text-xs">
                  <div v-if="!warning.teacher_feedback || warning.teacher_feedback.length === 0" class="text-gray-400 italic">
                    {{ warning.assigned_teachers.length > 0 ? '피드백 대기중...' : '담당자 미지정' }}
                  </div>
                  <div v-else class="space-y-2">
                    <div v-for="(fb, idx) in warning.teacher_feedback" :key="idx" class="bg-blue-50 p-2 rounded border border-blue-100">
                      <div class="font-bold text-blue-800 mb-1 flex items-center justify-between">
                        <span>{{ fb.teacher }}</span>
                        <span class="text-[10px] text-gray-400 font-normal">{{ formatDateShort(fb.updated_at) }}</span>
                      </div>
                      <div class="text-gray-700 leading-tight">
                        <span class="font-bold text-gray-500">Q:</span> {{ fb.reason }}<br/>
                        <span class="font-bold text-green-600">A:</span> {{ fb.solution }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <button 
                    @click="acknowledgeWarning(warning.id)" 
                    class="px-2.5 py-1.5 bg-gray-100 border border-gray-300 text-gray-600 rounded text-xs font-bold hover:bg-green-100 hover:text-green-700 hover:border-green-300 transition shadow-sm whitespace-nowrap"
                  >
                    최종확인
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 오늘의 종합 현황 카드 -->
      <div v-if="user?.role === 'admin'">
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

      <!-- 강사 전용 피드백 패널 -->
      <div v-if="user?.role !== 'admin' && instructorWarnings.length > 0" class="bg-white rounded-xl shadow-sm border overflow-hidden ring-2 ring-blue-500 ring-opacity-50">
        <div class="bg-blue-50 px-5 py-3 border-b flex justify-between items-center">
          <h3 class="font-bold text-blue-800 text-sm flex items-center gap-2">
            📌 원장님 지시: 집중 케어 필요 학생
            <span class="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">{{ instructorWarnings.length }}</span>
          </h3>
        </div>
        <div class="divide-y divide-gray-100 max-h-[500px] overflow-y-auto p-5 space-y-4">
          <div v-for="warning in instructorWarnings" :key="warning.id" class="border rounded-lg p-4 bg-gray-50 shadow-sm relative">
            <div class="flex items-center gap-2 mb-2 pb-2 border-b">
              <span class="font-bold text-lg text-gray-900">{{ warning.student_name || '반 전체 알림' }}</span>
              <span class="text-xs text-gray-500 border px-2 py-0.5 rounded bg-white font-bold">{{ warning.class_name }}</span>
              <span class="text-xs text-gray-400">{{ formatDateShort(warning.exam_date) }}</span>
            </div>
            <p class="text-sm font-bold text-red-600 mb-4 bg-red-50 p-2 rounded inline-block">
              {{ warning.edited_message || warning.message }}
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-600 mb-1">점수 하락 / 문제 발생 이유</label>
                <textarea 
                  v-model="warning.my_reason" 
                  rows="2" 
                  class="w-full text-sm px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="예: 타 과목 학원 시간표 변경으로 인한 숙제 미흡"
                ></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-600 mb-1">선생님 관리 상황 / 해결 방안</label>
                <textarea 
                  v-model="warning.my_solution" 
                  rows="2" 
                  class="w-full text-sm px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="예: 수업 전 30분 일찍 등원시켜 재시험 진행"
                ></textarea>
              </div>
            </div>
            
            <div class="mt-3 flex justify-end">
              <button 
                @click="submitFeedback(warning)" 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold shadow-sm flex items-center gap-2 transition"
                :disabled="!warning.my_reason || !warning.my_solution"
                :class="{ 'opacity-50 cursor-not-allowed': !warning.my_reason || !warning.my_solution }"
              >
                <span>보고 완료</span>
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
  const kstNow = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
  return kstNow.toISOString().split('T')[0];
};

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${m}/${dd} (${dayName})`;
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

const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;
const alertItems = ref<any[]>([]);
const teachersList = ref(['댄T', '마이크T', '첼시원장']);

const instructorWarnings = computed(() => {
  if (!user || user.role === 'admin') return [];
  const myName = user.name;
  return alertItems.value.filter(w => w.assigned_teachers && w.assigned_teachers.includes(myName));
});

const loadWarnings = async () => {
  try {
    const res = await warningApi.getActive();
    if (res.data.success) {
      alertItems.value = (res.data.data || []).map((w: any) => {
        // 기존 원장님 수정 메시지가 있으면 edited_message에 담고, 강사의 본인 피드백 찾기
        w.edited_message = w.custom_message || w.message;
        
        let myReason = '';
        let mySolution = '';
        if (user && user.role !== 'admin' && w.teacher_feedback) {
          const myFb = w.teacher_feedback.find((fb: any) => fb.teacher === user.name);
          if (myFb) {
            myReason = myFb.reason;
            mySolution = myFb.solution;
          }
        }
        return { ...w, my_reason: myReason, my_solution: mySolution };
      });
    }
  } catch (err) {
    console.error('학습 경고 불러오기 실패:', err);
  }
};

const saveAdminSettings = async (warning: any) => {
  if (user?.role !== 'admin') return;
  try {
    const payload = {
      assigned_teachers: warning.assigned_teachers,
      custom_message: warning.edited_message
    };
    await warningApi.updateAdminSettings(warning.id, payload);
  } catch (err) {
    console.error('관리자 설정 업데이트 실패:', err);
  }
};

const submitFeedback = async (warning: any) => {
  try {
    const payload = {
      reason: warning.my_reason,
      solution: warning.my_solution
    };
    await warningApi.updateFeedback(warning.id, payload);
    alert('보고가 완료되었습니다.');
    await loadWarnings();
  } catch (err) {
    console.error('피드백 저장 실패:', err);
    alert('저장에 실패했습니다.');
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
