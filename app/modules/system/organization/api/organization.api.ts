// // api/organization.api.ts

// import axios from 'axios';
// import { Organization, OrganizationPayload } from '../types/organization.type';

// const BASE_URL = 'http://localhost:8080/api/organizations';

// export const organizationApi = {
//   getTree: async (): Promise<Organization[]> => {
//     const res = await axios.get<Organization[]>(`${BASE_URL}/tree`);
//     return res.data;
//   },

//   create: async (data: OrganizationPayload): Promise<Organization> => {
//     const res = await axios.post<Organization>(BASE_URL, data);
//     return res.data;
//   },

//   update: async (
//     id: number,
//     data: OrganizationPayload
//   ): Promise<Organization> => {
//     const res = await axios.put<Organization>(`${BASE_URL}/${id}`, data);
//     return res.data;
//   },

//   delete: async (id: number): Promise<void> => {
//     await axios.delete(`${BASE_URL}/${id}`);
//   },
// };

import httpClient from "@/core/http/httpClient";
import {
    Organization,
    OrganizationPayload,
} from "../types/organization.type";

const BASE_URL = "/api/organizations";

export const organizationApi = {
    getTree: async (): Promise<Organization[]> => {
        const res = await httpClient.get<Organization[]>(
            `${BASE_URL}/tree`
        );
        return res.data;
    },

    getAll: async (): Promise<Organization[]> => {
        const res = await httpClient.get<Organization[]>(BASE_URL);
        return res.data;
    },

    create: async (
        data: OrganizationPayload
    ): Promise<Organization> => {
        const res = await httpClient.post<Organization>(
            BASE_URL,
            data
        );
        return res.data;
    },

    update: async (
        id: number,
        data: OrganizationPayload
    ): Promise<Organization> => {
        const res = await httpClient.put<Organization>(
            `${BASE_URL}/${id}`,
            data
        );
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${BASE_URL}/${id}`);
    },
};