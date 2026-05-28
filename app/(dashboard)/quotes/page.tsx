import QuoteListPage from "@/modules/quotes/QuoteListPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý báo giá ",
    description: "Trang quản lý báo giá hệ thống",
};
export default function QuotesPage() {
    return <QuoteListPage />;
}
