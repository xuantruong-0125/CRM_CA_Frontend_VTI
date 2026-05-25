// app/modules/kpi-config/api/kpi-config.api.ts

import httpClient from '@/core/http/httpClient';
import { KpiConfig, KpiConfigPayload, PaginatedResponse } from '../types/kpi-config.type';

const BASE_URL = '/api/kpi-configs';

export const kpiConfigApi = {
  findAll: async (keyword?: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<KpiConfig>> => {
    const res = await httpClient.get<PaginatedResponse<KpiConfig>>(BASE_URL, {
      params: { keyword, page, size }
    });
    return res.data;
  },

  create: async (data: KpiConfigPayload): Promise<KpiConfig> => {
    const res = await httpClient.post<KpiConfig>(BASE_URL, data);
    return res.data;
  },

  update: async (
    id: number,
    data: KpiConfigPayload
  ): Promise<KpiConfig> => {
    const res = await httpClient.put<KpiConfig>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`${BASE_URL}/${id}`);
  },
};
