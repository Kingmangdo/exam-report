<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 네비게이션 바 -->
    <nav class="bg-white border-b sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <span class="text-2xl font-black text-indigo-900 tracking-tight">독강영어<span class="text-indigo-600">.</span></span>
          </div>
          <div class="flex items-center space-x-4">
            <a href="#curriculum" class="text-gray-600 hover:text-indigo-600 font-medium hidden sm:block">커리큘럼</a>
            <a href="#system" class="text-gray-600 hover:text-indigo-600 font-medium hidden sm:block">관리시스템</a>
            <button @click="scrollToConsulting" class="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold shadow-sm hover:bg-indigo-700 transition">
              상담 문의
            </button>
            <router-link to="/login" class="text-xs text-gray-400 hover:text-gray-600 font-medium ml-4">
              관리자
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 히어로 섹션 -->
    <section class="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white py-20 lg:py-32 relative overflow-hidden">
      <!-- 배경 장식 -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
      
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-3xl mx-auto">
          <span class="inline-block py-1.5 px-4 rounded-full bg-indigo-800 border border-indigo-500 text-indigo-100 text-sm font-bold tracking-wide mb-6 shadow-sm">
            운양동 학부모님들의 확실한 선택, 독강영어
          </span>
          <h1 class="text-4xl lg:text-5xl xl:text-6xl font-black mb-6 leading-tight">
            학원을 다녀도 제자리라면?<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">공부 '습관'부터 바꿔야 합니다.</span>
          </h1>
          <p class="text-lg text-indigo-100 mb-10 leading-relaxed font-medium">
            하늘빛중 50점이 97점이 되고, 김포제일고 전교 1등이 탄생하는 곳.<br class="hidden sm:block"/>
            중등 A등급의 착각을 깨고, 고등 수능/내신 1등급의 '진짜 실력'을 만듭니다.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="scrollToConsulting" class="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-gray-50 transition transform hover:-translate-y-1">
              무료 전화 상담 문의
            </button>
            <a href="https://naver.me/GkRSMhtV" target="_blank" rel="noopener noreferrer" class="bg-indigo-800 border border-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition">
              네이버 레벨테스트 예약
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 특징 섹션 -->
    <section id="system" class="py-24 bg-gray-50 relative">
      <!-- 배경 패턴 -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#4f46e5 1px, transparent 1px); background-size: 32px 32px;"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-20">
          <span class="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-3 block">Our Core System</span>
          <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">독강영어 학원 <span class="text-indigo-600">효과 300%</span> 비결</h2>
          <p class="text-gray-600 font-medium text-lg max-w-2xl mx-auto">
            단순히 수업만 듣는다고 성적이 오르지 않습니다.<br class="hidden md:block" />
            독강영어는 <b>'스스로 공부하는 방법'</b>부터 근본적으로 뜯어고칩니다.
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-10 mb-24">
          <!-- 특징 1 -->
          <div class="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 text-blue-600 shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">1. 필기하는 법부터 가르칩니다</h3>
              <p class="text-gray-600 leading-relaxed text-base mb-6">
                안 하는 게 아니라 <b>'어떻게 하는지 몰라서'</b> 못했던 학생들. 첼시 원장님이 핵심만 빠르게 정리하고 10분 복습으로 효과를 극대화하는 <span class="bg-blue-50 text-blue-700 font-bold px-1">자기주도 학습의 기본기(필기 노트 복습법)</span>를 직접 지도합니다.
              </p>
              <ul class="space-y-2 text-sm text-gray-500 font-medium">
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 백지 복습 테스트로 완벽한 개념 체화</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 나만의 단권화 노트 제작 훈련</li>
              </ul>
            </div>
          </div>

          <!-- 특징 2 -->
          <div class="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-8 text-red-600 shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">2. 될 때까지! 당일 복습과 끝장 RT</h3>
              <p class="text-gray-600 leading-relaxed text-base mb-6">
                24시간 내 복습 시 정착률 90%! 수업을 들은 후 다음 시간에 <span class="bg-red-50 text-red-700 font-bold px-1">복습 시험(RT)을 필수로 진행</span>합니다. 기준 점수에 미달하면 오답을 완벽히 이해할 때까지 집에 갈 수 없는 끝장 관리 시스템입니다.
              </p>
              <ul class="space-y-2 text-sm text-gray-500 font-medium">
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 누적식 단어 시험 및 철저한 구두 테스트</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 이해 못 한 부분은 1:1 무한 질의응답</li>
              </ul>
            </div>
          </div>

          <!-- 특징 3 -->
          <div class="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-8 text-indigo-600 shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">3. 답만 맞히는 감(感) 영어가 아닌 '왜?'</h3>
              <p class="text-gray-600 leading-relaxed text-base mb-6">
                단순 암기로 A등급을 받는 중등부의 착각을 깹니다. 이 정답이 왜 답인지, 왜 틀렸는지 스스로 명확한 논리적 근거를 찾게 만들어 <span class="bg-indigo-50 text-indigo-700 font-bold px-1">고등학교 1등급을 가르는 진짜 문제 해결력</span>을 키웁니다.
              </p>
              <ul class="space-y-2 text-sm text-gray-500 font-medium">
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 고등 모의고사 빈칸/순서/삽입 논리 전개 훈련</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 내신 킬러 문항 대비 체계적인 서술형 영작</li>
              </ul>
            </div>
          </div>

          <!-- 특징 4 -->
          <div class="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-8 text-yellow-600 shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">4. 밤새워 만든 자체 교재 & 밀착 소통</h3>
              <p class="text-gray-600 leading-relaxed text-base mb-6">
                매일 학생들의 진도와 성취도를 학부모님께 <span class="bg-yellow-50 text-yellow-700 font-bold px-1">데일리 성적표(수업일지)로 카톡 발송</span>합니다. 원장님이 새벽까지 분석해 만든 비법 프린트와 자체 교재로 김포 지역 내신을 완벽 대비합니다.
              </p>
              <ul class="space-y-2 text-sm text-gray-500 font-medium">
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 하늘빛/모담/푸른솔/운양/제일고 기출 100% 분석</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 결석 시 100% 보강 및 실시간 피드백</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 명예의 전당 / 환경 섹션 -->
        <div class="bg-indigo-900 rounded-[2.5rem] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
          
          <div class="relative z-10 flex flex-col items-center">
            <span class="bg-indigo-800 text-indigo-200 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest mb-6">PREMIUM STUDY LOUNGE</span>
            <h3 class="text-3xl md:text-4xl font-black mb-6 leading-tight">"첼시쌤, 학원이 왜 이렇게 예뻐요?"</h3>
            <p class="text-indigo-100 mb-12 max-w-3xl mx-auto leading-relaxed text-lg font-light">
              어둡고 꽉 막힌 독서실 같은 학원은 끝났습니다. 카페처럼 채광이 좋은 개방형 라운지에서 몰입도를 극대화하고, <b class="text-white">90점 이상 달성 시 '명예의 전당'에 오르는 성취감</b>을 맛보며 아이들 스스로 머무르고 싶어 하는 공간을 구현했습니다.
            </p>
            
            <!-- 실적 뱃지 강조 -->
            <div class="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
              <div class="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center transform hover:scale-105 transition">
                <span class="text-3xl mb-2">🥇</span>
                <span class="font-bold text-lg">김포제일고 전교 1등·3등 배출</span>
                <span class="text-indigo-200 text-xs mt-1">제일고1 중간 영어 100점 중 과반수 독강 출신</span>
              </div>
              <div class="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center transform hover:scale-105 transition">
                <span class="text-3xl mb-2">💯</span>
                <span class="font-bold text-lg">운양고 최상위반 전원 100점</span>
                <span class="text-indigo-200 text-xs mt-1">하늘빛중·모담중 독강반 전원 100점 달성</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 상담 신청 폼 -->
    <section id="consulting" class="py-20 bg-indigo-50 border-t border-indigo-100 flex-1">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div class="bg-indigo-600 p-8 text-center">
            <h2 class="text-2xl font-bold text-white mb-2">우리 아이의 '진짜 문제점'을 진단받으세요</h2>
            <p class="text-indigo-100 text-sm">정보를 남겨주시면 첼시 원장님이 직접 연락드려 심층 학습 상담을 진행해 드립니다.</p>
          </div>
          
          <div class="p-8">
            <form @submit.prevent="submitConsulting" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 학생 이름 -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">학생 이름 <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    v-model="form.studentName" 
                    required 
                    placeholder="홍길동"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                
                <!-- 연락처 -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">학부모님 연락처 <span class="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    v-model="form.phone" 
                    required 
                    placeholder="010-0000-0000"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <!-- 학교 -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">학교</label>
                  <input 
                    type="text" 
                    v-model="form.school" 
                    placeholder="ㅇㅇ중학교"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <!-- 학년 -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">학년 <span class="text-red-500">*</span></label>
                  <select 
                    v-model="form.grade" 
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  >
                    <option value="" disabled selected>선택해주세요</option>
                    <option value="중1">중학교 1학년</option>
                    <option value="중2">중학교 2학년</option>
                    <option value="중3">중학교 3학년</option>
                    <option value="고1">고등학교 1학년</option>
                    <option value="고2">고등학교 2학년</option>
                    <option value="고3">고등학교 3학년</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              <!-- 문의 내용 -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">현재 영어 학습 고민 / 문의사항</label>
                <textarea 
                  v-model="form.memo" 
                  rows="4" 
                  placeholder="아이의 취약한 부분이나 궁금하신 점을 자유롭게 적어주세요."
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                ></textarea>
              </div>

              <!-- 동의 체크 -->
              <div class="flex items-start mt-4">
                <div class="flex items-center h-5">
                  <input 
                    id="privacy" 
                    type="checkbox" 
                    required
                    class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  >
                </div>
                <label for="privacy" class="ml-2 text-sm text-gray-600">
                  개인정보 수집 및 이용에 동의합니다. (수집된 정보는 상담 목적으로만 사용되며 이후 즉시 파기됩니다.)
                </label>
              </div>

              <button 
                type="submit" 
                class="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-indigo-700 transition"
                :disabled="isSubmitting"
                :class="{'opacity-70 cursor-not-allowed': isSubmitting}"
              >
                {{ isSubmitting ? '신청 중...' : '상담 신청하기' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- 푸터 -->
    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="text-center md:text-left">
          <span class="text-xl font-black text-white tracking-tight block mb-2">독강영어<span class="text-indigo-500">.</span></span>
          <p class="text-sm">독하게 가르치고 강하게 만듭니다.</p>
        </div>
        <div class="text-center md:text-right text-sm space-y-1">
          <p>경기도 김포시 김포한강11로 288-37 2층 212호, 213호</p>
          <p>상담문의: <a href="tel:031-983-0905" class="text-indigo-400 hover:text-indigo-300">031-983-0905</a></p>
          <p>등록번호: 제2221호</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';

const form = ref({
  studentName: '',
  phone: '',
  school: '',
  grade: '',
  memo: ''
});

const isSubmitting = ref(false);

const scrollToConsulting = () => {
  const el = document.getElementById('consulting');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

const submitConsulting = async () => {
  isSubmitting.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    await axios.post(`${apiUrl}/public/consulting`, {
      studentName: form.value.studentName,
      phone: form.value.phone,
      school: form.value.school,
      grade: form.value.grade,
      memo: form.value.memo
    });
    
    alert('상담 신청이 완료되었습니다! 원장님이 확인 후 연락드리겠습니다.');
    
    // 폼 초기화
    form.value = {
      studentName: '',
      phone: '',
      school: '',
      grade: '',
      memo: ''
    };
  } catch (error: any) {
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>