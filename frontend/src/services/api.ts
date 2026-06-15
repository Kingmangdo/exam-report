
import axios from 'axios';
import type { 
  Student, 
  Score, 
  Statistics, 
  ReportData,
  ApiResponse 
} from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ?��?�??�?� �?�?: �?컬 ?��?�리�??��?? ?�흰 �??��? ?��???�?�?
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ?��?�??�?� �?�?: 401 ?��?�(?�증 �?�?) �?리
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ?�증 API
export const authApi = {
  login: (credentials: any) => {
    return api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', credentials);
  },
  getMe: () => {
    return api.get<ApiResponse<any>>('/auth/me');
  },
  initAdmin: () => {
    return api.post<ApiResponse<any>>('/auth/init-admin');
  },
  getAllUsers: () => {
    return api.get<ApiResponse<any[]>>('/auth/users');
  },
  updateUser: (id: number, data: any) => {
    return api.put<ApiResponse<any>>(`/auth/users/${id}`, data);
  },
  deleteUser: (id: number) => {
    return api.delete<ApiResponse<void>>(`/auth/users/${id}`);
  }
};

// ??�?� �?�?API
export const studentApi = {
  getAll: (filters?: { class_name?: string; grade?: string; search?: string; status?: string }) => {
    return api.get<ApiResponse<Student[]>>('/students', { params: filters });
  },
  getById: (id: number) => {
    return api.get<ApiResponse<Student>>(`/students/${id}`);
  },
  create: (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<ApiResponse<Student>>('/students', data);
  },
  update: (id: number, data: Partial<Student>) => {
    return api.put<ApiResponse<Student>>(`/students/${id}`, data);
  },
  delete: (id: number) => {
    return api.delete<ApiResponse<void>>(`/students/${id}`);
  },
  updateClasses: (studentIds: number[], classNames: string[]) => {
    return api.post<ApiResponse<{ count: number }>>('/students/update-classes', {
      student_ids: studentIds,
      class_names: classNames
    });
  },
  // ?��?� �?리
  withdraw: (id: number, data: { withdraw_date: string; withdraw_reason?: string; withdraw_teacher?: string }) => {
    return api.post<ApiResponse<Student>>(`/students/${id}/withdraw`, data);
  },
  // ?��?��?복�?)
  reEnroll: (id: number) => {
    return api.post<ApiResponse<Student>>(`/students/${id}/re-enroll`);
  }
};

// ?��?� �?�?API
export const counselingApi = {
  getLogs: (studentId: number) => {
    return api.get<ApiResponse<any[]>>(`/counseling/student/${studentId}`);
  },
  createLog: (data: any) => {
    return api.post<ApiResponse<any>>('/counseling', data);
  },
  updateLog: (id: number, data: any) => {
    return api.put<ApiResponse<any>>(`/counseling/${id}`, data);
  },
  deleteLog: (id: number) => {
    return api.delete<ApiResponse<void>>(`/counseling/${id}`);
  }
};

// �?�?�?API
export const classApi = {
  getAll: () => {
    return api.get<ApiResponse<any[]>>('/classes');
  },
  getStudents: (className: string) => {
    return api.get<ApiResponse<any[]>>(`/classes/${className}/students`);
  },
  create: (data: any) => {
    return api.post<ApiResponse<any>>('/classes', data);
  },
  update: (id: number, data: any) => {
    return api.put<ApiResponse<any>>(`/classes/${id}`, data);
  },
  delete: (id: number) => {
    return api.delete<ApiResponse<void>>(`/classes/${id}`);
  },
  assignStudents: (studentIds: number[], classNames: string[]) => {
    return api.post<ApiResponse<void>>('/classes/assign-students', {
      student_ids: studentIds,
      class_names: classNames
    });
  },
  getLearningLog: (id: number, date: string) => {
    return api.get<ApiResponse<any>>(`/classes/${id}/learning-log`, { params: { date } });
  },
  saveLearningLog: (id: number, data: any) => {
    return api.post<ApiResponse<any>>(`/classes/${id}/learning-log`, data);
  },
  getAllLogs: (id: number) => {
    return api.get<ApiResponse<any[]>>(`/classes/${id}/learning-logs`);
  },
  getRecentLogDates: (id: number) => {
    return api.get<ApiResponse<string[]>>(`/classes/${id}/learning-log/recent-dates`);
  },
  getHomeworkDue: (date?: string) => {
    return api.get<ApiResponse<any[]>>('/classes/homework-due', { params: { date } });
  }
};

