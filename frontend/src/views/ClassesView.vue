
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">반 관리</h2>
      <button
        @click="openClassModal('create')"
        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
      >
        + 새 반 추가
      </button>
    </div>

    <!-- 오늘 숙제 검사 알림 배너 (숙제) -->
    <div
      v-if="homeworkDueTodayHomework.length > 0"
      class="mb-3 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm animate-pulse-slow"
    >
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🔔</span>
        <h3 class="text-lg font-bold text-red-700">오늘 숙제 검사날입니다.!</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="due in homeworkDueTodayHomework"
          :key="due.id"
          class="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-bold cursor-pointer hover:bg-red-200 transition"
          @click="goToClassHomeworkCheck(due)"
        >
          📋 {{ due.class_name || '반' }} - {{ due.content?.substring(0, 20) }}{{ (due.content?.length || 0) > 20 ? '...' : '' }}
        </span>
      </div>
    </div>

    <!-- 오늘 RT 검사 알림 배너 (RT) -->
    <div
      v-if="homeworkDueTodayRT.length > 0"
      class="mb-6 bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm animate-pulse-slow"
    >
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🔔</span>
        <h3 class="text-lg font-bold text-purple-700">오늘 RT</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="due in homeworkDueTodayRT"
          :key="due.id"
          class="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-bold cursor-pointer hover:bg-purple-200 transition"
          @click="goToClassHomeworkCheck(due)"
        >
          📋 {{ due.class_name || '반' }} - {{ due.content?.substring(0, 20) }}{{ (due.content?.length || 0) > 20 ? '...' : '' }}
        </span>
      </div>
    </div>

    <!-- 카테고리 탭 -->
    <div class="flex space-x-1 mb-6 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="currentTab = tab.id"
        class="px-6 py-3 text-base font-bold transition-colors relative"
        :class="currentTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab.label }}
        <span class="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ getClassCountByCategory(tab.id) }}</span>
      </button>
    </div>

    <!-- 반 리스트 (최대 20개 대응 - 컴팩트) -->
    <div class="flex flex-wrap gap-3 mb-6">
      <div
        v-for="item in filteredClasses"
        :key="item.id"
        class="bg-white rounded-lg shadow-sm px-4 py-3 border-l-4 hover:shadow-md transition cursor-pointer relative flex-shrink-0"
        :class="[
          selectedClass?.id === item.id ? 'ring-2 ring-primary bg-blue-50' : '',
          getCategoryColor(item.category)
        ]"
        @click="toggleClassSelection(item)"
      >
        <!-- 숙제 검사일 배지 -->
        <div v-if="hasHomeworkDue(item.id)" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow animate-bounce">
          📝
        </div>

        <div class="flex items-center gap-3">
          <div>
            <h3 class="text-base font-bold text-gray-800">{{ item.name }}</h3>
            <p class="text-xs text-gray-500">{{ item.teacher_name ? `담임: ${item.teacher_name}` : '담임 미지정' }} · {{ item.student_count || 0 }}명</p>
          </div>
          <div class="flex space-x-1 ml-2">
            <button @click.stop="openClassModal('edit', item)" class="text-gray-400 hover:text-primary">
              <span class="text-xs">수정</span>
            </button>
            <button @click.stop="deleteClass(item.id)" class="text-gray-400 hover:text-red-600">
              <span class="text-xs">삭제</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredClasses.length === 0" class="w-full py-8 text-center text-gray-400">
        해당 카테고리에 등록된 반이 없습니다.
      </div>
    </div>

    <!-- 선택된 반의 학생 관리 및 학습 관리 -->
    <div v-if="selectedClass" class="flex flex-col lg:flex-row gap-6">
      <!-- 왼쪽: 학생 목록 (35% 너비) -->
      <div class="lg:w-[35%] lg:flex-shrink-0 bg-white rounded-lg shadow-lg overflow-hidden border flex flex-col">
        <div class="p-3 bg-gray-50 border-b flex justify-between items-center">
          <h3 class="text-base font-bold text-gray-800">학생 목록</h3>
          <button
            v-if="isAdmin"
            @click="openStudentAssignModal"
            class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
          >
            추가/변경
          </button>
        </div>
        <div class="flex-1 overflow-y-auto max-h-[600px]">
          <table class="w-full divide-y divide-gray-200 table-fixed">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-2 py-2 text-left text-sm font-bold text-gray-600 w-[18%]">이름</th>
                <th class="px-2 py-2 text-left text-sm font-bold text-gray-600 w-[22%]">학교/학년</th>
                <th class="px-2 py-2 text-left text-sm font-bold text-gray-600 w-[38%]">연락처</th>
                <th class="px-2 py-2 text-left text-sm font-bold text-gray-600 w-[22%]">최근상담</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in sortedClassStudents" :key="student.id" class="hover:bg-gray-50 cursor-pointer" @click="openCounselingModal(student)">
                <td class="px-2 py-2.5 text-sm font-bold text-gray-900 truncate">
                  {{ student.name }}
                </td>
                <td class="px-2 py-2.5 text-sm text-gray-700 font-bold">
                  {{ student.school || '-' }}<br/>{{ student.grade || '-' }}
                </td>
                <td class="px-2 py-2.5 text-sm text-gray-600">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-bold">학: {{ formatPhone((student as any).student_no) }}</span>
                    <span class="font-extrabold text-blue-700">부: {{ formatPhone(student.parent_phone) }}</span>
                  </div>
                </td>
                <td class="px-2 py-2.5 text-sm text-gray-600 font-bold">
                  <div v-if="student.last_counseling_date" class="text-primary">
                    {{ student.last_counseling_date }}
                  </div>
                  <div v-else class="text-gray-300">-</div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="classStudents.length === 0" class="text-center py-8 text-gray-400 text-sm">
            배정된 학생 없음
          </div>
        </div>
      </div>

      <!-- 오른쪽: 반별 학습 관리 및 보강 관리 (65% 너비) -->
      <div class="lg:flex-1 bg-white rounded-lg shadow-lg overflow-hidden border flex flex-col">
        <!-- 탭 메뉴 -->
        <div class="flex border-b">
          <button 
            @click="activeRightTab = 'learning'" 
            class="flex-1 py-3 text-center font-bold text-sm transition-colors bg-primary text-white"
          >
            📚 학습 관리
          </button>
        </div>

        <!-- 학습 관리 내용 -->
        <div v-if="activeRightTab === 'learning'">
          <div class="p-4 bg-primary text-white flex justify-between items-center">
            <h3 class="text-lg font-bold">{{ selectedClass.name }} 학습 일지</h3>
          <div class="flex items-center gap-2">
              <label class="text-xs opacity-90">선택 날짜:</label>
              <input v-model="learningLogDate" type="date" class="px-2 py-1 text-xs border rounded text-gray-800" @change="fetchLearningLog" />
            <button
              type="button"
              @click.stop="clearSelectedClass"
              class="ml-2 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold"
            >
              ✕ 닫기
            </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 min-h-[400px]">
            <!-- 최근 3주 기록 목록 (사이드바) -->
            <div class="md:col-span-1 border-r bg-gray-50 p-4 overflow-y-auto max-h-[600px]">
              <h4 class="text-sm font-bold text-gray-600 uppercase mb-4 px-1">최근 3주 기록</h4>
              <div class="space-y-2">
                <button
                  v-for="log in recentLogDates"
                  :key="log.log_date"
                  @click="selectLogDate(log.log_date)"
                  class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition shadow-sm"
                  :class="learningLogDate === log.log_date ? 'bg-primary text-white' : (log.log_date === getTodayFull() ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-100')"
                >
                  <div class="font-bold">
                    {{ formatDateWithDay(log.log_date) }}
                    <span v-if="log.log_date === getTodayFull()" class="text-xs ml-1">(오늘)</span>
                  </div>
                  <div v-if="log.homework" class="mt-1 text-xs truncate" :class="learningLogDate === log.log_date ? 'text-blue-100' : 'text-gray-500'">
                    📝 {{ getHomeworkSummary(log.homework).substring(0, 20) }}{{ getHomeworkSummary(log.homework).length > 20 ? '...' : '' }}
                    <span v-if="hasHomeworkDueInLog(log.homework) || (log.homework_deadline === getTodayFull())" class="ml-1" :class="learningLogDate === log.log_date ? 'text-yellow-200 font-bold' : 'text-red-600 font-bold'">
                      🔔오늘검사
                    </span>
                  </div>
                </button>
                <div v-if="recentLogDates.length === 0" class="text-center py-8 text-gray-400 text-xs">
                  기록 없음
                </div>
              </div>
            </div>

            <!-- 입력 및 상세 내용 -->
            <div class="md:col-span-3 p-6 space-y-6">
              <div class="grid grid-cols-1 gap-6">
                <div class="flex gap-4">
                  <div class="w-[65%]">
                    <label class="block text-base font-bold text-gray-700 mb-2">진도</label>
                    <textarea v-model="learningLog.progress" rows="2" class="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary outline-none font-medium resize-none" placeholder="오늘 나간 진도를 입력하세요"></textarea>
                  </div>
                  <div class="w-[35%]">
                    <label class="block text-base font-bold text-gray-700 mb-2">교재</label>
                    <input v-model="learningLog.textbook" type="text" class="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary outline-none font-medium" placeholder="교재명" />
                  </div>
                </div>
                <div>
                  <div class="space-y-4">
                    <!-- 일반 숙제 -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-base font-bold text-gray-700">오늘 내준 숙제</label>
                        <button
                          type="button"
                          class="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 disabled:opacity-40"
                          @click="addHomework('homework')"
                          :disabled="homeworkItems.length >= 3"
                        >
                          + 추가
                        </button>
                      </div>
                      <div v-if="homeworkItems.length === 0" class="text-xs text-gray-400">
                        등록된 숙제가 없습니다. (+ 추가 버튼으로 추가하세요)
                      </div>
                      <div
                        v-for="(hw, idx) in homeworkItems"
                        :key="`hw-${idx}`"
                        class="flex items-center gap-2 mb-2"
                      >
                        <span class="text-xs font-bold text-gray-400 w-5 flex-shrink-0">{{ idx + 1 }}</span>
                        <input
                          v-model="hw.content"
                          type="text"
                          class="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary outline-none font-medium"
                          :placeholder="`숙제 ${idx + 1}`"
                        />
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <span class="text-xs text-red-600 font-bold">검사일:</span>
                          <input
                            v-model="hw.deadline"
                            type="date"
                            class="px-2 py-1.5 text-xs border-2 border-red-200 rounded-lg outline-none focus:ring-1 focus:ring-red-400 font-bold text-red-700 w-[140px]"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- RT 숙제 -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-base font-bold text-gray-700">오늘 내준 RT</label>
                        <button
                          type="button"
                          class="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 disabled:opacity-40"
                          @click="addHomework('rt')"
                          :disabled="rtItems.length >= 3"
                        >
                          + 추가
                        </button>
                      </div>
                      <div v-if="rtItems.length === 0" class="text-xs text-gray-400">
                        등록된 RT 숙제가 없습니다. (+ 추가 버튼으로 추가하세요)
                      </div>
                      <div
                        v-for="(hw, idx) in rtItems"
                        :key="`rt-${idx}`"
                        class="flex items-center gap-2 mb-2"
                      >
                        <span class="text-xs font-bold text-gray-400 w-5 flex-shrink-0">{{ idx + 1 }}</span>
                        <input
                          v-model="hw.content"
                          type="text"
                          class="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary outline-none font-medium"
                          :placeholder="`RT ${idx + 1}`"
                        />
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <span class="text-xs text-red-600 font-bold">검사일:</span>
                          <input
                            v-model="hw.deadline"
                            type="date"
                            class="px-2 py-1.5 text-xs border-2 border-red-200 rounded-lg outline-none focus:ring-1 focus:ring-red-400 font-bold text-red-700 w-[140px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 오늘 검사해야 할 숙제 / RT 영역 (강조) -->
                <div v-if="todayDueHomeworks.length > 0" class="bg-red-50 border-2 border-red-200 rounded-lg p-5 shadow-md">
                  <div class="flex justify-between items-center mb-3">
                    <h5 class="text-base font-bold text-red-700 flex items-center gap-2">
                      <span class="text-2xl">🚨</span> 오늘 검사해야 할 숙제 · RT
                    </h5>
                  </div>
                  <div class="flex gap-4 mb-3 text-sm font-bold">
                    <span v-if="todayHomeworkCount > 0" class="text-blue-700">숙제 {{ todayHomeworkCount }}개</span>
                    <span v-if="todayRTCount > 0" class="text-purple-700">RT {{ todayRTCount }}개</span>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(dueHw, idx) in todayDueHomeworks" :key="idx" class="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-100">
                      <span class="text-red-500 font-bold text-sm">{{ idx + 1 }}</span>
                      <span class="flex items-center gap-2 flex-1">
                        <span
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          :class="dueHw.type === 'rt' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                        >
                          {{ dueHw.type === 'rt' ? 'RT' : '숙제' }}
                        </span>
                        <span class="text-sm text-gray-800 font-medium flex-1">{{ dueHw.content }}</span>
                      </span>
                      <span class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {{ dueHw.log_date }} 부여
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end items-center gap-4 pt-4 border-t">
                <span v-if="saveStatus" class="text-sm text-green-600 font-bold animate-pulse">{{ saveStatus }}</span>
                <button 
                  @click="saveLearningLog" 
                  :disabled="savingLog"
                  class="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition shadow-md disabled:opacity-50"
                >
                  {{ savingLog ? '저장 중...' : '학습 내용 저장' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 기존 '보강 관리' 탭은 제거되었으며, 보강 일정 등록/수정은 상단 메뉴의 보강 캘린더에서만 가능합니다. -->
      </div>
    </div>

    <!-- 상담일지 모달 (반 관리에서 바로 사용) -->
    <div v-if="showCounselingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800">{{ selectedStudentForCounseling?.name }} 학생 상담</h3>
          <button @click="closeCounselingModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <!-- 상담 입력 -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">상담 날짜</label>
              <input v-model="counselingForm.consultation_date" type="date" class="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">상담 분류</label>
              <select v-model="counselingForm.category" class="w-full px-3 py-2 border rounded text-sm">
                <option value="일반상담">일반상담</option>
                <option value="성적상담">성적상담</option>
                <option value="진로상담">진로상담</option>
                <option value="생활지도">생활지도</option>
              </select>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-xs text-gray-500 mb-1">상담 내용</label>
            <textarea v-model="counselingForm.content" rows="3" class="w-full px-3 py-2 border rounded text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="상담 내용을 입력하세요"></textarea>
          </div>
          <div class="flex justify-end">
            <button @click="saveCounselingLog" :disabled="savingCounseling || !counselingForm.content" class="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-dark transition disabled:opacity-50">
              {{ savingCounseling ? '저장 중...' : '상담 기록 저장' }}
            </button>
          </div>
        </div>

        <!-- 상담 내역 목록 -->
        <div class="flex-1 overflow-y-auto">
          <h4 class="text-sm font-bold text-gray-700 mb-3">상담 이력</h4>
          <div v-if="counselingLogs.length === 0" class="text-center py-8 text-gray-400 text-sm">
            등록된 상담 기록이 없습니다.
          </div>
          <div v-else class="space-y-4">
            <div v-for="log in counselingLogs" :key="log.id" class="border rounded-lg p-4 hover:bg-gray-50 transition">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{{ log.category }}</span>
                  <span class="text-xs text-gray-500 font-medium">{{ log.consultation_date }}</span>
                  <span class="text-xs text-gray-400">|</span>
                  <span class="text-xs text-gray-500">{{ log.counselor_name }} 선생님</span>
                </div>
                <button v-if="isAdmin || user.name === log.counselor_name" @click="deleteCounselingLog(log.id)" class="text-red-400 hover:text-red-600 text-xs">삭제</button>
              </div>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ log.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 반 등록/수정 모달 -->
    <div v-if="showClassModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-xl font-bold mb-4">{{ classModalMode === 'create' ? '새 반 추가' : '반 정보 수정' }}</h3>
        <form @submit.prevent="saveClass" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">반 카테고리 <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <label class="flex-1 cursor-pointer">
                <input type="radio" v-model="classForm.category" value="regular" class="sr-only peer" />
                <div class="text-center py-2 border rounded-lg peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary hover:bg-gray-50 transition">정규반</div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" v-model="classForm.category" value="exam" class="sr-only peer" />
                <div class="text-center py-2 border rounded-lg peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600 hover:bg-gray-50 transition">내신대비</div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" v-model="classForm.category" value="ongoing" class="sr-only peer" />
                <div class="text-center py-2 border rounded-lg peer-checked:bg-orange-500 peer-checked:text-white peer-checked:border-orange-500 hover:bg-gray-50 transition">On-going</div>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">반 이름 <span class="text-red-500">*</span></label>
            <input v-model="classForm.name" type="text" required class="w-full px-4 py-2 border rounded-lg" placeholder="예: 중등 A반" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">담임 선생님</label>
            <input v-model="classForm.teacher_name" type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="선생님 이름" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">수업 요일</label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="day in weekdayOptions"
                :key="day"
                class="cursor-pointer"
              >
                <input
                  type="checkbox"
                  class="sr-only peer"
                  :value="day"
                  v-model="(classForm as any).weekdays"
                />
                <div
                  class="px-3 py-1 rounded-lg border text-sm text-gray-700 bg-white peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition"
                >
                  {{ day }}
                </div>
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-400">
              수업이 있는 요일만 선택하세요. 선택하지 않으면 요일 제한이 없는 반으로 처리됩니다.
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea v-model="classForm.description" rows="2" class="w-full px-4 py-2 border rounded-lg" placeholder="반에 대한 설명 입력"></textarea>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="closeClassModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">취소</button>
            <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">{{ classModalMode === 'create' ? '등록' : '수정' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 학생 배정 모달 -->
    <div v-if="showStudentAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <h3 class="text-xl font-bold mb-4">{{ selectedClass?.name }} 학생 배정</h3>
        
        <!-- 필터 영역 추가 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input v-model="studentSearchSearch" type="text" placeholder="학생 이름 검색" class="px-4 py-2 border rounded-lg text-sm" />
          <select v-model="assignModalFilters.school" class="px-4 py-2 border rounded-lg text-sm">
            <option value="">전체 학교</option>
            <option v-for="school in allAvailableSchools" :key="school" :value="school">{{ school }}</option>
          </select>
          <select v-model="assignModalFilters.grade" class="px-4 py-2 border rounded-lg text-sm">
            <option value="">전체 학년</option>
            <option v-for="n in 6" :key="n" :value="n.toString()">{{ n }}학년</option>
          </select>
        </div>

        <div class="flex-1 overflow-y-auto mb-4 border rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left">선택</th>
                <th class="px-4 py-2 text-left">이름</th>
                <th class="px-4 py-2 text-left">학교/학년</th>
                <th class="px-4 py-2 text-left">학생 연락처</th>
                <th class="px-4 py-2 text-left">현재 반</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in filteredAllStudents" :key="s.id" class="hover:bg-gray-50">
                <td class="px-4 py-2">
                  <input type="checkbox" :value="s.id" v-model="selectedStudentIds" class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                </td>
                <td class="px-4 py-2 font-medium">{{ s.name }}</td>
                <td class="px-4 py-2 text-sm text-gray-600">{{ s.school || '-' }} / {{ s.grade ? s.grade + '학년' : '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-600">{{ formatPhone((s as any).student_no) }}</td>
                <td class="px-4 py-2 text-xs text-gray-500">{{ s.class_name || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">{{ selectedStudentIds.length }}명 선택됨</p>
          <div class="flex space-x-3">
            <button type="button" @click="closeStudentAssignModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">취소</button>
            <button type="button" @click="assignStudents" class="px-4 py-2 bg-primary text-white rounded-lg">배정 완료</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { classApi, studentApi, counselingApi, supplementaryApi } from '../services/api';
import { normalizeClassName } from '../utils/string';
import type { Student } from '../types';

// 학습관리에서는 YYYY-MM-DD 형식 사용 (DB, input[type=date] 모두 이 형식)
const getTodayFull = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const route = useRoute();
const router = useRouter();
const classes = ref<any[]>([]);
const selectedClass = ref<any>(null);
const classStudents = ref<any[]>([]);
const allStudents = ref<Student[]>([]);
const loading = ref(false);

const learningLogDate = ref(getTodayFull());
const activeRightTab = ref<'learning' | 'supplementary'>('learning');

// 탭 설정
const currentTab = ref('regular_MWF');
const tabs = [
  { id: 'regular_MWF', label: '정규반 (월수금)' },
  { id: 'regular_TTS', label: '정규반 (화목토)' },
  { id: 'exam_MWF', label: '내신대비 (월수금)' },
  { id: 'exam_TTS', label: '내신대비 (화목토)' },
  { id: 'ongoing', label: 'On-going' }
];

const isMWF = (weekdays: string[] | null) => {
  if (!weekdays || weekdays.length === 0) return false;
  return weekdays.some(day => ['월', '수', '금'].includes(day));
};

const isTTS = (weekdays: string[] | null) => {
  if (!weekdays || weekdays.length === 0) return false;
  return weekdays.some(day => ['화', '목', '토'].includes(day));
};

const filteredClasses = computed(() => {
  return classes.value.filter(c => {
    const cat = c.category || 'regular';
    
    if (currentTab.value === 'regular_MWF') {
      return cat === 'regular' && isMWF(c.weekdays);
    } else if (currentTab.value === 'regular_TTS') {
      return cat === 'regular' && (!isMWF(c.weekdays) || isTTS(c.weekdays)); // 월수금이 아니면 화목토로 간주하거나 명시적 화목토
    } else if (currentTab.value === 'exam_MWF') {
      return cat === 'exam' && isMWF(c.weekdays);
    } else if (currentTab.value === 'exam_TTS') {
      return cat === 'exam' && (!isMWF(c.weekdays) || isTTS(c.weekdays));
    } else {
      return cat === currentTab.value;
    }
  });
});

const getClassCountByCategory = (tabId: string) => {
  return classes.value.filter(c => {
    const cat = c.category || 'regular';
    
    if (tabId === 'regular_MWF') {
      return cat === 'regular' && isMWF(c.weekdays);
    } else if (tabId === 'regular_TTS') {
      return cat === 'regular' && (!isMWF(c.weekdays) || isTTS(c.weekdays));
    } else if (tabId === 'exam_MWF') {
      return cat === 'exam' && isMWF(c.weekdays);
    } else if (tabId === 'exam_TTS') {
      return cat === 'exam' && (!isMWF(c.weekdays) || isTTS(c.weekdays));
    } else {
      return cat === tabId;
    }
  }).length;
};

const getCategoryColor = (cat: string) => {
  if (cat.startsWith('exam')) return 'border-green-500';
  if (cat === 'ongoing') return 'border-orange-500';
  return 'border-primary';
};

const emptyHomeworks = () => [
  { type: 'homework', content: '', deadline: '' }
];

const learningLog = ref({
  progress: '',
  textbook: '',
  homeworks: emptyHomeworks(),
  created_by: '',
  updated_by: ''
});
const savingLog = ref(false);
const saveStatus = ref('');
const recentLogDates = ref<any[]>([]);
const todayDueHomeworks = ref<any[]>([]);
const homeworkDueToday = ref<any[]>([]);

// 오늘 검사할 숙제 / RT 개수
const todayHomeworkCount = computed(
  () => todayDueHomeworks.value.filter((h: any) => h.type !== 'rt').length
);
const todayRTCount = computed(
  () => todayDueHomeworks.value.filter((h: any) => h.type === 'rt').length
);

// 상단 배너용 숙제 / RT 분리 목록
const homeworkDueTodayHomework = computed(() =>
  homeworkDueToday.value.filter((h: any) => h.type !== 'rt')
);
const homeworkDueTodayRT = computed(() =>
  homeworkDueToday.value.filter((h: any) => h.type === 'rt')
);

// 학습일지 입력용: 숙제 / RT 구분된 목록
const homeworkItems = computed(() =>
  learningLog.value.homeworks.filter((h: any) => h.type !== 'rt')
);
const rtItems = computed(() =>
  learningLog.value.homeworks.filter((h: any) => h.type === 'rt')
);

const addHomework = (type: 'homework' | 'rt') => {
  const currentList = type === 'rt' ? rtItems.value : homeworkItems.value;
  if (currentList.length >= 3) return;
  learningLog.value.homeworks.push({
    type,
    content: '',
    deadline: ''
  });
};

// 보강 관리 관련 상태
const showSupplementaryModal = ref(false);
const showStudentSearchModal = ref(false);
const supplementaryForm = ref({
  date: getTodayFull(),
  time: '14:00',
  endTime: '16:00',
  noEndTime: false,
  content: ''
});
const selectedSupplementaryStudents = ref<any[]>([]);
const otherClassStudents = ref<any[]>([]); // 타 반 학생 중 선택된 학생들
const supplementaryStudentSearch = ref('');
const supplementaryWeeks = ref<any[]>([]); // 3주치 데이터

// DB에 저장된 homework 문자열을 homeworks 배열로 파싱
const parseHomeworks = (homework: string, homework_deadline: string) => {
  const hws: any[] = [];
  if (!homework) return emptyHomeworks();
  try {
    const parsed = JSON.parse(homework);
    if (Array.isArray(parsed)) {
      parsed.forEach((item: any) => {
        hws.push({
          type: item.type === 'rt' ? 'rt' : 'homework',
          content: item.content || '',
          deadline: item.deadline || ''
        });
      });
      return hws.length > 0 ? hws : emptyHomeworks();
    }
  } catch (e) {
    // JSON이 아닌 기존 데이터: 첫 번째 칸에 숙제로 넣기
    hws.push({
      type: 'homework',
      content: homework,
      deadline: homework_deadline || ''
    });
  }
  return hws.length > 0 ? hws : emptyHomeworks();
};

// homeworks 배열을 DB 저장용 JSON 문자열로 변환
const serializeHomeworks = (homeworks: any[]) => {
  const filtered = homeworks
    .filter((h: any) => h.content && h.content.trim())
    .map((h: any) => ({
      type: h.type === 'rt' ? 'rt' : 'homework',
      content: h.content.trim(),
      deadline: h.deadline || ''
    }));
  if (filtered.length === 0) return { homework: '', homework_deadline: '' };
  return {
    homework: JSON.stringify(filtered),
    homework_deadline: filtered[0]?.deadline || ''
  };
};

// 숙제 목록에서 사이드바 표시용 요약 텍스트
const getHomeworkSummary = (homework: string) => {
  if (!homework) return '';
  try {
    const parsed = JSON.parse(homework);
    if (Array.isArray(parsed)) {
      const items = parsed.filter((h: any) => h.content).map((h: any) => h.content);
      return items.join(', ');
    }
  } catch (e) {
    return homework;
  }
  return homework;
};

// 숙제 목록에서 오늘 검사할 것이 있는지
const hasHomeworkDueInLog = (homework: string) => {
  const today = getTodayFull();
  if (!homework) return false;
  try {
    const parsed = JSON.parse(homework);
    if (Array.isArray(parsed)) {
      return parsed.some((h: any) => h.deadline === today && h.content);
    }
  } catch (e) {
    // 구형 데이터: homework_deadline 필드로 체크 (사이드바에서 별도 처리)
  }
  return false;
};

// 학생 정렬: 최근 상담일자 순 (상담일자가 없는 학생은 뒤로)
const sortedClassStudents = computed(() => {
  return [...classStudents.value].sort((a, b) => {
    const dateA = a.last_counseling_date || '0000-00-00';
    const dateB = b.last_counseling_date || '0000-00-00';
    return dateB.localeCompare(dateA);
  });
});

// 권한 확인
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = computed(() => user.role === 'admin');
const isCommon = computed(() => user.username?.startsWith('staff'));

// 수업 요일 옵션 (월~일)
const weekdayOptions = ['월', '화', '수', '목', '금', '토', '일'];

// 상담 모달 관련
const showCounselingModal = ref(false);
const selectedStudentForCounseling = ref<Student | null>(null);
const counselingLogs = ref<any[]>([]);
const counselingForm = ref({
  category: '일반상담',
  content: '',
  consultation_date: getTodayFull()
});
const savingCounseling = ref(false);

const formatPhone = (phone: string) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

const openCounselingModal = async (student: Student) => {
  if (isCommon.value) {
    alert('공통 계정은 상담 내역을 조회하거나 입력할 수 없습니다.');
    return;
  }
  selectedStudentForCounseling.value = student;
  showCounselingModal.value = true;
  fetchCounselingLogs(student.id);
};

const closeCounselingModal = () => {
  showCounselingModal.value = false;
  selectedStudentForCounseling.value = null;
  counselingLogs.value = [];
};

const fetchCounselingLogs = async (studentId: number) => {
  try {
    const res = await counselingApi.getLogs(studentId);
    if (res.data.success) counselingLogs.value = res.data.data || [];
  } catch (err) {
    console.error('상담 일지 로드 실패:', err);
  }
};

const saveCounselingLog = async () => {
  if (!selectedStudentForCounseling.value || !counselingForm.value.content) return;
  try {
    savingCounseling.value = true;
    await counselingApi.createLog({
      student_id: selectedStudentForCounseling.value.id,
      counselor_name: user.name,
      ...counselingForm.value
    });
    counselingForm.value.content = '';
    fetchCounselingLogs(selectedStudentForCounseling.value.id);
    
    // 상담 저장 후 목록의 상담일자 즉시 업데이트
    const studentIdx = classStudents.value.findIndex(s => s.id === selectedStudentForCounseling.value?.id);
    if (studentIdx !== -1) {
      classStudents.value[studentIdx].last_counseling_date = counselingForm.value.consultation_date;
    }
  } catch (err) {
    alert('상담 저장 중 오류가 발생했습니다.');
  } finally {
    savingCounseling.value = false;
  }
};

const deleteCounselingLog = async (id: number) => {
  if (!confirm('상담 기록을 삭제하시겠습니까?')) return;
  try {
    await counselingApi.deleteLog(id);
    if (selectedStudentForCounseling.value) fetchCounselingLogs(selectedStudentForCounseling.value.id);
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다.');
  }
};

const selectLogDate = (date: string) => {
  learningLogDate.value = date;
  fetchLearningLog();
};

const formatDateWithDay = (dateStr: string) => {
  if (!dateStr) return '';
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const fullDateStr = dateStr.startsWith('20') ? dateStr : `20${dateStr}`;
  const [year, month, day] = fullDateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const dayName = days[date.getDay()];
  return `${dateStr} (${dayName})`;
};

const showClassModal = ref(false);
const classModalMode = ref<'create' | 'edit'>('create');
// 수업 요일: 기본은 빈 배열 (필요 시 월~금 등으로 채워도 됨)
const classForm = ref({ 
  name: '', 
  teacher_name: '', 
  description: '',
  category: 'regular',
  weekdays: [] as string[]
});

const showStudentAssignModal = ref(false);
const studentSearchSearch = ref('');
const selectedStudentIds = ref<number[]>([]);
const assignModalFilters = ref({
  school: '',
  grade: ''
});

const allAvailableSchools = computed(() => {
  const schools = new Set<string>();
  allStudents.value.forEach(s => {
    if (s.school) schools.add(s.school);
  });
  return Array.from(schools).sort();
});

const filteredAllStudents = computed(() => {
  let filtered = allStudents.value;
  
  if (studentSearchSearch.value) {
    const search = studentSearchSearch.value.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) || 
      (s.school && s.school.toLowerCase().includes(search))
    );
  }
  
  if (assignModalFilters.value.school) {
    filtered = filtered.filter(s => s.school === assignModalFilters.value.school);
  }
  
  if (assignModalFilters.value.grade) {
    filtered = filtered.filter(s => s.grade === assignModalFilters.value.grade);
  }
  
  return filtered;
});

// 타 반 학생 검색 필터
const filteredAllStudentsForSearch = computed(() => {
  if (!supplementaryStudentSearch.value) return [];
  const search = supplementaryStudentSearch.value.toLowerCase();
  // 이미 현재 반에 있거나, 이미 추가된 학생은 제외
  const excludeIds = [...classStudents.value, ...otherClassStudents.value].map(s => s.id);
  
  return allStudents.value.filter(s => 
    !excludeIds.includes(s.id) && 
    (s.name.toLowerCase().includes(search) || (s.school && s.school.toLowerCase().includes(search)))
  );
});

const fetchClasses = async () => {
  try {
    const response = await classApi.getAll();
    if (response.data.success) {
      classes.value = response.data.data || [];
    }
  } catch (err) {
    console.error('반 목록 로드 실패:', err);
  }
};

  const fetchAllStudents = async () => {
    try {
      const response = await studentApi.getAll({ status: 'active' });
      if (response.data.success) {
        allStudents.value = response.data.data || [];
      }
  } catch (err) {
    console.error('전체 학생 로드 실패:', err);
  }
};

const selectClass = async (item: any) => {
  selectedClass.value = item;
  // 반 선택 시 항상 오늘 날짜로 초기화
  learningLogDate.value = getTodayFull();
  activeRightTab.value = 'learning'; // 기본 탭은 학습 관리
  
  try {
    loading.value = true;
    const response = await classApi.getStudents(item.name);
    if (response.data.success) {
      const students = (response.data.data || []).filter((s: any) => 
        s.class_name?.split(',').map((c: string) => normalizeClassName(c)).includes(normalizeClassName(item.name))
      );
      
      // 각 학생별 최근 상담일자 가져오기
      const studentsWithCounseling = await Promise.all(students.map(async (student: any) => {
        try {
          const logsRes = await counselingApi.getLogs(student.id);
          const logs = logsRes.data?.data || [];
          if (logsRes.data.success && logs.length > 0) {
            // 날짜순 정렬하여 가장 최근 날짜 추출
            const sortedLogs = logs.sort((a: any, b: any) => 
              b.consultation_date.localeCompare(a.consultation_date)
            );
            return { ...student, last_counseling_date: sortedLogs[0].consultation_date };
          }
        } catch (e) {
          console.error(`학생 ${student.name} 상담 로드 실패`, e);
        }
        return { ...student, last_counseling_date: null };
      }));
      
      classStudents.value = studentsWithCounseling;
    }
    await fetchLearningLog();
    await fetchRecentLogs();
    await fetchSupplementaryHistory(); // 보강 히스토리 로드
  } catch (err) {
    console.error('반 학생 로드 실패:', err);
  } finally {
    loading.value = false;
  }
};

// 반 카드 클릭 시: 동일 반이면 닫기, 아니면 상세 열기
const clearSelectedClass = () => {
  selectedClass.value = null;
};

const toggleClassSelection = async (item: any) => {
  if (selectedClass.value && selectedClass.value.id === item.id) {
    clearSelectedClass();
  } else {
    await selectClass(item);
  }
};

const fetchRecentLogs = async () => {
  if (!selectedClass.value) return;
  try {
    const response = await classApi.getRecentLogDates(selectedClass.value.id);
    if (response.data.success) {
      recentLogDates.value = response.data.data || [];
    }
  } catch (err) {
    console.error('최근 로그 날짜 로드 실패:', err);
  }
};

const fetchLearningLog = async () => {
  if (!selectedClass.value || !learningLogDate.value) return;
  try {
    const response = await classApi.getLearningLog(selectedClass.value.id, learningLogDate.value);
    if (response.data.success && response.data.data) {
      const d = response.data.data;
      learningLog.value = {
        progress: d.progress || '',
        textbook: d.textbook || '',
        homeworks: parseHomeworks(d.homework, d.homework_deadline),
        created_by: d.created_by || '',
        updated_by: d.updated_by || ''
      };
    } else {
      learningLog.value = {
        progress: '',
        textbook: '',
        homeworks: emptyHomeworks(),
        created_by: '',
        updated_by: ''
      };
    }
    await fetchTodayDueHomeworks();
  } catch (err) {
    console.error('학습 로그 로드 실패:', err);
  }
};

const fetchTodayDueHomeworks = async () => {
  if (!selectedClass.value) return;
  try {
    const res = await classApi.getAllLogs(selectedClass.value.id);
    if (res.data.success) {
      const logs = res.data.data || [];
      const today = getTodayFull();
      const dueItems: any[] = [];
      
      for (const log of logs) {
        if (!log.homework) continue;
        try {
          const parsed = JSON.parse(log.homework);
          if (Array.isArray(parsed)) {
            parsed.forEach((h: any) => {
              const itemType = h.type === 'rt' ? 'rt' : 'homework';
              if (h.content && h.deadline === today) {
                dueItems.push({
                  ...h,
                  type: itemType,
                  log_date: log.log_date,
                  created_by: log.created_by
                });
              }
            });
          }
        } catch (e) {
          // 구형 데이터: homework_deadline으로 체크 (모두 일반 숙제로 처리)
          if (log.homework_deadline === today && log.homework) {
            dueItems.push({
              type: 'homework',
              content: log.homework,
              deadline: today,
              log_date: log.log_date,
              created_by: log.created_by
            });
          }
        }
      }
      
      todayDueHomeworks.value = dueItems;
    }
  } catch (err) {
    console.error('오늘 검사 숙제 로드 실패:', err);
  }
};

const saveLearningLog = async () => {
  if (!selectedClass.value || !learningLogDate.value) return;
  try {
    savingLog.value = true;
    saveStatus.value = '';
    const { homework, homework_deadline } = serializeHomeworks(learningLog.value.homeworks);
    await classApi.saveLearningLog(selectedClass.value.id, {
      log_date: learningLogDate.value,
      progress: learningLog.value.progress,
      textbook: learningLog.value.textbook,
      homework,
      homework_deadline,
      created_by: learningLog.value.created_by,
      updated_by: learningLog.value.updated_by
    });
    saveStatus.value = '저장 완료!';
    await fetchRecentLogs(); // 최근 기록 목록 갱신
    await fetchHomeworkDue(); // 배너 갱신
    setTimeout(() => {
      saveStatus.value = '';
    }, 3000);
  } catch (err) {
    console.error('학습 로그 저장 실패:', err);
    alert('저장 중 오류가 발생했습니다.');
  } finally {
    savingLog.value = false;
  }
};

const openClassModal = (mode: 'create' | 'edit', item?: any) => {
  classModalMode.value = mode;
  if (mode === 'edit' && item) {
    classForm.value = { 
      ...item,
      category: item.category || 'regular',
      weekdays: item.weekdays || []
    };
  } else {
    classForm.value = { 
      name: '', 
      teacher_name: '', 
      description: '',
      category: 'regular',
      weekdays: []
    };
  }
  showClassModal.value = true;
};

const closeClassModal = () => {
  showClassModal.value = false;
};

const saveClass = async () => {
  try {
    if (classModalMode.value === 'create') {
      await classApi.create(classForm.value);
    } else {
      await classApi.update((classForm.value as any).id, classForm.value);
    }
    showClassModal.value = false;
    fetchClasses();
  } catch (err) {
    alert('반 정보 저장 중 오류가 발생했습니다.');
  }
};

const deleteClass = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까? 관련 데이터가 영향을 받을 수 있습니다.')) return;
  try {
    await classApi.delete(id);
    if (selectedClass.value?.id === id) selectedClass.value = null;
    fetchClasses();
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다.');
  }
};

const openStudentAssignModal = () => {
  if (!selectedClass.value) return;
  // 현재 반 학생들을 미리 선택된 상태로
  selectedStudentIds.value = classStudents.value.map(s => s.id);
  showStudentAssignModal.value = true;
};

const closeStudentAssignModal = () => {
  showStudentAssignModal.value = false;
};

const assignStudents = async () => {
  if (!selectedClass.value) return;
  
  try {
    loading.value = true;
    let updateCount = 0;
    
    // 체크된 모든 학생들에게 현재 반 이름을 추가/변경
    for (const student of allStudents.value) {
      const isSelected = selectedStudentIds.value.includes(student.id);
      const currentClasses = student.class_name?.split(',').map(c => normalizeClassName(c)).filter(c => c) || [];
      const hasThisClass = currentClasses.includes(normalizeClassName(selectedClass.value.name));
      
      let newClasses = [...currentClasses];
      if (isSelected && !hasThisClass) {
        newClasses.push(normalizeClassName(selectedClass.value.name));
      } else if (!isSelected && hasThisClass) {
        newClasses = newClasses.filter(c => c !== normalizeClassName(selectedClass.value.name));
      }
      
      if (JSON.stringify(currentClasses.sort()) !== JSON.stringify(newClasses.sort())) {
        await studentApi.update(student.id, { class_name: newClasses.join(',') });
        updateCount++;
      }
    }
    
    alert('학생 배정이 완료되었습니다.');
    showStudentAssignModal.value = false;
    await fetchAllStudents();
    await selectClass(selectedClass.value);
  } catch (err: any) {
    console.error('학생 배정 중 오류:', err);
    alert('학생 배정 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
  } finally {
    loading.value = false;
  }
};

// 모든 반의 오늘 숙제/RT 검사 예정 데이터 로드 (요일 + 날짜 기반 전용 API 사용)
const fetchHomeworkDue = async () => {
  try {
    const today = getTodayFull();

    // 백엔드에서 이미 "해당 날짜 + 수업 요일에 해당하는 반"만 필터링해서 내려줌
    const res = await classApi.getHomeworkDue(today);
    if (!res.data.success) {
      homeworkDueToday.value = [];
      return;
    }

    const rows = res.data.data || [];
    const allDue: any[] = [];

    for (const log of rows) {
      const cls = (log as any).classes || {};

      if (!log.homework) continue;
      try {
        const parsed = JSON.parse(log.homework);
        if (Array.isArray(parsed)) {
          parsed.forEach((h: any) => {
            const itemType = h.type === 'rt' ? 'rt' : 'homework';
            if (h.content && h.deadline === today) {
              allDue.push({
                ...h,
                type: itemType,
                class_name: cls.name || '-',
                class_id: log.class_id,
                id: `${log.id}-${itemType}-${h.content}`
              });
            }
          });
        }
      } catch (e) {
        // 구형 데이터 (모두 일반 숙제로 처리)
        if (log.homework_deadline === today && log.homework) {
          allDue.push({
            type: 'homework',
            content: log.homework,
            class_name: cls.name || '-',
            class_id: log.class_id,
            id: log.id
          });
        }
      }
    }

    homeworkDueToday.value = allDue;
  } catch (err) {
    console.error('숙제 검사일 로드 실패:', err);
  }
};

// 특정 반에 오늘 숙제 검사 예정이 있는지 확인
const hasHomeworkDue = (classId: number) => {
  return homeworkDueToday.value.some(d => d.class_id === classId);
};

// 숙제 검사 배너 클릭 시 해당 반으로 이동
const goToClassHomeworkCheck = async (due: any) => {
  const targetClass = classes.value.find((c: any) => c.id === due.class_id);
  if (targetClass) {
    await selectClass(targetClass);
  }
};

// ========== 보강 관리 로직 ==========
const openSupplementaryModal = () => {
  supplementaryForm.value = {
    date: getTodayFull(),
    time: '14:00',
    content: ''
  };
  selectedSupplementaryStudents.value = [];
  otherClassStudents.value = [];
  showSupplementaryModal.value = true;
};

const openStudentSearchForSupplementary = () => {
  supplementaryStudentSearch.value = '';
  showStudentSearchModal.value = true;
};

const addOtherStudentToSupplementary = (student: any) => {
  if (!otherClassStudents.value.some(s => s.id === student.id)) {
    otherClassStudents.value.push(student);
  }
  // 자동으로 체크 상태로
  if (!selectedSupplementaryStudents.value.some(s => s.id === student.id)) {
    selectedSupplementaryStudents.value.push(student);
  }
  showStudentSearchModal.value = false;
};

const toggleSupplementaryStudent = (student: any) => {
  const index = selectedSupplementaryStudents.value.findIndex(s => s.id === student.id);
  if (index === -1) {
    selectedSupplementaryStudents.value.push(student);
  } else {
    selectedSupplementaryStudents.value.splice(index, 1);
  }
};

const saveSupplementary = async () => {
  if (!supplementaryForm.value.content) {
    alert('보강 내용을 입력해주세요.');
    return;
  }
  
  try {
    const dateTime = `${supplementaryForm.value.date}T${supplementaryForm.value.time}:00+09:00`;
    let endDateTime = null;
    let durationMinutes = 240; // 기본 4시간

    if (!supplementaryForm.value.noEndTime && supplementaryForm.value.endTime) {
      endDateTime = `${supplementaryForm.value.date}T${supplementaryForm.value.endTime}:00+09:00`;
      const start = new Date(dateTime);
      const end = new Date(endDateTime);
      if (end < start) {
        end.setDate(end.getDate() + 1); // 다음날로 넘어가는 경우
        const kstTime = new Date(end.getTime() + (9 * 60 * 60 * 1000));
        const y = kstTime.getUTCFullYear();
        const m = String(kstTime.getUTCMonth() + 1).padStart(2, '0');
        const d = String(kstTime.getUTCDate()).padStart(2, '0');
        const h = String(kstTime.getUTCHours()).padStart(2, '0');
        const min = String(kstTime.getUTCMinutes()).padStart(2, '0');
        endDateTime = `${y}-${m}-${d}T${h}:${min}:00+09:00`;
      }
      durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    const res = await supplementaryApi.createSession({
      class_id: selectedClass.value.id,
      session_date: dateTime,
      end_time: endDateTime,
      duration_minutes: durationMinutes,
      content: supplementaryForm.value.content,
      student_ids: selectedSupplementaryStudents.value.map(s => s.id)
    });
    
    if (res.data.success) {
      alert('보강 일정이 등록되었습니다.');
      showSupplementaryModal.value = false;
      fetchSupplementaryHistory();
    }
  } catch (err: any) {
    alert('보강 등록 실패: ' + (err.response?.data?.message || err.message));
  }
};

const deleteSupplementary = async (id: number) => {
  if (!confirm('보강 일정을 삭제하시겠습니까?')) return;
  try {
    await supplementaryApi.deleteSession(id);
    fetchSupplementaryHistory();
  } catch (err) {
    alert('삭제 실패');
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

const fetchSupplementaryHistory = async () => {
  if (!selectedClass.value) return;
  
  // 전전주 월요일부터 이번주 일요일(또는 다음주까지) 계산
  const today = new Date();
  const day = today.getDay(); // 0: 일, 1: 월 ...
  const diffToMon = today.getDate() - day + (day === 0 ? -6 : 1); // 이번주 월요일
  const thisMon = new Date(today.setDate(diffToMon));
  
  // 전전주 월요일 (14일 전)
  const start = new Date(thisMon);
  start.setDate(start.getDate() - 14);
  
  // 다음주 일요일 (13일 후)
  const end = new Date(thisMon);
  end.setDate(end.getDate() + 13);
  
  try {
    const res = await supplementaryApi.getSessions(
      selectedClass.value.id, 
      start.toISOString(), 
      end.toISOString()
    );
    
    if (res.data.success) {
      const sessions = res.data.data || [];
      organizeWeeks(sessions, start);
    }
  } catch (err) {
    console.error('보강 히스토리 로드 실패:', err);
  }
};

const organizeWeeks = (sessions: any[], startDate: Date) => {
  const weeks = [];
  const labels = ['전전주', '지난주', '이번주', '다음주'];
  
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // 범위 문자열
    const range = `${weekStart.getMonth()+1}/${weekStart.getDate()} ~ ${weekEnd.getMonth()+1}/${weekEnd.getDate()}`;
    
    // 해당 주차 세션 필터링
    const weekSessions = sessions.filter((s: any) => {
      const d = new Date(s.session_date);
      return d >= weekStart && d <= weekEnd;
    });
    
    weeks.push({
      label: labels[i],
      range,
      sessions: weekSessions
    });
  }
  
  supplementaryWeeks.value = weeks;
};

// 라우트 쿼리(classId, tab, className)에 따라 자동으로 반 및 탭 선택
const applyRouteSelection = async () => {
  const initialClassId = route.query.classId ? Number(route.query.classId) : null;
  const initialClassName = (route.query.className as string) || '';
  const initialTab = (route.query.tab as string) || '';

  if (!initialClassId && !initialClassName) return;

  // 예전 보강 관리 대시보드에서 넘어오는 링크 호환:
  // tab=supplementary 인 경우, 새로운 보강 캘린더 화면으로 바로 이동
  if (initialTab === 'supplementary') {
    router.push({ name: 'supplementary-dashboard' });
    return;
  }

  let targetClass = null as any;
  if (initialClassId) {
    targetClass = classes.value.find((c: any) => c.id === initialClassId) || null;
  }
  // id로 못 찾은 경우 이름으로도 한 번 더 시도
  if (!targetClass && initialClassName) {
    targetClass = classes.value.find((c: any) => c.name === initialClassName) || null;
  }

  if (targetClass) {
    await selectClass(targetClass);
  }
};

onMounted(async () => {
  // 1) 먼저 반 목록만 불러와서 화면을 빨리 띄우고
  await fetchClasses();

  // 2) 라우트 쿼리(classId, tab 등)에 맞춰 해당 반/탭을 우선 선택
  await applyRouteSelection();

  // 3) 그 다음에 무거운 작업들은 백그라운드에서 천천히 처리
  //    - 전체 학생 목록 (배정 모달/검색용)
  //    - 모든 반의 '오늘 숙제 검사' 배너 데이터
  fetchAllStudents();
  fetchHomeworkDue();
});

// 같은 화면 안에서 쿼리만 바뀌는 경우도 반영
watch(
  () => route.query,
  async () => {
    await applyRouteSelection();
  }
);
</script>

<style scoped>
.bg-primary {
  background-color: #1e3a8a;
}
.bg-primary-dark {
  background-color: #1e3a8a;
}
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .7; }
}
</style>
