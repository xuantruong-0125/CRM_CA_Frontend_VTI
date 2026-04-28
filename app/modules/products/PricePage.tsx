"use client";

import React from "react";
import { PriceTable } from "./components/table/PriceTable";
import { useSearchPrices } from "./hooks/usePrices";

export const PricePage = () => {
  const { data, isLoading, isError, mutate } = useSearchPrices("", 0, 15);

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">Quản lý giá</h1>
        <p className="text-xs text-slate-500 mt-1">Cập nhật giá và chiết khấu (Inline Edit)</p>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : isError ? (
        <div className="text-sm text-rose-500">Lỗi khi tải dữ liệu!</div>
      ) : (
        <PriceTable data={data?.items || []} onRefresh={mutate} />
      )}
    </div>
  );
};
