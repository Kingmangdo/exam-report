# 빠른 시작 가이드

지금까지 완성된 프로젝트를 실행하는 방법입니다.

## 📋 실행 전 확인사항

1. **Node.js 설치 확인**
   ```bash
   node --version
   npm --version
   ```
   Node.js가 설치되어 있어야 합니다.

## 🚀 실행 방법

### 1단계: 백엔드 서버 실행

터미널 1번을 열고:

```bash
cd backend
npm install
npm run dev
```

백엔드 서버가 `http://localhost:5000`에서 실행됩니다.

**성공 메시지:**
```
🚀 서버가 http://localhost:5000 에서 실행 중입니다.
✅ 데이터베이스 초기화 완료
```

### 2단계: 프론트엔드 서버 실행

터미널 2번을 새로 열고:

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 서버가 `http://localhost:3000`에서 실행됩니다.

**성공 메시지:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3단계: 브라우저에서 확인

브라우저를 열고 다음 주소로 접속:

**http://localhost:3000**

## 📱 접속 가능한 페이지

1. **대시보드**: http://localhost:3000/
   - 전체 통계 확인

2. **학생 관리**: http://localhost:3000/students
   - 학생 등록, 수정, 삭제

3. **성적 입력**: http://localhost:3000/scores/new
   - 성적 입력 및 저장

4. **성적 조회**: http://localhost:3000/scores
   - 성적 목록 조회

5. **설정 관리**: http://localhost:3000/settings
   - 종합 문구 관리

6. **성적표 보기**: http://localhost:3000/report/{토큰}
   - 학부모용 성적표 (토큰 필요)

## ⚠️ 문제 해결

### 포트가 이미 사용 중인 경우

**백엔드 포트 변경:**
- `backend/.env` 파일 생성 후:
  ```
  PORT=5001
  ```

**프론트엔드 포트 변경:**
- `frontend/vite.config.ts`에서 `server.port` 수정

### npm install 오류

```bash
# 캐시 정리 후 재시도
npm cache clean --force
npm install
```

### 데이터베이스 오류

데이터베이스는 백엔드 서버 실행 시 자동으로 생성됩니다.
`database/exam_report.db` 파일이 생성되는지 확인하세요.

## 🧪 테스트 방법

1. **학생 등록 테스트**
   - 학생 관리 페이지에서 "학생 등록" 클릭
   - 정보 입력 후 저장

2. **성적 입력 테스트**
   - 성적 입력 페이지에서 학생 선택
   - 점수 입력 후 저장

3. **성적표 링크 생성 테스트**
   - 성적 조회 페이지에서 성적 선택
   - 링크 생성 (추후 카카오톡 발송 기능과 연동)

## 📝 참고사항

- 백엔드와 프론트엔드를 **동시에 실행**해야 합니다.
- 데이터베이스는 SQLite 파일로 `database/` 폴더에 저장됩니다.
- 개발 모드에서는 코드 변경 시 자동으로 새로고침됩니다.

---

**문제가 발생하면 에러 메시지를 확인하고 알려주세요!**
