// app/modules/personal-kpi/hooks/usePersonalKpi.ts
import { useState, useEffect } from "react";
import { personalKpiApi } from "../api/personal-kpi.api";
import { DashboardData } from "../../reports/types/reports.type";

export const usePersonalKpi = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy ID từ localStorage (nếu không có thì dùng giá trị mặc định để test)
  const currentUserIdStr = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const currentOrgIdStr = typeof window !== "undefined" ? localStorage.getItem("orgId") : null;

  const CURRENT_USER_ID = currentUserIdStr ? parseInt(currentUserIdStr, 10) : 3;
  const CURRENT_ORG_ID = currentOrgIdStr ? parseInt(currentOrgIdStr, 10) : 1;

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const items = await personalKpiApi.getMyAssignedConfigs(CURRENT_USER_ID, CURRENT_ORG_ID);
        setConfigs(items || []);
        if (items && items.length > 0) {
          setSelectedConfigId(items[0].id);
        }
      } catch (error) {
        console.error("Failed to load assigned KPIs", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedConfigId) {
      const loadStats = async () => {
        try {
          // GỌI API THẬT: Lấy tiến độ hoàn thành thực tế từ Database
          const data = await personalKpiApi.getMyKpiStats(selectedConfigId, CURRENT_USER_ID);
          setStats(data);
        } catch (error) {
          console.error("Failed to load KPI stats", error);
        }
      };
      loadStats();
    }
  }, [selectedConfigId]);

  return {
    configs,
    selectedConfigId,
    setSelectedConfigId,
    stats,
    isLoading
  };
};
