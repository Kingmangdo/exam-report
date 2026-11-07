<template>
  <div class="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-pretendard landing-wrapper">


  <!-- 네비게이션 바 -->
  <nav class="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <span class="text-2xl font-black text-indigo-900 tracking-tight">독강영어<span class="text-indigo-600">.</span></span>
        </div>
        <div class="flex items-center space-x-4 md:space-x-6">
          <router-link to="/login" class="text-gray-400 hover:text-indigo-600 text-sm font-bold transition">관리자</router-link>
          <a href="#system" class="text-gray-600 hover:text-indigo-600 font-bold hidden md:block transition">독강 시스템</a>
          <a @click="scrollToForm" href="javascript:void(0)" class="bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition transform hover:-translate-y-0.5 inline-flex items-center text-sm md:text-base">상담문의</a>
        </div>
      </div>
    </div>
  </nav>

  <!-- 히어로 섹션 -->
  <section class="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white py-24 lg:py-36 relative overflow-hidden">
    <!-- 배경 장식 -->
    <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
    <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
    
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-4xl mx-auto">
        <span class="inline-block py-1.5 px-5 rounded-full bg-indigo-800 border border-indigo-500 text-indigo-100 text-sm font-bold tracking-wide mb-8 shadow-sm">
          김포 운양동 · 하늘빛중 · 운양고 · 김포제일고 영어
        </span>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">
          <span data-editor-part="">시키는 영어 공부에서</span><br>
          <span data-editor-part="" class="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">스스로 해내는 습관으로.</span>
        </h1>
        <p class="text-lg sm:text-xl text-indigo-100 mb-12 leading-relaxed font-medium">수업을 듣고 끝내지 않습니다. 직접 정리하고 복습하고, <br>틀린 이유를 설명하는 과정까지 함께합니다.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a @click="scrollToForm" href="javascript:void(0)" class="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-gray-50 transition transform hover:-translate-y-1 w-full sm:w-auto inline-flex items-center justify-center">상담문의</a>
          <a href="#system" class="bg-indigo-800/80 backdrop-blur-sm border border-indigo-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition w-full sm:w-auto text-center inline-block">
            독강영어의 학습 과정
          </a>
        </div>
      </div>
    </div>
  </section>

  <section class="py-20 bg-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12"><span class="text-indigo-600 font-bold text-sm">학부모님이 가장 궁금한 것</span><h2 class="text-3xl md:text-4xl font-black mt-3 mb-4">“보내면 우리 아이가 정말 공부하게 될까요?”</h2><p class="text-gray-600">학원에서의 설명이 집에서도 이어지는지, 공부한 과정이 보이는지가 중요합니다.</p></div>
      <div class="grid md:grid-cols-3 gap-5">
        <div class="p-7 rounded-2xl border border-gray-200 bg-gray-50"><b class="text-indigo-600">01 · 복습</b><h3 class="font-bold text-xl mt-3 mb-2">수업은 듣는데 복습을 안 해요</h3><p class="text-gray-600">무엇을 다시 봐야 하는지 정리하고, 다음 수업에서 이해한 내용을 확인합니다.</p></div>
        <div class="p-7 rounded-2xl border border-gray-200 bg-gray-50"><b class="text-indigo-600">02 · 오답</b><h3 class="font-bold text-xl mt-3 mb-2">숙제는 하는데 설명을 못 해요</h3><p class="text-gray-600">정답만 고치는 대신 틀린 이유와 답의 근거를 말로 풀어보게 합니다.</p></div>
        <div class="p-7 rounded-2xl border border-gray-200 bg-gray-50"><b class="text-indigo-600">03 · 소통</b><h3 class="font-bold text-xl mt-3 mb-2">학원에서 뭘 하는지 모르겠어요</h3><p class="text-gray-600">진도와 성취, 다시 살펴야 할 부분을 학부모에게 공유하는 흐름을 만듭니다.</p></div>
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
        <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight"><span data-editor-part="">독강영어의</span> <span data-editor-part="" class="text-indigo-600">4단계 학습 과정</span></h2>
        <p class="text-gray-600 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
          <span data-editor-part="">단순히 수업만 듣는다고 성적이 오르지 않습니다.</span><br class="hidden md:block">
          <span data-editor-part="">독강영어는</span> <b data-editor-part="">'스스로 공부하는 방법'</b><span data-editor-part="">부터 차근차근 익히도록 돕습니다.</span>
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-10 mb-24">
        <!-- 특징 1 -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 relative overflow-hidden group flex flex-col">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          <!-- 필기 이미지 (워터마크 포함) -->
          <div class="w-full h-48 sm:h-56 relative overflow-hidden rounded-t-3xl border-b border-gray-100">
            <div class="absolute inset-0 bg-black/10 z-10"></div>
            <img src="/assets/student-notes.jpg" alt="하늘빛중 학생이 직접 작성한 필기 노트" class="w-full h-full object-cover transform group-hover:scale-105 transition duration-700">
            <div class="absolute bottom-3 right-3 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">하늘빛중 학생의 실제 필기 노트</div>
          </div>

          <div class="p-8 md:p-10 flex-1 relative z-10 bg-white">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">1. 필기하는 법부터 가르칩니다</h3>
            <p class="text-gray-600 leading-relaxed text-base mb-6"><span data-editor-part="">무엇을 어떻게 복습해야 할지 막막한 학생에게 핵심을 직접 정리하고</span> <br><span data-editor-part="">다시 꺼내 보는</span> <span class="bg-blue-50 text-blue-700 font-bold px-1" data-editor-part="">자기주도 학습의 기본기(필기 노트 복습법)</span><span data-editor-part="">를 직접 지도합니다.</span></p>
            <ul class="space-y-3 text-sm text-gray-600 font-bold bg-gray-50/50 p-4 rounded-xl border border-gray-100 mt-auto">
              <li class="flex items-center gap-2"><svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 백지 복습으로 이해한 내용을 확인</li>
              <li class="flex items-center gap-2"><svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 나만의 단권화 노트 제작 훈련</li>
            </ul>
          </div>
        </div>

        <!-- 특징 2 -->
        <div class="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-8 text-red-600 shadow-sm">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">2. 배운 뒤에는 복습으로 확인합니다</h3>
            <p class="text-gray-600 leading-relaxed text-base mb-6"><span data-editor-part="">수업을 들은 후 다음 시간에</span> <span class="bg-red-50 text-red-700 font-bold px-1" data-editor-part="">복습 시험(RT)을 필수로 진행</span><span data-editor-part="">합니다.</span> <br><span data-editor-part="">부족한 부분은 오답 이유를 확인하고 다시 설명할 수 있도록 지도합니다.</span></p>
            <ul class="space-y-3 text-sm text-gray-600 font-bold bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <li class="flex items-center gap-2"><svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 누적식 단어 시험 및 철저한 구두 테스트</li>
              <li class="flex items-center gap-2"><svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 이해하지 못한 부분은 질문하고 다시 확인</li>
            </ul>
          </div>
        </div>

        <!-- 특징 3 -->
        <div class="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-8 text-indigo-600 shadow-sm">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">3. 정답보다 '왜?'를 설명하게 합니다</h3>
            <p class="text-gray-600 leading-relaxed text-base mb-6"><span data-editor-part="">맞힌 문제라도 근거를 설명할 수 있는지 확인합니다.</span><br> <span data-editor-part="">이 정답이 왜 답인지, 왜 틀렸는지 스스로 명확한 논리적 근거를 찾게 만들어</span> <span class="bg-indigo-50 text-indigo-700 font-bold px-1" data-editor-part="">낯선 문제에도 적용할 수 있는 문제 해결력</span><span data-editor-part="">을 키웁니다.</span></p>
            <ul class="space-y-3 text-sm text-gray-600 font-bold bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <li class="flex items-center gap-2"><svg class="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 고등 모의고사 빈칸/순서/삽입 논리 전개 훈련</li>
              <li class="flex items-center gap-2"><svg class="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 내신 킬러 문항 대비 체계적인 서술형 영작</li>
            </ul>
          </div>
        </div>

        <!-- 특징 4 -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 relative overflow-hidden group flex flex-col">
          <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          <!-- 자체 교재/수업 이미지 (워터마크 포함) -->
          <div class="w-full h-48 sm:h-56 relative overflow-hidden rounded-t-3xl border-b border-gray-100">
            <div class="absolute inset-0 bg-black/10 z-10"></div>
            <img src="/assets/class-materials.jpg" alt="독강영어 자체 제작 학습 자료" class="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 object-center">
            <div class="absolute bottom-3 right-3 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">독강영어 자체 제작 학습 자료</div>
          </div>

          <div class="p-8 md:p-10 flex-1 relative z-10 bg-white">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">4. 학습 과정을 학부모와 공유합니다</h3>
            <p class="text-gray-600 leading-relaxed text-base mb-6"><span data-editor-part="">학생들의 진도와 성취도를 학부모님께</span> <span class="bg-yellow-50 text-yellow-700 font-bold px-1" data-editor-part="">수업일지로 공유</span><span data-editor-part="">합니다.</span> <br><span data-editor-part="">자체 교재와 수업 자료로 학교별 학습 내용을 준비합니다.</span></p>
            <ul class="space-y-3 text-sm text-gray-600 font-bold bg-gray-50/50 p-4 rounded-xl border border-gray-100 mt-auto">
              <li class="flex items-center gap-2"><svg class="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 학교별 시험 범위와 취약 유형을 살피는 학습</li>
              <li class="flex items-center gap-2"><svg class="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 결석 시 보강 방식과 학습 피드백은 상담 시 안내</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="mt-20">
        <div class="text-center mb-10"><span class="text-indigo-600 font-bold text-sm">학교와 학년에 맞는 상담</span><h3 class="text-3xl md:text-4xl font-black mt-3 mb-4">같은 영어라도 고민은 다릅니다</h3><p class="text-gray-600">평소에는 수준에 맞춰 이해를 쌓고, 시험 약 한 달 전에는 학교별 준비로 전환합니다.</p></div>
        <div class="grid md:grid-cols-3 gap-5">
          <div class="bg-white rounded-2xl p-7 border-t-4 border-indigo-600 shadow-md"><h4 class="text-xl font-bold mb-3">하늘빛중</h4><p class="text-gray-600">내신 복습 습관을 잡고,<br>고등 독해·문법 기초를 다집니다.</p></div>
          <div class="bg-white rounded-2xl p-7 border-t-4 border-indigo-600 shadow-md"><h4 class="text-xl font-bold mb-3">운양고</h4><p class="text-gray-600">평소 어법·구문·독해·서술형 학습,<br>시험 전 범위·변형 유형 맞춤 대비합니다.</p></div>
          <div class="bg-white rounded-2xl p-7 border-t-4 border-indigo-600 shadow-md"><h4 class="text-xl font-bold mb-3">김포제일고</h4><p class="text-gray-600">시험 범위와 변형 유형을 분석하고,<br>문장을 설명하고 쓰는 힘을 기릅니다.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section id="admission" class="py-24 bg-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <span class="text-indigo-600 font-bold text-sm">처음부터 아이에게 맞는 흐름으로</span>
        <h2 class="text-3xl md:text-4xl font-black mt-3 mb-4">입학 첫 2~4주, 더 유심히 살핍니다</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">레벨 테스트는 아이를 줄 세우는 시험이 아닙니다. 어디에서 막히는지 찾고, <br>지치지 않고 따라갈 수 있는 수업 흐름을 정하는 출발점입니다.<br></p>
      </div>
      <div class="grid md:grid-cols-4 gap-5">
        <div class="p-6 rounded-2xl bg-indigo-50 border border-indigo-100"><b class="text-indigo-600">01 · 예약</b><h3 class="font-bold text-lg mt-3 mb-2">상담 신청</h3><p class="text-gray-600 text-sm">학교·학년과 현재 영어 고민을 이야기합니다.</p></div>
        <div class="p-6 rounded-2xl bg-indigo-50 border border-indigo-100"><b class="text-indigo-600">02 · 진단</b><h3 class="font-bold text-lg mt-3 mb-2">레벨 테스트</h3><p class="text-gray-600 text-sm">어법, 구문, 문장 구조 중 막히는 지점을 살핍니다.</p></div>
        <div class="p-6 rounded-2xl bg-indigo-50 border border-indigo-100"><b class="text-indigo-600">03 · 배정</b><h3 class="font-bold text-lg mt-3 mb-2">상담과 반 배정</h3><p class="text-gray-600 text-sm">실력과 함께 이해 속도, 학습 태도도 고려합니다.</p></div>
        <div class="p-6 rounded-2xl bg-indigo-50 border border-indigo-100"><b class="text-indigo-600">04 · 적응</b><h3 class="font-bold text-lg mt-3 mb-2">첫 2~4주 관찰</h3><p class="text-gray-600 text-sm">수업 적응, 숙제 처리, 이해 속도를 보고 필요하면 방향을 조정합니다.</p></div>
      </div>
      <p class="text-center text-sm text-gray-500 mt-6">자세한 절차는 <a class="font-bold text-indigo-700 underline" href="https://m.blog.naver.com/drawingenglish/224157552204" target="_blank" rel="noopener noreferrer">독강영어 블로그 입학 안내</a>에서 확인할 수 있습니다.</p>
    </div>
  </section>
  <section id="results" class="py-24 bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12"><span class="text-indigo-600 font-bold text-sm">블로그에 공개한 학생별 사례</span><h2 class="text-3xl md:text-4xl font-black mt-3 mb-4">점수 뒤에 있었던 공부의 변화</h2><p class="text-gray-600">각 학생의 사례를 학습 과정과 함께 살펴보세요.</p></div>
      <div class="grid md:grid-cols-2 gap-6">
        <article class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <span class="text-sm font-bold text-indigo-600">김포제일고 학생 사례</span><h3 class="text-2xl font-black mt-3 mb-4">영어 67점 → 96점</h3><p class="text-gray-600 mb-5">중학교 때 영어 100점을 받던 학생이 고등학교 첫 시험에서 어려움을 겪은 뒤, 문장 구조와 변형 문제에 맞는 학습으로 2학기 기말 96점을 받은 과정이 소개되어 있습니다.</p><a class="font-bold text-indigo-700 underline" href="https://m.blog.naver.com/drawingenglish/224166485958" target="_blank" rel="noopener noreferrer">사례 원문 보기 ↗</a>
        </article>
        <article class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <span class="text-sm font-bold text-indigo-600">운양고 학생 사례</span><h3 class="text-2xl font-black mt-3 mb-4">영어 44점 → 74점 → 100점</h3><p class="text-gray-600 mb-5">영어가 약했던 학생이 약 1년 동안 공부 방식을 바꾸고, 2학년 2학기 중간 74점·기말 100점을 받은 사례가 소개되어 있습니다.</p><a class="font-bold text-indigo-700 underline" href="https://m.blog.naver.com/drawingenglish/224166485958" target="_blank" rel="noopener noreferrer">사례 원문 보기 ↗</a>
        </article>
      </div>
      <p class="text-sm text-gray-500 mt-6 text-center">블로그에 공개된 개별 학생의 사례입니다. 현재 성적과 학습 상황에 따라 필요한 지도 방식은 달라집니다.</p>
    </div>
  </section>

  <section id="director" class="py-24 bg-white">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
      <div><span class="text-indigo-600 font-bold text-sm">첼시 원장의 지도 기준</span><h2 class="text-3xl md:text-4xl font-black mt-3 mb-5">한 문제를 풀어도<br>왜 그런지 설명할 수 있게</h2><p class="text-gray-600 leading-8 mb-5">첼시 원장은 오답을 그냥 고치기보다 이유를 학생 스스로 이해하게 하는 수업을 강조합니다. 학생이 영어를 어려워할 때는 문제 수를 늘리기 전에 어떤 개념과 문장에서 막히는지 먼저 살핍니다.</p><p class="text-gray-600 leading-8">원장의 영어 학습 경험과 수업 준비 이야기도 직접 읽어보실 수 있습니다.</p><a class="inline-block font-bold text-indigo-700 underline mt-6" href="https://m.blog.naver.com/drawingenglish/223715771341" target="_blank" rel="noopener noreferrer">첼시 원장 소개 보기 ↗</a></div>
      <div class="bg-indigo-900 text-white rounded-3xl p-9 md:p-12"><span class="text-indigo-200 font-bold text-sm">부모가 확인할 수 있는 것</span><p class="text-2xl md:text-3xl font-black leading-snug mt-5 mb-6">“우리 아이가 무엇을 배우고, <br>어디서 막혔는지 알고 싶어요.”</p><p class="text-indigo-100 leading-8">수업일지와 복습·오답 확인은 결과만 전달하는 데 <br>그치지 않고 다음에 무엇을 공부해야 하는지 알려주기 위한 과정입니다.</p></div>
    </div>
  </section>
  <section id="consulting" class="py-24 bg-indigo-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12"><span class="text-indigo-600 font-bold text-sm">아이의 공부 과정을 함께 확인합니다</span><h2 class="text-3xl md:text-4xl font-black mt-3 mb-5">“열심히 했어요”보다 중요한 것</h2><p class="text-gray-600 text-lg">무엇을 배웠고, 어디서 막혔고, 다음에 무엇을 해야 하는지 알려드립니다.</p></div>
      <div class="grid md:grid-cols-2 gap-5 mb-16">
        <div class="bg-white rounded-2xl p-7 border border-indigo-100"><h3 class="font-bold text-xl mb-2">학부모님께 보이는 기록</h3><p class="text-gray-600">필기 노트, 복습·오답 기록, 수업일지를 통해 아이의 학습 과정을 확인합니다.</p></div>
        <div class="bg-white rounded-2xl p-7 border border-indigo-100"><h3 class="font-bold text-xl mb-2">상담에서 함께 살필 것</h3><p class="text-gray-600">학교와 학년, 최근 영어 공부의 어려움, 집에서의 복습 습관을 듣고 필요한 학습 방향을 정리합니다.</p></div>
      </div>
      <div class="bg-indigo-900 text-white rounded-3xl p-10 md:p-14 text-center shadow-xl">
        <h2 class="text-3xl md:text-4xl font-black mb-4">우리 아이에게 필요한 공부 방식,<br class="hidden sm:block"> 상담에서 먼저 확인해 보세요</h2>
        <p class="text-indigo-100 mb-8">학원 생활과 학습 관리 방식이 아이에게 맞을지 직접 이야기 나눠보세요.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3"><a href="https://naver.me/GkRSMhtV" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-full sm:w-auto bg-[#03C75A] text-white px-8 py-4 rounded-full font-black text-lg hover:opacity-90 transition">네이버 예약</a><a @click="scrollToForm" href="javascript:void(0)" class="inline-flex items-center justify-center w-full sm:w-auto bg-white text-indigo-900 px-8 py-4 rounded-full font-black text-lg hover:bg-indigo-50 transition">상담문의</a></div>
        <p class="text-indigo-200 text-sm mt-5">방문 상담은 네이버에서 예약하거나 전화로 문의해 주세요.</p>
      </div>
    
      <!-- 상담 신청 폼 -->
      <div id="reservation-form" class="mt-16 bg-white rounded-3xl shadow-xl overflow-hidden max-w-3xl mx-auto">
        <div class="bg-indigo-600 p-8 text-center">
          <h2 class="text-2xl font-bold text-white mb-2">우리 아이의 '진짜 문제점'을 진단받으세요</h2>
          <p class="text-indigo-100 text-sm">정보를 남겨주시면 첼시 원장님이 직접 연락드려 심층 학습 상담을 진행해 드립니다.</p>
        </div>
        <div class="p-8 text-left">
          <form @submit.prevent="submitConsulting" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 학생 이름 -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">학생 이름 <span class="text-red-500">*</span></label>
                <input type="text" v-model="form.studentName" required placeholder="홍길동" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <!-- 연락처 -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">학부모님 연락처 <span class="text-red-500">*</span></label>
                <input type="tel" v-model="form.phone" required placeholder="010-0000-0000" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <!-- 학교 -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">학교</label>
                <input type="text" v-model="form.school" placeholder="ㅇㅇ중학교" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <!-- 학년 -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">학년 <span class="text-red-500">*</span></label>
                <select v-model="form.grade" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white">
                  <option value="" disabled selected>선택해주세요</option>
                  <option value="초5">초등학교 5학년</option>
                  <option value="초6">초등학교 6학년</option>
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
                <textarea v-model="form.memo" rows="4" placeholder="아이의 취약한 부분이나 궁금하신 점을 자유롭게 적어주세요." class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"></textarea>
            </div>
            <!-- 동의 체크 -->
            <div class="flex items-start mt-4">
              <div class="flex items-center h-5">
                <input id="privacy" type="checkbox" required class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500">
              </div>
              <label for="privacy" class="ml-2 text-sm text-gray-600">
                개인정보 수집 및 이용에 동의합니다. (수집된 정보는 상담 목적으로만 사용되며 이후 즉시 파기됩니다.)
              </label>
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-indigo-700 transition" :disabled="isSubmitting" :class="{'opacity-70 cursor-not-allowed': isSubmitting}">
              {{ isSubmitting ? '신청 중...' : '상담 신청하기' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
  <!-- 푸터 -->
  <footer class="bg-gray-900 text-gray-400 py-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
      <div class="text-center md:text-left">
        <span class="text-2xl font-black text-white tracking-tight block mb-3">독강영어<span class="text-indigo-500">.</span></span>
        <p class="text-sm font-medium">아이가 공부하는 과정을 함께 만듭니다.</p>
      </div>
      <div class="text-center md:text-right text-sm space-y-2 font-medium">
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

const scrollToForm = () => {
  const el = document.getElementById('reservation-form');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    
    alert('상담 신청이 접수되었습니다! 첼시 원장님이 확인 후 연락드리겠습니다.');
    
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

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
.landing-wrapper { 
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; 
}
:global(html) { scroll-behavior: smooth; }
</style>