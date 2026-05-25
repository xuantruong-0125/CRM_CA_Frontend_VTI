// app/modules/reports/useCases/getDetailReportUseCase.ts
import { reportsApi } from "../api/reports.api";
import { UserKpiRow } from "../types/reports.type";

export const getDetailReportUseCase = {
  execute: async (configId: number): Promise<UserKpiRow[]> => {
    return await reportsApi.getDetailReport(configId);
  },

  groupByOrganization: (data: UserKpiRow[], searchEmployee: string): Record<string, UserKpiRow[]> => {
    const filtered = data.filter(row => 
      row.userName.toLowerCase().includes(searchEmployee.toLowerCase())
    );

    const grouped: Record<string, UserKpiRow[]> = {};
    filtered.forEach(row => {
      const orgName = row.organizationName || "Nhóm chung";
      if (!grouped[orgName]) grouped[orgName] = [];
      grouped[orgName].push(row);
    });
    
    return grouped;
  }
};
