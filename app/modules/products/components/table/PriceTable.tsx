"use client";

import React, { useState, useMemo } from "react";
import { Price, UpdatePriceRequest } from "../../types/price.type";
import { priceApi } from "../../api/price.api";
import { z } from "zod";
import { Check, X, Edit2, Trash } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { IndeterminateCheckbox } from "../shared/IndeterminateCheckbox";

interface PriceTableProps {
  data: Price[];
  onRefresh: () => void;
  onDeleteSelected?: (ids: number[]) => void;
}

const priceSchema = z.object({
  basePrice: z.number().finite("Phải là số").min(0, "Không được âm"),
  taxRate: z.number().finite("Phải là số").min(0, "Không được âm").max(100, "Tối đa 100%"),
});

export const PriceTable: React.FC<PriceTableProps> = ({ data, onRefresh, onDeleteSelected }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ basePrice: string; taxRate: string }>({
    basePrice: "0",
    taxRate: "0",
  });
  const [errors, setErrors] = useState<{ basePrice?: string; taxRate?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const startEdit = (price: Price) => {
    setEditingId(price.id);
    setEditValues({
      basePrice: price.basePrice.toString(),
      taxRate: price.taxRate.toString(),
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrors({});
  };

  const handleSave = async (price: Price) => {
    const numBasePrice = parseFloat(editValues.basePrice);
    const numTaxRate = parseFloat(editValues.taxRate);

    const validation = priceSchema.safeParse({ basePrice: numBasePrice, taxRate: numTaxRate });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        basePrice: fieldErrors.basePrice?.[0],
        taxRate: fieldErrors.taxRate?.[0],
      });
      return;
    }

    setIsSaving(true);
    try {
      const updateReq: UpdatePriceRequest = {
        basePrice: numBasePrice,
        taxRate: numTaxRate,
        effectiveFrom: price.effectiveFrom,
        effectiveTo: price.effectiveTo,
      };
      await priceApi.updatePrice(price.id, updateReq);
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error("Lỗi cập nhật giá:", err);
      alert("Cập nhật thất bại!");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<Price>[]>(
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
        accessorKey: "id",
        header: "ID",
        size: 70,
        minSize: 50,
      },
      {
        accessorKey: "productName",
        header: "Sản phẩm",
        size: 250,
        minSize: 150,
        cell: ({ row }) => (
          <div className="truncate" title={row.original.productName}>
            <div className="font-semibold text-slate-800 truncate">{row.original.productName}</div>
            <div className="text-[10px] text-slate-500 font-mono truncate">{row.original.productSkuCode}</div>
          </div>
        ),
      },
      {
        accessorKey: "basePrice",
        header: "Giá nhập (Cơ bản)",
        size: 150,
        minSize: 100,
        cell: ({ row }) => {
          const item = row.original;
          const isEditing = editingId === item.id;
          return isEditing ? (
            <div className="text-right">
              <input
                type="number"
                className={`w-full text-right px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 text-slate-900 ${errors.basePrice ? "border-rose-500 focus:ring-rose-500" : "border-sky-500 focus:ring-sky-500"
                  }`}
                value={editValues.basePrice}
                onChange={(e) => setEditValues({ ...editValues, basePrice: e.target.value })}
                disabled={isSaving}
              />
              {errors.basePrice && <div className="text-[9px] text-rose-500 mt-0.5">{errors.basePrice}</div>}
            </div>
          ) : (
            <div className="text-right font-medium text-slate-700">{item.basePrice.toLocaleString()} ₫</div>
          );
        },
      },
      {
        accessorKey: "taxRate",
        header: "Thuế (%)",
        size: 100,
        minSize: 70,
        cell: ({ row }) => {
          const item = row.original;
          const isEditing = editingId === item.id;
          return isEditing ? (
            <div className="text-right">
              <input
                type="number"
                className={`w-full text-right px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 text-slate-900 ${errors.taxRate ? "border-rose-500 focus:ring-rose-500" : "border-sky-500 focus:ring-sky-500"
                  }`}
                value={editValues.taxRate}
                onChange={(e) => setEditValues({ ...editValues, taxRate: e.target.value })}
                disabled={isSaving}
              />
              {errors.taxRate && <div className="text-[9px] text-rose-500 mt-0.5">{errors.taxRate}</div>}
            </div>
          ) : (
            <div className="text-right text-slate-600">{item.taxRate}%</div>
          );
        },
      },
      {
        accessorKey: "finalPrice",
        header: "Giá bán",
        size: 150,
        minSize: 100,
        cell: ({ row }) => (
          <div className="text-right font-semibold text-sky-700">{row.original.finalPrice.toLocaleString()} ₫</div>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        size: 100,
        minSize: 100,
        cell: ({ row }) => {
          const item = row.original;
          const isEditing = editingId === item.id;
          return isEditing ? (
            <div className="flex items-center justify-center gap-1">
              <button onClick={() => handleSave(item)} disabled={isSaving} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                <Check size={14} />
              </button>
              <button onClick={cancelEdit} disabled={isSaving} className="p-1 text-slate-500 hover:bg-slate-100 rounded">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button onClick={() => startEdit(item)} className="p-1 text-sky-600 hover:bg-sky-50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={14} />
              </button>
            </div>
          );
        },
      },
    ],
    [editingId, editValues, errors, isSaving]
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
            Đang chọn {selectedRows.length} mục giá
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
                    className="relative py-2 px-3 font-semibold select-none group overflow-hidden border-r border-transparent hover:border-slate-300 transition-colors"
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
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group text-slate-600">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-1.5 px-3 overflow-hidden"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-slate-500 bg-white">
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
