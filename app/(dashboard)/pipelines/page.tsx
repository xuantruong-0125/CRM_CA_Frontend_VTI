import PipelineListPage from "@/modules/opportunity/pipeline/PipelineListPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quy trình bán hàng",
    description: "Trang quản quy trình bán hàng",
};
export default function PipelinesPage() {
    return <PipelineListPage />;
}
