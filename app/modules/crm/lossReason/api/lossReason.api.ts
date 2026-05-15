import httpClient from "@/core/http/httpClient";
import { LossReason, LossReasonPayload } from "../types/lossReason.type";

const BASE = "/api/loss-reasons";

export const lossReasonApi = {
    getAll: async (): Promise<LossReason[]> => {
        const res = await httpClient.get(BASE);
        return res.data;
    },

    getById: async (id: number): Promise<LossReason> => {
        const res = await httpClient.get(`${BASE}/${id}`);
        return res.data;
    },

    create: async (payload: LossReasonPayload): Promise<LossReason> => {
        const res = await httpClient.post(BASE, payload);
        return res.data;
    },

    update: async (id: number, payload: LossReasonPayload): Promise<LossReason> => {
        const res = await httpClient.put(`${BASE}/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${BASE}/${id}`);
    },
};
