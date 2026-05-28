import { ProductPage } from "@/modules/products/ProductPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý sản phẩm",
    description: "Trang quản lý sản phẩm hệ thống",
};
export default function Page() {
  return <ProductPage />;
}
