"use client";

import React from "react";
import { flexRender, Row } from "@tanstack/react-table";
import { Product } from "../../types/product.type";

interface ProductTableRowProps {
  row: Row<Product>;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({ row }) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-600">
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
  );
};
