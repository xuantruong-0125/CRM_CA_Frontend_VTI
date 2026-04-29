"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CreateProductRequest, Product } from "./types/product.type";
import { productApi } from "./api/product.api";
import { priceApi } from "./api/price.api";
import { ImageUploader } from "./components/shared/ImageUploader";
import { useCategories } from "./hooks/useCategories";
import { CategoryComboBox } from "./components/shared/CategoryComboBox";
import { Info, DollarSign, Save, XCircle } from "lucide-react";

interface ProductDetailPageProps {
  initialData?: Product | null;
  isEditMode?: boolean;
}

type TabType = "information" | "price";

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ initialData, isEditMode = false }) => {
  const router = useRouter();
  const { categories, mutate: mutateCategories } = useCategories();
  
  const [activeTab, setActiveTab] = useState<TabType>("information");
  
  const [formData, setFormData] = useState<CreateProductRequest>({
    skuCode: "",
    name: "",
    description: "",
    imageUrl: "",
    categoryId: null,
  });

  const [priceData, setPriceData] = useState({
    basePrice: 0,
    taxRate: 10,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      if (initialData.finalPrice) {
        setPriceData(prev => ({ ...prev, basePrice: initialData.finalPrice }));
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "categoryId" ? (value ? Number(value) : null) : value 
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceData((prev) => ({ 
      ...prev, 
      [name]: name === "basePrice" || name === "taxRate" ? Number(value) : value 
    }));
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleCategoryChange = (categoryId: number) => {
    setFormData((prev) => ({ ...prev, categoryId }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      const form = e.currentTarget;
      const elements = Array.from(form.querySelectorAll("input, textarea, button, [role='combobox']")) as HTMLElement[];
      const index = elements.indexOf(e.target);
      if (index > -1 && index < elements.length - 1) {
        elements[index + 1].focus();
      }
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    const res = await axios.post("http://localhost:8080/api/v1/upload", uploadFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads")) return `http://localhost:8080${path}`;
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let currentImageUrl = formData.imageUrl;
      if (selectedFile) {
        currentImageUrl = await uploadFile(selectedFile);
      }

      const submissionData = {
        ...formData,
        imageUrl: currentImageUrl,
      };

      const formattedPriceData = {
        ...priceData,
        effectiveFrom: priceData.effectiveFrom ? `${priceData.effectiveFrom}T00:00:00` : null,
        effectiveTo: priceData.effectiveTo ? `${priceData.effectiveTo}T23:59:59` : null,
      };

      let product: Product;
      if (isEditMode && initialData?.id) {
        product = await productApi.updateProduct(initialData.id, submissionData);
      } else {
        product = await productApi.createProduct(submissionData);
        if (priceData.basePrice > 0) {
          await priceApi.createPrice({
            basePrice: priceData.basePrice,
            taxRate: priceData.taxRate,
            effectiveFrom: formattedPriceData.effectiveFrom,
            effectiveTo: formattedPriceData.effectiveTo,
            productId: product.id
          });
        }
      }
      router.push("/products");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 px-4" onKeyDown={handleKeyDown}>
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-[5px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span className="hover:text-sky-600 cursor-pointer transition-colors" onClick={() => router.push("/products")}>Quản lý sản phẩm</span>
          <span>/</span>
          <span className="text-slate-600">{isEditMode ? "Chỉnh sửa" : "Thêm mới"}</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-[5px] transition-all"
          >
            <XCircle size={16} />
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-[5px] shadow-md transition-all disabled:opacity-70"
          >
            {isLoading ? "Đang lưu..." : <><Save size={16} /> Lưu dữ liệu</>}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[5px] shadow-sm overflow-hidden">
        {/* Main Content Area */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left side: Main inputs (9/12) */}
            <div className="lg:col-span-9 space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Tên sản phẩm <span className="text-rose-500">*</span></label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-900 font-medium h-[38px]"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Danh mục sản phẩm <span className="text-rose-500">*</span></label>
                <div className="h-[38px]">
                  <CategoryComboBox 
                    categories={categories || []} 
                    value={formData.categoryId} 
                    onChange={handleCategoryChange}
                    onCategoryAdded={() => mutateCategories()}
                  />
                </div>
              </div>
            </div>

            {/* Right side: Image (3/12) */}
            <div className="lg:col-span-3 flex justify-center lg:justify-end">
              <div className="w-36 h-36 border-2 border-dashed border-slate-200 rounded-[5px] overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner relative group">
                <ImageUploader 
                  value={getImageUrl(formData.imageUrl)} 
                  onChange={handleFileChange} 
                  onClear={handleClearImage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="bg-slate-50/50 border-t border-slate-200">
          <div className="flex px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab("information")}
              className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-t-[5px] border-t border-x ${
                activeTab === "information" 
                  ? "text-sky-600 border-slate-200 bg-white" 
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Info size={16} />
              Thông tin chung
            </button>
            <button
              onClick={() => setActiveTab("price")}
              className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-t-[5px] border-t border-x ${
                activeTab === "price" 
                  ? "text-sky-600 border-slate-200 bg-white" 
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <DollarSign size={16} />
              Cấu hình giá
            </button>
          </div>

          <div className="p-6 bg-white">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-[5px] border border-rose-200 flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            {activeTab === "information" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* SKU/Description aligned with Name/Category (9/12) */}
                <div className="lg:col-span-9 space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Mã SKU / Tham chiếu nội bộ</label>
                    <input
                      name="skuCode"
                      value={formData.skuCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none uppercase bg-white text-slate-900 h-[38px]"
                      placeholder="VD: PRODUCT-001"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Mô tả sản phẩm</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none bg-white text-slate-900"
                      placeholder="Nhập thông tin mô tả chi tiết..."
                    />
                  </div>
                </div>
                {/* Notes aligned with Image (3/12) */}
                <div className="lg:col-span-3">
                  <div className="bg-slate-50 p-6 rounded-[5px] border border-slate-100 h-fit">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                      Ghi chú vận hành
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      Các thông tin này sẽ được hiển thị trên bảng báo giá và đơn hàng. Vui lòng kiểm tra kỹ SKU trước khi lưu.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="lg:col-span-9 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Giá bán cơ bản (VND)</label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-sky-500 transition-colors">₫</span>
                        <input
                          type="number"
                          name="basePrice"
                          value={priceData.basePrice}
                          onChange={handlePriceChange}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none font-bold text-slate-900 h-[38px]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Thuế suất (%)</label>
                      <input
                        type="number"
                        name="taxRate"
                        value={priceData.taxRate}
                        onChange={handlePriceChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Ngày hiệu lực</label>
                      <input
                        type="date"
                        name="effectiveFrom"
                        value={priceData.effectiveFrom}
                        onChange={handlePriceChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Ngày hết hạn (Tùy chọn)</label>
                      <input
                        type="date"
                        name="effectiveTo"
                        value={priceData.effectiveTo}
                        onChange={handlePriceChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
