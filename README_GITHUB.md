# 독강영어학원 데일리 성적표 시스템

## 📦 프로젝트 클론 후 설치

### 1. 저장소 클론
```bash
git clone https://github.com/YOUR_USERNAME/exam-report.git
cd exam-report
```

### 2. 백엔드 설정
```bash
cd backend

# 환경 변수 파일 생성
copy .env.example .env
# .env 파일을 열어서 필요한 값 설정

# 패키지 설치
npm.cmd install

# 서버 실행
npm.cmd run dev
```

### 3. 프론트엔드 설정
```bash
cd frontend

# 패키지 설치
npm.cmd install

# 개발 서버 실행
npm.cmd run dev
```

## ⚙️ 필수 설치 사항

### Windows에서 필요한 것들:
1. **Node.js** (https://nodejs.org/)
2. **Python 3.11+** (better-sqlite3 컴파일용)
3. **Visual Studio Build Tools** (better-sqlite3 컴파일용)
   - 또는 Windows Build Tools: `npm install -g windows-build-tools`

## 🔧 환경 변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 입력:

```env
PORT=5000
DATABASE_PATH=../database/exam_report.db
NODE_ENV=development
```

## 📝 참고

- 데이터베이스는 자동으로 생성됩니다.
- 첫 실행 시 테이블이 자동으로 초기화됩니다.
