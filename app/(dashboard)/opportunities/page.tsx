import OpportunityListPage from "@/modules/opportunity/OpportunityListPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Cơ hội bán hàng",
    description: "Trang quản cơ hội bán hàng",
};
export default function OpportunitiesPage() {
    return <OpportunityListPage />;
}
