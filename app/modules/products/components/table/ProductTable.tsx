import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { Product } from "../../types/product.type";
import { Edit, Trash2, Trash } from "lucide-react";
import { ProductTableRow } from "./ProductTableRow";
import { IndeterminateCheckbox } from "../shared/IndeterminateCheckbox";

interface ProductTableProps {
  data: Product[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDeleteSelected?: (ids: number[]) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ data, onEdit, onDelete, onDeleteSelected }) => {
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-1 flex items-center justify-center">
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
          <div className="px-1 flex items-center justify-center">
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
        accessorKey: "skuCode",
        header: "SKU",
        size: 100,
        minSize: 80,
        cell: (info) => (
          <div className="truncate text-slate-600 font-mono text-[11px]" title={info.getValue() as string}>
            {info.getValue() as string || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        size: 250,
        minSize: 150,
        cell: (info) => (
          <div className="truncate font-semibold text-slate-800" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Danh mục",
        size: 140,
        minSize: 100,
        cell: (info) => (
          <div className="truncate text-slate-600" title={info.getValue() as string}>
            {info.getValue() as string || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "finalPrice",
        header: "Giá mặc định",
        size: 120,
        minSize: 100,
        cell: (info) => {
          const price = info.getValue() as number;
          return (
            <div className="truncate text-slate-700 font-medium">
              {price != null ? price.toLocaleString() : "0"} ₫
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        size: 100,
        minSize: 80,
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
        id: "actions",
        header: "Thao tác",
        size: 80,
        minSize: 80,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(row.original.id)}
              className="p-1 text-sky-600 hover:bg-sky-50 rounded"
              title="Sửa"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
              title="Xóa"
            >
              <Trash2 size={14} />
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
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange" as ColumnResizeMode,
  });

  const selectedRows = table.getSelectedRowModel().flatRows;

  return (
    <div className="space-y-3">
      {selectedRows.length > 0 && onDeleteSelected && (
        <div className="flex items-center justify-between px-4 py-2 bg-sky-50 border border-sky-100 rounded-md animate-in fade-in slide-in-from-top-1">
          <span className="text-xs font-medium text-sky-800">
            Đang chọn {selectedRows.length} sản phẩm
          </span>
          <button
            onClick={() => {
              const ids = selectedRows.map(r => r.original.id);
              onDeleteSelected(ids);
              setRowSelection({});
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded transition-colors shadow-sm"
          >
            <Trash size={14} />
            Xóa mục đã chọn
          </button>
        </div>
      )}

      <div className="w-full overflow-x-auto bg-white border border-slate-200 rounded-md shadow-sm">
        <table
          className="min-w-full text-[13px] text-left table-fixed border-separate border-spacing-0"
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
                    <div className="truncate pr-2" title={typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : undefined}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                    
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
                <ProductTableRow key={row.id} row={row} />
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-slate-500 bg-white text-sm"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

