<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>📋</span> 독강 데일리 보드
      </h2>
      <div class="flex items-center gap-4">
        <button 
          v-if="isAdmin"
          @click="downloadMonthlyExcel"
          class="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-sm flex items-center gap-2 text-sm"
        >
          <span>📊 월별 엑셀 다운로드</span>
        </button>
        <div class="flex items-center gap-2">
          <button 
            @click="goToToday"
            class="px-3 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition shadow-sm text-sm"
          >
            오늘
          </button>
          <input 
            type="date" 
            v-model="selectedDate" 
            @change="fetchBoardData"
            class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700"
          />
        </div>
        <button 
          @click="saveBoardData"
          class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition shadow-sm flex items-center gap-2"
          :disabled="isSaving"
        >
          <span v-if="isSaving">저장 중...</span>
          <span v-else>💾 전체 저장</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- 1. 학원 전체 출결 및 특이사항 (공통 메모장) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="bg-yellow-50 px-5 py-3 border-b border-yellow-100 flex justify-between items-center">
          <h3 class="font-bold text-yellow-800 flex items-center gap-2">
            <span>📢</span> 학원 전체 출결 및 특이사항
          </h3>
          <span v-if="boardData.last_modified_by" class="text-xs text-gray-500">
            마지막 수정: {{ boardData.last_modified_by }}
          </span>
        </div>
        <div class="p-4">
          <textarea 
            v-model="boardData.global_memo"
            rows="4"
            placeholder="오늘의 지각생, 결석생, 상담 필요 학생 등 학원 전체가 공유해야 할 특이사항을 적어주세요."
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none resize-y text-sm"
          ></textarea>
        </div>
      </div>

      <!-- 1.5 보강 현황 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="bg-green-50 px-5 py-3 border-b border-green-100 flex justify-between items-center">
          <h3 class="font-bold text-green-800 flex items-center gap-2">
            <span>🧑‍🏫</span> 오늘의 보강 현황
          </h3>
          <span class="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            총 {{ suppSessions.length }}건
          </span>
        </div>
        <div class="p-4">
          <div v-if="suppSessions.length === 0" class="text-center py-6 text-gray-500 text-sm">
            오늘 일정이 잡힌 보강이 없습니다.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="session in suppSessions" :key="session.id" class="border border-green-100 rounded-lg p-3 bg-green-50/30">
              <div class="flex justify-between items-start mb-2">
                <div class="font-bold text-gray-800 text-sm">
                  {{ session.class_name || '반 미지정' }}
                  <span v-if="session.teacher_name" class="text-xs font-normal text-gray-500 ml-1">({{ session.teacher_name }}T)</span>
                </div>
                <div class="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">
                  {{ formatKstTime(session.session_date) }}
                  <span v-if="session.end_time" class="text-gray-400">~ {{ formatKstTime(session.end_time) }}</span>
                </div>
              </div>
              <div class="text-xs text-gray-600 mb-3 bg-white p-2 rounded border border-gray-100">
                {{ session.content || '내용 없음' }}
              </div>
              
              <!-- 보강 학생 출결 -->
              <div class="space-y-2">
                <div v-for="stu in session.supplementary_students" :key="stu.student_id" class="flex items-center justify-between bg-white p-1.5 rounded shadow-sm border border-gray-100">
                  <span class="text-sm font-medium text-gray-700">{{ stu.students?.name || '알 수 없음' }}</span>
                  <div class="flex gap-1">
                    <button 
                      @click="updateSuppAttendance(session.id, stu.student_id, 'present')"
                      class="px-2 py-1 text-[10px] font-bold rounded transition-colors"
                      :class="stu.attendance_status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                    >
                      출석
                    </button>
                    <button 
                      @click="updateSuppAttendance(session.id, stu.student_id, 'absent')"
                      class="px-2 py-1 text-[10px] font-bold rounded transition-colors"
                      :class="stu.attendance_status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                    >
                      결석
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 오늘의 과제 검사 & 3. 오늘의 RT -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- 오늘의 과제 검사 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div class="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
            <h3 class="font-bold text-blue-800 flex items-center gap-2">
              <span>📚</span> 오늘의 과제 검사
            </h3>
            <button v-if="isAdmin" @click="openAppendModal('homework')" class="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition">
              + 과제 추가
            </button>
          </div>
          <div class="p-4 flex-1 overflow-y-auto max-h-[600px]">
            <div v-if="homeworkList.length === 0" class="text-center py-10 text-gray-500 text-sm">
              오늘 검사할 과제가 없습니다.
            </div>
            <div v-else class="space-y-3">
              <div v-for="(hw, idx) in homeworkList" :key="idx" class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div class="mt-0.5">
                  <input type="checkbox" class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {{ hw.classes?.name || '알 수 없음' }}
                    </span>
                    <span class="text-xs text-gray-500">{{ hw.log_date }} 부여됨</span>
                  </div>
                  <p class="text-sm text-gray-800 font-medium">{{ hw.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 오늘의 RT -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div class="bg-purple-50 px-5 py-3 border-b border-purple-100 flex justify-between items-center">
            <h3 class="font-bold text-purple-800 flex items-center gap-2">
              <span>🎯</span> 오늘의 RT 진행
            </h3>
            <button v-if="isAdmin" @click="openAppendModal('rt')" class="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition">
              + RT 추가
            </button>
          </div>
          <div class="p-4 flex-1 overflow-y-auto max-h-[600px]">
            <div v-if="rtList.length === 0" class="text-center py-10 text-gray-500 text-sm">
              오늘 진행할 RT가 없습니다.
            </div>
            <div v-else class="space-y-4">
              <div v-for="(rtGroup, className) in rtByClass" :key="className" class="border rounded-lg overflow-hidden">
                <div class="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                  <span class="font-bold text-gray-800">{{ className }}</span>
                  <span class="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    RT {{ rtGroup.length }}건
                  </span>
                </div>
                <div class="p-3 space-y-2">
                  <!-- RT 목록 -->
                  <ul class="list-disc list-inside text-sm text-gray-700 pl-2 mb-3 space-y-1">
                    <li v-for="(rt, idx) in rtGroup" :key="idx">
                      {{ rt.content }} <span class="text-xs text-gray-400">({{ rt.log_date }})</span>
                    </li>
                  </ul>
                  
                  <!-- RT 주의사항 메모 -->
                  <div class="mt-2">
                    <label class="block text-xs font-bold text-gray-600 mb-1">RT 진행 시 주의사항</label>
                    <textarea 
                      v-model="boardData.rt_notes[className]"
                      rows="2"
                      placeholder="예: A학생 단어 재시험 3번 틀리면 남기기"
                      class="w-full p-2 border rounded focus:ring-1 focus:ring-purple-400 outline-none resize-y text-xs bg-yellow-50/30"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 추가 모달 (Admin 전용) -->
    <div v-if="showAppendModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">
              {{ appendType === 'rt' ? '🎯 RT 추가 (원장님용)' : '📚 과제 추가 (원장님용)' }}
            </h3>
            <button type="button" @click="showAppendModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
        <form @submit.prevent="saveAppendItem" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">대상 반 <span class="text-red-500">*</span></label>
              <select v-model="appendForm.class_id" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                <option value="" disabled>반을 선택하세요</option>
                <option v-for="cls in allClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                기록 날짜 <span class="text-xs text-gray-400">(보통 오늘)</span>
              </label>
              <input v-model="appendForm.log_date" type="date" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div class="mt-4">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700">
                추가할 내용 <span class="text-red-500">*</span>
              </label>
              <button type="button" @click="addAppendItem" class="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 font-medium transition-colors">
                + 추가
              </button>
            </div>
            
            <div v-for="(item, index) in appendForm.items" :key="index" class="flex gap-2 mb-2 items-center">
              <span class="text-gray-400 text-sm font-bold w-4 text-center">{{ index + 1 }}</span>
              <input v-model="item.content" type="text" :placeholder="appendType === 'rt' ? 'RT 내용 입력' : '숙제 내용 입력'" required class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              <div class="flex items-center gap-2 border border-red-200 rounded-lg px-2 py-1 bg-white focus-within:ring-2 focus-within:ring-red-100">
                <span class="text-xs text-red-500 font-medium whitespace-nowrap">검사일:</span>
                <input v-model="item.deadline" type="date" required class="w-28 text-sm outline-none text-gray-700" />
              </div>
              <button v-if="appendForm.items.length > 1" type="button" @click="removeAppendItem(index)" class="text-gray-400 hover:text-red-500 px-2 text-lg">
                &times;
              </button>
            </div>
            <div v-if="appendForm.items.length === 0" class="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg bg-gray-50">
              우측 상단의 (+ 추가) 버튼을 눌러 내용을 입력하세요.
            </div>
          </div>

          <div class="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 검사일을 지정하시면, 해당 날짜의 데일리 보드에 이 내용이 표시됩니다.
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="showAppendModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold">취소</button>
            <button type="submit" :disabled="isAppending" class="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-sm disabled:opacity-50">
              {{ isAppending ? '저장 중...' : '저장' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { dailyBoardApi, classApi, supplementaryApi } from '../services/api';
import * as XLSX from 'xlsx';

import { getTodayFull } from '../utils/date';

const formatKstTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const kstTime = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  const h = String(kstTime.getUTCHours()).padStart(2, '0');
  const m = String(kstTime.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const route = useRoute();
const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;
const isAdmin = user?.role === 'admin';

const selectedDate = ref(getTodayFull());
const isLoading = ref(false);
const isSaving = ref(false);

const goToToday = () => {
  const today = getTodayFull();
  if (selectedDate.value !== today) {
    selectedDate.value = today;
    fetchBoardData();
  }
};

const boardData = ref({
  global_memo: '',
  rt_notes: {} as Record<string, string>,
  last_modified_by: ''
});

const dueList = ref<any[]>([]);
const suppSessions = ref<any[]>([]); // 보강 현황 데이터

// 과제와 RT 분리
const homeworkList = computed(() => {
  const list: any[] = [];
  dueList.value.forEach(log => {
    if (log.homework) {
      try {
        const parsed = JSON.parse(log.homework);
        if (Array.isArray(parsed)) {
          parsed.forEach(h => {
            if (h.type !== 'rt' && h.deadline === selectedDate.value) {
              list.push({ ...h, log_date: log.log_date, classes: log.classes });
            }
          });
        }
      } catch (e) {}
    }
  });
  return list;
});

const rtList = computed(() => {
  const list: any[] = [];
  dueList.value.forEach(log => {
    if (log.homework) {
      try {
        const parsed = JSON.parse(log.homework);
        if (Array.isArray(parsed)) {
          parsed.forEach(h => {
            if (h.type === 'rt' && h.deadline === selectedDate.value) {
              list.push({ ...h, log_date: log.log_date, classes: log.classes });
            }
          });
        }
      } catch (e) {}
    }
  });
  return list;
});

// 반별 RT 그룹화
const rtByClass = computed(() => {
  const grouped: Record<string, any[]> = {};
  rtList.value.forEach(rt => {
    const className = rt.classes?.name || '알 수 없음';
    if (!grouped[className]) {
      grouped[className] = [];
    }
    grouped[className].push(rt);
  });
  return grouped;
});

// ========== Admin 과제/RT 추가 로직 ==========
const showAppendModal = ref(false);
const appendType = ref<'homework' | 'rt'>('homework');
const isAppending = ref(false);
const allClasses = ref<any[]>([]);
const appendForm = ref({
  class_id: '',
  log_date: '',
  items: [] as { content: string; deadline: string }[]
});

const openAppendModal = async (type: 'homework' | 'rt') => {
  if (allClasses.value.length === 0) {
    try {
      const res = await classApi.getAll();
      if (res.data.success) {
        allClasses.value = res.data.data;
      }
    } catch (e) { console.error('반 목록 로드 실패', e); }
  }
  appendType.value = type;
  appendForm.value = {
    class_id: '',
    log_date: getTodayFull(), // 기록 날짜는 보통 오늘
    items: [{ content: '', deadline: selectedDate.value }] // 기본 1개 세팅
  };
  showAppendModal.value = true;
};

const addAppendItem = () => {
  appendForm.value.items.push({
    content: '',
    deadline: selectedDate.value
  });
};

const removeAppendItem = (index: number) => {
  appendForm.value.items.splice(index, 1);
};

const saveAppendItem = async () => {
  if (!appendForm.value.class_id) {
    alert('반을 선택해주세요.');
    return;
  }
  if (appendForm.value.items.length === 0) {
    alert('최소 1개의 항목을 추가해주세요.');
    return;
  }
  
  for (const item of appendForm.value.items) {
    if (!item.content.trim() || !item.deadline) {
      alert('모든 내용과 마감일을 입력해주세요.');
      return;
    }
  }

  isAppending.value = true;
  try {
    const homework_items = appendForm.value.items.map(item => ({
      type: appendType.value,
      content: item.content,
      deadline: item.deadline,
      completed: false
    }));

    const payload = {
      log_date: appendForm.value.log_date,
      homework_items
    };

    const res = await classApi.appendHomeworkToLog(Number(appendForm.value.class_id), payload);
    if (res.data.success) {
      alert('저장되었습니다.');
      showAppendModal.value = false;
      await fetchBoardData(); // 현재 보고 있는 데일리 보드 다시 불러오기 (마감일 기준)
    }
  } catch (err: any) {
    alert('저장에 실패했습니다: ' + (err.response?.data?.message || err.message));
  } finally {
    isAppending.value = false;
  }
};

const fetchBoardData = async () => {
  isLoading.value = true;
  try {
    // 데일리 보드 데이터 및 과제/RT 목록 조회
    const res = await dailyBoardApi.getBoard(selectedDate.value);
    if (res.data.success) {
      const data = res.data.data;
      boardData.value = {
        global_memo: data.board.global_memo || '',
        rt_notes: data.board.rt_notes || {},
        last_modified_by: data.board.last_modified_by || ''
      };
      dueList.value = data.dueList || [];
      
      // rt_notes에 없는 반은 빈 문자열로 초기화
      Object.keys(rtByClass.value).forEach(className => {
        if (boardData.value.rt_notes[className] === undefined) {
          boardData.value.rt_notes[className] = '';
        }
      });
    }

    // 해당 날짜의 보강 현황 조회 (KST 기준 해당 날짜의 00:00:00 ~ 23:59:59)
    const startDate = `${selectedDate.value}T00:00:00+09:00`;
    const endDate = `${selectedDate.value}T23:59:59+09:00`;
    const suppRes = await supplementaryApi.getDashboardSessions(startDate, endDate);
    if (suppRes.data.success) {
      suppSessions.value = suppRes.data.data || [];
    }
  } catch (error) {
    console.error('데이터를 불러오는데 실패했습니다.', error);
    alert('데이터를 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const updateSuppAttendance = async (sessionId: number, studentId: number, status: string) => {
  try {
    await supplementaryApi.updateAttendance(sessionId, studentId, { attendance_status: status });
    // 로컬 상태 업데이트 (화면 즉시 반영)
    const session = suppSessions.value.find(s => s.id === sessionId);
    if (session && session.supplementary_students) {
      const student = session.supplementary_students.find((st: any) => st.student_id === studentId);
      if (student) {
        student.attendance_status = status;
      }
    }
  } catch (error) {
    console.error('보강 출결 업데이트 실패:', error);
    alert('출결 상태 변경에 실패했습니다.');
  }
};

const saveBoardData = async () => {
  isSaving.value = true;
  try {
    const userStr = localStorage.getItem('user');
    let username = '알 수 없음';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        username = user.name || user.username || '사용자';
      } catch (e) {}
    }

    const payload = {
      global_memo: boardData.value.global_memo,
      rt_notes: boardData.value.rt_notes,
      last_modified_by: username
    };

    const res = await dailyBoardApi.saveBoard(selectedDate.value, payload);
    if (res.data.success) {
      boardData.value.last_modified_by = username;
      alert('저장되었습니다.');
    }
  } catch (error) {
    console.error('저장 실패:', error);
    alert('저장에 실패했습니다.');
  } finally {
    isSaving.value = false;
  }
};

const downloadMonthlyExcel = async () => {
  const monthStr = prompt('다운로드할 연월을 입력하세요 (예: 2026-03)', selectedDate.value.substring(0, 7));
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    if (monthStr) alert('올바른 형식(YYYY-MM)으로 입력해주세요.');
    return;
  }

  try {
    const res = await dailyBoardApi.getBoardsByMonth(monthStr);
    if (res.data.success) {
      const boards = res.data.data;
      if (boards.length === 0) {
        alert('해당 월에 저장된 데일리 보드 데이터가 없습니다.');
        return;
      }

      const excelData = boards.map((board: any) => {
        // RT 메모를 문자열로 변환
        let rtNotesStr = '';
        if (board.rt_notes) {
          rtNotesStr = Object.entries(board.rt_notes)
            .filter(([_, note]) => note)
            .map(([className, note]) => `[${className}] ${note}`)
            .join('\n');
        }

        return {
          '날짜': board.target_date,
          '학원 전체 특이사항': board.global_memo || '',
          '반별 RT 주의사항': rtNotesStr,
          '마지막 작성자': board.last_modified_by || ''
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // 컬럼 너비 자동 조정
      const colWidths = [
        { wch: 15 }, // 날짜
        { wch: 50 }, // 학원 전체 특이사항
        { wch: 50 }, // 반별 RT 주의사항
        { wch: 15 }  // 마지막 작성자
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, '데일리보드');
      
      const fileName = `독강_데일리보드_${monthStr.replace('-', '')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    }
  } catch (error) {
    console.error('엑셀 다운로드 실패:', error);
    alert('엑셀 데이터를 불러오는데 실패했습니다.');
  }
};

onMounted(() => {
  // 컴포넌트가 마운트될 때 무조건 오늘 날짜로 초기화
  selectedDate.value = getTodayFull();
  fetchBoardData();
});

// 라우트가 변경되어 다시 이 페이지로 올 때도 오늘 날짜로 초기화
watch(() => route.path, (newPath) => {
  if (newPath === '/daily-board') {
    const today = getTodayFull();
    if (selectedDate.value !== today) {
      selectedDate.value = today;
      fetchBoardData();
    }
  }
});
</script>
