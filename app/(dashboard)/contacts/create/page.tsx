import { Suspense } from 'react';
import { ContactDetailPage } from "@/modules/contacts/ContactDetailPage";

export default function Page() {
  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <Suspense fallback={<div>Đang tải...</div>}>
        <ContactDetailPage />
      </Suspense>
    </div>
  );
}
