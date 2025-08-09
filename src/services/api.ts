import axios, { AxiosResponse } from 'axios';
import {
    User,
    Report,
    ReportSummary,
    ReportDetail,
    LoginCredentials,
    RegisterData,
    CreateReportRequest,
    UpdateProfileRequest,
    APIResponse,
    PaginatedResponse,
    PaymentIntent,
    Subscription,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with interceptors
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<{ access_token: string; token_type: string; user: User }> => {
        const formData = new FormData();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    register: async (data: RegisterData): Promise<{ message: string; user: User }> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
};

// Users API
export const usersAPI = {
    getProfile: async (): Promise<User> => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    uploadSignature: async (file: File): Promise<{ signature_url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/users/signature', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

// Reports API
export const reportsAPI = {
    getReports: async (page: number = 1, per_page: number = 10): Promise<PaginatedResponse<ReportSummary>> => {
        const response = await api.get('/reports/', {
            params: { page, per_page },
        });
        return response.data;
    },

    getReport: async (id: string): Promise<ReportDetail> => {
        const response = await api.get(`/reports/${id}`);
        return response.data;
    },

    createReport: async (data: CreateReportRequest): Promise<ReportDetail> => {
        const response = await api.post('/reports/', data);
        return response.data;
    },

    updateReport: async (id: string, data: Partial<ReportDetail>): Promise<ReportDetail> => {
        const response = await api.put(`/reports/${id}`, data);
        return response.data;
    },

    deleteReport: async (id: string): Promise<void> => {
        await api.delete(`/reports/${id}`);
    },

    generateReport: async (id: string, format: 'pdf' | 'docx'): Promise<Blob> => {
        const response = await api.get(`/reports/${id}/generate`, {
            params: { format },
            responseType: 'blob',
        });
        return response.data;
    },

    generateInvoice: async (id: string, format: 'pdf' | 'docx'): Promise<Blob> => {
        const response = await api.get(`/reports/${id}/invoice`, {
            params: { format },
            responseType: 'blob',
        });
        return response.data;
    },

    getAISuggestions: async (
        id: string,
        field_type: 'property_description' | 'market_analysis' | 'valuation_summary'
    ): Promise<{ suggestions: string[] }> => {
        const response = await api.post(`/reports/${id}/ai-suggestions`, { field_type });
        return response.data;
    },
};

// Files API
export const filesAPI = {
    uploadFile: async (file: File): Promise<{ id: string; url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    uploadPhoto: async (reportId: string, file: File, category: string, caption: string): Promise<{ id: string; url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('caption', caption);

        const response = await api.post(`/files/photos/${reportId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    processOCR: async (fileId: string): Promise<{ text: string; confidence: number; extracted_data: any }> => {
        const response = await api.post(`/files/ocr/${fileId}`);
        return response.data;
    },

    deletePhoto: async (photoId: string): Promise<void> => {
        await api.delete(`/files/photos/${photoId}`);
    },
};

// AI API
export const aiAPI = {
    getSuggestions: async (data: any): Promise<{ suggestions: any }> => {
        const response = await api.post('/ai/suggestions', data);
        return response.data;
    },
};

// Billing API
export const billingAPI = {
    getSubscription: async (): Promise<Subscription> => {
        const response = await api.get('/billing/subscription');
        return response.data;
    },

    createCheckout: async (priceId: string): Promise<{ checkout_url: string }> => {
        const response = await api.post('/billing/checkout', { price_id: priceId });
        return response.data;
    },
};

// Payments API
export const paymentsAPI = {
    createSubscription: async (planType: string): Promise<PaymentIntent> => {
        const response = await api.post('/payments/subscribe', { plan_type: planType });
        return response.data;
    },

    getSubscriptions: async (): Promise<Subscription[]> => {
        const response = await api.get('/payments/subscriptions');
        return response.data;
    },

    cancelSubscription: async (subscriptionId: string): Promise<{ message: string }> => {
        const response = await api.post(`/payments/subscriptions/${subscriptionId}/cancel`);
        return response.data;
    },

    getPlans: async (): Promise<any[]> => {
        const response = await api.get('/payments/plans');
        return response.data;
    },
};

// Admin API
export const adminAPI = {
    getUsers: async (page: number = 1, per_page: number = 10): Promise<PaginatedResponse<User>> => {
        const response = await api.get('/admin/users', {
            params: { page, per_page },
        });
        return response.data;
    },

    updateUserStatus: async (userId: string, isActive: boolean): Promise<{ message: string }> => {
        const response = await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
        return response.data;
    },

    getReports: async (page: number = 1, per_page: number = 10): Promise<PaginatedResponse<Report>> => {
        const response = await api.get('/admin/reports', {
            params: { page, per_page },
        });
        return response.data;
    },

    getSubscriptions: async (page: number = 1, per_page: number = 10): Promise<PaginatedResponse<Subscription>> => {
        const response = await api.get('/admin/subscriptions', {
            params: { page, per_page },
        });
        return response.data;
    },

    getAnalytics: async (): Promise<{
        total_users: number;
        active_subscriptions: number;
        total_reports: number;
        revenue_this_month: number;
    }> => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },
};

export default api;
