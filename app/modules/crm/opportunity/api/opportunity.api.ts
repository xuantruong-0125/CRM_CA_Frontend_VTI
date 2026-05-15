import httpClient from "@/core/http/httpClient";
import {
    Opportunity,
    OpportunityPayload,
    OpportunityFilter,
    OpportunityPageResponse,
} from "../types/opportunity.type";

const BASE = "/api/opportunities";

export const opportunityApi = {
    getAll: async (filters: OpportunityFilter = {}): Promise<OpportunityPageResponse> => {
        const params: Record<string, any> = {};
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.customerId) params.customerId = filters.customerId;
        if (filters.assignedUserId) params.assignedUserId = filters.assignedUserId;
        if (filters.pipelineId) params.pipelineId = filters.pipelineId;
        if (filters.stageId) params.stageId = filters.stageId;
        if (filters.healthStatus) params.healthStatus = filters.healthStatus;
        if (filters.dateFrom) params.dateFrom = filters.dateFrom;
        if (filters.dateTo) params.dateTo = filters.dateTo;
        if (filters.sortField) params.sortField = filters.sortField;
        if (filters.sortDir) params.sortDir = filters.sortDir;
        params.page = filters.page ?? 1;
        params.size = filters.size ?? 20;

        const res = await httpClient.get(BASE, { params });
        return res.data;
    },

    getById: async (id: number): Promise<Opportunity> => {
        const res = await httpClient.get(`${BASE}/${id}`);
        return res.data;
    },

    create: async (payload: OpportunityPayload): Promise<Opportunity> => {
        const res = await httpClient.post(BASE, payload);
        return res.data;
    },

    update: async (id: number, payload: OpportunityPayload): Promise<Opportunity> => {
        const res = await httpClient.put(`${BASE}/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${BASE}/${id}`);
    },
};
