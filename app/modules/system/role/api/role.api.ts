// import axios from "axios";
// import { Role, RolePayload } from "../types/role.type";

// const BASE_URL = "http://localhost:8080/api/roles";

// export const roleApi = {
//   getAll: async (): Promise<Role[]> => {
//     const res = await axios.get<Role[]>(BASE_URL);
//     return res.data;
//   },

//   create: async (data: RolePayload): Promise<Role> => {
//     const res = await axios.post<Role>(BASE_URL, data);
//     return res.data;
//   },

//   update: async (id: number, data: RolePayload): Promise<Role> => {
//     const res = await axios.put<Role>(`${BASE_URL}/${id}`, data);
//     return res.data;
//   },

//   delete: async (id: number): Promise<void> => {
//     await axios.delete(`${BASE_URL}/${id}`);
//   },
// };

import httpClient from "@/core/http/httpClient";
import { Role, RolePayload } from "../types/role.type";

const BASE_URL = "/api/roles";

export const roleApi = {
    getAll: async (): Promise<Role[]> => {
        const res = await httpClient.get<Role[]>(BASE_URL);
        return res.data;
    },

    create: async (data: RolePayload): Promise<Role> => {
        const res = await httpClient.post<Role>(BASE_URL, data);
        return res.data;
    },

    update: async (
        id: number,
        data: RolePayload
    ): Promise<Role> => {
        const res = await httpClient.put<Role>(
            `${BASE_URL}/${id}`,
            data
        );
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${BASE_URL}/${id}`);
    },
};