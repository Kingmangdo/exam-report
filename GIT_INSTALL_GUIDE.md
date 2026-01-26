# Git 설치 가이드

## 🚀 Git 설치 방법

### 1단계: Git 다운로드

1. **브라우저에서 접속**
   - https://git-scm.com/download/win

2. **다운로드 시작**
   - 자동으로 다운로드가 시작됩니다
   - 또는 "Click here to download manually" 클릭

---

### 2단계: Git 설치

1. **다운로드한 설치 파일 실행**
   - `Git-2.x.x-64-bit.exe` (또는 유사한 이름)

2. **설치 옵션 선택**
   - 대부분 기본 설정으로 진행하면 됩니다
   - **중요**: "Add Git to PATH" 옵션이 체크되어 있는지 확인
   - Next → Next → Install

3. **설치 완료**
   - "Finish" 클릭

---

### 3단계: 터미널 재시작

**중요**: Git 설치 후 **반드시 터미널을 완전히 종료하고 다시 열어야** PATH가 적용됩니다.

1. 현재 터미널 창 닫기
2. Cursor IDE 재시작 (또는 새 터미널 열기)

---

### 4단계: Git 설치 확인

새 터미널에서:

```powershell
git --version
```

**성공하면:**
```
git version 2.xx.x.windows.x
```

이렇게 나오면 설치 완료입니다!

---

## ✅ 설치 후 다음 단계

Git 설치가 완료되면 다음 명령어를 실행하세요:

```powershell
# 프로젝트 폴더로 이동
cd C:\Users\HP\Desktop\DK_English\exam-report

# Git 저장소 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 독강영어학원 성적표 시스템"

# 원격 저장소 추가
git remote add origin https://github.com/Kingmangdo/exam-report.git

# 브랜치를 main으로 변경
git branch -M main

# GitHub에 푸시
git push -u origin main
```

---

## 🔐 Personal Access Token 생성

`git push` 시 인증이 필요합니다:

1. **GitHub 접속**
   - https://github.com → 로그인

2. **Settings 이동**
   - 우측 상단 프로필 아이콘 클릭
   - "Settings" 클릭

3. **Developer settings**
   - 좌측 하단 "Developer settings" 클릭

4. **Personal access tokens**
   - "Personal access tokens" → "Tokens (classic)" 클릭

5. **토큰 생성**
   - "Generate new token (classic)" 클릭
   - Note: `exam-report` (설명)
   - Expiration: 원하는 기간 선택
   - **권한 체크**: ✅ `repo` (전체 저장소 접근)
   - "Generate token" 클릭

6. **토큰 복사**
   - **중요**: 토큰은 한 번만 표시됩니다!
   - 복사해서 안전한 곳에 보관

7. **사용 방법**
   - `git push` 실행 시:
     - Username: `Kingmangdo`
     - Password: **복사한 토큰 붙여넣기** (일반 비밀번호 아님!)

---

## 💡 대안: GitHub Desktop 사용

명령어가 어렵다면 **GitHub Desktop**을 사용하세요:

### 설치
1. https://desktop.github.com/ 접속
2. "Download for Windows" 클릭
3. 설치 파일 실행

### 사용법
1. **GitHub Desktop 실행**
2. **GitHub 계정 로그인**
3. **저장소 추가**
   - File → Add Local Repository
   - 프로젝트 폴더 선택: `C:\Users\HP\Desktop\DK_English\exam-report`
4. **커밋 및 푸시**
   - 왼쪽에서 변경된 파일 확인
   - 하단에 커밋 메시지 입력
   - "Commit to main" 클릭
   - "Publish repository" 또는 "Push origin" 클릭

**장점:**
- ✅ GUI로 쉽게 사용
- ✅ 자동 인증
- ✅ 변경 이력 시각화
- ✅ 충돌 해결 도구

---

## 🆘 문제 해결

### "git: command not found" 오류
- Git 설치 후 **터미널을 완전히 종료하고 다시 열기**
- Cursor IDE 재시작

### PATH 문제
- Git 설치 시 "Add Git to PATH" 옵션 확인
- 또는 수동으로 PATH에 Git 추가:
  - 일반적으로: `C:\Program Files\Git\cmd`

### 인증 오류
- Personal Access Token 사용 확인
- 일반 비밀번호가 아닌 토큰 사용

---

## ✅ 체크리스트

- [ ] Git 다운로드
- [ ] Git 설치 (PATH 옵션 체크)
- [ ] 터미널 재시작
- [ ] `git --version` 확인
- [ ] Personal Access Token 생성
- [ ] `git init`, `git add .`, `git commit` 실행
- [ ] `git push` 실행

---

**설치 완료 후 알려주시면 다음 단계를 안내해드리겠습니다!**
