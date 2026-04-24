// src/modules/activity/api/activity.api.ts
import axios from 'axios';
import { IActivity, IActivityPayload, PaginatedActivity } from '../types/activity.type'; // Nhớ import type đã tạo nhé

// Tạm thời hard cứng URL ở đây để test cho nhanh
const BASE_URL = 'http://localhost:8080/api/v1/activities';

export const activityApi = {
    // Lấy danh sách
    getActivities: async (params?: any): Promise<PaginatedActivity> => {
        // Gọi thẳng bằng thư viện axios thuần
        const response = await axios.get(BASE_URL, { params });

        // Bây giờ response.data chính là cái Object { content: [], totalPages: ... }
        return response.data;
    },


    // 2. Lấy chi tiết 1 Activity
    getActivityById: async (id: number): Promise<IActivity> => {
        const response = await axios.get(`${BASE_URL}/${id}`);
        return response.data;
    },


    // Tạo mới (Ví dụ để dành cho chức năng thêm Activity)
    createActivity: async (payload: IActivityPayload) => {
        const response = await axios.post(BASE_URL, payload);
        return response.data;
    },

    updateActivity: async (id: number, payload: any) => {
        const response = await axios.put(`${BASE_URL}/${id}`, payload);
        return response.data;
    },


    // 3. Thêm Ghi chú (Note) cho Activity đó
    addNote: async (activityId: number, content: string) => {
        // Đường dẫn này mình lấy theo file code cũ của bạn: /activities/view/{id}/add-note
        // Backend Spring Boot của bạn có thể đang map endpoint như thế này
        const response = await axios.post(`${BASE_URL}/view/${activityId}/add-note`, { content });
        return response.data;
    },

    // 4. Xóa Activity
    deleteActivities: async (ids: number[]) => {
        // Lưu ý: Axios DELETE có body phải nằm trong object { data: ... }
        const response = await axios.delete(BASE_URL, { data: ids });
        return response.data;
    }

};