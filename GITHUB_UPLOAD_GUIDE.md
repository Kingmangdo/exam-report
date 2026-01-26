# GitHub 업로드 가이드

프로젝트를 GitHub에 올려서 다른 노트북에서도 작업할 수 있도록 설정하는 방법입니다.

## 1단계: Git 설치

1. **Git 다운로드**
   - https://git-scm.com/download/win
   - Windows용 Git 다운로드

2. **설치**
   - 다운로드한 파일 실행
   - 기본 설정으로 설치 진행
   - 설치 중 "Git from the command line and also from 3rd-party software" 선택

3. **설치 확인**
   - 터미널을 완전히 종료하고 다시 열기
   ```bash
   git --version
   ```

## 2단계: GitHub 저장소 생성

1. **GitHub 로그인**
   - https://github.com 접속
   - 로그인 (계정이 없으면 회원가입)

2. **새 저장소 생성**
   - 우측 상단 "+" 버튼 클릭
   - "New repository" 선택
   - Repository name: `exam-report` (또는 원하는 이름)
   - Public 또는 Private 선택
   - "Initialize this repository with a README" 체크 해제
   - "Create repository" 클릭

## 3단계: 프로젝트 업로드

터미널에서 다음 명령어를 순서대로 실행:

```bash
# 1. 프로젝트 폴더로 이동
cd C:\Users\HP\Desktop\DK_English\exam-report

# 2. Git 초기화
git init

# 3. 모든 파일 추가
git add .

# 4. 첫 커밋
git commit -m "Initial commit: 독강영어학원 성적표 시스템"

# 5. GitHub 저장소 연결 (YOUR_USERNAME을 본인 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/exam-report.git

# 6. 메인 브랜치로 이름 변경
git branch -M main

# 7. GitHub에 업로드
git push -u origin main
```

## 4단계: 다른 노트북에서 가져오기

다른 노트북에서:

```bash
# 1. 프로젝트 클론
git clone https://github.com/YOUR_USERNAME/exam-report.git

# 2. 프로젝트 폴더로 이동
cd exam-report

# 3. 백엔드 패키지 설치
cd backend
npm.cmd install

# 4. 프론트엔드 패키지 설치
cd ../frontend
npm.cmd install
```

## ⚠️ 주의사항

### 업로드하지 말아야 할 파일들

다음 파일들은 `.gitignore`에 포함되어 있어 자동으로 제외됩니다:
- `node_modules/` (패키지 폴더)
- `.env` (환경 변수 파일)
- `database/*.db` (데이터베이스 파일)
- `dist/` (빌드 결과물)

### 환경 변수 파일 설정

다른 노트북에서 작업할 때:

1. `backend/.env.example` 파일을 참고하여
2. `backend/.env` 파일을 새로 생성하고
3. 필요한 환경 변수를 입력하세요

## 📝 Git 기본 명령어

```bash
# 변경사항 확인
git status

# 변경사항 추가
git add .

# 커밋
git commit -m "커밋 메시지"

# GitHub에 업로드
git push

# GitHub에서 최신 버전 가져오기
git pull
```

---

**참고**: 
- GitHub에 업로드하면 코드는 공개/비공개로 관리할 수 있습니다.
- 데이터베이스 파일은 업로드되지 않으므로, 다른 노트북에서 새로 생성됩니다.
- 환경 변수 파일도 업로드되지 않으므로, 각 노트북에서 별도로 설정해야 합니다.
