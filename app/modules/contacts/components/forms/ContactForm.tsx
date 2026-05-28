"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Contact, CreateContactRequest } from "../../types/contact.type";
import { contactApi } from "../../api/contact.api";
import { CustomerComboBox } from "../shared/CustomerComboBox";
import { useCustomers } from "../../hooks/useCustomers";

interface ContactFormProps {
  initialData?: Contact | null;
  isEditMode?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({ initialData, isEditMode = false }) => {
  const router = useRouter();
  const { customers } = useCustomers();
  const [formData, setFormData] = useState<CreateContactRequest>({
    fullName: "",
    position: "",
    phone: "",
    email: "",
    address: "",
    dob: "",
    notes: "",
    isPrimary: false,
    isActive: true,
    customerId: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        position: initialData.position || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        dob: initialData.dob || "",
        notes: initialData.notes || "",
        isPrimary: initialData.isPrimary || false,
        isActive: initialData.isActive !== false,
        customerId: initialData.customerId || null,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && initialData?.id) {
        await contactApi.updateContact(initialData.id, formData);
      } else {
        await contactApi.createContact(formData);
      }
      router.push("/contacts");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };
  console.log(customers);
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 border border-slate-200 rounded-md shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-6">
        {isEditMode ? "Sửa thông tin liên hệ" : "Thêm mới liên hệ"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chức vụ
            </label>
            <input
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
              placeholder="Ví dụ: Giám đốc kinh doanh..."
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Khách hàng liên kết <span className="text-rose-500">*</span>
            </label>
            <CustomerComboBox
              customers={customers}
              value={formData.customerId}
              onChange={(id) => setFormData(prev => ({ ...prev, customerId: id }))}
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Số điện thoại
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
              placeholder="09xx xxx xxx"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
              placeholder="email@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ngày sinh
            </label>
            <input
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Địa chỉ
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
              placeholder="Nhập địa chỉ..."
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ghi chú
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none text-slate-900"
              placeholder="Nhập ghi chú thêm về người liên hệ..."
            />
          </div>

          <div className="flex items-center gap-6 col-span-2 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleChange}
                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              />
              <span className="text-sm font-medium text-slate-700">Người liên hệ chính</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              />
              <span className="text-sm font-medium text-slate-700">Đang hoạt động</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/contacts")}
            className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-[5px] transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-[5px] transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoading ? "Đang xử lý..." : isEditMode ? "Cập nhật liên hệ" : "Tạo liên hệ mới"}
          </button>
        </div>
      </form>
    </div>
  );
};
