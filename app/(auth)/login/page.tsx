import LoginPage from "@/modules/auth/LoginPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Đăng nhập ",
    description: "Trang quản lý menu hệ thống",
};
export default function Page() {
    return <LoginPage />;
}