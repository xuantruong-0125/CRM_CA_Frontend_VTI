"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { TableToolbar } from "./components/shared/TableToolbar";
import { CategoryTable } from "./components/table/CategoryTable";
import { useSearchCategories } from "./hooks/useCategories";
import { categoryApi } from "./api/category.api";

export const CategoryPage = () => {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    name: true,
    description: true,
    isActive: true,
    createdAt: true,
    updatedAt: false,
  });

  const categoryColumns = [
    { id: "name", label: "Tên danh mục" },
    { id: "description", label: "Mô tả" },
    { id: "isActive", label: "Trạng thái" },
    { id: "createdAt", label: "Ngày tạo" },
    { id: "updatedAt", label: "Ngày cập nhật" },
  ];

  const { data, isLoading, isError, mutate } = useSearchCategories(keyword, pageIndex, pageSize);

  const handleColumnToggle = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleImport = () => {
    alert("Chức năng Import danh mục sẽ được triển khai sớm!");
  };

  const handleExport = (format: string) => {
    alert(`Đang xuất danh mục định dạng ${format.toUpperCase()}...`);
  };

  const selectedCount = Object.keys(rowSelection).length;

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPageIndex(0); // Reset to first page on search
  };

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
        setRowSelection({});
        mutate();
      } catch (error) {
        console.error("Failed to delete multiple categories", error);
        alert("Xóa một số danh mục thất bại!");
      }
    }
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  const performDeleteSelected = () => {
    const ids = Object.keys(rowSelection).map(index => {
      // rowSelection keys are row indices in the current page
      return data?.items[parseInt(index)].id;
    }).filter(id => id !== undefined) as number[];
    
    if (ids.length > 0) {
      handleDeleteSelected(ids);
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <TableToolbar
        title="Quản lý danh mục"
        onSearch={handleSearch}
        onCreate={() => router.push("/categories/create")}
        createLabel="Thêm"
        placeholder="Tìm kiếm danh mục..."
        selectedCount={selectedCount}
        onClearSelection={handleClearSelection}
        onDeleteSelected={performDeleteSelected}
        // Settings props
        columns={categoryColumns}
        visibleColumns={columnVisibility}
        onColumnToggle={handleColumnToggle}
        onImport={handleImport}
        onExport={handleExport}
      />

      {isLoading ? (
        <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : isError ? (
        <div className="text-sm text-rose-500">Lỗi khi tải dữ liệu!</div>
      ) : (
        <CategoryTable 
          data={data?.items || []} 
          totalCount={data?.totalItems || 0}
          totalPages={data?.totalPages || 0}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onEdit={handleEdit} 
          onDelete={handleDelete}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          columnVisibility={columnVisibility}
        />
      )}
    </div>
  );
};


