<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">학원비 수납 관리</h2>

    <!-- 필터 및 검색 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          v-model="filters.student_name"
          type="text"
          placeholder="학생 이름 검색"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="fetchPayments"
        />
        <input
          v-model="filters.billing_month"
          type="month"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @change="fetchPayments"
        />
        <select
          v-model="filters.status"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @change="fetchPayments"
        >
          <option value="">전체 상태</option>
          <option value="paid">완료</option>
          <option value="unpaid">미납</option>
        </select>
        <button
          @click="initMonthlyBilling"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          title="매월 1일 모든 학생의 수납 기록을 생성합니다."
        >
          🔄 수납 생성
        </button>
        <button
          @click="openModal('create')"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          + 직접 등록
        </button>
      </div>
    </div>

    <!-- 수납 목록 -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">청구월</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생명</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">반</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제일/수단</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
              {{ payment.billing_month }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ payment.student_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ payment.class_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
              ₩{{ (payment.amount || 0).toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                class="px-2 py-1 rounded text-xs font-bold"
                :class="payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ payment.status === 'paid' ? '완료' : '미납' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div v-if="payment.status === 'paid'">
                <p>{{ payment.payment_date }}</p>
                <p class="text-xs text-gray-400">{{ payment.payment_method }}</p>
              </div>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="openModal('edit', payment)"
                class="text-primary hover:text-primary-dark mr-3"
              >
                수정
              </button>
              <button
                @click="deletePayment(payment.id)"
                class="text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="payments.length === 0" class="text-center py-8 text-gray-500">
        기록된 수납 내역이 없습니다.
      </div>
    </div>

    <!-- 수납 등록/수정 모달 -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-xl font-bold mb-4">
          {{ modalMode === 'create' ? '수납 기록 등록' : '수납 기록 수정' }}
        </h3>

        <form @submit.prevent="savePayment">
          <div class="space-y-4">
            <!-- 학생 선택 (등록 시에만) -->
            <div v-if="modalMode === 'create'">
              <label class="block text-sm font-medium text-gray-700 mb-1">학생 선택 <span class="text-red-500">*</span></label>
              <select
                v-model="form.student_id"
                required
                class="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">학생을 선택하세요</option>
                <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }} ({{ s.class_name }})</option>
              </select>
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-1">학생</label>
              <p class="px-4 py-2 bg-gray-50 border rounded-lg text-gray-700">{{ selectedPaymentName }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">청구월 <span class="text-red-500">*</span></label>
                <input v-model="form.billing_month" type="date" required class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">금액 <span class="text-red-500">*</span></label>
                <input v-model.number="form.amount" type="number" required class="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input type="radio" v-model="form.status" value="unpaid" class="mr-2" /> 미납
                </label>
                <label class="flex items-center">
                  <input type="radio" v-model="form.status" value="paid" class="mr-2" /> 완료
                </label>
              </div>
            </div>

            <div v-if="form.status === 'paid'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">결제일</label>
                <input v-model="form.payment_date" type="date" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">결제 수단</label>
                <select v-model="form.payment_method" class="w-full px-4 py-2 border rounded-lg">
                  <option value="카드">카드</option>
                  <option value="계좌이체">계좌이체</option>
                  <option value="현금">현금</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">메모</label>
              <input v-model="form.remarks" type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="특이사항 입력" />
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              {{ modalMode === 'create' ? '등록' : '수정' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { paymentApi, studentApi } from '../services/api';
import type { Student } from '../types';

const payments = ref<any[]>([]);
const students = ref<Student[]>([]);
const loading = ref(true);
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedPaymentName = ref('');
        const form = ref<any>({
          student_id: '',
          amount: 0,
          billing_month: new Date().toISOString().split('T')[0],
          status: 'unpaid',
          payment_date: '',
          payment_method: '카드',
          remarks: ''
        });

        const filters = ref({
          student_name: '',
          billing_month: '',
          status: ''
        });

        const fetchPayments = async () => {
          try {
            loading.value = true;
            const response = await paymentApi.getAll(filters.value);
            if (response.data.success) {
              payments.value = response.data.data || [];
            }
          } catch (err) {
            console.error('수납 내역 로드 실패:', err);
          } finally {
            loading.value = false;
          }
        };

        const fetchStudents = async () => {
          try {
            const response = await studentApi.getAll();
            if (response.data.success) {
              students.value = response.data.data || [];
            }
          } catch (err) {
            console.error('학생 목록 로드 실패:', err);
          }
        };

        const openModal = (mode: 'create' | 'edit', payment?: any) => {
          modalMode.value = mode;
          if (mode === 'edit' && payment) {
            form.value = { ...payment };
            selectedPaymentName.value = payment.student_name;
          } else {
            form.value = {
              student_id: '',
              amount: 250000, // 기본 수강료 예시
              billing_month: new Date().toISOString().split('T')[0],
              status: 'unpaid',
              payment_date: new Date().toISOString().split('T')[0],
              payment_method: '카드',
              remarks: ''
            };
          }
          showModal.value = true;
        };

const closeModal = () => {
  showModal.value = false;
};

const savePayment = async () => {
  try {
    if (modalMode.value === 'create') {
      await paymentApi.create(form.value);
    } else {
      await paymentApi.update(form.value.id, form.value);
    }
    showModal.value = false;
    fetchPayments();
  } catch (err) {
    alert('저장 중 오류가 발생했습니다.');
  }
};

const initMonthlyBilling = async () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (!confirm(`${currentMonth}월 기준, 모든 학생의 수납 기록(미납 상태)을 생성하시겠습니까?\n이미 생성된 기록은 중복 생성되지 않습니다.`)) return;

  try {
    loading.value = true;
    let createdCount = 0;
    
    for (const student of students.value) {
      // 해당 학생의 해당 월 기록이 이미 있는지 확인
      const existing = payments.value.find(p => p.student_id === student.id && p.billing_month === currentMonth);
      if (!existing) {
        await paymentApi.create({
          student_id: student.id,
          amount: student.monthly_tuition || 0,
          billing_month: currentMonth,
          status: 'unpaid'
        });
        createdCount++;
      }
    }
    
    alert(`${createdCount}명의 수납 기록이 생성되었습니다.`);
    fetchPayments();
  } catch (err) {
    alert('수납 기록 생성 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

const deletePayment = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await paymentApi.delete(id);
    fetchPayments();
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다.');
  }
};

onMounted(() => {
  fetchPayments();
  fetchStudents();
});
</script>
