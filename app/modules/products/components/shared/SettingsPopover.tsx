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
    <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
        <h3 className="text-xl font-normal text-slate-800 uppercase leading-tight max-w-[150px]">
          Cấu hình bảng
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Column Management */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
            Hiển thị cột
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {columns.map((col) => (
              <label
                key={col.id}
                className="flex flex-col p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-sky-300 transition-colors group relative"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.id] !== false}
                    onChange={() => onColumnToggle(col.id)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] text-slate-600 group-hover:text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {col.label}
                  </span>
                </div>
                {visibleColumns[col.id] === false && (
                  <EyeOff size={12} className="text-slate-300 mt-1 absolute bottom-1.5 left-2" />
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
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-sky-200 transition-all active:scale-95 text-slate-700"
            >
              <Upload size={16} className="text-slate-500" />
              <span className="text-[12px] font-medium whitespace-nowrap">Nhập Excel</span>
            </button>
            <div className="relative group">
              <button
                className="w-full flex flex-col items-center justify-center gap-1.5 p-3 bg-[#2d7dca] text-white rounded-lg hover:bg-[#256bb1] transition-all active:scale-95 shadow-sm"
              >
                <Download size={16} />
                <span className="text-[12px] font-medium whitespace-nowrap">Xuất file</span>
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
