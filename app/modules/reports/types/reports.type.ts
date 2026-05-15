export interface MetricValue {
  actual: number;
  target: number;
  progress?: number;
}

export interface UserKpiRow {
  userId: number;
  userName: string;
  organizationName: string;
  metricValues: MetricValue[];
  doanhSo: MetricValue;
  hoaHong: number;
}

export interface DashboardData {
  totalDoanhSo: number;
  targetDoanhSo: number;
  totalHoaHong: number;
  
  khtnMoi: MetricValue;
  khtnLienHe: MetricValue;
  khtnChuyenDoi: MetricValue;
  khMoiMua: MetricValue;
  khCuQuayLai: MetricValue;
  
  cuocGoi: MetricValue;
  cuocGap: MetricValue;
  cuocGoiTongDai: MetricValue;
  emailBaoGia: MetricValue;
  emailGuiKh: MetricValue;
  
  monthLabels: string[];
  monthlyNewLeads: number[];
  
  tiLeLienHe: number;
  tiLeChuyenDoi: number;
  tiLeDoanhThu: number;
  
  userName: string;
  kpiConfigName: string;
}

export const METRIC_SHORT_LABELS = [
  "KH MỚI", "KH ĐANG\nLIÊN HỆ", "KH ĐÃ\nCHUYỂN ĐỔI",
  "KH MỚI\nMUA HÀNG", "KH CŨ\nQUAY LẠI",
  "CUỘC\nGỌI", "CUỘC\nGẶP", "CUỘC GỌI\nTỒNG ĐÀI",
  "EMAIL\nBÁO GIÁ", "EMAIL\nGỬI KH", "DOANH SỐ"
];
