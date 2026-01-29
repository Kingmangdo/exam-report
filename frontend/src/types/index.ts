// 학생 타입
export interface Student {
  id: number;
  name: string;
  grade?: string;
  school?: string;
  teacher_name?: string;
  class_name?: string;
  monthly_tuition?: number;
  phone?: string;
  parent_name?: string;
  parent_phone: string;
  created_at?: string;
  updated_at?: string;
}

// 성적 타입
export interface Score {
  id: number;
  student_id: number;
  student_name?: string;
  exam_date: string;
  class_name?: string;
  rt_total?: number;
  rt_correct?: number;
  rt_score?: number;
  word_total?: number;
  word_correct?: number;
  word_score?: number;
  assignment_score: number;
  attitude_score: number;
  total_score?: number;
  average_score?: number;
  class_average?: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

// 통계 타입
export interface Statistics {
  total_students: number;
  total_scores: number;
  today_scores: number;
  recent_scores: number;
  today_sends: number;
}

// 성적표 타입
export interface ReportData {
  student: {
    id: number;
    name: string;
    grade?: string;
    class_name?: string;
  };
  score: {
    id: number;
    exam_date: string;
    rt: {
      total: number;
      correct: number;
      score: number;
    };
    word: {
      total: number;
      correct: number;
      score: number;
      retest: boolean;
    };
    assignment: number;
    attitude: number;
    total: number;
    average: number;
    class_average: number;
    comment?: string;
  };
  previous?: {
    exam_date: string;
    average: number;
    total: number;
  };
  comparison?: {
    average_diff: number;
    total_diff: number;
    trend: 'up' | 'down' | 'stable';
  };
  recent_scores?: Array<{
    id: number;
    exam_date: string;
    rt_score: number;
    word_score: number;
    assignment_score: number;
    attitude_score: number;
    total_score: number;
    average_score: number;
    class_average: number;
  }>;
  general_comment?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}
