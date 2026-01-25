# 프로젝트 실행 가이드

## ✅ 설치 완료 상태

- ✅ 프론트엔드: 패키지 설치 완료
- ✅ 백엔드: 패키지 설치 완료
- ✅ Node.js 20.20.0 사용 중

---

## 🚀 프로젝트 실행 방법

### 방법 1: 두 개의 터미널 사용 (권장)

#### 터미널 1: 백엔드 서버 실행

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
npm.cmd run dev
```

**예상 출력:**
```
Server is running on port 3000
Database initialized
```

#### 터미널 2: 프론트엔드 서버 실행

새 터미널을 열고:

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\frontend
npm.cmd run dev
```

**예상 출력:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🌐 접속 주소

- **프론트엔드**: http://localhost:5173/
- **백엔드 API**: http://localhost:3000/api

---

## 📝 환경 변수 설정 (필요한 경우)

### 백엔드 `.env` 파일 생성

`backend/.env` 파일을 생성하고 (없는 경우):

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 프론트엔드 환경 변수

`frontend/.env` 파일을 생성하고 (없는 경우):

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🧪 테스트

### 1. 백엔드 API 테스트

브라우저에서 열기:
```
http://localhost:3000/api/students
```

빈 배열 `[]`이 나오면 정상입니다 (아직 학생 데이터가 없음).

### 2. 프론트엔드 접속

브라우저에서 열기:
```
http://localhost:5173
```

대시보드가 보이면 정상입니다!

---

## 🎯 주요 기능 테스트

1. **학생 관리**: 학생 추가/수정/삭제
2. **성적 입력**: 일일 성적 입력
3. **성적 조회**: 입력한 성적 확인
4. **성적표 생성**: 성적표 링크 생성 및 미리보기

---

## 🛑 서버 종료

각 터미널에서 `Ctrl + C`를 눌러 서버를 종료할 수 있습니다.

---

## 💡 문제 해결

### 백엔드 서버가 시작되지 않으면

1. 포트 3000이 사용 중인지 확인
2. `.env` 파일 확인
3. 데이터베이스 파일 권한 확인

### 프론트엔드가 시작되지 않으면

1. 포트 5173이 사용 중인지 확인
2. `node_modules` 폴더 확인
3. 캐시 삭제: `npm.cmd run dev -- --force`

---

## 🎉 다음 단계

설치가 완료되었으니 이제:
1. 백엔드 서버 실행
2. 프론트엔드 서버 실행
3. 브라우저에서 테스트
4. 학생 데이터 추가 및 성적 입력 테스트

행운을 빕니다! 🚀
