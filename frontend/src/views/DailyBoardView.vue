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

      <!-- 2. 오늘의 과제 검사 & 3. 오늘의 RT -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- 오늘의 과제 검사 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div class="bg-blue-50 px-5 py-3 border-b border-blue-100">
            <h3 class="font-bold text-blue-800 flex items-center gap-2">
              <span>📚</span> 오늘의 과제 검사
            </h3>
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
          <div class="bg-purple-50 px-5 py-3 border-b border-purple-100">
            <h3 class="font-bold text-purple-800 flex items-center gap-2">
              <span>🎯</span> 오늘의 RT 진행
            </h3>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { dailyBoardApi } from '../services/api';
import * as XLSX from 'xlsx';

import { getTodayFull } from '../utils/date';

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

const fetchBoardData = async () => {
  isLoading.value = true;
  try {
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
  } catch (error) {
    console.error('데일리 보드 데이터를 불러오는데 실패했습니다.', error);
    alert('데이터를 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
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
