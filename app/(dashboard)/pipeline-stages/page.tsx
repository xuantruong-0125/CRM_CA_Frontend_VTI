import PipelineStageListPage from "@/modules/opportunity/pipeline-stage/PipelineStageListPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý giai đoạn ",
    description: "Trang quản lý giai đoạn quy trình",
};
export default function PipelineStagesPage() {
    return <PipelineStageListPage />;
}
