import React, { useState } from "react";
import { X, RotateCcw, Building2, User } from "lucide-react";

interface CustomerFilterPopoverProps {
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
  initialFilters?: any;
}

export const CustomerFilterPopover: React.FC<CustomerFilterPopoverProps> = ({
  onClose,
  onApply,
  onReset,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (key: string, value: any) => {
    const newValue = filters[key] === value ? undefined : value;
    setFilters((prev: any) => ({ ...prev, [key]: newValue }));
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
        <h3 className="text-sm font-bold text-slate-800">Bộ lọc khách hàng</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Type Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
            Loại khách hàng
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleChange("type", "B2B")}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-bold border transition-all ${
                filters.type === "B2B"
                  ? "bg-purple-600 border-purple-600 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              <Building2 size={14} />
              B2B
            </button>
            <button
              onClick={() => handleChange("type", "B2C")}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-bold border transition-all ${
                filters.type === "B2C"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600"
              }`}
            >
              <User size={14} />
              B2C
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-50">
        <button
          onClick={() => {
            setFilters({});
            onReset();
          }}
          className="flex items-center justify-center gap-1.5 flex-1 h-9 text-[12px] font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <RotateCcw size={14} />
          Xóa lọc
        </button>
        <button
          onClick={() => onApply(filters)}
          className="flex-1 h-9 bg-sky-600 hover:bg-sky-700 text-white text-[12px] font-bold rounded-lg transition-all shadow-md shadow-sky-100"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};
