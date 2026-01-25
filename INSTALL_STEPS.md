# 설치 단계별 가이드

## ✅ Python 설치 완료 확인
Python 3.14.2가 정상적으로 설치되었습니다.

## 📦 백엔드 패키지 설치

### 방법 1: Python 경로 명시 (권장)

터미널에서 다음 명령어를 실행하세요:

```bash
cd backend
set PYTHON=C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe
npm.cmd install
```

### 방법 2: npm config로 Python 경로 설정

```bash
cd backend
npm.cmd config set python C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe
npm.cmd install
```

### 방법 3: 환경 변수로 설정 (영구적)

PowerShell에서 (관리자 권한):

```powershell
[System.Environment]::SetEnvironmentVariable('PYTHON', 'C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe', 'User')
```

터미널을 다시 열고:
```bash
cd backend
npm.cmd install
```

---

## 🎯 빠른 실행 (복사해서 사용)

**백엔드 설치:**
```bash
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
set PYTHON=C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe
npm.cmd install
```

**프론트엔드 설치:**
```bash
cd C:\Users\HP\Desktop\DK_English\exam-report\frontend
npm.cmd install
```

---

## ⚠️ 문제 해결

만약 위 방법들이 작동하지 않으면:
1. 터미널을 완전히 종료하고 다시 열기
2. Python이 PATH에 있는지 확인: `python --version`
3. Python 경로 확인: `where python`
