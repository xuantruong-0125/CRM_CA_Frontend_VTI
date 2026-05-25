// app/(dashboard)/system/organizations/page.tsx

import OrganizationPage from "@/modules/system/organization/OrganizationPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý tổ chức",
    description: "Trang quản lý menu hệ thống",
};
export default function Page() {
  return <OrganizationPage />;
}

