<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">설정 관리</h2>

    <!-- 종합 문구 관리 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">종합 문구 관리</h3>
      <p class="text-sm text-gray-500 mb-4">
        성적표 하단에 표시될 종합 문구를 입력하세요. 원장님이 직접 입력하실 수 있습니다.
      </p>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          종합 문구
        </label>
        <textarea
          v-model="commentForm.value"
          rows="4"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="예: 이번 달도 열심히 노력해주세요!"
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button
          @click="saveComment"
          :disabled="saving"
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
        >
          {{ saving ? '저장 중...' : '저장하기' }}
        </button>
      </div>
    </div>

    <!-- 저장 성공 알림 -->
    <div
      v-if="saveSuccess"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
    >
      종합 문구가 저장되었습니다!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settingsApi } from '../services/api';

const commentForm = ref({
  value: ''
});
const saving = ref(false);
const saveSuccess = ref(false);

const fetchComment = async () => {
  try {
    const response = await settingsApi.getComment();
    if (response.data.success && response.data.data) {
      commentForm.value.value = response.data.data.value || '';
    }
  } catch (err) {
    console.error('종합 문구 불러오기 실패:', err);
  }
};

const saveComment = async () => {
  try {
    saving.value = true;
    await settingsApi.setComment(commentForm.value.value);
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err: any) {
    alert(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    console.error(err);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchComment();
});
</script>

<style scoped>
.text-primary {
  color: #1e3a8a;
}

.bg-primary {
  background-color: #1e3a8a;
}

.bg-primary-dark {
  background-color: #1e40af;
}
</style>
