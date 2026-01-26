# 데이터베이스 폴더

이 폴더는 SQLite 데이터베이스 파일(`exam_report.db`)을 저장합니다.

## 데이터베이스 초기화

백엔드 폴더에서 다음 명령어를 실행하세요:

```bash
node utils/db-init.js
```

또는 서버를 처음 실행하면 자동으로 초기화됩니다.

## 데이터베이스 구조

- **students**: 학생 정보
- **scores**: 성적 데이터
- **kakao_send_history**: 카카오톡 발송 이력
- **report_access**: 성적표 접근 이력
- **settings**: 시스템 설정 (종합 문구 등)
