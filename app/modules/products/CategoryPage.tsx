"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Keyboard } from "lucide-react";
import { TableToolbar } from "./components/shared/TableToolbar";
import { CategoryTable } from "./components/table/CategoryTable";
import { useSearchCategories } from "./hooks/useCategories";
import { categoryApi } from "./api/category.api";
import { ConfirmDialog } from "./components/shared/ConfirmDialog";
import { useConfirm } from "./hooks/useConfirm";

export const CategoryPage = () => {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const {
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    options: confirmOptions,
    confirm: showConfirm,
    close: closeConfirm,
    handleConfirm
  } = useConfirm();

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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }

      // Alt + N: Thêm
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        router.push("/categories/create");
      }

      // Alt + R: Làm mới
      if (e.altKey && e.key === "r") {
        e.preventDefault();
        mutate();
      }

      // /: Focus tìm kiếm
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // Delete: Xóa mục đã chọn
      if (e.key === "Delete") {
        const selectedIds = getSelectedIds();
        if (selectedIds.length > 0) {
          handleDeleteSelected(selectedIds);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, rowSelection]);

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
    setPageIndex(0);
  };

  const handleEdit = (id: number) => {
    router.push(`/categories/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    showConfirm({
      title: "Xác nhận xóa danh mục",
      message: "Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        try {
          await categoryApi.deleteCategory(id);
          mutate();
        } catch (error) {
          console.error("Failed to delete category", error);
          alert("Xóa thất bại!");
        }
      }
    });
  };

  const handleDeleteSelected = (ids: number[]) => {
    showConfirm({
      title: "Xác nhận xóa nhiều danh mục",
      message: `Bạn có chắc chắn muốn xóa ${ids.length} danh mục đã chọn? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await Promise.all(ids.map(id => categoryApi.deleteCategory(id)));
          setRowSelection({});
          mutate();
        } catch (error) {
          console.error("Failed to delete multiple categories", error);
          alert("Xóa một số danh mục thất bại!");
        }
      }
    });
  };

  const getSelectedIds = () => {
    return Object.keys(rowSelection).map(index => {
      return data?.items[parseInt(index)].id;
    }).filter(id => id !== undefined) as number[];
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  const performDeleteSelected = () => {
    const ids = getSelectedIds();
    if (ids.length > 0) {
      handleDeleteSelected(ids);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-[rgb(21,0,211)] text-white px-6 py-[10px] rounded-md mb-3 flex items-center">
        <span className="text-[18px] font-bold tracking-[0.01em]">Danh mục</span>
      </div>
      <div>
        <TableToolbar
          onSearch={handleSearch}
          onCreate={() => router.push("/categories/create")}
          createLabel="Thêm (Alt+N)"
          placeholder="Tìm kiếm danh mục..."
          selectedCount={selectedCount}
          onClearSelection={handleClearSelection}
          onDeleteSelected={performDeleteSelected}
          columns={categoryColumns}
          visibleColumns={columnVisibility}
          onColumnToggle={handleColumnToggle}
          onImport={handleImport}
          onExport={handleExport}
        />

        <div className="relative">
          {isLoading ? (
            <div className="text-sm text-slate-500 py-10 text-center bg-white rounded-lg border border-slate-200">Đang tải dữ liệu...</div>
          ) : isError ? (
            <div className="text-sm text-rose-500 py-10 text-center bg-white rounded-lg border border-slate-200">Lỗi khi tải dữ liệu!</div>
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

        {/* Shortcut Guide Footer */}
        <div className="mt-6 flex items-center gap-6 px-4 py-3 bg-white rounded-[5px] border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest shrink-0">
            <Keyboard size={14} className="text-slate-400" />
            Phím tắt bảng:
          </div>
          <div className="flex gap-6 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-sky-600">Alt + N</kbd> Thêm (Alt+N)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-slate-700">/</kbd> Tìm kiếm
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-slate-700">Alt + R</kbd> Làm mới
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-rose-500">Del</kbd> Xóa mục chọn
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-slate-700">Esc</kbd> Thoát nhập
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          isLoading={isConfirmLoading}
          title={confirmOptions.title}
          message={confirmOptions.message}
          onClose={closeConfirm}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};
