# GitHub 저장소 설정 가이드

## 🎯 목표
집(Desktop)과 사무실(노트북)에서 같은 프로젝트를 공동으로 사용하기

---

## 📋 사전 준비

### 1. GitHub 계정 생성 (없는 경우)
1. https://github.com 접속
2. "Sign up" 클릭하여 계정 생성

### 2. Git 설치 확인
```powershell
git --version
```
- 설치되어 있지 않으면: https://git-scm.com/download/win 에서 다운로드

---

## 🚀 첫 번째 컴퓨터 (현재 Desktop) 설정

### 1단계: Git 저장소 초기화

```powershell
# 프로젝트 폴더로 이동
cd C:\Users\HP\Desktop\DK_English\exam-report

# Git 저장소 초기화
git init

# 현재 상태 확인
git status
```

### 2단계: 모든 파일 추가

```powershell
# 모든 파일 스테이징
git add .

# 첫 커밋
git commit -m "Initial commit: 독강영어학원 성적표 시스템"
```

### 3단계: GitHub에 저장소 생성

1. **GitHub 웹사이트 접속**
   - https://github.com 로그인
   - 우측 상단 "+" 버튼 → "New repository" 클릭

2. **저장소 정보 입력**
   - Repository name: `exam-report` (또는 원하는 이름)
   - Description: `독강영어학원 데일리 영어 성적표 시스템`
   - **Public** 또는 **Private** 선택
   - **"Initialize this repository with a README" 체크 해제** (이미 로컬에 파일이 있으므로)
   - "Create repository" 클릭

3. **GitHub에서 제공하는 명령어 복사**
   - 저장소 생성 후 나오는 페이지에서 명령어 확인
   - 예시:
     ```powershell
     git remote add origin https://github.com/사용자명/exam-report.git
     git branch -M main
     git push -u origin main
     ```

### 4단계: GitHub에 업로드

```powershell
# 원격 저장소 추가 (위에서 복사한 URL 사용)
git remote add origin https://github.com/사용자명/exam-report.git

# 기본 브랜치를 main으로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**인증:**
- GitHub Personal Access Token 필요할 수 있음
- 또는 GitHub Desktop 앱 사용 권장

---

## 💻 두 번째 컴퓨터 (사무실 노트북) 설정

### 1단계: GitHub에서 프로젝트 클론

```powershell
# 원하는 폴더로 이동 (예: Desktop)
cd C:\Users\사용자명\Desktop

# GitHub에서 프로젝트 클론
git clone https://github.com/사용자명/exam-report.git

# 프로젝트 폴더로 이동
cd exam-report
```

### 2단계: 의존성 설치

```powershell
# 백엔드 의존성 설치
cd backend
npm install

# 프론트엔드 의존성 설치
cd ../frontend
npm install
```

---

## 🔄 일상적인 작업 흐름

### 집(Desktop)에서 작업 후

```powershell
# 프로젝트 폴더로 이동
cd C:\Users\HP\Desktop\DK_English\exam-report

# 변경사항 확인
git status

# 변경된 파일 추가
git add .

# 커밋 (변경 내용 설명)
git commit -m "기능 추가: 반 일괄 이동 기능"

# GitHub에 푸시
git push
```

### 사무실(노트북)에서 작업 시작 전

```powershell
# 프로젝트 폴더로 이동
cd C:\Users\사용자명\Desktop\exam-report

# GitHub에서 최신 변경사항 가져오기
git pull

# 작업 시작...
```

### 사무실(노트북)에서 작업 후

```powershell
# 변경사항 확인
git status

# 변경된 파일 추가
git add .

# 커밋
git commit -m "버그 수정: 성적 저장 오류 해결"

# GitHub에 푸시
git push
```

---

## 📝 커밋 메시지 가이드

명확한 커밋 메시지를 작성하면 나중에 변경 이력을 이해하기 쉽습니다:

```
✅ 좋은 예:
- "기능 추가: 반 일괄 이동 기능"
- "버그 수정: 성적 저장 시 null 오류 해결"
- "UI 개선: 학생 목록 반 표시 개선"

