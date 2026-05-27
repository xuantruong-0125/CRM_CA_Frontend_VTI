"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Keyboard } from "lucide-react";
import { ProductTable } from "./components/table/ProductTable";
import { useSearchProducts } from "./hooks/useProducts";
import { productApi } from "./api/product.api";
import { TableToolbar } from "./components/shared/TableToolbar";
import { ConfirmDialog } from "./components/shared/ConfirmDialog";
import { useConfirm } from "./hooks/useConfirm";

export const ProductPage = () => {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [filters, setFilters] = useState<any>({});
  const {
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    options: confirmOptions,
    confirm: showConfirm,
    close: closeConfirm,
    handleConfirm
  } = useConfirm();

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    imageUrl: false,
    skuCode: true,
    name: true,
    categoryName: true,
    finalPrice: true,
    isActive: true,
    createdAt: true,
    updatedAt: false,
  });

  const productColumns = [
    { id: "imageUrl", label: "Ảnh sản phẩm" },
    { id: "skuCode", label: "SKU" },
    { id: "name", label: "Tên sản phẩm" },
    { id: "categoryName", label: "Danh mục" },
    { id: "finalPrice", label: "Giá" },
    { id: "isActive", label: "Trạng thái" },
    { id: "createdAt", label: "Ngày tạo" },
    { id: "updatedAt", label: "Ngày cập nhật" },
  ];

  const { data, isLoading, isError, mutate } = useSearchProducts(keyword, pageIndex, pageSize, filters);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // Alt + N: Thêm
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        router.push("/products/create");
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
    alert("Chức năng Import dữ liệu sẽ được triển khai sớm!");
  };

  const handleExport = (format: string) => {
    alert(`Đang xuất dữ liệu định dạng ${format.toUpperCase()}...`);
  };

  const selectedCount = Object.keys(rowSelection).length;

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPageIndex(0);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setPageIndex(0);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPageIndex(0);
  };

  const handleEdit = (id: number) => {
    router.push(`/products/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    showConfirm({
      title: "Xác nhận xóa sản phẩm",
      message: "Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        try {
          await productApi.deleteProduct(id);
          mutate();
        } catch (error) {
          console.error("Failed to delete product", error);
          alert("Xóa thất bại!");
        }
      }
    });
  };

  const handleDeleteSelected = (ids: number[]) => {
    showConfirm({
      title: "Xác nhận xóa nhiều sản phẩm",
      message: `Bạn có chắc chắn muốn xóa ${ids.length} sản phẩm đã chọn? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await Promise.all(ids.map(id => productApi.deleteProduct(id)));
          setRowSelection({});
          mutate();
        } catch (error) {
          console.error("Failed to delete multiple products", error);
          alert("Xóa một số sản phẩm thất bại!");
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
        <span className="text-[18px] font-bold tracking-[0.01em]">Sản phẩm</span>
      </div>
      <div>
        <TableToolbar
          onSearch={handleSearch}
          onFilterApply={handleApplyFilters}
          onFilterReset={handleResetFilters}
          onCreate={() => router.push("/products/create")}
          createLabel="Thêm (Alt+N)"
          placeholder="Tìm kiếm sản phẩm..."
          selectedCount={selectedCount}
          onClearSelection={handleClearSelection}
          onDeleteSelected={performDeleteSelected}
          columns={productColumns}
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
            <ProductTable
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
