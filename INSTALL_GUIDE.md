# 설치 가이드 - better-sqlite3 문제 해결

## 문제
`better-sqlite3` 패키지 설치 시 Python이 필요합니다.

## 해결 방법

### 방법 1: Python 설치 (권장)

1. **Python 다운로드**
   - https://www.python.org/downloads/ 접속
   - Python 3.11 이상 다운로드

2. **설치 시 주의사항**
   - ✅ **"Add Python to PATH" 체크박스를 반드시 선택하세요!**
   - Customize installation 선택
   - "Add Python to environment variables" 체크

3. **설치 확인**
   ```bash
   python --version
   ```

4. **재설치**
   ```bash
   cd backend
   npm.cmd install
   ```

### 방법 2: Windows Build Tools 설치

관리자 권한으로 PowerShell을 열고:

```powershell
npm.cmd install --global windows-build-tools
```

### 방법 3: 미리 컴파일된 바이너리 사용 (임시 해결)

```bash
cd backend
npm.cmd install --build-from-source=false
```

또는 환경 변수 설정:
```bash
set npm_config_build_from_source=false
npm.cmd install
```

---

## 참고사항

- Python 설치 후 **터미널을 완전히 종료하고 다시 열어야** PATH가 적용됩니다.
- Python이 설치되어 있어도 PATH에 없으면 위의 에러가 발생할 수 있습니다.
