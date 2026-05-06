import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { Customer } from "../../types/customer.type";
import { Edit, Trash2, Building2, Phone, Mail, FileText, Hash } from "lucide-react";
import { IndeterminateCheckbox } from "../../../products/components/shared/IndeterminateCheckbox";
import { Pagination } from "../../../products/components/shared/Pagination";

interface CustomerTableProps {
  data: Customer[];
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

export const CustomerTable: React.FC<CustomerTableProps> = ({
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
  const columns = useMemo<ColumnDef<Customer>[]>(
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
        accessorKey: "customerCode",
        header: "Mã khách hàng",
        size: 130,
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Hash size={12} className="text-slate-400" />
            <span className="font-medium text-slate-700">{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Tên khách hàng",
        size: 250,
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 size={14} />
            </div>
            <div className="truncate font-semibold text-slate-800" title={info.getValue() as string}>
              {info.getValue() as string}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Loại",
        size: 80,
        cell: (info) => {
          const type = info.getValue() as string;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                type === 'B2B' 
                  ? "bg-purple-100 text-purple-700 border border-purple-200" 
                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Số điện thoại",
        size: 130,
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Phone size={12} className="text-slate-400" />
            {info.getValue() as string || "-"}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <Mail size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{info.getValue() as string || "-"}</span>
          </div>
        ),
      },
      {
        accessorKey: "taxCode",
        header: "Mã số thuế",
        size: 130,
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-slate-600">
            <FileText size={12} className="text-slate-400" />
            {info.getValue() as string || "-"}
          </div>
        ),
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
