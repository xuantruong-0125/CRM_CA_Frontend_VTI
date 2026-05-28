import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const showLeftDots = currentPage > 4;
      const showRightDots = currentPage < totalPages - 3;

      if (!showLeftDots && showRightDots) {
        // Near beginning: 1 2 3 4 5 ... total
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        // Near end: 1 ... total-4 total-3 total-2 total-1 total
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // Middle: 1 ... curr-1 curr curr+1 ... total
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };


  const handleJumpToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = parseInt(e.currentTarget.value);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        onPageChange(val);
        e.currentTarget.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
      {/* Left side: record info */}
      <div className="text-xs text-slate-600 font-medium">
        Total: {totalCount} items
      </div>

      {/* Right side: controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 text-slate-500 bg-slate-100 hover:bg-sky-500 hover:text-white rounded disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-500 transition-colors"
            title="Trang đầu"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 text-slate-500 bg-slate-100 hover:bg-sky-500 hover:text-white rounded disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-500 transition-colors"
            title="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="text-xs text-slate-600 px-2 font-medium">
            Trang {currentPage} / {totalPages}
          </div>

          <input
            type="text"
            className="w-10 text-center text-xs border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-100"
            onKeyDown={handleJumpToPage}
          />
          <button
            className="px-2 py-1 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
            onClick={(e) => {
              const input = e.currentTarget.previousSibling as HTMLInputElement;
              const val = parseInt(input.value);
              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                onPageChange(val);
                input.value = "";
              }
            }}
          >
            Đi
          </button>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 text-slate-500 bg-slate-100 hover:bg-sky-500 hover:text-white rounded disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-500 transition-colors ml-1"
            title="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 text-slate-500 bg-slate-100 hover:bg-sky-500 hover:text-white rounded disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-500 transition-colors"
            title="Trang cuối"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
