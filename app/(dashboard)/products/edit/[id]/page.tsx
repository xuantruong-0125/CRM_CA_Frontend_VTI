"use client";

import { useParams } from "next/navigation";
import { ProductDetailPage } from "@/modules/products/ProductDetailPage";
import { useProduct } from "@/modules/products/hooks/useProducts";

export default function Page() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string) : null;
  const { product, isLoading, isError } = useProduct(id);

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (isError) return <div className="p-4 text-rose-500">Lỗi khi tải dữ liệu!</div>;

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <ProductDetailPage initialData={product} isEditMode={true} />
    </div>
  );
}
