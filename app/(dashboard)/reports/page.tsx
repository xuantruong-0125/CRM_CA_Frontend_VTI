// app/(dashboard)/reports/page.tsx

import { ReportsPage } from "@/modules/reports";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Báo cáo KPI",
    description: "Trang quản báo cáo hệ thống",
};
export default function Page() {
  return <ReportsPage />;
}
