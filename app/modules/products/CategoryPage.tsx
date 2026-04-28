"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CategoryTable } from "./components/table/CategoryTable";
import { useSearchCategories } from "./hooks/useCategories";
import { categoryApi } from "./api/category.api";

export const CategoryPage = () => {
  const router = useRouter();
  // Call API for page 0, size 50 for now
  const { data, isLoading, isError, mutate } = useSearchCategories("", 0, 50);

  const handleEdit = (id: number) => {
    router.push(`/categories/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryApi.deleteCategory(id);
        mutate(); // Refresh data
      } catch (error) {
        console.error("Failed to delete category", error);
        alert("Xóa thất bại!");
      }
    }
  };

  const handleDeleteSelected = async (ids: number[]) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} danh mục đã chọn?`)) {
      try {
        await Promise.all(ids.map(id => categoryApi.deleteCategory(id)));
        mutate();
      } catch (error) {
        console.error("Failed to delete multiple categories", error);
        alert("Xóa một số danh mục thất bại!");
      }
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản lý danh mục</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách tất cả danh mục sản phẩm trong hệ thống</p>
        </div>
        <button
          onClick={() => router.push("/categories/create")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded shadow-sm transition-colors"
        >
          <Plus size={16} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : isError ? (
        <div className="text-sm text-rose-500">Lỗi khi tải dữ liệu!</div>
      ) : (
        <CategoryTable 
          data={data?.items || []} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          onDeleteSelected={handleDeleteSelected}
        />
      )}
    </div>
  );
};
