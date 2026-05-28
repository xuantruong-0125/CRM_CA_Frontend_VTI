import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { Category } from "../../types/category.type";
import { Edit, Trash2, Trash } from "lucide-react";
import { IndeterminateCheckbox } from "../shared/IndeterminateCheckbox";
import { Pagination } from "../shared/Pagination";

interface CategoryTableProps {
  data: Category[];
  totalCount: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDeleteSelected?: (ids: number[]) => void;
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: (selection: any) => void;
  columnVisibility?: Record<string, boolean>;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  data,
  totalCount,
  totalPages,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onDeleteSelected,
  rowSelection,
  onRowSelectionChange,
  columnVisibility = {},
}) => {
  const columns = useMemo<ColumnDef<Category>[]>(
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
        accessorKey: "name",
        header: "Tên danh mục",
        size: 200,
        cell: (info) => (
          <div className="truncate font-medium text-slate-800" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Mô tả",
        size: 300,
        cell: (info) => (
          <div className="truncate text-slate-600" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        size: 100,
        cell: (info) => {
          const isActive = info.getValue() as boolean;
          return (
            <span
              className={`inline-flex items-center px-[10px] py-[3px] rounded-[20px] text-[12px] font-semibold ${
                isActive ? "bg-[#d1fae5] text-[#065f46]" : "bg-[#fee2e2] text-[#991b1b]"
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
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => onEdit(row.original.id)}
              className="w-[30px] h-[30px] flex items-center justify-center border-0 bg-transparent rounded-md text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] cursor-pointer transition-colors"
              title="Sửa"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className="w-[30px] h-[30px] flex items-center justify-center border-0 bg-transparent rounded-md text-[#6b7280] hover:bg-[#fee2e2] hover:text-[#dc2626] cursor-pointer transition-colors"
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
      <div className="w-full overflow-x-auto bg-white border border-[#e5e7eb] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <table
          className="min-w-full text-xs text-left table-fixed border-separate border-spacing-0"
          style={{ width: table.getTotalSize() }}
        >
          <thead className="text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative py-2 px-3 font-bold select-none group text-[13px] overflow-hidden bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] border-r border-white/30 transition-colors"
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
                      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none transition-all group-hover:bg-blue-300 hover:bg-white ${
                        header.column.getIsResizing() ? "bg-white opacity-100" : "opacity-0 group-hover:opacity-100"
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
                  className="border-b border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors text-[#111827] text-[13px]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-[6px] px-[10px] whitespace-nowrap overflow-hidden text-[13px] border-r border-black/10"
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



