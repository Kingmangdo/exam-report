# Visual Studio Build Tools 설치 가이드

## 🎯 왜 필요한가요?

`better-sqlite3`는 네이티브 모듈이라 C++ 컴파일러가 필요합니다.  
Node.js 24.13.0은 최신 버전이라 사전 컴파일된 바이너리가 없어서 직접 컴파일해야 합니다.

---

## 📥 설치 방법 (3단계)

### 1단계: 다운로드

1. 브라우저에서 다음 링크 열기:
   ```
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   ```

2. **"Build Tools for Visual Studio 2022"** 다운로드 클릭
   - 파일명: `vs_buildtools.exe` (약 1.3MB)

### 2단계: 설치

1. 다운로드한 `vs_buildtools.exe` 실행
2. 설치 화면에서:
   - ✅ **"C++ build tools"** 워크로드 체크
   - ✅ **"Windows 10 SDK"** (또는 최신 버전) 체크
   - 나머지는 기본값 유지
3. **"설치"** 클릭
   - 설치 시간: 약 10-20분
   - 다운로드 크기: 약 3-5GB

### 3단계: 설치 확인 및 재시도

1. **터미널 완전히 종료 후 다시 열기** (중요!)
2. 프로젝트 디렉토리로 이동:
   ```powershell
   cd C:\Users\HP\Desktop\DK_English\exam-report\backend
   ```
3. Python 경로 설정 후 설치:
   ```powershell
   $env:PYTHON = "C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe"
   npm.cmd install
   ```

---

## ⚡ 빠른 설치 스크립트

아래 명령어를 **관리자 권한 PowerShell**에서 실행:

```powershell
# 1. Chocolatey 설치 (없는 경우)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. Visual Studio Build Tools 설치
choco install visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended" -y
```

**또는** 수동으로 위의 1-3단계를 따라하세요.

---

## ✅ 설치 확인

설치가 완료되면 다음 명령어로 확인:

```powershell
npm.cmd config get msvs_version
```

또는:

```powershell
& "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe" -latest
```

---

## 🚨 문제 해결

### "Visual Studio를 찾을 수 없습니다" 오류
- 터미널을 완전히 종료하고 다시 열어보세요
- 컴퓨터를 재시작해보세요

### 설치가 너무 오래 걸려요
- 인터넷 연결을 확인하세요
- 방화벽/보안 프로그램이 차단하지 않는지 확인하세요

### 다른 방법이 있나요?
- **대안 1**: Node.js 버전을 낮추기 (예: 20.x LTS)
- **대안 2**: 다른 데이터베이스 사용 (PostgreSQL, MySQL)
- **대안 3**: Railway 배포 시 자동으로 빌드됨 (로컬 개발만 문제)

---

## 📝 다음 단계

Visual Studio Build Tools 설치 후:
1. 터미널 재시작
2. `install-all.ps1` 스크립트 실행 또는
3. 수동으로 `cd backend` → `npm.cmd install`
