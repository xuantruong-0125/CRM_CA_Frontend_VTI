// src/modules/activity/api/activity.api.ts
import httpClient from '@/core/http/httpClient';
import { IActivity, IActivityPayload, PaginatedActivity } from '../types/activity.type'; // Nhớ import type đã tạo nhé

const BASE_URL = '/api/v1/activities';

export const activityApi = {
    // Lấy danh sách
    getActivities: async (params?: any): Promise<PaginatedActivity> => {
        // Gọi thẳng bằng thư viện axios thuần
        const response = await httpClient.get(BASE_URL, { params });

        // Bây giờ response.data chính là cái Object { content: [], totalPages: ... }
        return response.data;
    },


    // 2. Lấy chi tiết 1 Activity
    getActivityById: async (id: number): Promise<IActivity> => {
        const response = await httpClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },


    // Tạo mới (Ví dụ để dành cho chức năng thêm Activity)
    createActivity: async (payload: IActivityPayload) => {
        const response = await httpClient.post(BASE_URL, payload);
        return response.data;
    },

    updateActivity: async (id: number, payload: any) => {
        const response = await httpClient.put(`${BASE_URL}/${id}`, payload);
        return response.data;
    },


    // 3. Thêm Ghi chú (Note) cho Activity đó
    addNote: async (activityId: number, content: string) => {
        // Gom dữ liệu thành payload chuẩn mà NoteController (Spring Boot) đang chờ
        const payload = {
            content: content,
            notableType: "Activity", // Rất quan trọng để DB phân biệt đây là note của module nào
            notableId: activityId,
            isPrivate: false
        };

        // Bắn thẳng qua NoteController (đổi đường dẫn từ BASE_URL sang đường dẫn của Notes)

        const response = await httpClient.post('/api/v1/notes', payload);
        return response.data;
    },

    // 4. Xóa Activity
    deleteActivities: async (ids: number[]) => {
        // Lưu ý: Axios DELETE có body phải nằm trong object { data: ... }
        const response = await httpClient.delete(BASE_URL, { data: ids });
        return response.data;
    }

};