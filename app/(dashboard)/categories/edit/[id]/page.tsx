"use client";

import { useParams } from "next/navigation";
import { CategoryForm } from "@/modules/products/components/forms/CategoryForm";
import { useCategory } from "@/modules/products/hooks/useCategories";

export default function Page() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string) : null;
  const { category, isLoading, isError } = useCategory(id);

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (isError) return <div className="p-4 text-rose-500">Lỗi khi tải dữ liệu!</div>;

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <CategoryForm initialData={category} isEditMode={true} />
    </div>
  );
}
