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

  const { data, isLoading, isError, mutate } = useSearchPrices(keyword, pageIndex, pageSize);

  const selectedCount = Object.keys(rowSelection).length;

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPageIndex(0);
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <TableToolbar
        title="Quản lý giá sản phẩm"
        onSearch={handleSearch}
        placeholder="Tìm kiếm theo sản phẩm..."
        selectedCount={selectedCount}
        onClearSelection={handleClearSelection}
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
        />
      )}
    </div>
  );
};
