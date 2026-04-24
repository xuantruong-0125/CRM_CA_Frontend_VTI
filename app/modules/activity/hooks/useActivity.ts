// src/modules/activity/hooks/useActivity.ts

import { useState, useEffect, useCallback } from 'react';

import { fetchActivitiesUseCase } from '../useCases/activity.useCases';
import { activityApi } from '../api/activity.api';
import { IActivity, PaginatedActivity } from '../types/activity.type';

export const useActivity = () => {
  const [activities, setActivities] = useState<PaginatedActivity>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0
});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // state quản lý bộ lọc
  const [filters, setFilters] = useState<any>({});

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
   
    try {
      // Truyền filters vào useCase -> API
      const data: PaginatedActivity = await fetchActivitiesUseCase(filters); 
      setActivities(data);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách Activity');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Tự động load dữ liệu khi hook được gọi
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    activities,
    isLoading,
    setFilters,
    filters,
    error,
    refetch: loadActivities, // Hàm để UI có thể chủ động gọi lại API (vd: sau khi tạo mới activity)
  };
};