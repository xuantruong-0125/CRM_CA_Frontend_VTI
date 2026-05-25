// app/modules/kpi-config/types/kpi-config.type.ts

export enum MetricType {
  CALL_COUNT = 'Số cuộc gọi',
  MEETING_COUNT = 'Số cuộc gặp',
  SWITCHBOARD_CALL = 'Số cuộc gọi tổng đài',
  QUOTE_EMAIL = 'Số email báo giá',
  CUSTOMER_EMAIL = 'Số email gửi kh',
  CONTACTING_LEAD = 'Số KHTN đang liên hệ',
  NEW_LEAD = 'Số KHTN mới',
  REVENUE = 'Doanh số',
  CONVERTED_LEAD = 'Số KHTN đã chuyển đổi',
  RECURRING_CUSTOMER = 'Số KH cũ quay lại mua',
  NEW_CUSTOMER = 'Số KH mới mua hàng'
}

// Map từ mã Tiếng Anh sang Tiếng Việt để hỗ trợ dữ liệu cũ
export const MetricKeyMap: Record<string, MetricType> = {
  'CALL_COUNT': MetricType.CALL_COUNT,
  'MEETING_COUNT': MetricType.MEETING_COUNT,
  'SWITCHBOARD_CALL': MetricType.SWITCHBOARD_CALL,
  'QUOTE_EMAIL': MetricType.QUOTE_EMAIL,
  'CUSTOMER_EMAIL': MetricType.CUSTOMER_EMAIL,
  'CONTACTING_LEAD': MetricType.CONTACTING_LEAD,
  'NEW_LEAD': MetricType.NEW_LEAD,
  'REVENUE': MetricType.REVENUE,
  'CONVERTED_LEAD': MetricType.CONVERTED_LEAD,
  'RECURRING_CUSTOMER': MetricType.RECURRING_CUSTOMER,
  'NEW_CUSTOMER': MetricType.NEW_CUSTOMER,
};

// MetricLabels giờ chỉ là alias cho chính giá trị enum
export const MetricLabels: Record<MetricType, string> = {
  [MetricType.CALL_COUNT]: MetricType.CALL_COUNT,
  [MetricType.MEETING_COUNT]: MetricType.MEETING_COUNT,
  [MetricType.SWITCHBOARD_CALL]: MetricType.SWITCHBOARD_CALL,
  [MetricType.QUOTE_EMAIL]: MetricType.QUOTE_EMAIL,
  [MetricType.CUSTOMER_EMAIL]: MetricType.CUSTOMER_EMAIL,
  [MetricType.CONTACTING_LEAD]: MetricType.CONTACTING_LEAD,
  [MetricType.NEW_LEAD]: MetricType.NEW_LEAD,
  [MetricType.REVENUE]: MetricType.REVENUE,
  [MetricType.CONVERTED_LEAD]: MetricType.CONVERTED_LEAD,
  [MetricType.RECURRING_CUSTOMER]: MetricType.RECURRING_CUSTOMER,
  [MetricType.NEW_CUSTOMER]: MetricType.NEW_CUSTOMER,
};


export interface KpiTarget {
  id?: number;
  metricType: MetricType | string;
  targetValue: number;
}

export interface KpiAssignment {
  id?: number;
  userId?: number;
  organizationId?: number;
  commissionPercent?: number;
}

export interface KpiConfig {
  id?: number;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  createdAt?: string;
  targets: KpiTarget[];
  assignments: KpiAssignment[];
}

export interface KpiConfigPayload {
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  targets: { metricType: string; targetValue: number }[];
  assignments: { userId?: number; organizationId?: number; commissionPercent?: number }[];
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
