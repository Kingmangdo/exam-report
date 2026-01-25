# Visual Studio Build Tools 인식 문제 해결

## 🔍 문제 상황

Visual Studio Build Tools가 설치되어 있지만 `node-gyp`가 인식하지 못하는 경우:

```
gyp ERR! find VS unknown version "undefined" found at "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools"
```

## ✅ 해결 방법

### 방법 1: 개선된 설치 스크립트 사용 (권장)

```powershell
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
.\install-backend.ps1
```

이 스크립트는:
- Visual Studio Build Tools 경로를 자동으로 찾습니다
- 필요한 환경 변수를 설정합니다
- npm config를 올바르게 구성합니다

---

### 방법 2: 수동 설정

터미널에서 다음 명령어를 실행:

```powershell
cd C:\Users\HP\Desktop\DK_English\exam-report\backend

# Python 경로 설정
$env:PYTHON = "C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe"

# Visual Studio 버전 명시
$env:GYP_MSVS_VERSION = "2022"
npm.cmd config set msvs_version 2022
npm.cmd config set python "$env:PYTHON"

# Visual Studio 경로 설정 (경로가 다른 경우 수정)
$vsPath = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools"
if (Test-Path $vsPath) {
    $env:VCINSTALLDIR = "$vsPath\VC"
}

# 설치
npm.cmd install
```

---

### 방법 3: Visual Studio Developer Command Prompt 사용

1. **시작 메뉴**에서 "Developer Command Prompt for VS 2022" 검색
2. 해당 터미널에서:
   ```powershell
   cd C:\Users\HP\Desktop\DK_English\exam-report\backend
   $env:PYTHON = "C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe"
   npm.cmd install
   ```

---

## 🔧 Visual Studio Build Tools 재설치 (필요한 경우)

만약 위 방법들이 작동하지 않으면:

1. **Visual Studio Installer** 실행
2. **수정** 클릭
3. **"C++ build tools"** 워크로드 확인
4. **"Windows 10 SDK"** (또는 최신 버전) 확인
5. **수정** 클릭하여 재설치

---

## 📝 확인 사항

설치 후 다음 명령어로 확인:

```powershell
# npm config 확인
npm.cmd config get msvs_version
npm.cmd config get python

# Visual Studio 경로 확인
& "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" -latest
```

---

## 🚀 빠른 해결

**지금 바로 시도:**

```powershell
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
.\install-backend.ps1
```
