// // api/menu.api.ts

// import axios from "axios";
// import { Menu, MenuPayload } from "../types/menu.type";

// const BASE_URL = "http://localhost:8080/api/menus";

// export const menuApi = {
//   getTree: async (): Promise<Menu[]> => {
//     const res = await axios.get<Menu[]>(`${BASE_URL}/tree`);
//     return res.data;
//   },

//   create: async (data: MenuPayload): Promise<Menu> => {
//     const res = await axios.post<Menu>(BASE_URL, data);
//     return res.data;
//   },

//   update: async (
//     id: number,
//     data: MenuPayload
//   ): Promise<Menu> => {
//     const res = await axios.put<Menu>(`${BASE_URL}/${id}`, data);
//     return res.data;
//   },

//   delete: async (id: number): Promise<void> => {
//     await axios.delete(`${BASE_URL}/${id}`);
//   },
// };

import httpClient from "@/core/http/httpClient";
import { Menu, MenuPayload } from "../types/menu.type";

const BASE_URL = "/api/menus";

export const menuApi = {
    getTree: async (): Promise<Menu[]> => {
        const res = await httpClient.get<Menu[]>(
            `${BASE_URL}/tree`
        );
        return res.data;
    },

    create: async (data: MenuPayload): Promise<Menu> => {
        const res = await httpClient.post<Menu>(
            BASE_URL,
            data
        );
        return res.data;
    },

    update: async (
        id: number,
        data: MenuPayload
    ): Promise<Menu> => {
        const res = await httpClient.put<Menu>(
            `${BASE_URL}/${id}`,
            data
        );
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${BASE_URL}/${id}`);
    },
};