# Visual Studio Developer Command Prompt에서 설치하기

## ✅ 현재 상태

Visual Studio 2026 Developer Command Prompt가 실행되었습니다!
이 터미널에서는 Visual Studio의 환경 변수가 자동으로 설정되어 있어서
`better-sqlite3` 설치가 성공할 가능성이 높습니다.

---

## 🚀 설치 단계

### 1단계: 프로젝트 디렉토리로 이동

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
```

### 2단계: Python 경로 설정 (필요한 경우)

```cmd
set PYTHON=C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe
```

### 3단계: 패키지 설치

```cmd
npm.cmd install
```

---

## 📝 전체 명령어 (한 번에 복사)

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
set PYTHON=C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe
npm.cmd install
```

---

## ✅ 성공 확인

설치가 완료되면:
- `node_modules` 폴더가 생성됩니다
- 에러 메시지 없이 완료됩니다

그 다음:
```cmd
npm.cmd run dev
```
로 서버를 실행할 수 있습니다!

---

## 🎯 팁

- 이 Developer Command Prompt는 Visual Studio의 환경 변수를 자동으로 설정합니다
- 일반 PowerShell보다 `better-sqlite3` 같은 네이티브 모듈 설치에 유리합니다
- 앞으로도 네이티브 모듈 설치 시 이 터미널을 사용하세요
