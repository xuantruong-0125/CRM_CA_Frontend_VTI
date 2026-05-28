// app/(dashboard)/kpi-configs/page.tsx

import { KpiConfigListPage } from "@/modules/kpi-config";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Thiết lập KPI ",
    description: "Trang quản lý KPI thống",
};
export default function Page() {
  return <KpiConfigListPage />;
}
