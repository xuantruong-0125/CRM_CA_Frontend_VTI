// app/(dashboard)/my-kpi/page.tsx
import PersonalKpiPage from "../../modules/personal-kpi/PersonalKpiPage";

export const metadata = {
  title: "KPI Của Tôi | CRM VTI",
  description: "Trang theo dõi mục tiêu và tiến độ KPI cá nhân",
};

export default function MyKpiPage() {
  return <PersonalKpiPage />;
}
