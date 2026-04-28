"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateProductRequest, Product } from "./types/product.type";
import { productApi } from "./api/product.api";
import { ImageUploader } from "./components/shared/ImageUploader";
import { useCategories } from "./hooks/useCategories";

interface ProductDetailPageProps {
  initialData?: Product | null;
  isEditMode?: boolean;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ initialData, isEditMode = false }) => {
  const router = useRouter();
  const { categories } = useCategories();
  
  const [formData, setFormData] = useState<CreateProductRequest>({
    skuCode: "",
    name: "",
    description: "",
    imageUrl: "",
    categoryId: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        skuCode: initialData.skuCode || "",
        name: initialData.name || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        categoryId: initialData.categoryId || null,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "categoryId" ? (value ? Number(value) : null) : value 
    }));
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && initialData?.id) {
        await productApi.updateProduct(initialData.id, formData);
      } else {
        await productApi.createProduct(formData);
      }
      router.push("/products");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isEditMode ? "Chi tiết sản phẩm" : "Thêm mới sản phẩm"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode ? "Cập nhật thông tin chi tiết của sản phẩm" : "Nhập thông tin cho sản phẩm mới"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-sm transition-colors"
          >
            Trở về
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded shadow-sm transition-colors disabled:opacity-70"
          >
            {isLoading ? "Đang lưu..." : "Lưu dữ liệu"}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded border border-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột chính: Thông tin chi tiết */}
        <div className="lg:col-span-2 bg-white p-5 border border-slate-200 rounded-md shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4 border-b border-slate-100 pb-2">Thông tin cơ bản</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Tên sản phẩm <span className="text-rose-500">*</span></label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-slate-900"
                  placeholder="Nhập tên..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Mã SKU</label>
                <input
                  name="skuCode"
                  value={formData.skuCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 uppercase text-slate-900"
                  placeholder="VD: PROD-001"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Danh mục <span className="text-rose-500">*</span></label>
              <select
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-900"
              >
                <option value="" disabled>-- Chọn danh mục --</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Mô tả chi tiết</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none text-slate-900"
                placeholder="Mô tả công năng, đặc điểm sản phẩm..."
              />
            </div>
          </form>
        </div>

        {/* Cột phụ: Quản lý ảnh */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-5 border border-slate-200 rounded-md shadow-sm h-full">
            <h3 className="font-semibold text-slate-700 mb-4 border-b border-slate-100 pb-2">Hình ảnh sản phẩm</h3>
            <ImageUploader value={formData.imageUrl} onChange={handleImageChange} />
          </div>
        </div>
      </div>
    </div>
  );
};
