import httpClient from "@/core/http/httpClient";
import { Pipeline, PipelinePayload } from "../types/pipeline.type";

const BASE = "/api/pipelines";

export const pipelineApi = {
    getAll: async (): Promise<Pipeline[]> => {
        const res = await httpClient.get(BASE);
        return res.data;
    },

    getById: async (id: number): Promise<Pipeline> => {
        const res = await httpClient.get(`${BASE}/${id}`);
        return res.data;
    },

    create: async (payload: PipelinePayload): Promise<Pipeline> => {
        const res = await httpClient.post(BASE, payload);
        return res.data;
    },

    update: async (id: number, payload: PipelinePayload): Promise<Pipeline> => {
        const res = await httpClient.put(`${BASE}/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${BASE}/${id}`);
    },
};
