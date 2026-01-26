# Cursor에서 직접 설치하는 방법

Cursor IDE에서 필요한 패키지와 도구를 직접 설치하는 방법입니다.

## 🚀 Cursor 터미널 사용

### 1. Cursor 내장 터미널 열기
- `Ctrl + `` (백틱) 또는
- 상단 메뉴: Terminal → New Terminal

### 2. 패키지 설치 명령어 실행

**백엔드 설치:**
```bash
cd backend
npm install
```

**프론트엔드 설치:**
```bash
cd frontend
npm install
```

## 🔧 Cursor에서 자동 설치 스크립트 실행

### 방법 1: 설치 스크립트 생성 및 실행

Cursor에서 다음 파일을 생성하고 실행할 수 있습니다:

**`install-all.ps1`** (PowerShell 스크립트):
```powershell
# 백엔드 설치
Write-Host "백엔드 패키지 설치 중..." -ForegroundColor Green
cd backend
npm.cmd install
cd ..

# 프론트엔드 설치
Write-Host "프론트엔드 패키지 설치 중..." -ForegroundColor Green
cd frontend
npm.cmd install
cd ..

Write-Host "설치 완료!" -ForegroundColor Green
```

**실행 방법:**
```powershell
.\install-all.ps1
```

### 방법 2: Cursor AI에게 직접 요청

Cursor 채팅에서:
```
"backend 폴더에서 npm install을 실행해줘"
또는
"프로젝트의 모든 패키지를 설치해줘"
```

## 📦 필요한 도구 자동 설치

### Node.js 확인 및 설치 안내
Cursor 터미널에서:
```bash
node --version
```

없으면 Cursor가 설치 링크를 제공할 수 있습니다.

### Python 확인
```bash
python --version
```

### Visual Studio Build Tools
Cursor에서 직접 설치할 수는 없지만, 다운로드 링크를 열어드릴 수 있습니다.

## 🎯 추천 방법

1. **Cursor 터미널 사용** (가장 간단)
   - Cursor 내장 터미널에서 직접 명령어 실행

2. **Cursor AI 요청**
   - 채팅에서 "npm install 실행해줘" 요청

3. **스크립트 파일 생성**
   - 위의 `install-all.ps1` 파일 생성 후 실행

---

**참고**: Cursor는 VS Code 기반이므로 VS Code의 모든 터미널 기능을 사용할 수 있습니다.
