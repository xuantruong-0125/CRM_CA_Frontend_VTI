"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Customer, CreateCustomerRequest } from "./types/customer.type";
import { customerApi } from "./api/customer.api";
import { CreateContactRequest } from "../contacts/types/contact.type";
import { contactApi } from "../contacts/api/contact.api";
import {
  Info, Save, XCircle, AlertCircle, Keyboard, Building2, User, Phone,
  Mail, Globe, Calendar, Briefcase, Plus, Trash2, UserPlus
} from "lucide-react";

interface CustomerDetailPageProps {
  initialData?: Customer | null;
  isEditMode?: boolean;
}

type TabType = "general" | "contact" | "business";

interface ValidationErrors {
  name?: string;
  customerCode?: string;
  type?: string;
  email?: string;
  phone?: string;
}

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ initialData, isEditMode = false }) => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("general");

  const [formData, setFormData] = useState<CreateCustomerRequest>({
    customerCode: "",
    name: "",
    shortName: "",
    type: "B2C",
    taxCode: "",
    phone: "",
    email: "",
    fax: "",
    establishedDate: "",
    description: "",
    sourceId: null,
    statusId: null,
    tierId: null,
    assignedTo: null,
  });

  const [contacts, setContacts] = useState<CreateContactRequest[]>([]);
  const [contactValidationErrors, setContactValidationErrors] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerCode: initialData.customerCode || "",
        name: initialData.name || "",
        shortName: initialData.shortName || "",
        type: initialData.type || "B2C",
        taxCode: initialData.taxCode || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        fax: initialData.fax || "",
        establishedDate: initialData.establishedDate ? initialData.establishedDate.split('T')[0] : "",
        description: initialData.description || "",
        sourceId: initialData.sourceId || null,
        statusId: initialData.statusId || null,
        tierId: initialData.tierId || null,
        assignedTo: initialData.assignedTo || null,
      });

      if (initialData.contacts) {
        setContacts(initialData.contacts.map(c => ({
          fullName: c.fullName || "",
          position: c.position || "",
          phone: c.phone || "",
          email: c.email || "",
          address: c.address || "",
          dob: c.dob || "",
          notes: c.notes || "",
          isPrimary: c.isPrimary || false,
          isActive: c.isActive !== false,
          customerId: initialData.id,
        })));
      }
    }
  }, [initialData]);

  const validateField = (name: string, value: any) => {
    let err = "";
    switch (name) {
      case "name":
        if (!value || !value.trim()) err = "Tên khách hàng không được để trống";
        break;
      case "customerCode":
        if (!isEditMode) {
          if (!value || !value.trim()) err = "Mã khách hàng không được để trống";
          else if (!/^[A-Z0-9\-_]+$/.test(value)) err = "Mã chỉ gồm chữ hoa, số, '-' và '_'";
        }
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = "Email không hợp lệ";
        break;
      case "phone":
        if (value && !/^[0-9+\- ]+$/.test(value)) err = "Số điện thoại không hợp lệ";
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: err }));
    return err;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["sourceId", "statusId", "tierId", "assignedTo"];
    let finalValue: any = value;

    if (numericFields.includes(name)) {
      finalValue = value === "" ? null : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));
    validateField(name, value);
  };

  const addContact = () => {
    setContacts(prev => [...prev, {
      fullName: "",
      position: "",
      phone: "",
      email: "",
      address: "",
      dob: "",
      notes: "",
      isPrimary: prev.length === 0,
      isActive: true,
      customerId: null
    }]);
  };

  const removeContact = (index: number) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
    setContactValidationErrors(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleContactChange = (index: number, field: keyof CreateContactRequest, value: any) => {
    setContacts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // If setting a primary contact, unset others
      if (field === "isPrimary" && value === true) {
        return updated.map((c, i) => i === index ? c : { ...c, isPrimary: false });
      }

      return updated;
    });

    // Clear error when user types
    if (contactValidationErrors[index]?.[field]) {
      setContactValidationErrors(prev => {
        const row = { ...prev[index] };
        delete row[field];
        return { ...prev, [index]: row };
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (isLoading) return;

    // Validate customer info
    const errs: ValidationErrors = {};
    errs.name = validateField("name", formData.name);
    errs.customerCode = validateField("customerCode", formData.customerCode);
    errs.email = validateField("email", formData.email);
    errs.phone = validateField("phone", formData.phone);

    const hasCustomerErrors = Object.values(errs).some(v => v !== "");

    // Validate contacts
    const contactErrs: Record<number, any> = {};
    contacts.forEach((contact, index) => {
      const rowErrs: any = {};
      if (!contact.fullName || !contact.fullName.trim()) rowErrs.fullName = "Bắt buộc";
      if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) rowErrs.email = "Sai định dạng";
      if (contact.phone && !/^[0-9+\- ]+$/.test(contact.phone)) rowErrs.phone = "Sai định dạng";
      if (Object.keys(rowErrs).length > 0) contactErrs[index] = rowErrs;
    });

    const hasContactErrors = Object.keys(contactErrs).length > 0;

    if (hasCustomerErrors || hasContactErrors) {
      setValidationErrors(errs);
      setContactValidationErrors(contactErrs);

      if (hasCustomerErrors && activeTab !== "general") {
        setActiveTab("general");
      } else if (hasContactErrors && !hasCustomerErrors) {
        setActiveTab("contact");
      }

      setError("Vui lòng sửa các lỗi nhập liệu!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const submissionData = {
        ...formData,
        establishedDate: formData.establishedDate || undefined,
      };

      let newCustomer: Customer;
      if (isEditMode && initialData) {
        newCustomer = await customerApi.updateCustomer(initialData.id, submissionData);
      } else {
        newCustomer = await customerApi.createCustomer(submissionData);
      }


      if (!isEditMode && contacts.length > 0) {
        const contactPromises = contacts.map(contact =>
          contactApi.createContact({ ...contact, customerId: newCustomer.id })
        );
        await Promise.all(contactPromises);
      }

      router.push("/customers");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  // Shortcut handling
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        router.push("/customers");
      }
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setActiveTab("general");
      }
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        setActiveTab("contact");
      }
      if (e.altKey && e.key === "3") {
        e.preventDefault();
        setActiveTab("business");
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [formData, isLoading, contacts]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      const form = e.currentTarget;
      const elements = Array.from(form.querySelectorAll("input, textarea, button, select")) as HTMLElement[];
      const index = elements.indexOf(e.target);
      if (index > -1 && index < elements.length - 1) {
        elements[index + 1].focus();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 px-4" onKeyDown={handleKeyDown}>
      {/* Header / Action Bar */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-[5px] border border-slate-200 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            <span className="hover:text-sky-600 cursor-pointer transition-colors" onClick={() => router.push("/customers")}>Quản lý khách hàng</span>
            <span>/</span>
            <span className="text-slate-600">{isEditMode ? "Chỉnh sửa" : "Thêm mới"}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-bold">Ctrl + S</kbd> Lưu
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-bold">Esc</kbd> Hủy
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/customers")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-[5px] transition-all"
          >
            <XCircle size={16} />
            Hủy bỏ
          </button>
          <button
            onClick={() => handleSubmit()}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Tên khách hàng <span className="text-rose-500">*</span></label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên khách hàng..."
                className={`w-full px-3 py-2 text-sm border ${validationErrors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-900 font-medium h-[38px]`}
                autoFocus
              />
              {validationErrors.name && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.name}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Mã khách hàng <span className="text-rose-500">*</span></label>
              <input
                name="customerCode"
                value={formData.customerCode}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full px-3 py-2 text-sm border ${validationErrors.customerCode ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none uppercase text-slate-900 h-[38px] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
                placeholder="VD: CUST-001"
              />
              {validationErrors.customerCode && <p className="text-[11px] text-rose-500 font-bold">{validationErrors.customerCode}</p>}
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="bg-slate-50/50 border-t border-slate-200">
          <div className="flex px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-t-[5px] border-t border-x ${activeTab === "general"
                ? "text-sky-600 border-slate-200 bg-white"
                : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
                }`}
            >
              <Info size={16} />
              Thông tin chung
              <span className="ml-2 text-[10px] text-slate-400 bg-slate-100 px-1 rounded">Alt+1</span>
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-t-[5px] border-t border-x ${activeTab === "contact"
                ? "text-sky-600 border-slate-200 bg-white"
                : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
                }`}
            >
              <UserPlus size={16} />
              Người liên hệ
              <span className="ml-2 text-[10px] text-slate-400 bg-slate-100 px-1 rounded">Alt+2</span>
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-t-[5px] border-t border-x ${activeTab === "business"
                ? "text-sky-600 border-slate-200 bg-white"
                : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
                }`}
            >
              <Briefcase size={16} />
              Kinh doanh
              <span className="ml-2 text-[10px] text-slate-400 bg-slate-100 px-1 rounded">Alt+3</span>
            </button>
          </div>

          <div className="p-8 bg-white min-h-[400px]">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-[5px] border border-rose-200 flex items-center gap-3">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Loại khách hàng</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="B2C"
                          checked={formData.type === "B2C"}
                          onChange={handleChange}
                          className="w-4 h-4 text-sky-600"
                        />
                        <span className="text-sm text-slate-700 flex items-center gap-1.5"><User size={14} /> Cá nhân (B2C)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="B2B"
                          checked={formData.type === "B2B"}
                          onChange={handleChange}
                          className="w-4 h-4 text-sky-600"
                        />
                        <span className="text-sm text-slate-700 flex items-center gap-1.5"><Building2 size={14} /> Doanh nghiệp (B2B)</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Tên viết tắt</label>
                    <input
                      name="shortName"
                      value={formData.shortName}
                      onChange={handleChange}
                      placeholder="VD: VTI"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Phone size={14} /> Số điện thoại</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="VD: 0987654321"
                      className={`w-full px-3 py-2 text-sm border ${validationErrors.phone ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={14} /> Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="VD: example@company.com"
                      className={`w-full px-3 py-2 text-sm border ${validationErrors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-300'} rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]`}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Globe size={14} /> Số Fax</label>
                    <input
                      name="fax"
                      value={formData.fax}
                      onChange={handleChange}
                      placeholder="Nhập số fax nếu có..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Mô tả khách hàng</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none text-slate-900"
                    placeholder="Nhập thông tin mô tả chi tiết về khách hàng..."
                  />
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">Danh sách người liên hệ</h3>
                    <p className="text-[11px] text-slate-500">Thêm thông tin những người đại diện cho khách hàng này.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 hover:bg-sky-100 rounded-[5px] transition-all"
                  >
                    <Plus size={14} />
                    Thêm người liên hệ
                  </button>
                </div>

                <div className="border border-slate-200 rounded-[5px] overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5 font-bold text-slate-600 text-[11px] uppercase">Họ và tên</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 text-[11px] uppercase">Chức vụ</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 text-[11px] uppercase">Điện thoại</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 text-[11px] uppercase">Email</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 text-[11px] uppercase w-20">Chính</th>
                        <th className="px-4 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contacts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-400 italic">
                            Chưa có người liên hệ nào được thêm.
                          </td>
                        </tr>
                      ) : (
                        contacts.map((contact, index) => (
                          <tr key={index} className="group hover:bg-slate-50/50">
                            <td className="px-3 py-2">
                              <input
                                value={contact.fullName}
                                onChange={(e) => handleContactChange(index, "fullName", e.target.value)}
                                className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-sky-500 outline-none bg-transparent text-slate-900 font-medium transition-all ${contactValidationErrors[index]?.fullName
                                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-transparent group-hover:border-slate-200 focus:border-sky-500"
                                  }`}
                                placeholder="Họ và tên..."
                                title={contactValidationErrors[index]?.fullName}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={contact.position}
                                onChange={(e) => handleContactChange(index, "position", e.target.value)}
                                className="w-full px-2 py-1 border border-transparent group-hover:border-slate-200 rounded focus:border-sky-500 outline-none bg-transparent text-slate-900 font-medium"
                                placeholder="Ví dụ: Giám đốc..."
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={contact.phone}
                                onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                                className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-sky-500 outline-none bg-transparent text-slate-900 font-medium transition-all ${contactValidationErrors[index]?.phone
                                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-transparent group-hover:border-slate-200 focus:border-sky-500"
                                  }`}
                                placeholder="Số ĐT..."
                                title={contactValidationErrors[index]?.phone}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={contact.email}
                                onChange={(e) => handleContactChange(index, "email", e.target.value)}
                                className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-sky-500 outline-none bg-transparent text-slate-900 font-medium transition-all ${contactValidationErrors[index]?.email
                                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-transparent group-hover:border-slate-200 focus:border-sky-500"
                                  }`}
                                placeholder="Email..."
                                title={contactValidationErrors[index]?.email}
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={contact.isPrimary}
                                onChange={(e) => handleContactChange(index, "isPrimary", e.target.checked)}
                                className="w-4 h-4 text-sky-600 rounded"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => removeContact(index)}
                                className="text-slate-300 hover:text-rose-500 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "business" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Mã số thuế</label>
                    <input
                      name="taxCode"
                      value={formData.taxCode}
                      onChange={handleChange}
                      placeholder="Nhập mã số thuế..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} /> Ngày thành lập / Ngày sinh</label>
                    <input
                      type="date"
                      name="establishedDate"
                      value={formData.establishedDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Nguồn khách hàng</label>
                    <select
                      name="sourceId"
                      value={formData.sourceId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px] bg-white"
                    >
                      <option value="">-- Chọn nguồn --</option>
                      <option value="1">Facebook</option>
                      <option value="2">Google</option>
                      <option value="3">Giới thiệu</option>
                      <option value="4">Khác</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Trạng thái</label>
                    <select
                      name="statusId"
                      value={formData.statusId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px] bg-white"
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="1">Tiềm năng</option>
                      <option value="2">Đang tiếp cận</option>
                      <option value="3">Khách hàng chính thức</option>
                      <option value="4">Ngừng theo dõi</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Hạng khách hàng</label>
                    <select
                      name="tierId"
                      value={formData.tierId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px] bg-white"
                    >
                      <option value="">-- Chọn hạng --</option>
                      <option value="1">Đồng</option>
                      <option value="2">Bạc</option>
                      <option value="3">Vàng</option>
                      <option value="4">Kim cương</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Phụ trách bởi</label>
                    <select
                      name="assignedTo"
                      value={formData.assignedTo || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900 h-[38px] bg-white"
                    >
                      <option value="">-- Chọn nhân viên --</option>
                      <option value="1">Admin</option>
                      <option value="2">Sale Manager</option>
                    </select>
                  </div>
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
        <div className="flex gap-6 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm font-bold text-sky-600">Ctrl + S</kbd> Lưu nhanh
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm font-bold text-rose-500">Esc</kbd> Hủy bỏ
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm font-bold text-slate-700">Alt + 1</kbd> Thông tin
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm font-bold text-slate-700">Alt + 2</kbd> Liên hệ
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm font-bold text-slate-700">Alt + 3</kbd> Kinh doanh
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm font-bold text-slate-700">Enter</kbd> Chuyển ô
          </div>
        </div>
      </div>
    </div>
  );
};
