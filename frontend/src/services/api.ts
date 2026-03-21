
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

// ?¸í?°??í?° ì¶?ê?: ë¡?ì»¬ ?¤í? ë¦¬ì??ì?? ? í° ê°??¸ì? ?¤ë???ì¶?ê?
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ?¸í?°??í?° ì¶?ê?: 401 ?ë?¬(?¸ì¦ ë§?ë£?) ì²?ë¦¬
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

// ?¸ì¦ API
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

// ??ì? ê´?ë¦?API
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
  // ?´ì? ì²?ë¦¬
  withdraw: (id: number, data: { withdraw_date: string; withdraw_reason?: string; withdraw_teacher?: string }) => {
    return api.post<ApiResponse<Student>>(`/students/${id}/withdraw`, data);
  },
  // ?¬ë?±ë¡?ë³µê?)
  reEnroll: (id: number) => {
    return api.post<ApiResponse<Student>>(`/students/${id}/re-enroll`);
  }
};

// ?ë?´ ê´?ë¦?API
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

// ë°?ê´?ë¦?API
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

// ë³´ê°? ê´?ë¦?API
export const supplementaryApi = {
  getSessions: (classId: number, startDate?: string, endDate?: string) => {
    return api.get<ApiResponse<any[]>>(`/supplementary/class/${classId}`, { params: { start_date: startDate, end_date: endDate } });
  },
  // ë³´ê°? ????ë³´??ì?©: ëª¨ë?  ë°?ì? ë³´ê°? ?¼ì ? ì¡°í??
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
  // ë³´ê°? ì¶?ê²°/ê²°ì? ?¬ì?  ??ë°?´í?¸
  updateAttendance: (sessionId: number, studentId: number, data: { attendance_status: 'pending' | 'present' | 'absent'; absent_reason?: string }) => {
    return api.patch<ApiResponse<any>>(`/supplementary/${sessionId}/students/${studentId}/attendance`, data);
  }
};

// ?±ì·¨??ê? API
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

// AI ì½?ë©???API (ë¡?ì»¬ Ollama)
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

// ?±ì  ê´?ë¦?API
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

// ?µê³? API
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

// ?±ì ??API
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

// ?¤ì ? API
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

// ê²°ì ? ê´?ë¦?API
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

// ì¹´ì¹´????ë¦¼??API
export const kakaoApi = {
  sendReport: (scoreId: number) => {
    return api.post<ApiResponse<any>>('/kakao/send-report', { score_id: scoreId });
  },
  // ?±ì·¨??ê? ??ë¦¼??
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
  // ??ì?½ ??ë?´ ??ë¦¼??
  sendReservationNotification: (reservationId: number) => {
    return api.post<ApiResponse<any>>('/kakao/send-reservation', { reservation_id: reservationId });
  },
  getReservationSendStatus: () => {
    return api.get<ApiResponse<any[]>>('/kakao/reservation-send-status');
  },
  // ë³´ê°? ??ì?? ??ë¦¼??
  sendSupplementaryNotification: (sessionId: number) => {
    return api.post<ApiResponse<any>>('/kakao/send-supplementary', { session_id: sessionId });
  }
};

// ??ì?½??ê´?ë¦?API
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
  // ??í?? ì²?ë¦¬
  enroll: (id: number) => {
    return api.post<ApiResponse<any>>(`/reservations/${id}/enroll`);
  },
  // ??ë²¨??ì?¤??
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
  // ??ë²¨??ì?¤???±ì ??ë§í¬
  generateReportLink: (levelTestId: number, name: string, phoneLast4: string) => {
    return api.post<ApiResponse<{ token: string; url: string }>>('/reports/level-test/generate', {
      level_test_id: levelTestId, name, phone_last4: phoneLast4
    });
  },
  getReportPreview: (levelTestId: number) => {
    return api.get<ApiResponse<any>>(`/reports/level-test/preview/${levelTestId}`);
  }
};

export default api;
export const dailyBoardApi = {
  getBoard: (date: string) => api.get<ApiResponse<any>>(`/daily-board/${date}`),
  saveBoard: (date: string, data: any) => api.post<ApiResponse<any>>(`/daily-board/${date}`, data)
};
