import { ContactPage } from "@/modules/contacts/ContactPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý liên hệ ",
    description: "Trang quản lý liên hệ khách hàng",
};
export default function Page() {
  return <ContactPage />;
}
