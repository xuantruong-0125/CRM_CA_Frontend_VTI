"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { categoryApi } from "../../api/category.api";
import { Category } from "../../types/category.type";

interface CategoryQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
}

export const CategoryQuickAddModal: React.FC<CategoryQuickAddModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const newCategory = await categoryApi.createCategory({
        name: name.trim(),
        description: description.trim(),
      });
      onSuccess(newCategory);
      setName("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể thêm danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[5px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Thêm nhanh danh mục</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-[5px] border border-rose-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tên danh mục <span className="text-rose-500">*</span></label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 bg-white"
              placeholder="VD: Điện thoại, Laptop..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none text-slate-900 bg-white"
              placeholder="Mô tả ngắn về danh mục..."
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-[5px] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-6 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-[5px] shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isLoading ? "Đang lưu..." : "Lưu danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
