import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { Product } from "../../types/product.type";
import { Edit, Trash2 } from "lucide-react";
import { IndeterminateCheckbox } from "../shared/IndeterminateCheckbox";
import { Pagination } from "../shared/Pagination";

interface ProductTableProps {
  data: Product[];
  totalCount: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: (selection: any) => void;
  columnVisibility?: Record<string, boolean>;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  data,
  totalCount,
  totalPages,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  rowSelection,
  onRowSelectionChange,
  columnVisibility = {},
}) => {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center w-full h-full">
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllPageRowsSelected(),
                indeterminate: table.getIsSomePageRowsSelected(),
                onChange: (e) => {
                  if (table.getIsSomePageRowsSelected()) {
                    table.toggleAllPageRowsSelected(false);
                  } else {
                    table.getToggleAllPageRowsSelectedHandler()(e);
                  }
                },
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center w-full h-full">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
        size: 40,
        minSize: 40,
      },
      {
        accessorKey: "imageUrl",
        header: "Ảnh",
        size: 60,
        cell: (info) => (
          <div className="flex items-center justify-center w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
            {info.getValue() ? (
              <img
                src={info.getValue() as string}
                alt="Product"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                }}
              />
            ) : (
              <div className="text-[10px] text-slate-400 font-bold uppercase">No Pic</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "skuCode",
        header: "SKU",
        size: 100,
        cell: (info) => <div className="font-mono text-slate-600 uppercase">{info.getValue() as string}</div>,
      },
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        size: 250,
        cell: (info) => (
          <div className="truncate font-semibold text-slate-800" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Danh mục",
        size: 150,
        cell: (info) => <div className="truncate text-slate-600">{info.getValue() as string}</div>,
      },
      {
        accessorKey: "finalPrice",
        header: "Giá sản phẩm",
        size: 120,
        cell: (info) => {
          const price = info.getValue() as number;
          return (
            <div className="font-bold text-sky-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(price || 0)}
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        size: 100,
        cell: (info) => {
          const isActive = info.getValue() as boolean;
          return (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        size: 150,
        cell: (info) => {
          const dateStr = info.getValue() as string;
          if (!dateStr) return "-";
          const date = new Date(dateStr);
          return (
            <div className="text-slate-500 text-[11px]">
              {date.toLocaleDateString("vi-VN")} {date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
            </div>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Ngày cập nhật",
        size: 150,
        cell: (info) => {
          const dateStr = info.getValue() as string;
          if (!dateStr) return "-";
          const date = new Date(dateStr);
          return (
            <div className="text-slate-500 text-[11px]">
              {date.toLocaleDateString("vi-VN")} {date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        size: 100,
        minSize: 100,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(row.original.id)}
              className="p-1 text-sky-600 hover:bg-sky-50 rounded"
              title="Sửa"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange" as ColumnResizeMode,
  });

  return (
    <div className="space-y-3">
      <div className="w-full overflow-x-auto bg-white border border-slate-200 rounded-md shadow-sm">
        <table
          className="min-w-full text-xs text-left table-fixed border-separate border-spacing-0"
          style={{ width: table.getTotalSize() }}
        >
          <thead className="text-slate-700 bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative py-1.5 px-2 font-semibold select-none group text-xs overflow-hidden border-r border-transparent hover:border-slate-200 transition-colors"
                    style={{ width: header.getSize() }}
                  >
                    {header.id === "select" ? (
                      flexRender(header.column.columnDef.header, header.getContext())
                    ) : (
                      <div className="truncate pr-2" title={typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : undefined}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                    
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none transition-all group-hover:bg-slate-300 hover:bg-sky-500 ${
                        header.column.getIsResizing() ? "bg-sky-600 opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-600"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-1.5 px-2 whitespace-nowrap overflow-hidden"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-slate-500 bg-white"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pageIndex + 1}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={(page) => onPageChange(page - 1)}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
