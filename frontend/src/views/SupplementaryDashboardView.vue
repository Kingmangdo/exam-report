<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">보강 관리</h2>
    </div>

    <!-- 보강 현황 (보강 대시보드 전용 화면) -->
    <div class="bg-white rounded-lg shadow-lg border p-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            🕒 보강 현황
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            이번주(월~일) 기준 모든 반의 보강 일정과 명단을 한눈에 확인합니다.
          </p>
        </div>
        <span class="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-bold">
          총 {{ supplementaryDashboardSessions.length }}건
        </span>
      </div>

      <div v-if="supplementaryDashboardLoading" class="py-8 text-center text-gray-400 text-sm">
        보강 일정 불러오는 중...
      </div>
      <div v-else-if="supplementaryDashboardSessions.length === 0" class="py-8 text-center text-gray-400 text-sm">
        이번주 예정된 보강 일정이 없습니다.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="session in supplementaryDashboardSessions"
          :key="session.id"
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-lg px-4 py-3 hover:bg-gray-50 transition"
        >
          <div class="flex items-start gap-3">
            <div class="flex flex-col items-center text-xs font-bold text-purple-700">
              <span class="px-2 py-0.5 rounded bg-purple-50">
                {{ formatTime(session.session_date) }}
              </span>
              <span class="mt-1 text-[10px] text-gray-500">
                {{ session.class_name || '반 미지정' }}
              </span>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800 mb-1">
                {{ session.content }}
              </p>
              <p class="text-xs text-gray-600 mb-1">
                참여 학생
                <span class="font-bold text-purple-700">
                  {{ (session.supplementary_students || []).length }}명
                </span>
              </p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="stu in (session.supplementary_students || []).slice(0, 8)"
                  :key="stu.student_id"
                  class="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded"
                >
                  {{ stu.students?.name }}
                </span>
                <span
                  v-if="(session.supplementary_students || []).length > 8"
                  class="text-[11px] text-gray-400"
                >
                  외 {{ (session.supplementary_students || []).length - 8 }}명
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end md:justify-center gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold disabled:opacity-50"
              :disabled="sendingSessionId === session.id"
              @click="sendSupplementaryAlimtalk(session)"
            >
              {{ sendingSessionId === session.id ? '발송 중...' : '보강 알림톡 발송' }}
            </button>
            <button
              type="button"
              class="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold"
              @click="openClassFromDashboard(session)"
            >
              해당 반 보강 상세 관리
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { classApi, supplementaryApi, kakaoApi } from '../services/api';

const router = useRouter();
const supplementaryDashboardSessions = ref<any[]>([]);
const supplementaryDashboardLoading = ref(false);
const sendingSessionId = ref<number | null>(null);

// 이번주(월~일) 범위 계산
const getThisWeekRange = () => {
  const today = new Date();
  const day = today.getDay(); // 0: 일, 1: 월 ...
  const diffToMon = today.getDate() - day + (day === 0 ? -6 : 1); // 이번주 월요일
  const monday = new Date(today.setDate(diffToMon));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { start: monday, end: sunday };
};

// 보강 대시보드 데이터 로드 (모든 반 기준, 전용 API 사용)
const fetchSupplementaryDashboard = async () => {
  try {
    supplementaryDashboardLoading.value = true;
    const { start, end } = getThisWeekRange();

    const res = await supplementaryApi.getDashboardSessions(
      start.toISOString(),
      end.toISOString()
    );

    if (!res.data.success) {
      supplementaryDashboardSessions.value = [];
      return;
    }

    const sessions = res.data.data || [];

    // 날짜순 정렬 (백엔드에서도 정렬하지만, 안전하게 한 번 더)
    sessions.sort(
      (a: any, b: any) =>
        new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
    );

    supplementaryDashboardSessions.value = sessions;
  } catch (err) {
    console.error('보강 대시보드 로드 실패:', err);
  } finally {
    supplementaryDashboardLoading.value = false;
  }
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const kstTime = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  const m = String(kstTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kstTime.getUTCDate()).padStart(2, '0');
  const h = String(kstTime.getUTCHours()).padStart(2, '0');
  const mi = String(kstTime.getUTCMinutes()).padStart(2, '0');
  const day = ['일', '월', '화', '수', '목', '금', '토'][kstTime.getUTCDay()];
  return `${m}/${dd}(${day}) ${h}:${mi}`;
};

// 대시보드에서 해당 반 보강 관리(반 관리 화면)로 이동
const openClassFromDashboard = (session: any) => {
  if (!session.class_id) return;
  router.push({
    path: '/classes',
    query: {
      classId: String(session.class_id),
      tab: 'supplementary',
      className: session.class_name || ''
    }
  });
};

// 보강 알림톡 발송
const sendSupplementaryAlimtalk = async (session: any) => {
  if (!session.id) return;
  if (!confirm('해당 보강 세션의 참여 학생에게 보강 알림톡을 발송할까요?')) return;

  try {
    sendingSessionId.value = session.id;
    const res = await kakaoApi.sendSupplementaryNotification(session.id);
    if (res.data.success) {
      alert(res.data.message || '보강 알림톡을 발송했습니다.');
    } else {
      alert(res.data.message || '보강 알림톡 발송에 실패했습니다.');
    }
  } catch (err: any) {
    alert('보강 알림톡 발송 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
  } finally {
    sendingSessionId.value = null;
  }
};

onMounted(async () => {
  await fetchSupplementaryDashboard();
});
</script>

