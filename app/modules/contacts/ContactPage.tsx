"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";
import { ContactTable } from "./components/table/ContactTable";
import { useContacts } from "./hooks/useContacts";
import { contactApi } from "./api/contact.api";
import { TableToolbar } from "../products/components/shared/TableToolbar";
import { ConfirmDialog } from "../products/components/shared/ConfirmDialog";
import { useConfirm } from "../products/hooks/useConfirm";
import { ContactFilterPopover } from "./components/shared/ContactFilterPopover";

export const ContactPage = () => {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [filters, setFilters] = useState<any>({});
  const [isDataMasked, setIsDataMasked] = useState(false);

  const {
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    options: confirmOptions,
    confirm: showConfirm,
    close: closeConfirm,
    handleConfirm
  } = useConfirm();

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    fullName: true,
    position: true,
    customerName: true,
    phone: true,
    email: true,
    isPrimary: true,
  });

  const contactColumns = [
    { id: "fullName", label: "Họ và tên" },
    { id: "position", label: "Chức vụ" },
    { id: "customerName", label: "Khách hàng" },
    { id: "phone", label: "Số điện thoại" },
    { id: "email", label: "Email" },
    { id: "isPrimary", label: "Loại liên hệ" },
  ];

  const { data, isLoading, isError, mutate } = useContacts(keyword, pageIndex + 1, pageSize, filters);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }

      if (e.altKey && e.key === "n") {
        e.preventDefault();
        router.push("/contacts/create");
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
    router.push(`/contacts/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    showConfirm({
      title: "Xác nhận xóa liên hệ",
      message: "Bạn có chắc chắn muốn xóa liên hệ này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        try {
          await contactApi.deleteContact(id);
          mutate();
        } catch (error) {
          console.error("Failed to delete contact", error);
        }
      }
    });
  };

  const handleDeleteSelected = (ids: number[]) => {
    showConfirm({
      title: "Xác nhận xóa nhiều liên hệ",
      message: `Bạn có chắc chắn muốn xóa ${ids.length} liên hệ đã chọn?`,
      onConfirm: async () => {
        try {
          await contactApi.bulkDeleteContacts(ids);
          setRowSelection({});
          mutate();
        } catch (error) {
          console.error("Failed to delete multiple contacts", error);
        }
      }
    });
  };

  const getSelectedIds = () => {
    return Object.keys(rowSelection).map(index => {
      return data?.items[parseInt(index)].id;
    }).filter(id => id !== undefined) as number[];
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-[rgb(21,0,211)] text-white px-6 py-[10px] rounded-md mb-3 flex items-center">
        <span className="text-[18px] font-bold tracking-[0.01em]">Quản lý liên hệ</span>
      </div>
      <TableToolbar
        onSearch={handleSearch}
        onFilterApply={handleApplyFilters}
        onFilterReset={handleResetFilters}
        FilterComponent={ContactFilterPopover}
        onCreate={() => router.push("/contacts/create")}
        createLabel="Thêm (Alt+N)"
        placeholder="Tìm kiếm liên hệ..."
        selectedCount={Object.keys(rowSelection).length}
        onClearSelection={() => setRowSelection({})}
        onDeleteSelected={() => handleDeleteSelected(getSelectedIds())}
        columns={contactColumns}
        visibleColumns={columnVisibility}
        onColumnToggle={handleColumnToggle}
        isDataMasked={isDataMasked}
        onDataMaskToggle={() => setIsDataMasked(!isDataMasked)}
      />

      <div className="relative">
        {isLoading ? (
          <div className="text-sm text-slate-500 py-10 text-center bg-white rounded-lg border border-slate-200">Đang tải dữ liệu...</div>
        ) : isError ? (
          <div className="text-sm text-rose-500 py-10 text-center bg-white rounded-lg border border-slate-200">Lỗi khi tải dữ liệu!</div>
        ) : (
          <ContactTable
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
            isDataMasked={isDataMasked}
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
