// app/(dashboard)/my-kpi/page.tsx
import PersonalKpiPage from "../../modules/personal-kpi/PersonalKpiPage";

import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | KPI của tôi ",
    description: "Trang quản lý KPi cá nhân",
};

export default function MyKpiPage() {
  return <PersonalKpiPage />;
}
