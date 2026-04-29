"use client";

import React from "react";
import { X, Calendar, FileText, Tag } from "lucide-react";
import { Category } from "../../types/category.type";

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[5px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-[5px]">
              <Tag size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Chi tiết danh mục</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-50 rounded-[5px] border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tên danh mục</label>
                <p className="text-base font-bold text-slate-800">{category.name}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-[5px] border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Mô tả</label>
                <div className="flex gap-2">
                  <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {category.description || "Không có mô tả cho danh mục này."}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-[5px] border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Ngày tạo</label>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{category.createdAt ? new Date(category.createdAt).toLocaleDateString('vi-VN') : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-[5px] shadow-md transition-all"
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
