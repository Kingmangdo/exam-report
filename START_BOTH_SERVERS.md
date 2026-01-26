# 두 서버 실행 가이드

## 🎯 현재 상태

- ✅ 백엔드: `http://localhost:5000` 실행 중
- ❌ 프론트엔드: 실행 필요

---

## 🚀 프론트엔드 실행하기

### 새 터미널 열기

1. Cursor에서 **새 터미널** 열기 (Ctrl + ` 또는 터미널 메뉴)
2. 다음 명령어 실행:

```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\frontend
npm.cmd run dev
```

### 예상 출력

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

## 🌐 접속 주소

프론트엔드 실행 후:

**브라우저에서 열기:**
```
http://localhost:3000
```

---

## 📋 전체 실행 순서

### 터미널 1: 백엔드 (이미 실행 중)
```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\backend
npm.cmd run dev
```

### 터미널 2: 프론트엔드 (지금 실행)
```cmd
cd C:\Users\HP\Desktop\DK_English\exam-report\frontend
npm.cmd run dev
```

---

## ✅ 확인 사항

1. **백엔드 확인**: 
   - 브라우저에서 `http://localhost:5000/api/health` 열기
   - JSON 응답이 나오면 정상

2. **프론트엔드 확인**:
   - 브라우저에서 `http://localhost:3000` 열기
   - 대시보드가 보이면 정상

---

## 🛑 서버 종료

각 터미널에서 `Ctrl + C`를 눌러 서버를 종료할 수 있습니다.

---

## 💡 문제 해결

### 프론트엔드가 시작되지 않으면

1. 포트 3000이 사용 중인지 확인
2. `node_modules` 폴더 확인
3. 캐시 삭제 후 재시도:
   ```cmd
   npm.cmd run dev -- --force
   ```

### API 요청이 실패하면

1. 백엔드 서버가 실행 중인지 확인
2. 브라우저 콘솔에서 에러 확인 (F12)
3. 네트워크 탭에서 요청 상태 확인