// 보�? �?�?API
export const supplementaryApi = {
  getSessions: (classId: number, startDate?: string, endDate?: string) => {
    return api.get<ApiResponse<any[]>>(`/supplementary/class/${classId}`, { params: { start_date: startDate, end_date: endDate } });
  },
  // 보�? ????보??�?�: 모�?� �?�? 보�? ?��? 조�??
  getDashboardSessions: (startDate?: string, endDate?: string) => {
    return api.get<ApiResponse<any[]>>('/supplementary/dashboard', {
      params: { start_date: startDate, end_date: endDate }
    });
  },
  createSession: (data: any) => {
    return api.post<ApiResponse<any>>('/supplementary', data);
  },
  updateSession: (id: number, data: any) => {
    return api.put<ApiResponse<any>>(`/supplementary/${id}`, data);
  },
  deleteSession: (id: number) => {
    return api.delete<ApiResponse<void>>(`/supplementary/${id}`);
  },
  addStudents: (sessionId: number, studentIds: number[]) => {
    return api.post<ApiResponse<any>>(`/supplementary/${sessionId}/students`, { student_ids: studentIds });
  },
  removeStudent: (sessionId: number, studentId: number) => {
    return api.delete<ApiResponse<void>>(`/supplementary/${sessionId}/students/${studentId}`);
  },
  getStudentHistory: (studentId: number, startDate?: string, endDate?: string) => {
    return api.get<ApiResponse<any[]>>(`/supplementary/student/${studentId}`, { params: { start_date: startDate, end_date: endDate } });
  },
  // 보�? �?결/결�?� ?��?� ??띰?��?�
  updateAttendance: (sessionId: number, studentId: number, data: { attendance_status: 'pending' | 'present' | 'absent'; absent_reason?: string }) => {
    return api.patch<ApiResponse<any>>(`/supplementary/${sessionId}/students/${studentId}/attendance`, data);
  }
};

// ?�취??�? API
export const bimonthlyApi = {
  getAll: (filters?: { class_name?: string; exam_date?: string; student_id?: number }) => {
    return api.get<ApiResponse<any[]>>('/bimonthly', { params: filters });
  },
  getById: (id: number) => {
    return api.get<ApiResponse<any>>(`/bimonthly/${id}`);
  },
  create: (data: any) => {
    return api.post<ApiResponse<any>>('/bimonthly', data);
  },
  delete: (id: number) => {
    return api.delete<ApiResponse<void>>(`/bimonthly/${id}`);
  },
  getClassAverage: (class_name: string, exam_date: string) => {
    return api.get<ApiResponse<any>>('/bimonthly/class-average', { params: { class_name, exam_date } });
  }
};

// AI �?�???API (�?컬 Ollama)
export const aiApi = {
  generateBimonthlyComment: (data: {
    student_name: string;
    class_name?: string;
    exam_date: string;
    average_score?: number;
    parts: Array<{ name: string; score: number; max_score: number }>;
    previous_comment?: string;
  }) => {
    return api.post<ApiResponse<{ comment: string }>>('/ai/generate-comment', data);
  }
};

