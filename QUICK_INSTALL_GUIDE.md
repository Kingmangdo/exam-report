# 빠른 설치 가이드 - Node.js 다운그레이드

## 🎯 현재 문제

Node.js 24.13.0은 최신 버전이라 `better-sqlite3`의 사전 컴파일된 바이너리가 없습니다.
Visual Studio 2026도 `node-gyp`가 인식하지 못합니다.

## ✅ 해결: Node.js 20.x LTS 설치

### 1단계: 다운로드 (2분)

1. 브라우저에서 열기: **https://nodejs.org/**
2. **"20.x.x LTS"** 버전 클릭 (초록색 버튼)
3. **Windows Installer (.msi)** 다운로드

### 2단계: 설치 (1분)

1. 다운로드한 `.msi` 파일 더블클릭
2. "Next" → "Next" → "Install" 클릭
3. 설치 완료 후 "Finish" 클릭

### 3단계: 터미널 재시작 (중요!)

1. **모든 터미널 창 완전히 종료**
   - PowerShell, CMD, Cursor 터미널 모두 종료
2. Cursor 다시 열기
3. 새 터미널 열기

### 4단계: 버전 확인

```cmd
node --version
```

**출력이 `v20.x.x`여야 합니다!**

만약 여전히 `v24.13.0`이 나오면:
- 컴퓨터 재시작
- 또는 PATH 환경 변수 확인

### 5단계: 패키지 설치

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
npm.cmd install
```

이제 성공할 것입니다! ✅

---

## 📋 체크리스트

- [ ] Node.js 20.x LTS 다운로드 완료
- [ ] 설치 완료
- [ ] 모든 터미널 종료
- [ ] 새 터미널에서 `node --version` → `v20.x.x` 확인
- [ ] `npm.cmd install` 실행
- [ ] 설치 성공! 🎉

---

## 💡 왜 이 방법인가?

- ✅ **즉시 작동**: 사전 컴파일된 바이너리 사용
- ✅ **안정적**: LTS 버전 (2026년 4월까지 지원)
- ✅ **Visual Studio 문제 우회**: 컴파일 불필요
- ✅ **대부분의 프로젝트 호환**: LTS라서 안전

---

## 🚨 여전히 v24.13.0이 나오면?

1. **컴퓨터 재시작** (가장 확실)
2. 또는 환경 변수 확인:
   ```cmd
   where node
   ```
   첫 번째 경로가 `C:\Program Files\nodejs\`여야 합니다.
