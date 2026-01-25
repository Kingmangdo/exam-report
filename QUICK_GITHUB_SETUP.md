# 🚀 GitHub 빠른 설정 가이드

## 현재 컴퓨터 (Desktop)에서 진행

### 1단계: Git 설치 확인

```powershell
git --version
```

**Git이 없으면:**
- https://git-scm.com/download/win 에서 다운로드 후 설치
- 또는 `setup-git.ps1` 스크립트 실행

---

### 2단계: Git 저장소 초기화

```powershell
# 프로젝트 폴더로 이동
cd C:\Users\HP\Desktop\DK_English\exam-report

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 독강영어학원 성적표 시스템"
```

---

### 3단계: GitHub 저장소 생성

1. **https://github.com** 접속 → 로그인
2. 우측 상단 **"+"** → **"New repository"**
3. 저장소 정보 입력:
   - **Repository name**: `exam-report`
   - **Description**: `독강영어학원 데일리 영어 성적표 시스템`
   - **Public** 또는 **Private** 선택
   - ⚠️ **"Initialize this repository with a README" 체크 해제**
4. **"Create repository"** 클릭

---

### 4단계: GitHub에 업로드

GitHub에서 제공하는 명령어 실행 (저장소 생성 후 페이지에 표시됨):

```powershell
# 원격 저장소 추가 (사용자명을 본인 것으로 변경)
git remote add origin https://github.com/사용자명/exam-report.git

# 기본 브랜치를 main으로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**인증:**
- 사용자명: GitHub 사용자명
- 비밀번호: **Personal Access Token** (아래 참고)

---

### 5단계: Personal Access Token 생성

1. GitHub → 우측 상단 프로필 → **Settings**
2. 좌측 메뉴 → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **"Generate new token (classic)"** 클릭
5. 권한 선택:
   - ✅ **repo** (전체 저장소 접근)
6. **"Generate token"** 클릭
7. **토큰 복사** (한 번만 표시됨!)

**토큰 사용:**
- `git push` 시 비밀번호 입력란에 토큰 붙여넣기

---

## 내일 사무실 노트북에서 진행

### 1단계: 프로젝트 클론

```powershell
# 원하는 폴더로 이동
cd C:\Users\사용자명\Desktop

# GitHub에서 프로젝트 다운로드
git clone https://github.com/사용자명/exam-report.git

# 프로젝트 폴더로 이동
cd exam-report
```

### 2단계: 의존성 설치

```powershell
# 백엔드
cd backend
npm install

# 프론트엔드
cd ../frontend
npm install
```

---

## 🔄 일상적인 사용법

### 작업 시작 전 (항상!)
```powershell
git pull  # 최신 변경사항 가져오기
```

### 작업 완료 후
```powershell
git add .
git commit -m "변경 내용 설명"
git push
```

---

## 💡 GitHub Desktop 사용 (더 쉬움!)

### 설치
- https://desktop.github.com/ 에서 다운로드

### 장점
- ✅ GUI로 쉽게 사용
- ✅ 자동 인증
- ✅ 변경 이력 시각화
- ✅ 충돌 해결 도구

### 사용법
1. **저장소 추가**: File → Clone repository
2. **변경사항 커밋**: 변경 파일 확인 → 메시지 입력 → Commit
3. **푸시**: Push origin 버튼
4. **풀**: Fetch origin → Pull origin 버튼

---

## ⚠️ 중요 사항

1. **작업 전 항상 `git pull`**
2. **데이터베이스 파일은 업로드되지 않음** (각 컴퓨터에서 별도 생성)
3. **`.env` 파일도 업로드되지 않음** (각 컴퓨터에서 별도 생성)
4. **`node_modules`는 업로드되지 않음** (각 컴퓨터에서 `npm install`)

---

## 🆘 문제 해결

### "git: command not found"
→ Git 설치 필요: https://git-scm.com/download/win

### "fatal: not a git repository"
```powershell
git init
```

### "error: failed to push"
→ Personal Access Token 확인
→ 네트워크 연결 확인

### "error: Your local changes would be overwritten"
```powershell
git stash      # 변경사항 임시 저장
git pull       # 최신 버전 가져오기
git stash pop  # 변경사항 복원
```

---

## ✅ 체크리스트

### 오늘 (Desktop)
- [ ] Git 설치
- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit`
- [ ] GitHub 저장소 생성
- [ ] Personal Access Token 생성
- [ ] `git push`

### 내일 (노트북)
- [ ] `git clone`
- [ ] `npm install` (backend, frontend)
- [ ] `.env` 파일 생성 (필요시)
- [ ] 테스트 실행

---

**자세한 내용은 `GITHUB_SETUP_GUIDE.md` 참고하세요!**
