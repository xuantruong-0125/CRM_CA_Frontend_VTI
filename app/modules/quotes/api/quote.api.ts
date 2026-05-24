import httpClient from "@/core/http/httpClient";
import {
    Quote,
    QuotePayload,
    QuoteFilter,
    QuotePageResponse,
    QuoteFormDataCustomer,
    QuoteFormDataTemplate,
    ProductApiResponse,
} from "../types/quote.type";

const BASE = "/api/quotes";

export const quoteApi = {
    getAll: async (filters: QuoteFilter = {}): Promise<QuotePageResponse> => {
        const params: Record<string, any> = {};
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.customerId) params.customerId = filters.customerId;
        if (filters.statusId) params.statusId = filters.statusId;
        if (filters.quoteNumber) params.quoteNumber = filters.quoteNumber;
        if (filters.fromDate) params.fromDate = filters.fromDate;
        if (filters.toDate) params.toDate = filters.toDate;
        if (filters.sort) params.sort = filters.sort;
        params.page = (filters.page ?? 1) - 1;
        params.size = filters.size ?? 10;

        const res = await httpClient.get(BASE, { params });
        return res.data;
    },

    getById: async (id: number): Promise<Quote> => {
        const res = await httpClient.get(`${BASE}/${id}`);
        return res.data;
    },

    create: async (payload: QuotePayload): Promise<Quote> => {
        const res = await httpClient.post(BASE, payload);
        return res.data;
    },

    update: async (id: number, payload: QuotePayload): Promise<Quote> => {
        const res = await httpClient.put(`${BASE}/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`${BASE}/${id}`);
    },

    updateStatus: async (id: number, statusId: number): Promise<void> => {
        await httpClient.patch(`${BASE}/${id}/status`, { statusId });
    },

    checkQuoteNumber: async (number: string, excludeId?: number): Promise<{ exists: boolean }> => {
        const res = await httpClient.get(`${BASE}/check-number`, { params: { number, excludeId } });
        return res.data;
    },

    getFormCustomers: async (): Promise<QuoteFormDataCustomer[]> => {
        const res = await httpClient.get(`${BASE}/form-data/customers`);
        return res.data;
    },

    searchCustomers: async (keyword: string): Promise<QuoteFormDataCustomer[]> => {
        const res = await httpClient.get(`${BASE}/form-data/customers/search`, { params: { keyword } });
        return res.data;
    },

    getFormProducts: async (): Promise<ProductApiResponse[]> => {
        const res = await httpClient.get(`${BASE}/form-data/products`);
        return res.data ?? [];
    },

    getFormTemplates: async (): Promise<QuoteFormDataTemplate[]> => {
        const res = await httpClient.get(`${BASE}/form-data/templates`);
        return res.data;
    },
};
