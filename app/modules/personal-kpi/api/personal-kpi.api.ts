// app/modules/personal-kpi/api/personal-kpi.api.ts
import httpClient from "../../../core/http/httpClient";
import { DashboardData } from "../../reports/types/reports.type";

export const personalKpiApi = {
  // Lấy danh sách các cấu hình KPI mà nhân viên đang tham gia
  getMyAssignedConfigs: async (userId: number, orgId: number) => {
    const response = await httpClient.get(`/api/kpi-configs/my-assignments?userId=${userId}&organizationId=${orgId}`);
    return response.data;
  },

  // Lấy dữ liệu chi tiết KPI của chính nhân viên đó cho một cấu hình cụ thể
  getMyKpiStats: async (configId: number, userId: number): Promise<DashboardData> => {
    const response = await httpClient.get(`/api/reports/dashboard/${configId}?userId=${userId}`);
    return response.data;
  }
};
