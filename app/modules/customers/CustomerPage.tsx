"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";
import { CustomerTable } from "./components/table/CustomerTable";
import { useCustomers } from "./hooks/useCustomers";
import { customerApi } from "./api/customer.api";
import { TableToolbar } from "../products/components/shared/TableToolbar";
import { ConfirmDialog } from "../products/components/shared/ConfirmDialog";
import { useConfirm } from "../products/hooks/useConfirm";
import { CustomerFilterPopover } from "./components/shared/CustomerFilterPopover";

export const CustomerPage = () => {
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
    customerCode: true,
    name: true,
    type: true,
    phone: true,
    email: true,
    taxCode: true,
  });

  const customerColumns = [
    { id: "customerCode", label: "Mã khách hàng" },
    { id: "name", label: "Tên khách hàng" },
    { id: "type", label: "Loại" },
    { id: "phone", label: "Số điện thoại" },
    { id: "email", label: "Email" },
    { id: "taxCode", label: "Mã số thuế" },
  ];

  const { data, isLoading, isError, mutate } = useCustomers(keyword, pageIndex + 1, pageSize, filters);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }

      if (e.altKey && e.key === "n") {
        e.preventDefault();
        router.push("/customers/create");
      }

      if (e.altKey && e.key === "r") {
        e.preventDefault();
        mutate();
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      if (e.key === "Delete") {
        const selectedIds = getSelectedIds();
        if (selectedIds.length > 0) handleDeleteSelected(selectedIds);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, rowSelection]);

  const handleColumnToggle = (columnId: string) => {
    setColumnVisibility(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

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
    router.push(`/customers/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    showConfirm({
      title: "Xác nhận xóa khách hàng",
      message: "Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        try {
          await customerApi.deleteCustomer(id);
          mutate();
        } catch (error) {
          console.error("Failed to delete customer", error);
        }
      }
    });
  };

  const handleDeleteSelected = (ids: number[]) => {
    showConfirm({
      title: "Xác nhận xóa nhiều khách hàng",
      message: `Bạn có chắc chắn muốn xóa ${ids.length} khách hàng đã chọn?`,
      onConfirm: async () => {
        try {
          await customerApi.bulkDeleteCustomers(ids);
          setRowSelection({});
          mutate();
        } catch (error) {
          console.error("Failed to delete multiple customers", error);
        }
      }
    });
  };

  const getSelectedIds = () => {
    return Object.keys(rowSelection).map(index => {
        const items = data?.items || [];
        return items[parseInt(index)]?.id;
    }).filter(id => id !== undefined) as number[];
  };

  const tableData = data?.items || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      <TableToolbar
        title="Quản lý khách hàng"
        onSearch={handleSearch}
        onFilterApply={handleApplyFilters}
        onFilterReset={handleResetFilters}
        FilterComponent={CustomerFilterPopover}
        onCreate={() => router.push("/customers/create")}
        createLabel="Thêm (Alt+N)"
        placeholder="Tìm kiếm khách hàng..."
        selectedCount={Object.keys(rowSelection).length}
        onClearSelection={() => setRowSelection({})}
        onDeleteSelected={() => handleDeleteSelected(getSelectedIds())}
        columns={customerColumns}
        visibleColumns={columnVisibility}
        onColumnToggle={handleColumnToggle}
      />

      <div className="relative">
        {isLoading ? (
          <div className="text-sm text-slate-500 py-10 text-center bg-white rounded-lg border border-slate-200">Đang tải dữ liệu...</div>
        ) : isError ? (
          <div className="text-sm text-rose-500 py-10 text-center bg-white rounded-lg border border-slate-200">Lỗi khi tải dữ liệu!</div>
        ) : (
          <CustomerTable 
            data={tableData} 
            totalCount={totalItems}
            totalPages={totalPages}
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

      <div className="mt-6 flex items-center gap-6 px-4 py-3 bg-white rounded-[5px] border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
          <Keyboard size={14} className="text-slate-400" />
          Phím tắt:
        </div>
        <div className="flex gap-6 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-sky-600">Alt + N</kbd> Thêm mới
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-slate-700">/</kbd> Tìm kiếm
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-rose-500">Del</kbd> Xóa chọn
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
  );
};
