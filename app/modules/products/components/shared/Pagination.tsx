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
      <div className="text-xs text-slate-500 font-medium">
        Hiển thị <span className="text-slate-900">{Math.min(pageSize, totalCount)}</span>/<span className="text-slate-900">{totalCount}</span>
      </div>

      {/* Right side: controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Page size selector */}
        <div className="flex items-center gap-2 mr-2">
          <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Số dòng:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-xs bg-white border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium cursor-pointer hover:border-slate-300"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded p-0.5 shadow-sm">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1 text-slate-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="Trang đầu"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 text-slate-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors border-r border-slate-200 mr-1"
            title="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-0.5 mx-1">
            {getPageNumbers().map((p, i) => (
              <React.Fragment key={i}>
                {p === "..." ? (
                  <span className="px-1.5 text-slate-400 text-xs font-bold">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(p as number)}
                    className={`min-w-[28px] h-[28px] flex items-center justify-center text-xs font-semibold rounded transition-all ${
                      currentPage === p
                        ? "bg-sky-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-sky-600"
                    }`}
                  >
                    {p}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 text-slate-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors border-l border-slate-200 ml-1"
            title="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 text-slate-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="Trang cuối"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        {/* Jump to page */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Đến:</span>
          <input
            type="text"
            placeholder="Số trang"
            className="w-16 text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 placeholder:text-slate-300 font-medium"
            onKeyDown={handleJumpToPage}
          />
        </div>
      </div>
    </div>
  );
};
