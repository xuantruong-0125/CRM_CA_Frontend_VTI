"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Plus, Check, Eye } from "lucide-react";
import { Category } from "../../types/category.type";
import { CategoryQuickAddModal } from "./CategoryQuickAddModal";
import { CategoryDetailModal } from "./CategoryDetailModal";

interface CategoryComboBoxProps {
  categories: Category[];
  value: number | null;
  onChange: (categoryId: number) => void;
  onCategoryAdded?: (category: Category) => void;
}

export const CategoryComboBox: React.FC<CategoryComboBoxProps> = ({
  categories,
  value,
  onChange,
  onCategoryAdded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === value),
    [categories, value]
  );

  // Giới hạn chỉ lấy tối đa 5 kết quả
  const filteredCategories = useMemo(() => {
    let result = categories;
    if (search.trim()) {
      result = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result.slice(0, 5);
  }, [categories, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (categoryId: number) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearch("");
  };

  const handleQuickAddSuccess = (newCategory: Category) => {
    if (onCategoryAdded) {
      onCategoryAdded(newCategory);
    }
    onChange(newCategory.id);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex gap-1 items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between px-3 py-2 text-sm border border-slate-300 rounded-[5px] bg-white hover:border-slate-400 focus:ring-1 focus:ring-sky-500 transition-all text-slate-900"
        >
          <span className={selectedCategory ? "text-slate-900" : "text-slate-400"}>
            {selectedCategory ? selectedCategory.name : "-- Chọn danh mục --"}
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (value) {
              setIsDetailOpen(true);
            } else {
              alert("Vui lòng chọn danh mục để xem chi tiết!");
            }
          }}
          className="p-2 border border-slate-300 rounded-[5px] bg-white hover:bg-slate-50 text-slate-400 hover:text-sky-600 transition-colors"
          title="Xem chi tiết danh mục"
        >
          <Eye size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-[5px] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              className="flex-1 bg-transparent border-none text-xs focus:ring-0 outline-none text-slate-700"
              autoFocus
            />
          </div>

          <div className="max-h-[220px] overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-sky-50 transition-colors ${
                    value === cat.id ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-700"
                  }`}
                >
                  <span>{cat.name}</span>
                  {value === cat.id && <Check size={14} />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-center text-slate-500 italic">
                Không tìm thấy danh mục nào
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsQuickAddOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-3 text-sm text-sky-600 font-bold border-t border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <Plus size={14} />
            <span>Thêm category mới</span>
          </button>
        </div>
      )}

      <CategoryQuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={handleQuickAddSuccess}
      />

      <CategoryDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        category={selectedCategory || null}
      />
    </div>
  );
};
