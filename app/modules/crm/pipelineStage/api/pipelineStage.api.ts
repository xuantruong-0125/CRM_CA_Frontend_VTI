import httpClient from "@/core/http/httpClient";
import { PipelineStage, PipelineStagePayload } from "../types/pipelineStage.type";

const BASE = "/api/stages";

export const pipelineStageApi = {
    getAll: async (pipelineId?: number): Promise<PipelineStage[]> => {
        const params = pipelineId ? { pipelineId } : {};
        const res = await httpClient.get(BASE, { params });
        return res.data;
    },

    getById: async (id: number): Promise<PipelineStage> => {
        const res = await httpClient.get(`${BASE}/${id}`);
        return res.data;
    },

    create: async (payload: PipelineStagePayload): Promise<PipelineStage> => {
        const res = await httpClient.post(BASE, payload);
        return res.data;
    },

    update: async (id: number, payload: PipelineStagePayload): Promise<PipelineStage> => {
        const res = await httpClient.put(`${BASE}/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${BASE}/${id}`);
    },
};
