import React, { useEffect, useState } from "react";
import { X, RotateCcw, ChevronDown, Search } from "lucide-react";
import { categoryApi } from "../../api/category.api";
import { Category } from "../../types/category.type";

interface FilterPopoverProps {
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
  initialFilters?: any;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  onClose,
  onApply,
  onReset,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catSearch, setCatSearch] = useState("");
  const [isCatOpen, setIsCatOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories
    .filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    .slice(0, 5);

  const handleChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 p-5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
        <h3 className="text-sm font-bold text-slate-800">Bộ lọc tìm kiếm</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Danh mục
          </label>
          <div className="relative">
            <button
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 flex items-center justify-between hover:bg-slate-100 transition-all shadow-sm"
            >
              <span className="truncate">
                {filters.categoryId 
                  ? categories.find(c => c.id.toString() === filters.categoryId.toString())?.name || "Đang tải..."
                  : "Tất cả danh mục"}
              </span>
              <ChevronDown size={14} className={`text-slate-500 transition-transform ${isCatOpen ? "rotate-180" : ""}`} />
            </button>

            {isCatOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-40 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm danh mục..."
                    className="w-full h-9 pl-8 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <button
                    onClick={() => {
                      handleChange("categoryId", "");
                      setIsCatOpen(false);
                      setCatSearch("");
                    }}
                    className="w-full text-left px-2 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-md transition-colors"
                  >
                    Tất cả danh mục
                  </button>
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        handleChange("categoryId", cat.id);
                        setIsCatOpen(false);
                        setCatSearch("");
                      }}
                      className={`w-full text-left px-2 py-2 text-sm rounded-md transition-colors ${
                        filters.categoryId?.toString() === cat.id.toString()
                          ? "bg-sky-100 text-sky-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="px-2 py-4 text-center text-xs text-slate-400">
                      Không tìm thấy danh mục
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Trạng thái
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["Active", "Inactive", "Out of Stock"].map((status) => (
              <button
                key={status}
                onClick={() => handleChange("status", status)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium border transition-all ${
                  filters.status === status
                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                    : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Khoảng giá (VNĐ)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Từ"
                className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg text-[13px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                value={filters.minPrice || ""}
                onChange={(e) => handleChange("minPrice", e.target.value)}
              />
            </div>
            <span className="text-slate-500 font-bold">-</span>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Đến"
                className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg text-[13px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                value={filters.maxPrice || ""}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-50">
        <button
          onClick={() => {
            setFilters({});
            onReset();
          }}
          className="flex items-center justify-center gap-1.5 flex-1 h-10 text-[13px] font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
        >
          <RotateCcw size={14} />
          Đặt lại
        </button>
        <button
          onClick={() => onApply(filters)}
          className="flex-1 h-10 bg-sky-600 hover:bg-sky-700 text-white text-[13px] font-bold rounded-lg transition-all shadow-md shadow-sky-100"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};
