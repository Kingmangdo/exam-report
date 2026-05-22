<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>💬</span> 알림톡 발송 센터
      </h2>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 좌측: 대상자 선택 -->
      <div class="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-[500px] lg:h-[700px]">
        <div class="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
          <h3 class="font-bold text-gray-800">수신자 선택 ({{ selectedStudents.length }}명)</h3>
        </div>
        
        <!-- 필터 -->
        <div class="p-3 border-b bg-white space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">반 선택</label>
            <select v-model="selectedClass" @change="handleClassChange" class="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-primary outline-none">
              <option value="">전체 학생</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.name">{{ cls.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">이름 검색</label>
            <input v-model="searchQuery" type="text" placeholder="학생 이름" class="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>

        <!-- 학생 목록 -->
        <div class="flex-1 overflow-y-auto p-2">
          <div class="flex items-center px-3 py-2 bg-blue-50 rounded mb-2">
            <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mr-3 cursor-pointer" />
            <span class="text-sm font-bold text-blue-800">전체 선택</span>
          </div>

          <div v-if="filteredStudents.length === 0" class="text-center py-10 text-gray-400 text-sm">
            학생이 없습니다.
          </div>
          <div v-else class="space-y-1">
            <label v-for="student in filteredStudents" :key="student.id" class="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer transition">
              <input type="checkbox" :value="student" v-model="selectedStudents" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mr-3" />
              <div class="flex-1">
                <span class="text-sm font-bold text-gray-800">{{ student.name }}</span>
                <span class="text-xs text-gray-500 ml-2 block truncate w-40">{{ student.class_name || '반 미배정' }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- 우측: 템플릿 및 내용 입력 -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-[600px] lg:h-[700px]">
        <div class="bg-gray-50 px-5 border-b flex justify-between items-center">
          <div class="flex gap-4">
            <button 
              @click="activeTab = 'compose'" 
              class="py-3 px-2 font-bold text-sm border-b-2 transition"
              :class="activeTab === 'compose' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              메시지 작성
            </button>
            <button 
              @click="activeTab = 'history'; fetchHistory()" 
              class="py-3 px-2 font-bold text-sm border-b-2 transition"
              :class="activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              발송 이력
            </button>
          </div>
        </div>

        <!-- 탭 내용: 메시지 작성 -->
        <div v-show="activeTab === 'compose'" class="flex-1 overflow-y-auto flex flex-col">
          <div class="p-6 flex-1 overflow-y-auto">
          <!-- 템플릿 선택 -->
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">템플릿 선택</label>
            <select v-model="selectedTemplate" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
              <option value="UG_9086">상담 안내 (승인 완료)</option>
              <option value="future_notice" disabled>학원 공지사항 (추후 심사 예정)</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">* 현재 '상담 안내' 템플릿만 승인되어 발송 가능합니다.</p>
          </div>

          <!-- 발송 대상 선택 -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label class="block text-sm font-bold text-gray-700 mb-3">발송 대상 선택 <span class="text-xs font-normal text-gray-500">(선택한 학생 기준)</span></label>
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="formData.sendToParent" class="w-5 h-5 text-primary focus:ring-primary rounded border-gray-300">
                <span class="text-sm font-bold text-gray-700">학부모에게 발송</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="formData.sendToStudent" class="w-5 h-5 text-primary focus:ring-primary rounded border-gray-300">
                <span class="text-sm font-bold text-gray-700">학생에게 발송</span>
              </label>
            </div>
            <p v-if="!formData.sendToParent && !formData.sendToStudent" class="text-xs text-red-500 mt-2 font-bold">발송 대상을 하나 이상 선택해주세요.</p>
          </div>

          <!-- 발송 내용 입력 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">일자 (■ 일자 : #{일자})</label>
              <input v-model="formData.date" type="date" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">내용 (■ 내용 : #{내용}) <span class="text-red-500">*</span></label>
              <textarea 
                v-model="formData.content" 
                rows="6" 
                placeholder="발송할 상담 내용이나 공지사항을 입력하세요."
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">※ 클래스와 이름은 선택한 학생 데이터로 자동 채워집니다.</p>
            </div>
          </div>

          <!-- 미리보기 -->
          <div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-5">
            <h4 class="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <span>📱</span> 알림톡 미리보기 (첫 번째 선택 학생 기준)
            </h4>
            <div class="bg-white p-4 rounded border text-sm text-gray-700 whitespace-pre-wrap leading-relaxed shadow-sm">
[독강영어전문학원 상담 안내]

학부모님, 안녕하십니까.
{{ previewStudent.name }} 학생의 상담 내용을 안내해 드립니다.

■ 클래스 : {{ previewStudent.class }}
■ 이름 : {{ previewStudent.name }}
■ 일자 : {{ formData.date }}
■ 내용 : {{ formData.content || '(내용이 여기에 들어갑니다)' }}

궁금하신 사항은 학원으로 문의해 주시기 바랍니다.
감사합니다.
            </div>
          </div>
        </div>

          <!-- 하단 전송 버튼 -->
          <div class="bg-gray-50 px-6 py-4 border-t flex items-center justify-between mt-auto">
            <div class="text-sm text-gray-600">
              총 <span class="font-bold text-primary">{{ selectedStudents.length }}</span>명에게 발송합니다.
            </div>
            <button 
              @click="sendMessages" 
              :disabled="isSending || selectedStudents.length === 0 || !formData.content || (!formData.sendToParent && !formData.sendToStudent)"
              class="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-50 shadow-md flex items-center gap-2"
            >
              <span v-if="isSending">발송 중... ({{ sentCount }}/{{ selectedStudents.length }})</span>
              <span v-else>🚀 선택한 학생에게 발송</span>
            </button>
          </div>
        </div>

        <!-- 탭 내용: 발송 이력 -->
        <div v-show="activeTab === 'history'" class="flex-1 overflow-y-auto flex flex-col p-4 bg-gray-50">
          <div v-if="isLoadingHistory" class="text-center py-10 text-gray-500">
            이력을 불러오는 중...
          </div>
          <div v-else-if="historyList.length === 0" class="text-center py-10 text-gray-400">
            발송 이력이 없습니다.
          </div>
          <div v-else class="space-y-3">
            <div v-for="item in historyList" :key="item.id" class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800">{{ item.students?.name || '알 수 없음' }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="item.receiver_type === 'parent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                    {{ item.receiver_type === 'parent' ? '학부모' : '학생' }}
                  </span>
                  <span class="text-xs text-gray-500">{{ item.receiver_phone }}</span>
                </div>
                <span class="text-xs font-bold px-2 py-1 rounded" :class="item.send_status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ item.send_status === 'success' ? '성공' : '실패' }}
                </span>
              </div>
              <div class="text-xs text-gray-500 mb-1">
                {{ new Date(item.send_at).toLocaleString() }}
              </div>
              
              <!-- 메시지 내용 (첫 줄만 보이거나 전체 보기) -->
              <div v-if="item.message_content" class="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 cursor-pointer hover:bg-gray-100 transition" @click="toggleExpand(item.id)">
                <div v-if="!expandedHistory.has(item.id)" class="text-sm text-gray-700 truncate font-medium">
                  {{ item.message_content.split('\n').find((l: string) => l.trim()) || item.message_content }}
                </div>
                <div v-else class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {{ item.message_content }}
                </div>
                <div class="text-center text-[10px] text-gray-400 mt-2 font-bold">
                  {{ expandedHistory.has(item.id) ? '▲ 접기' : '▼ 전체 내용 보기' }}
                </div>
              </div>

              <div v-if="item.error_message" class="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded">
                {{ item.error_message }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 결과 모달 -->
    <div v-if="showResultModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b text-center">
          <h3 class="text-xl font-bold text-gray-800">발송 결과</h3>
        </div>
        <div class="p-6 space-y-4 text-center">
          <div class="flex justify-center gap-8">
            <div class="bg-green-50 p-4 rounded-lg flex-1">
              <div class="text-sm text-green-700 font-bold mb-1">성공</div>
              <div class="text-3xl font-black text-green-600">{{ results.success }}</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg flex-1">
              <div class="text-sm text-red-700 font-bold mb-1">실패</div>
              <div class="text-3xl font-black text-red-600">{{ results.fail }}</div>
            </div>
          </div>
          
          <div v-if="results.fail > 0 && results.errors.length > 0" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-left overflow-y-auto max-h-32 text-xs text-red-600">
            <div class="font-bold mb-1">오류 상세:</div>
            <div v-for="(err, idx) in results.errors" :key="idx" class="mb-1 truncate">{{ err }}</div>
          </div>

          <p class="text-sm text-gray-500 mt-4">
            실패한 경우 학부모 연락처가 정확히 등록되어 있는지 확인해 주세요.
          </p>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-center">
          <button @click="showResultModal = false" class="px-8 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition">확인</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { studentApi, classApi, kakaoApi } from '../services/api';

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const students = ref<any[]>([]);
const classes = ref<any[]>([]);
const selectedClass = ref('');
const searchQuery = ref('');
const selectedStudents = ref<any[]>([]);

const selectedTemplate = ref('UG_9086');
const activeTab = ref('compose');
const historyList = ref<any[]>([]);
const isLoadingHistory = ref(false);
const expandedHistory = ref(new Set<number>());

const toggleExpand = (id: number) => {
  const newSet = new Set(expandedHistory.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  expandedHistory.value = newSet;
};

const formData = ref({
  date: getToday(),
  content: '',
  sendToParent: true,
  sendToStudent: false
});

const isSending = ref(false);
const sentCount = ref(0);
const showResultModal = ref(false);
const results = ref({ success: 0, fail: 0, errors: [] as string[], details: [] as string[] });

const fetchStudents = async () => {
  try {
    const res = await studentApi.getAll({ status: 'active' });
    if (res.data.success) {
      students.value = res.data.data;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchClasses = async () => {
  try {
    const res = await classApi.getAll();
    if (res.data.success) {
      classes.value = res.data.data;
    }
  } catch (err) {
    console.error(err);
  }
};

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const matchClass = selectedClass.value ? s.class_name?.includes(selectedClass.value) : true;
    const matchName = searchQuery.value ? s.name?.includes(searchQuery.value) : true;
    return matchClass && matchName;
  });
});

const isAllSelected = computed(() => {
  return filteredStudents.value.length > 0 && selectedStudents.value.length === filteredStudents.value.length;
});

const toggleSelectAll = (e: any) => {
  if (e.target.checked) {
    selectedStudents.value = [...filteredStudents.value];
  } else {
    selectedStudents.value = [];
  }
};

const handleClassChange = () => {
  selectedStudents.value = []; // 반 변경 시 선택 초기화
};

const previewStudent = computed(() => {
  if (selectedStudents.value.length > 0) {
    const s = selectedStudents.value[0];
    let displayClass = '-';
    if (s.class_name) {
      displayClass = s.class_name.split(',')[0].trim();
    }
    return { name: s.name, class: displayClass };
  }
  return { name: '홍길동', class: '화목 수능' };
});

const sendMessages = async () => {
  if (!confirm(`${selectedStudents.value.length}명에게 알림톡을 발송하시겠습니까?`)) return;

  isSending.value = true;
  sentCount.value = 0;
  results.value = { success: 0, fail: 0, errors: [] };

  for (const student of selectedStudents.value) {
    try {
      let className = '-';
      if (student.class_name) {
        className = student.class_name.split(',')[0].trim();
      }

      const targets = [];
      if (formData.value.sendToParent) targets.push('parent');
      if (formData.value.sendToStudent) targets.push('student');

      const payload = {
        student_id: student.id,
        class_name: className,
        date: formData.value.date,
        content: formData.value.content,
        targets: targets
      };

      const res = await kakaoApi.sendCounselingNotification(payload);
      
      // 서버에서 돌아온 응답(data 배열)을 분석하여 건수별로 카운팅
      if (res.data.data && Array.isArray(res.data.data)) {
        res.data.data.forEach((item: any) => {
          let currentSuccess = false;
          if (item) {
            if (item.result_code == 1 || String(item.result_code) === '1') currentSuccess = true;
            else if (item.code == 0 || String(item.code) === '0') currentSuccess = true;
            else if (item.message && (item.message.includes('성공') || item.message.toLowerCase().includes('success'))) currentSuccess = true;
          }
          if (currentSuccess) {
            results.value.success++;
          } else {
            results.value.fail++;
            results.value.errors.push(`${student.name}: ${item?.message || '발송 실패'}`);
          }
        });
      } else {
        // 하위 호환성
        if (res.data.success) {
          results.value.success++;
        } else {
          results.value.fail++;
          if (res.data.message) {
            results.value.errors.push(`${student.name}: ${res.data.message}`);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      results.value.fail++;
      results.value.errors.push(`${student.name}: ${err.response?.data?.message || err.message}`);
    }
    sentCount.value++;
  }

  isSending.value = false;
  showResultModal.value = true;
};

const fetchHistory = async () => {
  if (activeTab.value !== 'history') return;
  isLoadingHistory.value = true;
  try {
    const res = await kakaoApi.getCounselingSendStatus();
    if (res.data.success) {
      historyList.value = res.data.data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoadingHistory.value = false;
  }
};

onMounted(() => {
  fetchClasses();
  fetchStudents();
});
</script>
