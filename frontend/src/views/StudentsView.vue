<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">학생 관리</h2>
      <div class="flex space-x-3">
        <button
          @click="downloadStudentList"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          📊 학생명단 Excel 다운로드
        </button>
        <button
          @click="downloadTemplate"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          📥 Excel 양식 다운로드
        </button>
        <label
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          📤 Excel 업로드
          <input
            type="file"
            accept=".xlsx,.xls"
            @change="handleFileUpload"
            class="hidden"
          />
        </label>
        <button
          @click="openModal('create')"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          + 학생 등록
        </button>
      </div>
    </div>

    <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="text-sm font-medium text-gray-600">
          <span class="mr-4">
            전체 학생 수: <span class="text-primary font-bold">{{ totalStudentCount }}</span>명 |
            검색 결과: <span class="text-green-600 font-bold">{{ students.length }}</span>명
          </span>
        </div>
        <!-- 재원생 / 퇴원생 토글 -->
        <div class="flex items-center space-x-2">
          <button
            class="px-3 py-1 rounded-full text-sm font-medium border"
            :class="currentStatus === 'active' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300'"
            @click="changeStatusFilter('active')"
          >
            재원생
          </button>
          <button
            class="px-3 py-1 rounded-full text-sm font-medium border"
            :class="currentStatus === 'withdrawn' ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300'"
            @click="changeStatusFilter('withdrawn')"
          >
            퇴원생
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="학생 이름 검색"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @input="handleSearchInput"
        />
        <select
          v-model="filters.class_name"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @change="fetchStudents"
        >
          <option value="">전체 반</option>
          <option
            v-for="className in allAvailableClasses"
            :key="className"
            :value="className"
          >
            {{ className }}
          </option>
        </select>
        <select
          v-model="filters.grade"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @change="fetchStudents"
        >
          <option value="">전체 학년</option>
          <option v-for="grade in allAvailableGrades" :key="grade" :value="grade">
            {{ grade }}학년
          </option>
        </select>
        <button
          @click="resetFilters"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          초기화
        </button>
      </div>
    </div>

    <!-- 일괄 반 이동 모달 -->
    <div
      v-if="showClassMoveModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">반 일괄 이동</h3>
        <p class="text-sm text-gray-600 mb-4">
          선택한 {{ selectedStudents.length }}명의 학생을 이동할 반을 선택하세요.
        </p>
        <div class="space-y-3 mb-4">
          <div v-for="className in allAvailableClasses" :key="className" class="flex items-center">
            <input
              :id="`class-${className}`"
              type="checkbox"
              :value="className"
              v-model="targetClasses"
              class="mr-2"
            />
            <label :for="`class-${className}`" class="text-sm text-gray-700">
              {{ className }}
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="class-new"
              type="checkbox"
              v-model="showNewClassInput"
              class="mr-2"
            />
            <label for="class-new" class="text-sm text-gray-700">새 반 추가</label>
          </div>
          <input
            v-if="showNewClassInput"
            v-model="newClassName"
            type="text"
            placeholder="반 이름 입력 (예: D반)"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="showClassMoveModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            취소
          </button>
          <button
            @click="moveStudentsToClasses"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            이동
          </button>
        </div>
      </div>
    </div>

    <!-- 학생 목록 -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- 일괄 작업 버튼 -->
      <div v-if="selectedStudents.length > 0" class="p-4 bg-blue-50 border-b flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">
          {{ selectedStudents.length }}명 선택됨
        </span>
        <div class="flex space-x-3">
          <button
            @click="openClassMoveModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            반 이동
          </button>
          <button
            v-if="isAdmin"
            @click="deleteSelectedStudents"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            선택 삭제
          </button>
        </div>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left">
              <input
                type="checkbox"
                @change="toggleSelectAll"
                :checked="selectedStudents.length === sortedStudents.length && sortedStudents.length > 0"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </th>
            <th class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">
              <button
                type="button"
                @click="toggleDateSort"
                class="flex items-center gap-1 text-gray-700 hover:text-primary"
              >
                <span>등록일시</span>
                <span v-if="dateSortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </button>
            </th>
            <th class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">이름</th>
            <th class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">학교</th>
            <th class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">학년</th>
            <th class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">반</th>
            <th class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">담임</th>
            <th class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">학생 연락처</th>
            <th class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">학부모 연락처</th>
            <th v-if="currentStatus === 'withdrawn'" class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">
              퇴원일
            </th>
            <th v-if="currentStatus === 'withdrawn'" class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">
              퇴원 사유
            </th>
            <th v-if="currentStatus === 'withdrawn'" class="px-6 py-3 text-left text-base font-bold text-gray-700 uppercase">
              퇴원 담당
            </th>
            <th class="px-6 py-3 text-center text-base font-bold text-gray-700 uppercase">상담내용</th>
            <th v-if="isAdmin" class="px-6 py-3 text-center text-base font-bold text-gray-700 uppercase">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="student in sortedStudents" :key="student.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                :value="student.id"
                v-model="selectedStudents"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600">
              {{ formatDate(student.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
              {{ student.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600">
              {{ student.school || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600">
              {{ student.grade || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600">
              <div v-if="student.classes && student.classes.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="(className, idx) in student.classes"
                  :key="idx"
                  class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium"
                >
                  {{ className }}
                </span>
              </div>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600">
              {{ student.teacher_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600">
              {{ formatPhone(student.student_no) || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600">
              <div class="flex flex-col">
                <span :class="student.phone ? 'text-blue-600 font-medium' : 'text-gray-600'">
                  {{ formatPhone(student.parent_phone) }}
                </span>
                <span v-if="student.phone" class="text-gray-500 text-sm mt-1">
                  {{ formatPhone(student.phone) }}
                </span>
              </div>
            </td>
            <td
              v-if="currentStatus === 'withdrawn'"
              class="px-6 py-4 whitespace-nowrap text-base text-gray-600"
            >
              {{ formatDate(student.withdraw_date || '') }}
            </td>
            <td
              v-if="currentStatus === 'withdrawn'"
              class="px-6 py-4 whitespace-nowrap text-base text-gray-600"
            >
              <span class="line-clamp-2" :title="student.withdraw_reason || '-'">
                {{ student.withdraw_reason || '-' }}
              </span>
            </td>
            <td
              v-if="currentStatus === 'withdrawn'"
              class="px-6 py-4 whitespace-nowrap text-base text-gray-600"
            >
              {{ student.withdraw_teacher || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-base text-center">
              <button
                @click="openCounselingModal(student)"
                class="text-green-600 hover:text-green-800 font-bold"
              >
                상담
              </button>
            </td>
            <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-base text-center font-medium space-x-3">
              <button
                @click="openModal('edit', student)"
                class="text-primary hover:text-primary-dark"
              >
                수정
              </button>
              <button
                v-if="currentStatus === 'active'"
                @click="openWithdrawModal(student)"
                class="text-orange-600 hover:text-orange-800"
              >
                퇴원
              </button>
              <button
                v-if="currentStatus === 'withdrawn'"
                @click="reEnrollStudent(student)"
                class="text-green-600 hover:text-green-800"
              >
                재등록
              </button>
              <button
                @click="deleteStudent(student.id)"
                class="text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="students.length === 0" class="text-center py-8 text-gray-500">
        등록된 학생이 없습니다.
      </div>
    </div>

    <!-- 학생 등록/수정 모달 -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">
          {{ modalMode === 'create' ? '학생 등록' : '학생 수정' }}
        </h3>

        <form @submit.prevent="saveStudent">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학생 이름 <span class="text-red-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">등록일시</label>
              <input
                v-model="form.created_at"
                type="date"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p class="text-xs text-gray-500 mt-1">선택하지 않으면 현재 날짜로 자동 설정됩니다.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학생 연락처</label>
              <input
                v-model="form.student_no"
                type="tel"
                placeholder="01012345678"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학교</label>
              <select
                v-model="form.school"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                @change="handleSchoolChange"
              >
                <option value="">학교 선택</option>
                <option value="청수초">청수초</option>
                <option value="하늘빛초">하늘빛초</option>
                <option value="하늘빛중">하늘빛중</option>
                <option value="모담중">모담중</option>
                <option value="푸른솔중">푸른솔중</option>
                <option value="제일고">제일고</option>
                <option value="운양고">운양고</option>
                <option value="운유고">운유고</option>
                <option value="custom">직접입력</option>
              </select>
              <input
                v-if="showCustomSchoolInput"
                v-model="customSchoolName"
                type="text"
                placeholder="학교명 직접 입력"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                @input="updateCustomSchool"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학년</label>
              <select
                v-model="form.grade"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">학년 선택</option>
                <option v-for="n in 6" :key="n" :value="n.toString()">{{ n }}학년</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">담임 선생님</label>
              <select
                v-model="form.teacher_name"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">선생님 선택</option>
                <option value="댄T">댄T</option>
                <option value="마이크T">마이크T</option>
                <option value="첼시원장">첼시원장</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">반 (중복 선택 가능)</label>
              <div class="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                <div v-for="className in allAvailableClasses" :key="className" class="flex items-center">
                  <input
                    :id="`form-class-${className}`"
                    type="checkbox"
                    :value="className"
                    v-model="form.classes"
                    class="mr-2 rounded border-gray-300"
                  />
                  <label :for="`form-class-${className}`" class="text-sm text-gray-700">
                    {{ className }}
                  </label>
                </div>
                <div class="flex items-center mt-2">
                  <input
                    id="form-class-new"
                    type="checkbox"
                    v-model="showNewClassInput"
                    class="mr-2 rounded border-gray-300"
                  />
                  <label for="form-class-new" class="text-sm text-gray-700">새 반 추가</label>
                </div>
                <input
                  v-if="showNewClassInput"
                  v-model="newClassName"
                  type="text"
                  placeholder="반 이름 입력 (예: D반)"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  @keyup.enter="addNewClass"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                학부모 연락처 1 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.parent_phone"
                type="tel"
                required
                placeholder="01012345678"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">학부모 연락처 2</label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="01012345678"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
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

    <!-- 퇴원 처리 모달 -->
    <div
      v-if="showWithdrawModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">
          {{ withdrawTargetStudent?.name }} 학생 퇴원 처리
        </h3>

        <form @submit.prevent="submitWithdraw">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                퇴원 날짜 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="withdrawForm.withdraw_date"
                type="date"
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">담당 선생님</label>
              <select
                v-model="withdrawForm.withdraw_teacher"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">선생님 선택</option>
                <option value="댄T">댄T</option>
                <option value="마이크T">마이크T</option>
                <option value="첼시원장">첼시원장</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">퇴원 사유</label>
              <textarea
                v-model="withdrawForm.withdraw_reason"
                rows="3"
                placeholder="퇴원 사유를 입력하세요."
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeWithdrawModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              퇴원 처리
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 상담일지 모달 -->
    <div
      v-if="showCounselingModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div class="p-4 border-b bg-green-600 text-white flex justify-between items-center rounded-t-lg">
          <h3 class="text-xl font-bold">{{ selectedStudentForCounseling?.name }} 학생 상담일지</h3>
          <button @click="closeCounselingModal" class="text-2xl font-bold">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <!-- 상담 입력 폼 -->
          <div class="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-gray-700 mb-3">새 상담 기록</h4>
            <div class="grid grid-cols-3 gap-4 mb-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">상담 날짜</label>
                <input v-model="counselingForm.consultation_date" type="date" class="w-full px-3 py-2 text-sm border rounded" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">상담자</label>
                <input v-model="counselingForm.counselor_name" type="text" class="w-full px-3 py-2 text-sm border rounded" placeholder="선생님 성함" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">상담 유형</label>
                <select v-model="counselingForm.category" class="w-full px-3 py-2 text-sm border rounded">
                  <option value="일반상담">일반상담</option>
                  <option value="학습상담">학습상담</option>
                  <option value="진학상담">진학상담</option>
                  <option value="생활상담">생활상담</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="block text-xs text-gray-500 mb-1">상담 내용</label>
              <textarea v-model="counselingForm.content" rows="3" class="w-full px-3 py-2 text-sm border rounded" placeholder="상담 내용을 입력하세요"></textarea>
            </div>
            <div class="flex justify-end">
              <button @click="saveCounselingLog" class="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                기록 저장
              </button>
            </div>
          </div>

          <!-- 상담 히스토리 -->
          <div>
            <h4 class="font-bold text-gray-700 mb-4">상담 히스토리 ({{ counselingLogs.length }}건)</h4>
            <div v-if="counselingLogs.length === 0" class="text-center py-8 text-gray-400 text-sm">
              기록된 상담 내역이 없습니다.
            </div>
            <div v-else class="space-y-4">
              <div v-for="log in counselingLogs" :key="log.id" class="border-l-4 border-green-500 bg-white p-4 shadow-sm rounded-r-lg border-y border-r">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">{{ log.category }}</span>
                    <span class="text-xs text-gray-500">{{ log.consultation_date }}</span>
                  </div>
                  <button @click="deleteCounselingLog(log.id)" class="text-red-400 hover:text-red-600 text-xs">삭제</button>
                </div>
                <p class="text-sm text-gray-800 whitespace-pre-wrap mb-2">{{ log.content }}</p>
                <div class="text-right">
                  <span class="text-xs text-gray-400">작성자: {{ log.counselor_name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t bg-gray-50 text-right rounded-b-lg">
          <button @click="closeCounselingModal" class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { studentApi, excelApi, counselingApi, classApi } from '../services/api';
import type { Student } from '../types';
import { normalizeClassName } from '../utils/string';
import * as XLSX from 'xlsx';

const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;
const isAdmin = user?.role === 'admin';

const students = ref<Student[]>([]);
const dateSortOrder = ref<'asc' | 'desc'>('desc');
// 재원/퇴원 상태 필터
const currentStatus = ref<'active' | 'withdrawn'>('active');

const sortedStudents = computed(() => {
  const list = [...students.value];
  // created_at 기준 정렬 (기본: 최신순)
  return list.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateSortOrder.value === 'asc' ? aTime - bTime : bTime - aTime;
  });
});
const totalStudentCount = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const form = ref<Partial<Student & { classes: string[] }>>({ classes: [] });
const filters = ref({
  search: '',
  class_name: '',
  grade: ''
});

// 검색 디바운스용 타이머
let searchTimer: any = null;

const handleSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchStudents();
  }, 500); // 0.5초 대기 후 검색
};

const selectedStudents = ref<number[]>([]);
const showClassMoveModal = ref(false);
const targetClasses = ref<string[]>([]);
const showNewClassInput = ref(false);
const newClassName = ref('');
const availableClasses = ref<string[]>([]);

// 학교 직접 입력 관련
const showCustomSchoolInput = ref(false);
const customSchoolName = ref('');

// 퇴원 처리 관련 상태
const showWithdrawModal = ref(false);
const withdrawTargetStudent = ref<Student | null>(null);
const withdrawForm = ref<{
  withdraw_date: string;
  withdraw_reason: string;
  withdraw_teacher: string;
}>({
  withdraw_date: new Date().toISOString().split('T')[0],
  withdraw_reason: '',
  withdraw_teacher: ''
});

const handleSchoolChange = () => {
  if (form.value.school === 'custom') {
    showCustomSchoolInput.value = true;
    form.value.school = '';
  } else {
    showCustomSchoolInput.value = false;
    customSchoolName.value = '';
  }
};

const updateCustomSchool = () => {
  form.value.school = customSchoolName.value;
};

// 상담일지 관련 상태
const showCounselingModal = ref(false);
const selectedStudentForCounseling = ref<Student | null>(null);
const counselingLogs = ref<any[]>([]);
const counselingForm = ref({
  counselor_name: '',
  category: '일반상담',
  content: '',
  consultation_date: new Date().toISOString().split('T')[0]
});

const openCounselingModal = async (student: Student) => {
  selectedStudentForCounseling.value = student;
  showCounselingModal.value = true;
  await fetchCounselingLogs(student.id);
};

const closeCounselingModal = () => {
  showCounselingModal.value = false;
  selectedStudentForCounseling.value = null;
  counselingLogs.value = [];
  counselingForm.value = {
    counselor_name: '',
    category: '일반상담',
    content: '',
    consultation_date: new Date().toISOString().split('T')[0]
  };
};

const fetchCounselingLogs = async (studentId: number) => {
  try {
    const response = await counselingApi.getLogs(studentId);
    if (response.data.success) {
      counselingLogs.value = response.data.data;
    }
  } catch (err) {
    console.error('상담일지 로드 실패:', err);
  }
};

const saveCounselingLog = async () => {
  if (!selectedStudentForCounseling.value) return;
  if (!counselingForm.value.counselor_name || !counselingForm.value.content) {
    alert('상담자와 내용을 입력해주세요.');
    return;
  }

  try {
    const response = await counselingApi.createLog({
      student_id: selectedStudentForCounseling.value.id,
      ...counselingForm.value
    });
    if (response.data.success) {
      alert('상담 기록이 저장되었습니다.');
      counselingForm.value.content = '';
      await fetchCounselingLogs(selectedStudentForCounseling.value.id);
    }
  } catch (err) {
    alert('상담 기록 저장 중 오류가 발생했습니다.');
  }
};

const deleteCounselingLog = async (id: number) => {
  if (!confirm('상담 기록을 삭제하시겠습니까?')) return;
  try {
    const response = await counselingApi.deleteLog(id);
    if (response.data.success && selectedStudentForCounseling.value) {
      await fetchCounselingLogs(selectedStudentForCounseling.value.id);
    }
  } catch (err) {
    alert('상담 기록 삭제 중 오류가 발생했습니다.');
  }
};

const formatPhone = (phone: string) => {
  if (!phone) return '-';
  if (phone.length === 11) {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

const availableGrades = ref<string[]>([]);
const allAvailableClasses = ref<string[]>([]);
const allAvailableGrades = ref<string[]>([]);
const registeredClasses = ref<any[]>([]);

// 필터 목록 초기화 (전체 학생 기반)
const initFilterOptions = async () => {
  try {
    // 1. 반 관리에서 등록된 실제 반 목록 가져오기
    const classResponse = await classApi.getAll();
    if (classResponse.data.success) {
      registeredClasses.value = classResponse.data.data;
      allAvailableClasses.value = classResponse.data.data.map((c: any) => c.name).sort();
    }

    // 2. 학생 데이터를 기반으로 학년 목록 가져오기
    const studentResponse = await studentApi.getAll({});
    if (studentResponse.data.success && studentResponse.data.data) {
      const allStudents = studentResponse.data.data;
      const gradesSet = new Set<string>();
      
      allStudents.forEach((student: any) => {
        if (student.grade) {
          gradesSet.add(student.grade.toString());
        }
      });
      
      allAvailableGrades.value = Array.from(gradesSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
  } catch (err) {
    console.error('필터 옵션 초기화 실패:', err);
  }
};

const fetchStudents = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const activeFilters: any = {};
    if (filters.value.search) activeFilters.search = filters.value.search;
    if (filters.value.class_name) activeFilters.class_name = filters.value.class_name;
    if (filters.value.grade) activeFilters.grade = filters.value.grade;
    activeFilters.status = currentStatus.value;

    const response = await studentApi.getAll(activeFilters);
    if (response.data.success && response.data.data) {
      students.value = response.data.data;
      
      // 필터가 없을 때의 전체 학생 수 업데이트
      if (!filters.value.search && !filters.value.class_name && !filters.value.grade) {
        totalStudentCount.value = response.data.data.length;
      } else if (totalStudentCount.value === 0) {
        // 처음 로딩 시 필터가 있더라도 전체 수를 알기 위해 별도 호출하거나 초기값 설정
        const totalRes = await studentApi.getAll({});
        if (totalRes.data.success) {
          totalStudentCount.value = totalRes.data.data.length;
        }
      }
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '학생 목록을 불러오는 중 오류가 발생했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changeStatusFilter = (status: 'active' | 'withdrawn') => {
  if (currentStatus.value === status) return;
  currentStatus.value = status;
  // 상태 변경 시 선택된 학생 초기화 및 목록 재조회
  selectedStudents.value = [];
  fetchStudents();
};

// 전체 선택/해제
const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    selectedStudents.value = sortedStudents.value.map(s => s.id);
  } else {
    selectedStudents.value = [];
  }
};

const toggleDateSort = () => {
  dateSortOrder.value = dateSortOrder.value === 'desc' ? 'asc' : 'desc';
};

// 반 이동 모달 열기
const openClassMoveModal = () => {
  if (selectedStudents.value.length === 0) {
    alert('이동할 학생을 선택해주세요.');
    return;
  }
  targetClasses.value = [];
  showNewClassInput.value = false;
  newClassName.value = '';
  showClassMoveModal.value = true;
};

// 새 반 추가
const addNewClass = () => {
  if (newClassName.value.trim()) {
    const className = newClassName.value.trim();
    if (!allAvailableClasses.value.includes(className)) {
      allAvailableClasses.value.push(className);
      allAvailableClasses.value.sort();
    }
    if (!targetClasses.value.includes(className)) {
      targetClasses.value.push(className);
    }
    newClassName.value = '';
    showNewClassInput.value = false;
  }
};

// 학생 일괄 반 이동
const moveStudentsToClasses = async () => {
  if (targetClasses.value.length === 0 && !newClassName.value.trim()) {
    alert('이동할 반을 선택하거나 입력해주세요.');
    return;
  }

  let finalClasses = [...targetClasses.value];
  if (newClassName.value.trim()) {
    finalClasses.push(newClassName.value.trim());
  }

  if (finalClasses.length === 0) {
    alert('이동할 반을 선택해주세요.');
    return;
  }

  try {
    const response = await studentApi.updateClasses(selectedStudents.value, finalClasses);
    if (response.data.success) {
      alert(`${response.data.data.count}명의 학생 반이 변경되었습니다.`);
      showClassMoveModal.value = false;
      selectedStudents.value = [];
      fetchStudents();
    } else {
      alert(response.data.message || '반 이동 중 오류가 발생했습니다.');
    }
  } catch (err: any) {
    alert(err.response?.data?.message || '반 이동 중 오류가 발생했습니다.');
    console.error(err);
  }
};

const openModal = (mode: 'create' | 'edit', student?: Student) => {
  modalMode.value = mode;
  showCustomSchoolInput.value = false;
  customSchoolName.value = '';
  
  if (mode === 'edit' && student) {
    // created_at을 날짜 형식(yyyy-mm-dd)으로 변환
    let created_at_date = '';
    if (student.created_at) {
      const date = new Date(student.created_at);
      created_at_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    form.value = {
      ...student,
      created_at: created_at_date,
      classes: (student as any).classes || (student.class_name ? student.class_name.split(',').map((c: string) => normalizeClassName(c)).filter((c: string) => c) : [])
    };
    
    // 기존 학교가 목록에 없는 경우 직접 입력 모드로 전환
    const defaultSchools = ['청수초', '하늘빛초', '하늘빛중', '모담중', '푸른솔중', '제일고', '운양고', '운유고'];
    if (student.school && !defaultSchools.includes(student.school)) {
      showCustomSchoolInput.value = true;
      customSchoolName.value = student.school;
    }
  } else {
    form.value = { classes: [], created_at: '' };
  }
  showNewClassInput.value = false;
  newClassName.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  form.value = { classes: [], created_at: '' };
  showNewClassInput.value = false;
  newClassName.value = '';
};

// 퇴원 모달 열기
const openWithdrawModal = (student: Student) => {
  withdrawTargetStudent.value = student;
  showWithdrawModal.value = true;
  withdrawForm.value = {
    withdraw_date: new Date().toISOString().split('T')[0],
    withdraw_reason: '',
    withdraw_teacher: ''
  };
};

const closeWithdrawModal = () => {
  showWithdrawModal.value = false;
  withdrawTargetStudent.value = null;
};

const submitWithdraw = async () => {
  if (!withdrawTargetStudent.value) return;

  if (!withdrawForm.value.withdraw_date) {
    alert('퇴원 날짜를 선택해주세요.');
    return;
  }

  if (!confirm(`${withdrawTargetStudent.value.name} 학생을 퇴원 처리하시겠습니까?`)) {
    return;
  }

  try {
    await studentApi.withdraw(withdrawTargetStudent.value.id, {
      withdraw_date: withdrawForm.value.withdraw_date,
      withdraw_reason: withdrawForm.value.withdraw_reason || undefined,
      withdraw_teacher: withdrawForm.value.withdraw_teacher || undefined
    });
    alert('퇴원 처리가 완료되었습니다.');
    closeWithdrawModal();
    await initFilterOptions();
    await fetchStudents();
  } catch (err: any) {
    alert(err.response?.data?.message || '퇴원 처리 중 오류가 발생했습니다.');
    console.error(err);
  }
};

// 재등록 처리
const reEnrollStudent = async (student: Student) => {
  if (!confirm(`${student.name} 학생을 재등록 처리하시겠습니까?`)) return;
  try {
    await studentApi.reEnroll(student.id);
    alert('재등록(복귀) 처리가 완료되었습니다.');
    await initFilterOptions();
    await fetchStudents();
  } catch (err: any) {
    alert((err as any).response?.data?.message || '재등록 처리 중 오류가 발생했습니다.');
    console.error(err);
  }
};

const saveStudent = async () => {
  try {
    // 새 반 추가 처리
    if (showNewClassInput.value && newClassName.value.trim()) {
      const className = newClassName.value.trim();
      if (!form.value.classes) form.value.classes = [];
      if (!form.value.classes.includes(className)) {
        form.value.classes.push(className);
      }
    }

    const studentData: any = {
      name: form.value.name,
      student_no: form.value.student_no,
      grade: form.value.grade,
      school: form.value.school,
      teacher_name: form.value.teacher_name,
      monthly_tuition: form.value.monthly_tuition || 0,
      class_name: form.value.classes || [],
      phone: form.value.phone,
      parent_name: form.value.parent_name,
      parent_phone: form.value.parent_phone
    };

    // 등록일시가 입력된 경우 ISO 형식으로 변환하여 전달
    if (form.value.created_at) {
      // 날짜만 입력된 경우 시간을 00:00:00으로 설정 (KST 기준)
      studentData.created_at = `${form.value.created_at}T00:00:00+09:00`;
    }

    if (modalMode.value === 'create') {
      await studentApi.create(studentData);
    } else if (form.value.id) {
      await studentApi.update(form.value.id, studentData);
    }
    closeModal();
    // 학생 저장 후 필터 옵션도 갱신 (새로운 반/학년이 추가되었을 수 있으므로)
    await initFilterOptions();
    fetchStudents();
  } catch (err: any) {
    alert(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    console.error(err);
  }
};

const deleteStudent = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    await studentApi.delete(id);
    // 학생 삭제 후 필터 옵션도 갱신
    await initFilterOptions();
    fetchStudents();
  } catch (err: any) {
    alert(err.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    console.error(err);
  }
};

// 선택된 학생 일괄 삭제
const deleteSelectedStudents = async () => {
  if (selectedStudents.value.length === 0) return;
  
  if (!confirm(`선택한 ${selectedStudents.value.length}명의 학생을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`)) {
    return;
  }

  try {
    loading.value = true;
    // 순차적으로 삭제 처리 (또는 백엔드에 일괄 삭제 API 추가 가능)
    for (const id of selectedStudents.value) {
      await studentApi.delete(id);
    }
    
    alert('선택한 학생들의 삭제가 완료되었습니다.');
    selectedStudents.value = [];
    await initFilterOptions();
    await fetchStudents();
  } catch (err: any) {
    alert('일부 학생 삭제 중 오류가 발생했습니다.');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = { search: '', class_name: '', grade: '' };
  fetchStudents();
};

// 학생명단 Excel 다운로드
const downloadStudentList = () => {
  if (sortedStudents.value.length === 0) {
    alert('다운로드할 학생 데이터가 없습니다.');
    return;
  }

  try {
    // Excel 데이터 준비
    const excelData = sortedStudents.value.map((student) => {
      // 등록일시 포맷팅 (yy-mm-dd)
      const createdDate = student.created_at 
        ? formatDate(student.created_at) 
        : '-';
      
      // 반 정보 포맷팅 (배열이면 쉼표로 구분)
      const classes = (student as any).classes 
        ? (student as any).classes.join(', ')
        : student.class_name 
        ? student.class_name.split(',').map((c: string) => normalizeClassName(c)).join(', ')
        : '-';
      
      // 연락처 포맷팅
      const studentPhone = formatPhone(student.student_no) || '-';
      const parentPhone1 = formatPhone(student.parent_phone) || '-';
      const parentPhone2 = formatPhone(student.phone) || '-';

      return {
        '등록일시': createdDate,
        '이름': student.name || '-',
        '학교': student.school || '-',
        '학년': student.grade ? `${student.grade}학년` : '-',
        '반': classes,
        '담임': student.teacher_name || '-',
        '학생 연락처': studentPhone,
        '학부모 연락처1': parentPhone1,
        '학부모 연락처2': parentPhone2
      };
    });

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 자동 조정
    const colWidths = [
      { wch: 12 }, // 등록일시
      { wch: 10 }, // 이름
      { wch: 15 }, // 학교
      { wch: 8 },  // 학년
      { wch: 20 }, // 반
      { wch: 10 }, // 담임
      { wch: 15 }, // 학생 연락처
      { wch: 15 }, // 학부모 연락처1
      { wch: 15 }  // 학부모 연락처2
    ];
    ws['!cols'] = colWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '학생명단');

    // 파일명 생성 (현재 날짜 포함)
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const fileName = `학생명단_${dateStr}.xlsx`;

    // 파일 다운로드
    XLSX.writeFile(wb, fileName);
    
    alert(`학생명단 ${sortedStudents.value.length}명이 Excel 파일로 다운로드되었습니다.`);
  } catch (err) {
    console.error('Excel 다운로드 오류:', err);
    alert('Excel 파일 다운로드 중 오류가 발생했습니다.');
  }
};

// Excel 양식 다운로드
const downloadTemplate = async () => {
  try {
    const response = await excelApi.downloadTemplate();
    
    // Axios response.data가 Blob인지 확인 (api.ts에서 responseType: 'blob' 설정 필요)
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 서버에서 보낸 파일명 추출 시도
    const contentDisposition = response.headers['content-disposition'];
    let fileName = '학생명단_양식.xlsx';
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, '').replace('UTF-8\'\'', ''));
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    // 메모리 해제
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('Download error:', err);
    alert('양식 다운로드 중 오류가 발생했습니다.');
  }
};

// Excel 파일 업로드
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 파일 확장자 확인
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    alert('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
    return;
  }

  if (!confirm(`"${file.name}" 파일을 업로드하여 학생을 일괄 등록하시겠습니까?`)) {
    target.value = '';
    return;
  }

  try {
    const response = await excelApi.uploadStudents(file);
    
    if (response.data.success) {
      const { total, success, skipped, failed, details } = response.data.data || {};
      
      let message = `업로드 완료!\n\n`;
      message += `총 ${total}명 중\n`;
      message += `✅ 성공: ${success}명\n`;
      if (skipped > 0) message += `⏭️ 건너뜀: ${skipped}명\n`;
      if (failed > 0) message += `❌ 실패: ${failed}명\n`;
      
      if (details?.failed.length > 0) {
        message += `\n실패한 항목:\n`;
        details.failed.forEach((item: any) => {
          message += `- ${item.name}: ${item.reason}\n`;
        });
      }
      
      alert(message);
      fetchStudents(); // 학생 목록 새로고침
    } else {
      alert(response.data.message || '업로드 중 오류가 발생했습니다.');
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Excel 파일 업로드 중 오류가 발생했습니다.';
    alert(errorMessage);
    console.error('Excel 업로드 에러:', err);
  } finally {
    target.value = ''; // 파일 입력 초기화
  }
};

onMounted(() => {
  initFilterOptions();
  fetchStudents();
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
