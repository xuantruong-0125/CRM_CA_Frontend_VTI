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
}) => {
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<Category>[]>(
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
                  // Custom logic: if indeterminate, deselect all
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
        accessorKey: "id",
        header: "ID",
        size: 60,
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
            Đang chọn {selectedRows.length} danh mục
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


