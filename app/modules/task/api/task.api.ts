import httpClient from '@/core/http/httpClient';

const BASE_URL = '/api/v1/tasks';

export const taskApi = {
    // Lấy danh sách có phân trang và lọc
    getTasks: async (params?: any) => {
        const response = await httpClient.get(BASE_URL, { params });
        return response.data;
    },

    // Lấy chi tiết 1 task
    getTaskById: async (id: number) => {
        const response = await httpClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Tạo mới
    createTask: async (data: any) => {
        const response = await httpClient.post(BASE_URL, data);
        return response.data;
    },

    // Cập nhật
    updateTask: async (id: number, data: any) => {
        const response = await httpClient.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    // Xóa (Hỗ trợ xóa nhiều)
    deleteTasks: async (ids: number[]) => {
        // Tuỳ vào backend của bạn nhận danh sách ID qua body hay query
        const response = await httpClient.delete(BASE_URL, { data: ids });
        return response.data;
    }
    
};