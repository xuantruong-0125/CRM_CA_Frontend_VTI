// app/modules/kpi-config/hooks/useKpiConfigForm.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MetricType, KpiConfigPayload, MetricKeyMap, KpiConfig } from '../types/kpi-config.type';
import { kpiConfigUseCase } from '../useCases/kpiConfigUseCase';
import { userApi } from '../../system/user/api/user.api';
import { organizationApi } from '../../system/organization/api/organization.api';

export const useKpiConfigForm = (id?: number | string) => {
  const router = useRouter();
  const configId = id ? Number(id) : null;
  const [isLoading, setIsLoading] = useState(!!id);
  const [formData, setFormData] = useState({
    name: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [targets, setTargets] = useState<Record<MetricType, string>>({
    [MetricType.CALL_COUNT]: '',
    [MetricType.MEETING_COUNT]: '',
    [MetricType.SWITCHBOARD_CALL]: '',
    [MetricType.QUOTE_EMAIL]: '',
    [MetricType.CUSTOMER_EMAIL]: '',
    [MetricType.CONTACTING_LEAD]: '',
    [MetricType.NEW_LEAD]: '',
    [MetricType.REVENUE]: '',
    [MetricType.CONVERTED_LEAD]: '',
    [MetricType.RECURRING_CUSTOMER]: '',
    [MetricType.NEW_CUSTOMER]: '',
  });

  const [allOptions, setAllOptions] = useState<any[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [users, orgs] = await Promise.all([
        userApi.getUsers(),
        organizationApi.getAll()
      ]);
      
      const userOpts = users.map(u => ({
        key: `user-${u.id}`,
        label: u.fullName || u.username || `Nhân viên ${u.id}`,
        type: 'user',
        id: u.id,
      }));
      
      const orgOpts = orgs.map(o => ({
        key: `org-${o.id}`,
        label: o.name,
        type: 'org',
        id: o.id,
      }));
      
      setAllOptions([...userOpts, ...orgOpts]);

      if (configId) {
        const config = await kpiConfigUseCase.getById(configId);
        if (config) {
          setFormData({
            name: config.name || '',
            status: config.status || 'ACTIVE',
            startDate: config.startDate || '',
            endDate: config.endDate || '',
            description: config.description || '',
          });

          const newTargets = { ...targets };
          config.targets.forEach((t: any) => {
            const kpiKey = (MetricKeyMap as any)[t.metricType] || t.metricType;
            if (Object.values(MetricType).includes(kpiKey as MetricType)) {
              newTargets[kpiKey as MetricType] = t.targetValue === 0 ? '' : t.targetValue.toString();
            }
          });
          setTargets(newTargets);

          const restored = config.assignments.map((a: any) => {
            const isUser = !!a.userId;
            const aid = a.userId || a.organizationId;
            const type = isUser ? 'user' : 'org';
            
            // 🔥 Tìm option tương ứng trong userOpts hoặc orgOpts để lấy label chuẩn (tên thật)
            const matchedOpt = isUser
              ? userOpts.find((u: any) => u.id === aid)
              : orgOpts.find((o: any) => o.id === aid);

            return { 
              key: `${type}-${aid}`, 
              label: matchedOpt ? matchedOpt.label : (isUser ? `NV #${aid}` : `Phòng ban #${aid}`), 
              type, 
              id: aid, 
              commissionPercent: a.commissionPercent !== undefined && a.commissionPercent !== null ? a.commissionPercent : 0 
            };
          });
          setSelectedAssignments(restored);
        }
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  }, [configId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    try {
      const payload: KpiConfigPayload = {
        ...formData,
        targets: Object.entries(targets).map(([type, value]) => ({
          metricType: type,
          targetValue: parseInt(value || '0', 10),
        })),
        assignments: selectedAssignments.map(a => ({
          userId: a.type === 'user' ? a.id : undefined,
          organizationId: a.type === 'org' ? a.id : undefined,
          commissionPercent: a.commissionPercent || 0,
        })),
      };

      await kpiConfigUseCase.save(configId, payload);
      toast.success(configId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      router.push('/kpi-configs');
    } catch (error) {
      toast.error('Lỗi khi lưu.');
    }
  };

  const handleCommissionChange = (key: string, value: string) => {
    const val = parseFloat(value);
    setSelectedAssignments(prev => prev.map(s => 
      s.key === key ? { ...s, commissionPercent: isNaN(val) ? 0 : val } : s
    ));
  };

  return {
    formData, setFormData,
    targets, setTargets,
    allOptions,
    selectedAssignments, setSelectedAssignments,
    isLoading,
    handleSave,
    handleCommissionChange,
    cancel: () => router.push('/kpi-configs')
  };
};
