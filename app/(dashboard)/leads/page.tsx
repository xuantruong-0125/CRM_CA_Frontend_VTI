import LeadListPage from "@/modules/lead/components/LeadListPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Khách hàng tiềm năng ",
    description: "Trang quản lý khách hàng tiềm năng",
};
export default function LeadsPage() {
  return <LeadListPage />;
}
