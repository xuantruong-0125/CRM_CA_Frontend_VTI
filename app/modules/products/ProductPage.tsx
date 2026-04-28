"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ProductTable } from "./components/table/ProductTable";
import { useSearchProducts } from "./hooks/useProducts";
import { productApi } from "./api/product.api";

export const ProductPage = () => {
  const router = useRouter();
  // Fetch products with a page size of 15 as requested
  const { data, isLoading, isError, mutate } = useSearchProducts("", 0, 15);

  const handleEdit = (id: number) => {
    router.push(`/products/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productApi.deleteProduct(id);
        mutate();
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Xóa thất bại!");
      }
    }
  };

  const handleDeleteSelected = async (ids: number[]) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} sản phẩm đã chọn?`)) {
      try {
        await Promise.all(ids.map(id => productApi.deleteProduct(id)));
        mutate();
      } catch (error) {
        console.error("Failed to delete multiple products", error);
        alert("Xóa một số sản phẩm thất bại!");
      }
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản lý sản phẩm</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách sản phẩm trung tâm (Hiển thị 15 dòng)</p>
        </div>
        <button
          onClick={() => router.push("/products/create")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded shadow-sm transition-colors"
        >
          <Plus size={16} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : isError ? (
        <div className="text-sm text-rose-500">Lỗi khi tải dữ liệu!</div>
      ) : (
        <ProductTable 
          data={data?.items || []} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          onDeleteSelected={handleDeleteSelected}
        />
      )}
    </div>
  );
};
