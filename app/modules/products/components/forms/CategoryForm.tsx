"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateCategoryRequest, Category } from "../../types/category.type";
import { categoryApi } from "../../api/category.api";

interface CategoryFormProps {
  initialData?: Category | null;
  isEditMode?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, isEditMode = false }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && initialData?.id) {
        await categoryApi.updateCategory(initialData.id, formData);
      } else {
        await categoryApi.createCategory(formData);
      }
      router.push("/categories"); // Quay lại trang danh sách
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 border border-slate-200 rounded-md shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {isEditMode ? "Sửa danh mục" : "Thêm mới danh mục"}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Tên danh mục <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-slate-900"
            placeholder="Nhập tên danh mục..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none text-slate-900"
            placeholder="Nhập mô tả danh mục..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/categories")}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading ? "Đang lưu..." : "Lưu dữ liệu"}
          </button>
        </div>
      </form>
    </div>
  );
};
