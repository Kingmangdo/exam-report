# API 문서

독강영어학원 성적표 시스템 API 문서입니다.

## 기본 정보

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`

## API 엔드포인트

### 1. 학생 관리 API

#### GET /api/students
모든 학생 조회 (필터링 가능)

**Query Parameters:**
- `class_name` (optional): 반 이름
- `grade` (optional): 학년
- `search` (optional): 이름 또는 학부모 이름 검색

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "홍길동",
      "grade": "1",
      "class_name": "A반",
      "phone": "01012345678",
      "parent_name": "홍부모",
      "parent_phone": "01087654321",
      "created_at": "2024-01-01 00:00:00",
      "updated_at": "2024-01-01 00:00:00"
    }
  ],
  "count": 1
}
```

#### GET /api/students/:id
학생 ID로 조회

#### POST /api/students
학생 등록

**Request Body:**
```json
{
  "name": "홍길동",
  "grade": "1",
  "class_name": "A반",
  "phone": "01012345678",
  "parent_name": "홍부모",
  "parent_phone": "01087654321"
}
```

#### PUT /api/students/:id
학생 수정

#### DELETE /api/students/:id
학생 삭제

---

### 2. 성적 관리 API

#### GET /api/scores
모든 성적 조회 (필터링 가능)

**Query Parameters:**
- `student_id` (optional): 학생 ID
- `exam_date` (optional): 시험일자 (yy-mm-dd)
- `class_name` (optional): 반 이름
- `start_date` (optional): 시작일자
- `end_date` (optional): 종료일자

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "student_name": "홍길동",
      "exam_date": "24-01-15",
      "rt_total": 100,
      "rt_correct": 85,
      "rt_score": 85.0,
      "word_total": 100,
      "word_correct": 80,
      "word_score": 80.0,
      "assignment_score": 90.0,
      "attitude_score": 95.0,
      "total_score": 350.0,
      "average_score": 87.5,
      "class_average": 85.0,
      "comment": "좋은 성적입니다.",
      "created_at": "2024-01-15 00:00:00",
      "updated_at": "2024-01-15 00:00:00"
    }
  ],
  "count": 1
}
```

#### POST /api/scores
성적 등록

**Request Body:**
```json
{
  "student_id": 1,
  "exam_date": "24-01-15",
  "rt_total": 100,
  "rt_correct": 85,
  "word_total": 100,
  "word_correct": 80,
  "assignment_score": 90,
  "attitude_score": 95,
  "comment": "좋은 성적입니다."
}
```

**Note**: 같은 날짜 같은 학생이 이미 있으면 자동으로 업데이트됩니다.

#### PUT /api/scores/:id
성적 수정

#### DELETE /api/scores/:id
성적 삭제

---

### 3. 통계 API

#### GET /api/statistics/overall
전체 통계 (대시보드용)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_students": 150,
    "total_scores": 500,
    "today_scores": 50,
    "recent_scores": 350,
    "today_sends": 45
  }
}
```

#### GET /api/statistics/student/:studentId
학생별 통계

**Query Parameters:**
- `start_date` (optional): 시작일자
- `end_date` (optional): 종료일자

#### GET /api/statistics/class/:classId
반별 통계

**Query Parameters:**
- `exam_date` (optional): 시험일자

---

### 4. 비교 API

#### GET /api/compare/class-average/:classId
반 평균 계산

**Query Parameters:**
- `exam_date` (required): 시험일자

#### GET /api/compare/previous/:studentId
이전 성적과 비교

**Query Parameters:**
- `exam_date` (required): 시험일자

**Response:**
```json
{
  "success": true,
  "data": {
    "current": { ... },
    "previous": { ... },
    "comparison": {
      "has_previous": true,
      "average_diff": 2.5,
      "total_diff": 10.0,
      "trend": "up",
      "rt_diff": 5.0,
      "word_diff": -2.0,
      "assignment_diff": 3.0,
      "attitude_diff": 4.0
    }
  }
}
```

---

### 5. 설정 API

#### GET /api/settings/comment
종합 문구 조회

#### POST /api/settings/comment
종합 문구 저장/수정

**Request Body:**
```json
{
  "value": "이번 달도 열심히 노력해주세요!"
}
```

#### GET /api/settings
모든 설정 조회

#### GET /api/settings/:key
설정 조회 (키로)

#### POST /api/settings/:key
설정 저장/수정 (키로)

---

### 6. 성적표 API

#### POST /api/reports/generate
성적표 링크 생성

**Request Body:**
```json
{
  "score_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "성적표 링크가 생성되었습니다.",
  "data": {
    "token": "abc123...",
    "url": "/report/abc123...",
    "expires_at": "2024-01-22T00:00:00.000Z"
  }
}
```

#### GET /api/reports/check/:token
링크 상태 확인

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "abc123...",
    "student_name": "홍길동",
    "expires_at": "2024-01-22T00:00:00.000Z",
    "is_expired": false,
    "accessed_at": "2024-01-15T10:00:00.000Z"
  }
}
```

#### POST /api/reports/verify/:token
성적표 접근 인증

**Request Body:**
```json
{
  "student_name": "홍길동",
  "phone_last4": "4321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "인증이 완료되었습니다.",
  "data": {
    "score_id": 1,
    "verified": true
  }
}
```

#### GET /api/reports/:token
성적표 데이터 조회 (인증 필요)

**Query Parameters:**
- `student_name` (required): 학생 이름
- `phone_last4` (required): 핸드폰 뒷4자리

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 1,
      "name": "홍길동",
      "grade": "1",
      "class_name": "A반"
    },
    "score": {
      "id": 1,
      "exam_date": "24-01-15",
      "rt": {
        "total": 100,
        "correct": 85,
        "score": 85.0
      },
      "word": {
        "total": 100,
        "correct": 80,
        "score": 80.0,
        "retest": false
      },
      "assignment": 90.0,
      "attitude": 95.0,
      "total": 350.0,
      "average": 87.5,
      "class_average": 85.0,
      "comment": "좋은 성적입니다."
    },
    "previous": {
      "exam_date": "24-01-08",
      "average": 85.0,
      "total": 340.0
    },
    "comparison": {
      "average_diff": 2.5,
      "total_diff": 10.0,
      "trend": "up"
    },
    "general_comment": "이번 달도 열심히 노력해주세요!"
  }
}
```

#### GET /api/reports/preview/:scoreId
성적표 미리보기 (관리자용, 인증 없이)

---

### 7. Health Check

#### GET /api/health
서버 상태 확인

**Response:**
```json
{
  "status": "ok",
  "message": "독강영어학원 성적표 시스템 API 서버가 정상 작동 중입니다.",
  "timestamp": "2024-01-15T00:00:00.000Z"
}
```

---

## 에러 응답 형식

```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 정보"
}
```

## 상태 코드

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 오류

---

**작성일**: 2026년 1월
**버전**: 1.0.0
