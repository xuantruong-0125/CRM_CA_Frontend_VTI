// import axios from "axios";
// import httpClient from "@/core/http/httpClient";

// import { User, UserPayload, UserPageResponse, UserFilter } from "../types/user.type";

// const API_URL = "http://localhost:8080/api/users";

// export const userApi = {
//     // getAll: async (): Promise<User[]> => {
//     //     const res = await axios.get(API_URL);
//     //     return res.data;
//     // },

//     getAll: async (page = 0): Promise<UserPageResponse> => {
//         const res = await axios.get(`${API_URL}?page=${page}`);
//         return res.data;
//     },

//     search: async (filters: UserFilter): Promise<UserPageResponse> => {
//         const res = await axios.get(`${API_URL}/search`, {
//             params: filters,
//         });
//         return res.data;
//     },


//     create: async (payload: UserPayload): Promise<User> => {
//         const res = await axios.post(API_URL, payload);
//         return res.data;
//     },

//     update: async (id: number, payload: UserPayload): Promise<User> => {
//         const res = await axios.put(`${API_URL}/${id}`, payload);
//         return res.data;
//     },

//     delete: async (id: number): Promise<void> => {
//         await axios.delete(`${API_URL}/${id}`);
//     },
// };

import httpClient from "@/core/http/httpClient";
import {
    User,
    UserPayload,
    UserPageResponse,
    UserFilter,
} from "../types/user.type";

const API_URL = "/api/users";

export const userApi = {
    getAll: async (page = 0): Promise<UserPageResponse> => {
        const res = await httpClient.get(`${API_URL}?page=${page}`);
        return res.data;
    },

    getUsers: async (): Promise<User[]> => {
        const res = await httpClient.get<any>(API_URL);
        // Nếu trả về dạng page { content: [...] }
        if (res.data && res.data.content) {
            return res.data.content;
        }
        // Nếu trả về dạng mảng trực tiếp [...]
        if (Array.isArray(res.data)) {
            return res.data;
        }
        return [];
    },

    search: async (filters: UserFilter): Promise<UserPageResponse> => {
        const res = await httpClient.get(`${API_URL}/search`, {
            params: filters,
        });
        return res.data;
    },

    create: async (payload: UserPayload): Promise<User> => {
        const res = await httpClient.post(API_URL, payload);
        return res.data;
    },

    update: async (
        id: number,
        payload: UserPayload
    ): Promise<User> => {
        const res = await httpClient.put(
            `${API_URL}/${id}`,
            payload
        );
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${API_URL}/${id}`);
    },
};