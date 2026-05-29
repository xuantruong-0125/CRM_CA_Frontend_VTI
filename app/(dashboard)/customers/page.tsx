
import CustomerListPage from "@/modules/customer/components/CustomerListPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý khách hàng ",
    description: "Trang quản lý khách hàng",
};
export default function CustomersPage() {
  return <CustomerListPage />;
}