❌ 나쁜 예:
- "수정"
- "업데이트"
- "asdf"
```

---

## ⚠️ 주의사항

### 1. 충돌 방지
- **작업 전 항상 `git pull`로 최신 상태 확인**
- 같은 파일을 동시에 수정하지 않기

### 2. 데이터베이스 파일
- `database/*.db` 파일은 `.gitignore`에 포함되어 있어 업로드되지 않습니다
- 각 컴퓨터에서 별도로 데이터베이스가 생성됩니다
- **중요 데이터는 별도로 백업하세요**

### 3. 환경 변수
- `.env` 파일도 업로드되지 않습니다
- 각 컴퓨터에서 `.env` 파일을 별도로 생성해야 합니다

### 4. node_modules
- `node_modules` 폴더는 업로드되지 않습니다
- 새 컴퓨터에서 `npm install`로 설치해야 합니다

---

## 🔐 GitHub 인증 (Personal Access Token)

### 토큰 생성 방법

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. 권한 선택:
   - ✅ `repo` (전체 저장소 접근)
4. "Generate token" 클릭
5. **토큰 복사** (한 번만 표시됨!)

### 토큰 사용

```powershell
# 푸시 시 사용자명과 비밀번호 대신 토큰 사용
# Username: GitHub 사용자명
# Password: Personal Access Token
```

또는 **GitHub Desktop** 앱 사용을 권장합니다 (더 쉽습니다)

---

## 🛠️ GitHub Desktop 사용 (권장)

### 설치
1. https://desktop.github.com/ 에서 다운로드
2. 설치 후 GitHub 계정 로그인

### 사용법
1. **저장소 추가**: File → Clone repository → GitHub.com에서 선택
2. **변경사항 커밋**: 왼쪽에서 변경된 파일 확인 → 하단에 메시지 입력 → "Commit to main"
3. **푸시**: "Push origin" 버튼 클릭
4. **풀**: "Fetch origin" → "Pull origin" 버튼 클릭

**장점:**
- GUI로 쉽게 사용 가능
- 충돌 해결 도구 제공
- 변경 이력 시각화

---

## 📦 현재 프로젝트 상태 확인

### 업로드될 파일들
- ✅ 소스 코드 (frontend/src, backend/)
- ✅ 설정 파일 (package.json, vite.config.ts 등)
- ✅ 문서 파일 (*.md)
- ✅ .gitignore

### 업로드되지 않는 파일들
- ❌ node_modules/
- ❌ database/*.db
- ❌ .env
- ❌ dist/ (빌드 결과물)

---

## 🚨 문제 해결

### "fatal: not a git repository"
```powershell
# Git 저장소 초기화
git init
```

### "error: failed to push"
- GitHub 인증 확인
- Personal Access Token 확인
- 네트워크 연결 확인

### "error: Your local changes would be overwritten"
```powershell
# 변경사항 임시 저장
git stash

# 최신 버전 가져오기
git pull

# 임시 저장한 변경사항 복원
git stash pop
```

### 충돌 발생 시
1. 충돌 파일 열기
2. `<<<<<<<`, `=======`, `>>>>>>>` 표시 확인
3. 원하는 코드 선택
4. 충돌 마커 제거
5. `git add .` → `git commit` → `git push`

---

## ✅ 체크리스트

### 첫 번째 컴퓨터 (Desktop)
- [ ] Git 설치 확인
- [ ] `git init` 실행
- [ ] `git add .` 실행
- [ ] `git commit` 실행
- [ ] GitHub 저장소 생성
- [ ] `git remote add origin` 실행
- [ ] `git push` 실행

### 두 번째 컴퓨터 (노트북)
- [ ] Git 설치 확인
- [ ] `git clone` 실행
- [ ] `npm install` (backend, frontend)
- [ ] `.env` 파일 생성 (필요시)
- [ ] 테스트 실행

---

## 📞 다음 단계

1. **현재 Desktop에서 위의 "첫 번째 컴퓨터 설정" 진행**
2. **GitHub 저장소 생성**
3. **내일 사무실 노트북에서 "두 번째 컴퓨터 설정" 진행**

문제가 발생하면 알려주세요!
