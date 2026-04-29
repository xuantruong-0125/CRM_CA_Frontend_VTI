"use client";

import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
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
  const [validationErrors, setValidationErrors] = useState<{name?: string, description?: string}>({});

  if (!isOpen) return null;

  const validate = (fieldName: string, value: string) => {
    let err = "";
    if (fieldName === "name") {
      if (!value.trim()) err = "Tên danh mục không được để trống";
      else if (value.length > 100) err = "Tên danh mục tối đa 100 ký tự";
    }
    if (fieldName === "description") {
      if (value.length > 500) err = "Mô tả tối đa 500 ký tự";
    }
    setValidationErrors(prev => ({ ...prev, [fieldName]: err }));
    return err;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    validate("name", val);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
    validate("description", val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameErr = validate("name", name);
    const descErr = validate("description", description);
    
    if (nameErr || descErr) return;

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
      setError(err.response?.data?.message || "Không thể thêm danh mục. Có thể tên đã tồn tại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tên danh mục <span className="text-rose-500">*</span></label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 text-sm border ${validationErrors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 bg-white transition-all`}
              placeholder="VD: Điện thoại, Laptop..."
              required
            />
            {validationErrors.name && <p className="text-xs text-rose-500 font-medium">{validationErrors.name}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Mô tả</label>
            <textarea
              value={description}
              onChange={handleDescChange}
              className={`w-full px-3 py-2 text-sm border ${validationErrors.description ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none text-slate-900 bg-white transition-all`}
              placeholder="Mô tả ngắn về danh mục..."
              rows={4}
            />
            {validationErrors.description && <p className="text-xs text-rose-500 font-medium">{validationErrors.description}</p>}
          </div>

          <div className="bg-slate-50 p-3 rounded-[5px] border border-slate-100">
            <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
              <AlertCircle size={10} /> Tên danh mục phải là duy nhất và tối đa 100 ký tự.
            </p>
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
              disabled={isLoading || !name.trim() || !!validationErrors.name || !!validationErrors.description}
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
