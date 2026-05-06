
import UserPage from "@/modules/system/user/UserPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý người dùng ",
    description: "Trang quản lý menu hệ thống",
};
export default function Page() {
  return <UserPage />;
}