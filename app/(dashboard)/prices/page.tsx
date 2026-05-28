import { PricePage } from "@/modules/products/PricePage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý bảng giá ",
    description: "Trang quản lý bảng giá sản phẩm",
};
export default function Page() {
  return <PricePage />;
}
