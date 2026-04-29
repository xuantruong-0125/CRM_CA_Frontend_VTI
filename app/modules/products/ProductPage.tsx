"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ProductTable } from "./components/table/ProductTable";
import { useSearchProducts } from "./hooks/useProducts";
import { productApi } from "./api/product.api";
import { TableToolbar } from "./components/shared/TableToolbar";

export const ProductPage = () => {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const { data, isLoading, isError, mutate } = useSearchProducts(keyword, pageIndex, pageSize);

  const selectedCount = Object.keys(rowSelection).length;

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPageIndex(0); // Reset to first page on search
  };

  const handleEdit = (id: number) => {
    router.push(`/products/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productApi.deleteProduct(id);
        mutate(); // Refresh data
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
        setRowSelection({});
        mutate();
      } catch (error) {
        console.error("Failed to delete multiple products", error);
        alert("Xóa một số sản phẩm thất bại!");
      }
    }
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  const performDeleteSelected = () => {
    const ids = Object.keys(rowSelection).map(index => {
      return data?.items[parseInt(index)].id;
    }).filter(id => id !== undefined) as number[];
    
    if (ids.length > 0) {
      handleDeleteSelected(ids);
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <TableToolbar
        title="Quản lý sản phẩm"
        onSearch={handleSearch}
        onCreate={() => router.push("/products/create")}
        createLabel="Thêm"
        placeholder="Tìm kiếm sản phẩm..."
        selectedCount={selectedCount}
        onClearSelection={handleClearSelection}
        onDeleteSelected={performDeleteSelected}
      />

      {isLoading ? (
        <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : isError ? (
        <div className="text-sm text-rose-500">Lỗi khi tải dữ liệu!</div>
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
        />
      )}
    </div>
  );
};