// ?�젝 �?�?API
export const scoreApi = {
  getAll: (filters?: { 
    student_id?: number; 
    student_name?: string;
    exam_date?: string; 
    class_name?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    return api.get<ApiResponse<Score[]>>('/scores', { params: filters });
  },
  getById: (id: number) => {
    return api.get<ApiResponse<Score>>(`/scores/${id}`);
  },
  create: (data: Omit<Score, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<ApiResponse<Score>>('/scores', data);
  },
  update: (id: number, data: Partial<Score>) => {
    return api.put<ApiResponse<Score>>(`/scores/${id}`, data);
  },
  delete: (id: number) => {
    return api.delete<ApiResponse<void>>(`/scores/${id}`);
  },
  saveDraft: (data: { class_name: string; exam_date: string; draft_data: any; last_modified_by: string }) => {
    return api.post<ApiResponse<any>>('/scores/draft', data);
  },
  getDraft: (className: string, examDate: string) => {
    return api.get<ApiResponse<any>>(`/scores/draft/${encodeURIComponent(className)}/${examDate}`);
  },
  deleteDraft: (className: string, examDate: string) => {
    return api.delete<ApiResponse<any>>(`/scores/draft/${encodeURIComponent(className)}/${examDate}`);
  }
};

// ?��? API
export const statisticsApi = {
  getOverall: () => {
    return api.get<ApiResponse<Statistics>>('/statistics/overall');
  },
  getStudent: (studentId: number, startDate?: string, endDate?: string) => {
    return api.get<ApiResponse<any>>(`/statistics/student/${studentId}`, {
      params: { start_date: startDate, end_date: endDate }
    });
  },
  getClass: (classId: string, examDate?: string) => {
    return api.get<ApiResponse<any>>(`/statistics/class/${classId}`, {
      params: { exam_date: examDate }
    });
  }
};

// ?�젝??API
export const reportApi = {
  generateLink: (scoreId: number) => {
    return api.post<ApiResponse<{ token: string; url: string; expires_at: string }>>(
      '/reports/generate',
      { score_id: scoreId }
    );
  },
  checkLink: (token: string) => {
    return api.get<ApiResponse<any>>(`/reports/check/${token}`);
  },
  verifyAccess: (token: string, studentName: string, phoneLast4: string) => {
    return api.post<ApiResponse<{ score_id: number; verified: boolean }>>(
      `/reports/verify/${token}`,
      { student_name: studentName, phone_last4: phoneLast4 }
    );
  },
  getReport: (token: string, studentName: string, phoneLast4: string) => {
    return api.get<ApiResponse<ReportData>>(`/reports/${token}`, {
      params: { student_name: studentName, phone_last4: phoneLast4 }
    });
  },
  preview: (scoreId: number) => {
    return api.get<ApiResponse<ReportData>>(`/reports/preview/${scoreId}`);
  }
};

// ?��? API
export const settingsApi = {
  getComment: () => {
    return api.get<ApiResponse<{ key: string; value: string }>>('/settings/comment');
  },
  setComment: (value: string) => {
    return api.post<ApiResponse<{ key: string; value: string }>>('/settings/comment', { value });
  }
};

// Excel API
export const excelApi = {
  downloadTemplate: () => {
    return api.get('/excel/template', {
      responseType: 'blob'
    });
  },
  uploadStudents: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<{
      total: number;
      success: number;
      skipped: number;
      failed: number;
      details: {
        success: Array<{ id: number; name: string }>;
        skipped: Array<{ name: string; reason: string }>;
        failed: Array<{ name: string; reason: string }>;
      };
    }>>('/excel/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// 결�? �?�?API
export const paymentApi = {
  getAll: (filters?: any) => {
    return api.get<ApiResponse<any[]>>('/payments', { params: filters });
  },
  getStudentPayments: (studentId: number) => {
    return api.get<ApiResponse<any[]>>(`/payments/student/${studentId}`);
  },
  create: (data: any) => {
    return api.post<ApiResponse<any>>('/payments', data);
  },
  update: (id: number, data: any) => {
    return api.put<ApiResponse<any>>(`/payments/${id}`, data);
  },
  delete: (id: number) => {
    return api.delete<ApiResponse<void>>(`/payments/${id}`);
  }
};

// 카카????림??API
export const kakaoApi = {
  sendReport: (scoreId: number) => {
    return api.post<ApiResponse<any>>('/kakao/send-report', { score_id: scoreId });
  },
  // ?�취??�? ??림??
  sendBimonthlyReport: (bimonthlyScoreId: number) => {
    return api.post<ApiResponse<any>>('/kakao/send-bimonthly', { bimonthly_score_id: bimonthlyScoreId });
  },
  generateBimonthlyLink: (bimonthlyScoreId: number) => {
    return api.post<ApiResponse<{ token: string; url: string; expires_at: string }>>('/kakao/bimonthly-link', { bimonthly_score_id: bimonthlyScoreId });
  },
  previewBimonthlyReport: (scoreId: number) => {
    return api.get<ApiResponse<any>>(`/kakao/bimonthly-preview/${scoreId}`);
  },
  verifyBimonthlyAccess: (token: string, studentName: string, phoneLast4: string) => {
    return api.post<ApiResponse<any>>(`/kakao/bimonthly-verify/${token}`, { student_name: studentName, phone_last4: phoneLast4 });
  },
  getBimonthlyReport: (token: string, studentName: string, phoneLast4: string) => {
    return api.get<ApiResponse<any>>(`/kakao/bimonthly-report/${token}`, { params: { student_name: studentName, phone_last4: phoneLast4 } });
  },
  getBimonthlySendStatus: (className: string, examDate: string) => {
    return api.get<ApiResponse<any[]>>('/kakao/bimonthly-send-status', { params: { class_name: className, exam_date: examDate } });
  },
  // ??�?� ??�?� ??림??
  sendCounselingNotification: (data: { student_id: number; class_name: string; date: string; content: string; targets: string[] }) => {
    return api.post<ApiResponse<any>>('/kakao/send-counseling', data);
  },
  getCounselingSendStatus: (params?: { startDate?: string; endDate?: string }) => {
    return api.get<ApiResponse<any[]>>('/kakao/counseling-send-status', { params });
  },
  sendReservationNotification: (reservationId: number) => {
    return api.post<ApiResponse<any>>('/kakao/send-reservation', { reservation_id: reservationId });
  },
  getReservationSendStatus: () => {
    return api.get<ApiResponse<any[]>>('/kakao/reservation-send-status');
  },
  // 보�? ??�?? ??림??
  sendSupplementaryNotification: (sessionId: number) => {
    return api.post<ApiResponse<any>>('/kakao/send-supplementary', { session_id: sessionId });
  }
};

// ??�?�??�?�?API
export const reservationApi = {
  getAll: (filters?: { status?: string; search?: string }) => {
    return api.get<ApiResponse<any[]>>('/reservations', { params: filters });
  },
  getById: (id: number) => {
    return api.get<ApiResponse<any>>(`/reservations/${id}`);
  },
  create: (data: any) => {
    return api.post<ApiResponse<any>>('/reservations', data);
  },
  update: (id: number, data: any) => {
    return api.put<ApiResponse<any>>(`/reservations/${id}`, data);
  },
  delete: (id: number) => {
    return api.delete<ApiResponse<void>>(`/reservations/${id}`);
  },
  // ??�?? �?리
  enroll: (id: number) => {
    return api.post<ApiResponse<any>>(`/reservations/${id}/enroll`);
  },
  // ??벨??�?�??
  getLevelTest: (reservationId: number) => {
    return api.get<ApiResponse<any>>(`/reservations/${reservationId}/level-test`);
  },
  saveLevelTest: (data: any) => {
    return api.post<ApiResponse<any>>('/reservations/level-test', data);
  },
  getLevelTestById: (id: number) => {
    return api.get<ApiResponse<any>>(`/reservations/level-test/${id}`);
  },
  deleteLevelTest: (id: number) => {
    return api.delete<ApiResponse<void>>(`/reservations/level-test/${id}`);
  },
  // ??벨??�?�???�젝??망희
  generateReportLink: (levelTestId: number, name: string, phoneLast4: string) => {
    return api.post<ApiResponse<{ token: string; url: string }>>('/reports/level-test/generate', {
      level_test_id: levelTestId, name, phone_last4: phoneLast4
    });
  },
  getReportPreview: (levelTestId: number) => {
    return api.get<ApiResponse<any>>(`/reports/level-test/preview/${levelTestId}`);
  }
};

// ?? ?? API
export const attendanceApi = {
  getByClass: (classId: number, date: string) => {
    return api.get<ApiResponse<any[]>>(`/attendance/class/${classId}`, { params: { date } });
  },
  getByDate: (date: string) => {
    return api.get<ApiResponse<any[]>>(`/attendance/by-date/${date}`);
  },
  getByDateOptimized: (date: string) => {
    return api.get<ApiResponse<any>>(`/attendance/by-date-optimized/${date}`);
  },
  getStudentMonthly: (studentId: number, month: string) => {
    return api.get<ApiResponse<any[]>>(`/attendance/student/${studentId}`, { params: { month } });
  },
  getMonthlySummary: (month: string) => {
    return api.get<ApiResponse<any[]>>(`/attendance/summary/${month}`);
  },
  getConsecutiveAbsent: (days?: number) => {
    return api.get<ApiResponse<any[]>>('/attendance/consecutive-absent', { params: { days } });
  },
  update: (data: { class_id: number; student_id: number; attendance_date: string; status: string }) => {
    return api.post<ApiResponse<any>>('/attendance', data);
  }
};

export default api;
export const dailyBoardApi = {
  getBoard: (date: string) => api.get<ApiResponse<any>>(`/daily-board/${date}`),
  getBoardsByMonth: (month: string) => api.get<ApiResponse<any[]>>(`/daily-board/month/${month}`),
  saveBoard: (date: string, data: any) => api.post<ApiResponse<any>>(`/daily-board/${date}`, data)
};

export const softLandingApi = {
  getStudents: () => api.get<ApiResponse<any[]>>('/soft-landing/students'),
  updateExclusion: (studentId: number, excluded: boolean, excludedReason?: string) => 
    api.put<ApiResponse<any>>(`/soft-landing/students/${studentId}/exclusion`, { excluded, excludedReason }),
  updateInitialLevel: (studentId: number, initialLevel: string) =>
    api.put<ApiResponse<any>>(`/soft-landing/students/${studentId}/initial-level`, { initialLevel }),
  upsertCheckpoint: (studentId: number, phase: number, data: any) =>
    api.put<ApiResponse<any>>(`/soft-landing/students/${studentId}/checkpoints/${phase}`, data),
  generateReportLink: (studentId: number, phase: number, studentName: string, phoneLast4: string) =>
    api.post<ApiResponse<{ token: string; url: string }>>('/soft-landing/report/link', { student_id: studentId, phase, student_name: studentName, phone_last4: phoneLast4 }),
  verifyReportAccess: (token: string, studentName: string, phoneLast4: string) =>
    api.post<ApiResponse<any>>(`/soft-landing/report/verify/${token}`, { student_name: studentName, phone_last4: phoneLast4 }),
  getReportData: (token: string, studentName: string, phoneLast4: string, preview: boolean = false) =>
    api.get<ApiResponse<any>>(`/soft-landing/report/data/${token}`, { params: { student_name: studentName, phone_last4: phoneLast4, preview: preview ? 'true' : 'false' } })
};
