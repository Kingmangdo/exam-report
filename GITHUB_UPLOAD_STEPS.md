# GitHub 업로드 단계별 가이드

## ✅ Git 설치 확인 완료
- Git 버전: 2.52.0.windows.1
- CMD에서 정상 작동 확인

---

## 🚀 GitHub 업로드 단계

### 1단계: CMD 창에서 프로젝트 폴더로 이동

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report
```

---

### 2단계: Git 저장소 초기화 (처음 한 번만)

```cmd
git init
```

**결과:**
```
Initialized empty Git repository in C:\Users\HP\Desktop\DK_English\exam-report\.git\
```

---

### 3단계: 모든 파일 추가

```cmd
git add .
```

**확인:**
```cmd
git status
```
- 초록색으로 표시된 파일들이 추가된 것입니다

---

### 4단계: 첫 커밋 생성

```cmd
git commit -m "Initial commit: 독강영어학원 성적표 시스템"
```

**결과:**
```
[main (root-commit) xxxxxxx] Initial commit: 독강영어학원 성적표 시스템
 X files changed, Y insertions(+)
```

---

### 5단계: 원격 저장소 연결

```cmd
git remote add origin https://github.com/Kingmangdo/exam-report.git
```

**확인:**
```cmd
git remote -v
```

**결과:**
```
origin  https://github.com/Kingmangdo/exam-report.git (fetch)
origin  https://github.com/Kingmangdo/exam-report.git (push)
```

---

### 6단계: 브랜치를 main으로 설정

```cmd
git branch -M main
```

---

### 7단계: GitHub에 푸시

```cmd
git push -u origin main
```

**인증 요청:**
- Username: `Kingmangdo`
- Password: **Personal Access Token** (일반 비밀번호 아님!)

---

## 🔐 Personal Access Token 생성 (필수)

`git push` 시 토큰이 필요합니다:

1. **GitHub 접속**
   - https://github.com → 로그인

2. **Settings → Developer settings**
   - 우측 상단 프로필 → Settings
   - 좌측 하단 "Developer settings" 클릭

3. **Personal access tokens → Tokens (classic)**
   - "Generate new token (classic)" 클릭

4. **토큰 설정**
   - Note: `exam-report`
   - Expiration: 원하는 기간 (예: 90 days)
   - **권한 체크**: ✅ `repo` (전체 저장소 접근)

5. **토큰 생성 및 복사**
   - "Generate token" 클릭
   - **중요**: 토큰을 복사하세요 (한 번만 표시됨!)

6. **사용**
   - `git push` 실행 시
   - Password 입력란에 **토큰 붙여넣기**

---

## 📋 전체 명령어 (한 번에 복사)

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report
git init
git add .
git commit -m "Initial commit: 독강영어학원 성적표 시스템"
git remote add origin https://github.com/Kingmangdo/exam-report.git
git branch -M main
git push -u origin main
```

---

## ✅ 업로드 확인

푸시가 성공하면:
- https://github.com/Kingmangdo/exam-report 에서 파일 확인

**성공 메시지:**
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), done.
To https://github.com/Kingmangdo/exam-report.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🆘 문제 해결

### "fatal: not a git repository"
→ `git init` 먼저 실행

### "error: remote origin already exists"
→ 이미 연결되어 있음. 다음 명령어로 확인:
```cmd
git remote -v
```

### "error: failed to push"
→ Personal Access Token 확인
→ 네트워크 연결 확인

### "error: src refspec main does not match any"
→ 커밋이 없음. `git add .` → `git commit` 먼저 실행

---

## 💡 다음 단계

업로드 완료 후:
1. GitHub에서 파일 확인
2. 내일 사무실 노트북에서 `git clone`으로 다운로드
3. 일상적인 작업: `git pull` → 작업 → `git push`

---

**CMD 창에서 위 명령어들을 순서대로 실행하세요!**
