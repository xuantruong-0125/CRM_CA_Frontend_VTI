"use client";

import { useParams } from "next/navigation";
import { CustomerDetailPage } from "@/modules/customers/CustomerDetailPage";
import { useCustomer } from "@/modules/customers/hooks/useCustomers";

export default function Page() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string) : null;
  const { customer, isLoading, isError } = useCustomer(id);

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (isError) return <div className="p-4 text-rose-500">Lỗi khi tải dữ liệu!</div>;

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <CustomerDetailPage initialData={customer} isEditMode={true} />
    </div>
  );
}
