import React from "react";
import { X, Download, Upload, Eye, EyeOff, FileSpreadsheet, FileJson } from "lucide-react";

interface ColumnOption {
  id: string;
  label: string;
}

interface SettingsPopoverProps {
  onClose: () => void;
  columns: ColumnOption[];
  visibleColumns: Record<string, boolean>;
  onColumnToggle: (columnId: string) => void;
  onImport?: () => void;
  onExport?: (format: "csv" | "xlsx" | "json") => void;
  isDataMasked?: boolean;
  onDataMaskToggle?: () => void;
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  onClose,
  columns,
  visibleColumns,
  onColumnToggle,
  onImport,
  onExport,
  isDataMasked,
  onDataMaskToggle,
}) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Cấu hình bảng</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Column Management */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
            Hiển thị cột
          </label>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {columns.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors border border-transparent hover:border-slate-100"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns[col.id] !== false}
                  onChange={() => onColumnToggle(col.id)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span className="flex-1 text-[13px] text-slate-600 group-hover:text-slate-900 font-medium">
                  {col.label}
                </span>
                {visibleColumns[col.id] !== false ? (
                  <Eye size={14} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <EyeOff size={14} className="text-slate-300" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Dữ liệu
            </label>
            {onDataMaskToggle && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-700">Mã hóa bảo mật</span>
                <div className="relative inline-block w-8 h-4">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isDataMasked || false} 
                    onChange={onDataMaskToggle} 
                  />
                  <div className={`block w-8 h-4 rounded-full transition-colors ${isDataMasked ? 'bg-sky-500' : 'bg-slate-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-2 h-2 rounded-full transition-transform ${isDataMasked ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onImport}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:border-sky-200 hover:text-sky-600 transition-all active:scale-95"
            >
              <Upload size={14} />
              Nhập Excel
            </button>
            <div className="relative group">
              <button
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-lg text-[12px] font-bold hover:bg-sky-700 transition-all active:scale-95 shadow-sm shadow-sky-100"
              >
                <Download size={14} />
                Xuất file
              </button>
              
              {/* Export Dropdown on Hover */}
              <div className="absolute bottom-full left-0 w-full mb-1 bg-white border border-slate-200 rounded-lg shadow-xl hidden group-hover:block p-1 z-10">
                <button
                  onClick={() => onExport?.("xlsx")}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-sky-600 rounded"
                >
                  <FileSpreadsheet size={12} /> Excel (.xlsx)
                </button>
                <button
                  onClick={() => onExport?.("csv")}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-sky-600 rounded"
                >
                  <FileSpreadsheet size={12} /> CSV (.csv)
                </button>
                <button
                  onClick={() => onExport?.("json")}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-sky-600 rounded"
                >
                  <FileJson size={12} /> JSON (.json)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="px-4 py-2 bg-slate-50 text-[10px] text-slate-400 text-center italic">
        Các thay đổi về hiển thị cột sẽ được lưu tự động
      </div>
    </div>
  );
};
