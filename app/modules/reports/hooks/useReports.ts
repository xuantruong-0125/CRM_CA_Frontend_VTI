// app/modules/reports/hooks/useReports.ts
import { useState, useEffect, useCallback } from "react";
import { kpiConfigApi } from "../../kpi-config/api/kpi-config.api";
import { getDashboardUseCase } from "../useCases/getDashboardUseCase";
import { getDetailReportUseCase } from "../useCases/getDetailReportUseCase";
import { DashboardData, UserKpiRow } from "../types/reports.type";

export const useReports = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [detailData, setDetailData] = useState<UserKpiRow[]>([]);
  const [activeTab, setActiveTab] = useState<"detail" | "dashboard">("dashboard");
  const [selectedDashboardUserId, setSelectedDashboardUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Khai báo hàm loadAllData TRƯỚC khi sử dụng trong useEffect
  const loadAllData = useCallback(async (configId: number, userId?: number) => {
    setIsLoading(true);
    try {
      const [dash, detail] = await Promise.all([
        getDashboardUseCase.execute(configId, userId),
        getDetailReportUseCase.execute(configId)
      ]);
      setDashboardData(dash);
      setDetailData(detail);
    } catch (error) {
      console.error("Failed to load report data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load danh sách cấu hình khi vào trang
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await kpiConfigApi.findAll("", 0, 100);
        const items = response.content || [];
        setConfigs(items);
        if (items.length > 0 && items[0].id !== undefined) {
          setSelectedConfigId(items[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch KPI configs", error);
      }
    };
    fetchConfigs();
  }, []);

  // Load dữ liệu khi đổi cấu hình hoặc đổi nhân viên
  useEffect(() => {
    if (selectedConfigId) {
      loadAllData(selectedConfigId, selectedDashboardUserId || undefined);
    }
  }, [selectedConfigId, selectedDashboardUserId, loadAllData]);

  const getGroupedData = (searchEmployee: string) => {
    return getDetailReportUseCase.groupByOrganization(detailData, searchEmployee);
  };

  return {
    configs,
    selectedConfigId,
    setSelectedConfigId,
    dashboardData,
    detailData,
    activeTab,
    setActiveTab,
    selectedDashboardUserId,
    setSelectedDashboardUserId,
    isLoading,
    getGroupedData
  };
};
