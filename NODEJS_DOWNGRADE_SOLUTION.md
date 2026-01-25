# Node.js 다운그레이드로 해결하기 (가장 확실한 방법)

## 🔍 문제 원인

- Visual Studio 2026 (버전 18)이 설치되어 있음
- `node-gyp`가 Visual Studio 2026을 인식하지 못함
- Node.js 24.13.0은 최신 버전이라 사전 컴파일된 바이너리가 없음

## ✅ 해결 방법: Node.js 20.x LTS로 다운그레이드

### 장점
- ✅ 즉시 작동 (사전 컴파일된 바이너리 사용)
- ✅ 안정적인 LTS 버전
- ✅ Visual Studio 버전 문제 해결 불필요

### 단점
- ⚠️ 다른 프로젝트에 영향 가능 (하지만 LTS라서 대부분 호환)

---

## 🚀 설치 단계

### 1단계: Node.js 20.x LTS 다운로드

1. 브라우저에서 다음 링크 열기:
   ```
   https://nodejs.org/
   ```

2. **"LTS" 버전** 다운로드 (현재 20.x.x)
   - Windows Installer (.msi) 선택
   - 64-bit 버전 권장

### 2단계: 설치

1. 다운로드한 `.msi` 파일 실행
2. 설치 마법사 따라하기
   - ✅ "Automatically install the necessary tools" 체크 (선택사항)
   - 기존 Node.js 덮어쓰기
3. 설치 완료

### 3단계: 터미널 재시작

1. **모든 터미널 창 완전히 종료**
2. 새로운 터미널 열기 (PowerShell 또는 CMD)

### 4단계: 버전 확인

```cmd
node --version
```

출력: `v20.x.x` (예: v20.11.0)

### 5단계: 백엔드 패키지 설치

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
npm.cmd install
```

이제 `better-sqlite3`가 사전 컴파일된 바이너리를 사용하여 설치됩니다!

---

## 📝 전체 과정 요약

1. Node.js 20.x LTS 다운로드 및 설치
2. 터미널 재시작
3. `cd backend` → `npm.cmd install`
4. 완료! ✅

---

## 🎯 대안: .npmrc 파일 삭제 후 재시도

만약 Node.js 다운그레이드를 원하지 않는다면:

1. `.npmrc` 파일 삭제:
   ```cmd
   del C:\Users\HP\Desktop\DK_English\exam-report\backend\.npmrc
   ```

2. Visual Studio Installer에서 "C++ build tools" 워크로드 재설치

3. 컴퓨터 재시작 후 재시도

하지만 **Node.js 다운그레이드가 가장 확실하고 빠른 방법**입니다.

---

## 💡 참고

- Node.js 20.x LTS는 2026년 4월까지 지원됩니다
- 대부분의 프로젝트와 호환됩니다
- Visual Studio 버전 문제를 완전히 우회할 수 있습니다
