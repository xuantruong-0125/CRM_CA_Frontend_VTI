"use client";

import React, { useState, useEffect, useMemo } from "react";
import httpClient from "@/core/http/httpClient";
import { useRouter } from "next/navigation";
import { CreateProductRequest, Product } from "./types/product.type";
import { productApi } from "./api/product.api";
import { priceApi } from "./api/price.api";
import { ImageUploader } from "./components/shared/ImageUploader";
import { useCategories } from "./hooks/useCategories";
import { CategoryComboBox } from "./components/shared/CategoryComboBox";
import { Info, DollarSign, Save, XCircle, AlertCircle, HelpCircle, Keyboard } from "lucide-react";

const formatNumber = (num: number | string) => {
  if (num === "" || num === null || num === undefined) return "";
  const clean = num.toString().replace(/\D/g, "");
  return clean ? Number(clean).toLocaleString("vi-VN") : "";
};

interface ProductDetailPageProps {
  initialData?: Product | null;
  isEditMode?: boolean;
}

type TabType = "information" | "price";

interface ValidationErrors {
  name?: string;
  skuCode?: string;
  description?: string;
  categoryId?: string;
  basePrice?: string;
  taxRate?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const finalPrice = useMemo(() => {
    const base = Number(priceData.basePrice) || 0;
    const tax = Number(priceData.taxRate) || 0;
    return Math.round(base * (1 + tax / 100));
  }, [priceData.basePrice, priceData.taxRate]);

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

