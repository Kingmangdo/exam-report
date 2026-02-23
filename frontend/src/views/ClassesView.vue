
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

    <!-- 오늘 숙제 검사 알림 배너 -->
    <div v-if="homeworkDueToday.length > 0" class="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm animate-pulse-slow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🔔</span>
        <h3 class="text-lg font-bold text-red-700">오늘 숙제 검사일입니다!</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="due in homeworkDueToday"
          :key="due.id"
          class="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-bold cursor-pointer hover:bg-red-200 transition"
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
        @click="selectClass(item)"
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
                    <span class="font-bold">학: {{ formatPhone(student.student_no) }}</span>
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
            class="flex-1 py-3 text-center font-bold text-sm transition-colors"
            :class="activeRightTab === 'learning' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
          >
            📚 학습 관리
          </button>
          <button 
            @click="activeRightTab = 'supplementary'" 
            class="flex-1 py-3 text-center font-bold text-sm transition-colors"
            :class="activeRightTab === 'supplementary' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
          >
            🕒 보강 관리
          </button>
        </div>

        <!-- 학습 관리 내용 -->
        <div v-if="activeRightTab === 'learning'">
          <div class="p-4 bg-primary text-white flex justify-between items-center">
            <h3 class="text-lg font-bold">{{ selectedClass.name }} 학습 일지</h3>
            <div class="flex items-center gap-2">
              <label class="text-xs opacity-90">선택 날짜:</label>
              <input v-model="learningLogDate" type="date" class="px-2 py-1 text-xs border rounded text-gray-800" @change="fetchLearningLog" />
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
              <!-- 작성자 정보 표시 -->
              <div v-if="learningLog.created_by || learningLog.updated_by" class="flex items-center gap-3 text-sm bg-blue-50 px-4 py-2.5 rounded-lg border border-blue-100">
                <span class="text-blue-500">👤</span>
                <span class="text-blue-700 font-bold">작성: {{ learningLog.created_by || '-' }}</span>
                <span v-if="learningLog.updated_by && learningLog.updated_by !== learningLog.created_by" class="text-gray-400">|</span>
                <span v-if="learningLog.updated_by && learningLog.updated_by !== learningLog.created_by" class="text-orange-600 font-bold">수정: {{ learningLog.updated_by }}</span>
              </div>

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
                  <label class="block text-base font-bold text-gray-700 mb-3">오늘 내준 숙제</label>
                  <div class="space-y-2">
                    <div v-for="(hw, idx) in learningLog.homeworks" :key="idx" class="flex items-center gap-2">
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
                </div>
                
                <!-- 오늘 검사해야 할 숙제 영역 (강조) -->
                <div v-if="todayDueHomeworks.length > 0" class="bg-red-50 border-2 border-red-200 rounded-lg p-5 shadow-md">
                  <div class="flex justify-between items-center mb-3">
                    <h5 class="text-base font-bold text-red-700 flex items-center gap-2">
                      <span class="text-2xl">🚨</span> 오늘 검사해야 할 숙제
                    </h5>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(dueHw, idx) in todayDueHomeworks" :key="idx" class="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-100">
                      <span class="text-red-500 font-bold text-sm">{{ idx + 1 }}</span>
                      <span class="text-sm text-gray-800 font-medium flex-1">{{ dueHw.content }}</span>
                      <span class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{{ dueHw.log_date }} 부여 {{ dueHw.created_by ? `| 출제: ${dueHw.created_by}` : '' }}</span>
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

        <!-- 보강 관리 내용 -->
        <div v-else-if="activeRightTab === 'supplementary'" class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-800">보강 스케줄</h3>
            <button @click="openSupplementaryModal" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold text-sm">
              + 보강 일정 추가
            </button>
          </div>

          <!-- 3주 히스토리 (전전주, 전주, 금주) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div v-for="(week, idx) in supplementaryWeeks" :key="idx" class="bg-gray-50 rounded-lg p-4 border">
              <h4 class="text-sm font-bold text-gray-700 mb-3 text-center border-b pb-2">
                {{ week.label }} <span class="text-xs font-normal text-gray-500">({{ week.range }})</span>
              </h4>
              <div v-if="week.sessions.length === 0" class="text-center py-4 text-gray-400 text-xs">일정 없음</div>
              <div class="space-y-3">
                <div v-for="session in week.sessions" :key="session.id" class="bg-white p-3 rounded shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div class="flex justify-between items-start mb-1">
                    <span class="text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{{ formatTime(session.session_date) }}</span>
                    <button @click="deleteSupplementary(session.id)" class="text-gray-400 hover:text-red-500 text-xs">&times;</button>
                  </div>
                  <p class="text-sm font-bold text-gray-800 mb-1">{{ session.content }}</p>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="student in session.supplementary_students" :key="student.student_id" class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {{ student.students?.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상담일지 모달 (반 관리에서 바로 사용) -->
    <div v-if="showCounselingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeCounselingModal">
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
    <div v-if="showClassModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeClassModal">
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
    <div v-if="showStudentAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeStudentAssignModal">
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
                <td class="px-4 py-2 text-sm text-gray-600">{{ formatPhone(s.student_no) }}</td>
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

    <!-- 보강 일정 등록 모달 -->
    <div v-if="showSupplementaryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showSupplementaryModal = false">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <h3 class="text-xl font-bold mb-4">보강 일정 등록</h3>
        
        <div class="space-y-4 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">날짜</label>
              <input v-model="supplementaryForm.date" type="date" class="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">시간</label>
              <input v-model="supplementaryForm.time" type="time" class="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">보강 내용</label>
            <input v-model="supplementaryForm.content" type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="예: 관계대명사 보충" />
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-bold text-gray-700">참여 학생 선택</label>
            <button @click="openStudentSearchForSupplementary" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 font-bold">
              + 다른 반 학생 추가
            </button>
          </div>
          
          <div class="border rounded-lg overflow-y-auto flex-1 p-2">
            <!-- 현재 반 학생 목록 -->
            <div v-if="classStudents.length > 0">
              <div class="text-xs font-bold text-gray-500 mb-1 px-2">현재 반 학생</div>
              <div v-for="student in classStudents" :key="student.id" class="flex items-center px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer" @click="toggleSupplementaryStudent(student)">
                <input type="checkbox" :checked="selectedSupplementaryStudents.some(s => s.id === student.id)" class="w-4 h-4 mr-2 text-purple-600 rounded focus:ring-purple-500" />
                <span class="text-sm">{{ student.name }}</span>
              </div>
            </div>
            
            <!-- 추가된 타 반 학생 목록 -->
            <div v-if="otherClassStudents.length > 0" class="mt-3">
              <div class="text-xs font-bold text-gray-500 mb-1 px-2 border-t pt-2">추가된 학생</div>
              <div v-for="student in otherClassStudents" :key="student.id" class="flex items-center px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer" @click="toggleSupplementaryStudent(student)">
                <input type="checkbox" :checked="selectedSupplementaryStudents.some(s => s.id === student.id)" class="w-4 h-4 mr-2 text-purple-600 rounded focus:ring-purple-500" />
                <span class="text-sm">{{ student.name }} <span class="text-xs text-gray-400">({{ student.class_name || '반 없음' }})</span></span>
              </div>
            </div>
          </div>
          <div class="mt-2 text-right text-sm text-gray-600">
            총 {{ selectedSupplementaryStudents.length }}명 선택됨
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button @click="showSupplementaryModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">취소</button>
          <button @click="saveSupplementary" class="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">저장</button>
        </div>
      </div>
    </div>

    <!-- 타 반 학생 검색 모달 (보강용) -->
    <div v-if="showStudentSearchModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="showStudentSearchModal = false">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl h-[500px] flex flex-col">
        <h3 class="text-lg font-bold mb-4">학생 검색</h3>
        <input v-model="supplementaryStudentSearch" type="text" placeholder="이름 검색..." class="w-full px-4 py-2 border rounded-lg mb-4" />
        
        <div class="flex-1 overflow-y-auto border rounded-lg">
          <div v-for="student in filteredAllStudentsForSearch" :key="student.id" 
               class="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center"
               @click="addOtherStudentToSupplementary(student)">
            <div>
              <div class="font-bold">{{ student.name }}</div>
              <div class="text-xs text-gray-500">{{ student.school }} / {{ student.class_name }}</div>
            </div>
            <button class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">선택</button>
          </div>
        </div>
        <div class="mt-4 text-right">
          <button @click="showStudentSearchModal = false" class="px-4 py-2 bg-gray-200 rounded-lg">닫기</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { classApi, studentApi, counselingApi, supplementaryApi } from '../services/api';
import type { Student } from '../types';

// 학습관리에서는 YYYY-MM-DD 형식 사용 (DB, input[type=date] 모두 이 형식)
const getTodayFull = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const classes = ref<any[]>([]);
const selectedClass = ref<any>(null);
const classStudents = ref<any[]>([]);
const allStudents = ref<Student[]>([]);
const loading = ref(false);

const learningLogDate = ref(getTodayFull());
const activeRightTab = ref<'learning' | 'supplementary'>('learning');

// 탭 설정
const currentTab = ref('regular');
const tabs = [
  { id: 'regular', label: '정규반' },
  { id: 'exam', label: '내신대비' },
  { id: 'ongoing', label: 'On-going' }
];

const filteredClasses = computed(() => {
  return classes.value.filter(c => (c.category || 'regular') === currentTab.value);
});

const getClassCountByCategory = (cat: string) => {
  return classes.value.filter(c => (c.category || 'regular') === cat).length;
};

const getCategoryColor = (cat: string) => {
  switch(cat) {
    case 'exam': return 'border-green-500';
    case 'ongoing': return 'border-orange-500';
    default: return 'border-primary';
  }
};

const emptyHomeworks = () => [
  { content: '', deadline: '' },
  { content: '', deadline: '' },
  { content: '', deadline: '' },
  { content: '', deadline: '' }
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

// 보강 관리 관련 상태
const showSupplementaryModal = ref(false);
const showStudentSearchModal = ref(false);
const supplementaryForm = ref({
  date: getTodayFull(),
  time: '14:00',
  content: ''
});
const selectedSupplementaryStudents = ref<any[]>([]);
const otherClassStudents = ref<any[]>([]); // 타 반 학생 중 선택된 학생들
const supplementaryStudentSearch = ref('');
const supplementaryWeeks = ref<any[]>([]); // 3주치 데이터

// DB에 저장된 homework 문자열을 homeworks 배열로 파싱
const parseHomeworks = (homework: string, homework_deadline: string) => {
  const hws = emptyHomeworks();
  if (!homework) return hws;
  try {
    const parsed = JSON.parse(homework);
    if (Array.isArray(parsed)) {
      parsed.forEach((item: any, i: number) => {
        if (i < 4) {
          hws[i].content = item.content || '';
          hws[i].deadline = item.deadline || '';
        }
      });
      return hws;
    }
  } catch (e) {
    // JSON이 아닌 기존 데이터: 첫 번째 칸에 넣기
    hws[0].content = homework;
    hws[0].deadline = homework_deadline || '';
  }
  return hws;
};

// homeworks 배열을 DB 저장용 JSON 문자열로 변환
const serializeHomeworks = (homeworks: any[]) => {
  const filtered = homeworks.filter((h: any) => h.content.trim());
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
  // dateStr이 '26-01-31' 형식이면 '2026-01-31'로 변환
  const fullDateStr = dateStr.startsWith('20') ? dateStr : `20${dateStr}`;
  const date = new Date(fullDateStr);
  const dayName = days[date.getDay()];
  return `${dateStr} (${dayName})`;
};

const showClassModal = ref(false);
const classModalMode = ref<'create' | 'edit'>('create');
const classForm = ref({ 
  name: '', 
  teacher_name: '', 
  description: '',
  category: 'regular'
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
    const response = await studentApi.getAll();
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
        s.class_name?.split(',').map((c: string) => c.trim()).includes(item.name)
      );
      
      // 각 학생별 최근 상담일자 가져오기
      const studentsWithCounseling = await Promise.all(students.map(async (student: any) => {
        try {
          const logsRes = await counselingApi.getLogs(student.id);
          if (logsRes.data.success && logsRes.data.data.length > 0) {
            // 날짜순 정렬하여 가장 최근 날짜 추출
            const sortedLogs = logsRes.data.data.sort((a: any, b: any) => 
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
              if (h.content && h.deadline === today) {
                dueItems.push({ ...h, log_date: log.log_date, created_by: log.created_by });
              }
            });
          }
        } catch (e) {
          // 구형 데이터: homework_deadline으로 체크
          if (log.homework_deadline === today && log.homework) {
            dueItems.push({ content: log.homework, deadline: today, log_date: log.log_date, created_by: log.created_by });
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
      category: item.category || 'regular'
    };
  } else {
    classForm.value = { 
      name: '', 
      teacher_name: '', 
      description: '',
      category: 'regular'
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
      const currentClasses = student.class_name?.split(',').map(c => c.trim()).filter(c => c) || [];
      const hasThisClass = currentClasses.includes(selectedClass.value.name);
      
      let newClasses = [...currentClasses];
      if (isSelected && !hasThisClass) {
        newClasses.push(selectedClass.value.name);
      } else if (!isSelected && hasThisClass) {
        newClasses = newClasses.filter(c => c !== selectedClass.value.name);
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

// 모든 반의 오늘 숙제 검사 예정 데이터 로드
const fetchHomeworkDue = async () => {
  try {
    const today = getTodayFull();
    const allDue: any[] = [];
    
    for (const cls of classes.value) {
      try {
        const res = await classApi.getAllLogs(cls.id);
        if (res.data.success) {
          const logs = res.data.data || [];
          for (const log of logs) {
            if (!log.homework) continue;
            try {
              const parsed = JSON.parse(log.homework);
              if (Array.isArray(parsed)) {
                parsed.forEach((h: any) => {
                  if (h.content && h.deadline === today) {
                    allDue.push({ ...h, class_name: cls.name, class_id: cls.id, id: `${log.id}-${h.content}` });
                  }
                });
              }
            } catch (e) {
              // 구형 데이터
              if (log.homework_deadline === today && log.homework) {
                allDue.push({ content: log.homework, class_name: cls.name, class_id: cls.id, id: log.id });
              }
            }
          }
        }
      } catch (e) { /* 무시 */ }
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
    const res = await supplementaryApi.createSession({
      class_id: selectedClass.value.id,
      session_date: dateTime,
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
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
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

onMounted(async () => {
  await fetchClasses();
  fetchAllStudents();
  // 반 목록 로드 후 숙제 검사일 체크
  await fetchHomeworkDue();
});
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
