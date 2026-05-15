import httpClient from "@/core/http/httpClient";
import { DashboardData, UserKpiRow } from "../types/reports.type";

const API_BASE_URL = "/api/reports";

export const reportsApi = {
  getDetailReport: async (kpiConfigId: number): Promise<UserKpiRow[]> => {
    const response = await httpClient.get(`${API_BASE_URL}/detail/${kpiConfigId}`);
    return response.data;
  },

  getDashboardData: async (kpiConfigId: number, userId?: number): Promise<DashboardData> => {
    const params = userId ? { userId } : {};
    const response = await httpClient.get(`${API_BASE_URL}/dashboard/${kpiConfigId}`, { params });
    return response.data;
  }
};
