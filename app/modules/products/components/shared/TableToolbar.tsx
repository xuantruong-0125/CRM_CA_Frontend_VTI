import React from "react";
import {
  Search,
  Filter,
  Settings2,
  Package,
  X,
  Trash2,
  MoreVertical,
  ChevronDown,
} from "lucide-react";

interface TableToolbarProps {
  title?: string;
  onSearch: (value: string) => void;
  onFilter?: () => void;
  onSettings?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  placeholder?: string;
  // Selection props
  selectedCount?: number;
  onClearSelection?: () => void;
  onDeleteSelected?: () => void;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  onSearch,
  onFilter,
  onSettings,
  onCreate,
  createLabel = "Thêm",
  placeholder = "Tìm kiếm...",
  selectedCount = 0,
  onClearSelection,
  onDeleteSelected,
}) => {
  const isSelectedMode = selectedCount > 0;

  return (
    <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm overflow-hidden h-14">
      {/* 1. Title Section (Left) */}
      {title && (
        <div className="flex items-center gap-1.5 px-3 mr-1 border-r border-slate-100 pr-4 cursor-pointer hover:bg-slate-50 h-full transition-colors group">
          <h1 className="text-[14px] font-bold text-slate-800 whitespace-nowrap">
            {title}
          </h1>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      )}

      {/* Right Group: Selection, Search, Actions (Right Aligned) */}
      <div className="flex items-center gap-3 ml-auto pr-1 flex-shrink-0">
        {/* 2. Selection Actions Bar */}
        {isSelectedMode && (
          <div className="flex items-center bg-sky-50 border border-sky-100 rounded-md px-1 py-1 h-9 animate-in fade-in slide-in-from-left-2 duration-200 flex-shrink-0">
            <button
              onClick={onClearSelection}
              className="p-1 text-sky-600 hover:bg-sky-100 rounded-md transition-colors"
              title="Bỏ chọn"
            >
              <X size={14} />
            </button>
            <span className="text-[12px] font-semibold text-sky-700 px-2 min-w-[70px] whitespace-nowrap">
              Đã chọn {selectedCount}
            </span>
            <div className="h-4 w-px bg-sky-200 mx-1" />
            {onDeleteSelected && (
              <button
                onClick={onDeleteSelected}
                className="flex items-center gap-1 px-2 h-7 text-[12px] font-bold text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              >
                <Trash2 size={13} />
                <span>Xóa</span>
              </button>
            )}
            <button className="p-1 text-slate-400 hover:bg-sky-100 rounded-md transition-colors">
              <MoreVertical size={14} />
            </button>
          </div>
        )}

        {/* 3. Search Input */}
        <div className="relative w-full max-w-[280px] group h-9">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 h-full bg-slate-50 border border-slate-200 text-slate-900 text-[13px] rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all"
            placeholder={placeholder}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* 4. Utility Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFilter || (() => {})}
            className="flex items-center justify-center w-9 h-9 text-slate-500 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 rounded-md transition-all active:scale-95 shadow-sm bg-white"
            title="Lọc"
          >
            <Filter size={17} />
          </button>
          
          <button
            onClick={onSettings || (() => {})}
            className="flex items-center justify-center w-9 h-9 text-slate-500 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 rounded-md transition-all active:scale-95 shadow-sm bg-white"
            title="Cài đặt"
          >
            <Settings2 size={17} />
          </button>

          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 h-9 bg-sky-600 hover:bg-sky-700 text-white text-[13px] font-bold rounded-md transition-all active:scale-95 shadow-md shadow-sky-100 ml-1"
            >
              <Package size={17} />
              <span>{createLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};




