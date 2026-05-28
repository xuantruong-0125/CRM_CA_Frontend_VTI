import { CategoryPage } from "@/modules/products/CategoryPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý danh mục sản phẩm ",
    description: "Trang quản lý danh mục sản phẩm hệ thống",
};
export default function Page() {
  return <CategoryPage />;
}
