
import RolePage from "@/modules/system/role/RolePage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý chức vụ",
    description: "Trang quản lý menu hệ thống",
};
export default function Page() {
  return <RolePage />;
}