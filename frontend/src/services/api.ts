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

// 인터셉터 추가: 로컬 스토리지에서 토큰 가져와 헤더에 추가
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 인터셉터 추가: 401 에러(인증 만료) 처리
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

// 인증 API
export const authApi = {
  login: (credentials: any) => {
    return api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', credentials);
  },
  getMe: () => {
    return api.get<ApiResponse<any>>('/auth/me');
  },
  initAdmin: () => {
    return api.post<ApiResponse<any>>('/auth/init-admin');
  }
};

// 학생 관리 API
export const studentApi = {
  getAll: (filters?: { class_name?: string; grade?: string; search?: string }) => {
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
  }
};

// 상담 관리 API
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

// 반 관리 API
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
  }
};

// 성적 관리 API
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
  }
};

// 통계 API
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

// 성적표 API
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

// 설정 API
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

// 결제 관리 API
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

export default api;
