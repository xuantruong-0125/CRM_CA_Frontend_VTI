
import MenuPage from "@/modules/system/menu/MenuPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý menu ",
    description: "Trang quản lý menu hệ thống",
};
export default function Page() {
  return <MenuPage />;
}