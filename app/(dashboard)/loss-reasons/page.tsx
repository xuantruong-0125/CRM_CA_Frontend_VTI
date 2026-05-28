import LossReasonListPage from "@/modules/opportunity/loss-reason/LossReasonListPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Lý do thất bại  ",
    description: "Trang quản lý lý do thất bại",
};
export default function LossReasonsPage() {
    return <LossReasonListPage />;
}
