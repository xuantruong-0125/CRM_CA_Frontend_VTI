// app/modules/reports/useCases/getDashboardUseCase.ts
import { reportsApi } from "../api/reports.api";
import { DashboardData } from "../types/reports.type";

export const getDashboardUseCase = {
  execute: async (configId: number, userId?: number): Promise<DashboardData> => {
    return await reportsApi.getDashboardData(configId, userId);
  }
};
