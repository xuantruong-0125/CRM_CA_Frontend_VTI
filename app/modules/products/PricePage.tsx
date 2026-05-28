"use client";

import React, { useState } from "react";
import { PriceTable } from "./components/table/PriceTable";
import { useSearchPrices } from "./hooks/usePrices";
import { TableToolbar } from "./components/shared/TableToolbar";

export const PricePage = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    productName: true,
    basePrice: true,
    taxRate: true,
    finalPrice: true,
    createdAt: true,
    updatedAt: false,
  });

  const priceColumns = [
    { id: "productName", label: "Sản phẩm" },
    { id: "basePrice", label: "Giá nhập" },
    { id: "taxRate", label: "Thuế" },
    { id: "finalPrice", label: "Giá bán" },
    { id: "createdAt", label: "Ngày tạo" },
    { id: "updatedAt", label: "Ngày cập nhật" },
  ];

  const { data, isLoading, isError, mutate } = useSearchPrices(keyword, pageIndex, pageSize);

  const handleColumnToggle = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleImport = () => {
    alert("Chức năng Import giá sẽ được triển khai sớm!");
  };

  const handleExport = (format: string) => {
    alert(`Đang xuất bảng giá định dạng ${format.toUpperCase()}...`);
  };

  const selectedCount = Object.keys(rowSelection).length;

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPageIndex(0);
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Bar as requested */}
      <div className="mb-4 bg-[rgb(21,0,211)] px-4 py-[7px] rounded-[10px] text-left font-bold text-lg text-white">
        Quản lý giá sản phẩm
      </div>

      <div className="flex-1">
        <TableToolbar
          onSearch={handleSearch}
          placeholder="Tìm kiếm theo sản phẩm..."
          selectedCount={selectedCount}
          onClearSelection={handleClearSelection}
          // Settings props
          columns={priceColumns}
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
          <PriceTable
            data={data?.items || []}
            totalCount={data?.totalItems || 0}
            totalPages={data?.totalPages || 0}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            onRefresh={mutate}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            columnVisibility={columnVisibility}
          />
        )}
      </div>
    </div>
  );
};