  // Shortcut handling
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit(new Event("submit") as any);
      }
      // Escape: Cancel
      if (e.key === "Escape") {
        router.push("/products");
      }
      // Alt + 1: Information Tab
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setActiveTab("information");
      }
      // Alt + 2: Price Tab
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        setActiveTab("price");
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [formData, priceData, isLoading]); // Re-bind when state changes to have fresh data in closure if needed

  const validateField = (name: string, value: any) => {
    let err = "";
    switch (name) {
      case "name":
        if (!value || !value.trim()) err = "Tên sản phẩm không được để trống";
        else if (value.length > 100) err = "Tên sản phẩm tối đa 100 ký tự";
        break;
      case "skuCode":
        if (!isEditMode) {
          if (!value || !value.trim()) err = "Mã SKU không được để trống";
          else if (value.length > 100) err = "Mã SKU tối đa 100 ký tự";
          else if (!/^[A-Z0-9\-_]+$/.test(value)) err = "SKU chỉ gồm chữ hoa, số, '-' và '_'";
        }
        break;
      case "description":
        if (value && value.length > 500) err = "Mô tả tối đa 500 ký tự";
        break;
      case "categoryId":
        if (!value) err = "Vui lòng chọn danh mục";
        break;
      case "basePrice":
        if (value === "" || value === null) err = "Giá vốn không được để trống";
        else if (value <= 0) err = "Giá vốn phải lớn hơn 0";
        else if (!Number.isInteger(Number(value))) err = "Giá vốn phải là số nguyên (VNĐ)";
        break;
      case "taxRate":
        if (value === "" || value === null) err = "Thuế suất không được để trống";
        else if (value < 0) err = "Thuế suất không được âm";
        break;
      case "effectiveFrom":
        if (!value) err = "Ngày hiệu lực không được để trống";
        else {
          const today = new Date().toISOString().split('T')[0];
          if (value < today) err = "Ngày hiệu lực không được là quá khứ";
        }
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: err }));
    return err;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? (value ? Number(value) : null) : value
    }));
    validateField(name, value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val: any = value;

    if (name === "basePrice") {
      const cleanValue = value.replace(/\D/g, "");
      val = cleanValue === "" ? "" : Number(cleanValue);
    } else if (name === "taxRate") {
      val = value === "" ? "" : Number(value);
    }

    setPriceData((prev) => ({ ...prev, [name]: val }));
    validateField(name, val);

    if (name === "effectiveTo" || name === "effectiveFrom") {
      const from = name === "effectiveFrom" ? value : priceData.effectiveFrom;
      const to = name === "effectiveTo" ? value : priceData.effectiveTo;
      if (from && to && from > to) {
        setValidationErrors(prev => ({ ...prev, effectiveTo: "Ngày kết thúc phải sau ngày bắt đầu" }));
      } else {
        setValidationErrors(prev => ({ ...prev, effectiveTo: "" }));
      }
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Chỉ cho phép tải lên tệp ảnh!");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh phải có kích thước nhỏ hơn 2MB!");
        return;
      }
    }
    setSelectedFile(file);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleCategoryChange = (categoryId: number) => {
    setFormData((prev) => ({ ...prev, categoryId }));
    validateField("categoryId", categoryId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to move to next field logic
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
    const res = await httpClient.post("/api/v1/upload", uploadFormData, {
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
    e?.preventDefault?.();
    if (isLoading) return;

    // Validate all fields
    const errs: ValidationErrors = {};
    errs.name = validateField("name", formData.name);
    errs.skuCode = validateField("skuCode", formData.skuCode);
    errs.categoryId = validateField("categoryId", formData.categoryId);
    errs.basePrice = validateField("basePrice", priceData.basePrice);
    errs.taxRate = validateField("taxRate", priceData.taxRate);
    errs.effectiveFrom = validateField("effectiveFrom", priceData.effectiveFrom);

    if (priceData.effectiveFrom && priceData.effectiveTo && priceData.effectiveFrom > priceData.effectiveTo) {
      errs.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    const hasErrors = Object.values(errs).some(v => v !== "");
    if (hasErrors) {
      setValidationErrors(errs);
      setError("Vui lòng sửa các lỗi nhập liệu bên dưới!");
      return;
    }

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

      if (isEditMode && initialData?.id) {
        await productApi.updateProduct(initialData.id, submissionData);
      } else {
        const product = await productApi.createProduct(submissionData);
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
      {/* Header / Action Bar */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-[5px] border border-slate-200 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[18px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            <span className="hover:text-sky-600 cursor-pointer transition-colors text-blue" onClick={() => router.push("/products")}>Quản lý sản phẩm</span>
            <span>/</span>
            <span className="text-slate-600">{isEditMode ? "Chỉnh sửa" : "Thêm mới"}</span>
          </div>
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

      

      <div className="bg-white border border-slate-200 rounded-[5px] shadow-sm overflow-hidden mb-6">
        {/* Main inputs section */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-9 space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Tên sản phẩm <span className="text-rose-500">*</span></label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên sản phẩm..."
                  className={`w-full px-3 py-2 text-sm border ${validationErrors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-900 font-medium h-[38px]`}
                  autoFocus
                />
                {validationErrors.name && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.name}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Danh mục sản phẩm <span className="text-rose-500">*</span></label>
                <div className={`h-[38px] ${validationErrors.categoryId ? 'ring-1 ring-rose-400 rounded-[5px]' : ''}`}>
                  <CategoryComboBox
                    categories={categories || []}
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    onCategoryAdded={() => mutateCategories()}
                  />
                </div>
                {validationErrors.categoryId && <p className="text-[11px] text-rose-500 font-bold mt-1">{validationErrors.categoryId}</p>}
              </div>
            </div>

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
              className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-t-[5px] border-t border-x ${activeTab === "information"
                ? "text-sky-600 border-slate-200 bg-white"
                : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
                }`}
            >
              <Info size={16} />
              Thông tin chung
              <span className="ml-2 text-[10px] text-slate-400 bg-slate-100 px-1 rounded">Alt+1</span>
            </button>
            <button
              onClick={() => setActiveTab("price")}
              className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-t-[5px] border-t border-x ${activeTab === "price"
                ? "text-sky-600 border-slate-200 bg-white"
                : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
                }`}
            >
              <DollarSign size={16} />
              Cấu hình giá
              <span className="ml-2 text-[10px] text-slate-400 bg-slate-100 px-1 rounded">Alt+2</span>
            </button>
          </div>

          <div className="p-8 bg-white min-h-[300px]">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-[5px] border border-rose-200 flex items-center gap-3">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {activeTab === "information" ? (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Mã SKU / Tham chiếu nội bộ <span className="text-rose-500">*</span></label>
                    <input
                      name="skuCode"
                      value={formData.skuCode}
                      onChange={handleChange}
                      disabled={isEditMode}
                      className={`w-full px-3 py-2 text-sm border ${validationErrors.skuCode ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none uppercase text-slate-900 h-[38px] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
                      placeholder="VD: PRODUCT-001"
                    />
                    {validationErrors.skuCode && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.skuCode}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Mô tả sản phẩm</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-3 py-2 text-sm border ${validationErrors.description ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none bg-white text-slate-900`}
                      placeholder="Nhập thông tin mô tả chi tiết..."
                    />
                    {validationErrors.description && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.description}</p>}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-[5px] border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                    <HelpCircle size={14} className="text-sky-500" />
                    Quy tắc nhập liệu
                  </h4>
                  <ul className="text-[11px] text-slate-500 flex flex-wrap items-center gap-6 leading-relaxed italic">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full shrink-0" /> Tên & SKU: tối đa 100 ký tự.</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full shrink-0" /> SKU: chỉ hoa + số + "-" + "_".</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full shrink-0" /> Mô tả: tối đa 500 ký tự.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Giá vốn (VND) <span className="text-rose-500">*</span></label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-sky-500 transition-colors">₫</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          name="basePrice"
                          value={formatNumber(priceData.basePrice)}
                          onChange={handlePriceChange}
                          placeholder="0"
                          className={`w-full pl-8 pr-3 py-2 text-sm border ${validationErrors.basePrice ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none font-bold text-slate-900 h-[38px]`}
                        />
                      </div>
                      {validationErrors.basePrice && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.basePrice}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Thuế suất (%) <span className="text-rose-500">*</span></label>
                      <input
                        type="number"
                        name="taxRate"
                        value={priceData.taxRate}
                        onChange={handlePriceChange}
                        className={`w-full px-3 py-2 text-sm border ${validationErrors.taxRate ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]`}
                      />
                      {validationErrors.taxRate && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.taxRate}</p>}
                    </div>
                  </div>

                  <div className="p-4 bg-sky-50 rounded-[5px] border border-sky-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
                      <DollarSign size={16} />
                      <span>Giá bán cuối cùng (đã gồm thuế):</span>
                    </div>
                    <div className="text-xl font-black text-sky-700 tracking-tight">
                      {finalPrice.toLocaleString('vi-VN')} <span className="text-xs font-bold uppercase ml-1">VNĐ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Ngày hiệu lực <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        name="effectiveFrom"
                        value={priceData.effectiveFrom}
                        onChange={handlePriceChange}
                        className={`w-full px-3 py-2 text-sm border ${validationErrors.effectiveFrom ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]`}
                      />
                      {validationErrors.effectiveFrom && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.effectiveFrom}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Ngày hết hạn (Tùy chọn)</label>
                      <input
                        type="date"
                        name="effectiveTo"
                        value={priceData.effectiveTo}
                        onChange={handlePriceChange}
                        className={`w-full px-3 py-2 text-sm border ${validationErrors.effectiveTo ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]`}
                      />
                      {validationErrors.effectiveTo && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.effectiveTo}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-[5px] border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                    <HelpCircle size={14} className="text-sky-500" />
                    Quy tắc định giá
                  </h4>
                  <ul className="text-[11px] text-slate-500 flex flex-wrap items-center gap-6 leading-relaxed italic">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full shrink-0" /> Giá vốn {'>'} 0, đơn vị VNĐ.</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full shrink-0" /> Thuế suất: không giới hạn.</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full shrink-0" /> Ngày bắt đầu ≤ Ngày kết thúc.</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full shrink-0" /> Không chọn ngày quá khứ.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shortcut Info Footer */}
      <div className="flex items-center gap-6 px-4 py-3 bg-slate-50 rounded-[5px] border border-slate-200">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Keyboard size={14} className="text-slate-400" />
          Phím tắt hệ thống:
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-black border border-slate-200 rounded shadow-sm font-bold text-sky-600">Ctrl + S</kbd> Lưu nhanh
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-black border border-slate-200 rounded shadow-sm font-bold text-rose-500">Esc</kbd> Hủy bỏ
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-black border border-slate-200 rounded shadow-sm font-bold text-slate-700">Alt + 1</kbd> Thông tin
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-black border border-slate-200 rounded shadow-sm font-bold text-slate-700">Alt + 2</kbd> Định giá
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-black border border-slate-200 rounded shadow-sm font-bold text-slate-700">Enter</kbd> Chuyển ô
          </div>
        </div>
      </div>
    </div>
  );
};
