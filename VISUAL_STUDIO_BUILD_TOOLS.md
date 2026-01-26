# Visual Studio Build Tools 설치 가이드

## 문제
`better-sqlite3` 패키지 설치 시 Visual Studio Build Tools가 필요합니다.

## 해결 방법

### 방법 1: Visual Studio Build Tools 설치 (권장)

1. **다운로드**
   - https://visualstudio.microsoft.com/downloads/
   - "Build Tools for Visual Studio" 다운로드

2. **설치**
   - 다운로드한 파일 실행
   - "C++ build tools" 워크로드 선택
   - "Desktop development with C++" 체크
   - 설치 진행 (시간이 좀 걸립니다)

3. **재설치**
   ```bash
   cd backend
   npm.cmd install
   ```

### 방법 2: Windows Build Tools (더 가벼움)

관리자 권한 PowerShell에서:

```powershell
npm install --global windows-build-tools
```

또는:

```powershell
npm install --global @microsoft/node-gyp
```

### 방법 3: 미리 컴파일된 바이너리 사용 (임시)

```bash
cd backend
npm.cmd install better-sqlite3 --build-from-source=false
```

---

## 빠른 해결 (권장 순서)

1. Visual Studio Build Tools 설치 (약 3-5GB, 10-20분 소요)
2. 터미널 재시작
3. `npm.cmd install` 재실행

---

## 참고

- Visual Studio Build Tools는 한 번만 설치하면 됩니다.
- 다른 네이티브 모듈 설치 시에도 재사용됩니다.
