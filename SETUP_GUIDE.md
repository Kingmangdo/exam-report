# 프로젝트 초기 설정 가이드

## ✅ 완료된 작업

1. ✅ 프로젝트 구조 생성
2. ✅ Vue.js 프론트엔드 초기 설정
3. ✅ Node.js + Express 백엔드 초기 설정
4. ✅ SQLite 데이터베이스 설정

## 📦 설치 및 실행 방법

### 1. 프론트엔드 설정

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 2. 백엔드 설정

```bash
cd backend
npm install
npm run dev
```

백엔드는 `http://localhost:5000`에서 실행됩니다.

**참고**: 백엔드를 처음 실행하면 SQLite 데이터베이스가 자동으로 초기화됩니다.

### 3. 환경 변수 설정

백엔드 폴더에 `.env` 파일을 생성하세요:

```env
PORT=5000
DATABASE_PATH=../database/exam_report.db
NODE_ENV=development
```

## 📁 프로젝트 구조

```
exam-report/
├── frontend/              # Vue.js 프론트엔드
│   ├── src/
│   │   ├── components/   # 재사용 가능한 컴포넌트
│   │   ├── views/        # 페이지 컴포넌트
│   │   ├── router/       # Vue Router 설정
│   │   ├── stores/       # Pinia 상태 관리
│   │   ├── services/     # API 호출 서비스
│   │   ├── utils/        # 유틸리티 함수
│   │   └── types/        # TypeScript 타입 정의
│   ├── package.json
│   └── vite.config.ts
├── backend/              # Node.js + Express 백엔드
│   ├── routes/           # API 라우트
│   ├── controllers/      # 컨트롤러
│   ├── models/           # 데이터 모델
│   ├── middleware/       # 미들웨어
│   ├── utils/            # 유틸리티 함수
│   ├── server.js         # 서버 진입점
│   └── package.json
├── database/             # SQLite 데이터베이스 파일
└── docs/                 # 문서
```

## 🗄️ 데이터베이스 스키마

### students (학생 정보)
- id, name, grade, class_name, phone
- parent_name, parent_phone
- created_at, updated_at

### scores (성적 데이터)
- id, student_id, exam_date
- rt_total, rt_correct, rt_score
- word_total, word_correct, word_score
- assignment_score, attitude_score
- total_score, average_score, class_average
- comment
- created_at, updated_at

### kakao_send_history (카카오톡 발송 이력)
- id, student_id, score_id
- parent_phone, send_status
- send_at, retry_count, error_message

### report_access (성적표 접근 이력)
- id, score_id, access_token
- student_name, phone_last4
- expires_at, accessed_at, created_at

### settings (시스템 설정)
- id, key, value, updated_at

## 🚀 다음 단계

1. API 엔드포인트 개발
2. 프론트엔드 페이지 개발
3. 카카오톡 알림톡 연동
4. 성적표 생성 기능
5. 배포 설정

---

**작성일**: 2026년 1월
**상태**: 초기 설정 완료 ✅
