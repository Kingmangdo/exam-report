import axios from 'axios';
import type { 
  Student, 
  Score, 
  Statistics, 
  ReportData,
  ApiResponse 
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

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

// 성적 관리 API
export const scoreApi = {
  getAll: (filters?: { 
    student_id?: number; 
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

export default api;
