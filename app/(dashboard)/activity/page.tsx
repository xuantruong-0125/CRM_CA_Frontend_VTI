import { Suspense } from 'react';
import ActivityPage from '@/modules/activity/ActivityPage'; 
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý hoạt động",
    description: "Trang quản lý hoạt động hệ thống",
};
export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải danh sách hoạt động...</div>}>
      <ActivityPage />
    </Suspense>
  );
}