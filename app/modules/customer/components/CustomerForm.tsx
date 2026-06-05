"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Check, ChevronRight, CircleX, Info, Users, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import type { ReactNode } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TIER_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
} from "@/modules/customer/constants/customer.constants";
import { useCustomerSalesUsers, useCustomerContacts, useCustomerAddresses } from "@/modules/customer/hooks/useCustomers";
import type {
  CustomerAddressResponseDTO,
  CustomerResponseDTO,
} from "@/modules/customer/types/customer.types";
import { getCustomerTaxCode, normalizeCustomerStatus, normalizeCustomerTier } from "@/modules/customer/utils/customer.mapper";
import { useLeadReferences } from "@/modules/lead/hooks/useLeadReferences";
import { customerFormSchema } from "@/modules/customer/schemas/customer.schema";
import type { CustomerFormInput, CustomerFormValues } from "@/modules/customer/schemas/customer.schema";
import { useCurrentUser } from "@/core/auth/useCurrentUser";

type CustomerFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<CustomerResponseDTO> | null;
  initialAddress?: Partial<CustomerAddressResponseDTO> | null;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

type TabKey = "management" | "address" | "contacts" | "notes";

const inputClass =
  "h-8 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15";

const textareaClass =
  "w-full rounded-[6px] border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600";

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function parseStatusId(statusName?: string) {
  switch (normalizeCustomerStatus(statusName)) {
    case "PAUSED":
      return 2;
    case "BLACKLIST":
      return 3;
    case "OTHER":
      return 4;
    case "CARING":
    default:
      return 1;
  }
}

function parseTierId(tierName?: string) {
  switch (normalizeCustomerTier(tierName)) {
    case "GOLD":
      return 2;
    case "DIAMOND":
      return 3;
    case "SILVER":
    default:
      return 1;
  }
}

function normalizeAddressType(addressType?: string) {
  switch (addressType) {
    case "BILLING":
    case "SHIPPING":
      return addressType;
    case "OFFICE":
    default:
      return "OFFICE";
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="mt-1 block text-[11px] leading-4 text-red-600">{message}</span>;
}

function FieldFrame({
  label,
  required,
  error,
  children,
  hint,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col ${className ?? ""}`}>
      <span className={labelClass}>
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</span> : null}
      <FieldError message={error} />
    </label>
  );
}

export default function CustomerForm({
  mode,
  initialValues,
  initialAddress,
  onSubmit,
  onCancel,
  isSubmitting,
}: CustomerFormProps) {
  const { mounted, currentUser, isSale } = useCurrentUser();
  const referencesQuery = useLeadReferences();
  const salesUsersQuery = useCustomerSalesUsers();
  const [activeTab, setActiveTab] = useState<TabKey>("management");
  const contactsQuery = useCustomerContacts(initialValues?.id, mode === "edit" && !!initialValues?.id);
  const addressesQuery = useCustomerAddresses(initialValues?.id, mode === "edit" && !!initialValues?.id);
  const [hasResetContacts, setHasResetContacts] = useState(false);
  const [hasLoadedAddresses, setHasLoadedAddresses] = useState(false);

  const sourceOptions = referencesQuery.data?.sources ?? [];
  const saleOptions = salesUsersQuery.data ?? [];
  const provinceOptions = referencesQuery.data?.provinces ?? [];
  const lockSaleAssignee = mounted && isSale && !!currentUser;

  const defaultValues = useMemo<CustomerFormInput>(
    () => ({
      type: initialValues?.type ?? "B2B",
      name: initialValues?.name ?? "",
      shortName: initialValues?.shortName ?? "",
      phone: initialValues?.phone ?? "",
      taxCode: getCustomerTaxCode(initialValues) ?? "",
      email: initialValues?.email ?? "",
      fax: initialValues?.fax ?? "",
      description: initialValues?.description ?? "",
      establishedDate: toDateInputValue(initialValues?.establishedDate),
      sourceId: initialValues?.sourceId,
      statusId: parseStatusId(initialValues?.statusName),
      tierId: parseTierId(initialValues?.tierName),
      assignedTo: initialValues?.assignedTo,
      addresses: mode === "create" ? [
        {
          addressType: "OFFICE",
          fullAddress: "",
          provinceId: undefined,
          isPrimary: true,
        }
      ] : [],
      contacts: [],
    }),
    [initialValues, mode],
  );

  const form = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (lockSaleAssignee && currentUser) {
      form.setValue("assignedTo", currentUser.id, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [currentUser, form, lockSaleAssignee]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control: form.control,
    name: "addresses",
  });

  const handleSetPrimaryContact = (index: number) => {
    fields.forEach((_, idx) => {
      form.setValue(`contacts.${idx}.isPrimary`, idx === index);
    });
  };

  const handleSetPrimaryAddress = (index: number) => {
    addressFields.forEach((_, idx) => {
      form.setValue(`addresses.${idx}.isPrimary`, idx === index);
    });
  };

  const lastIdRef = useRef<number | undefined>(initialValues?.id);

  useEffect(() => {
    if (initialValues?.id !== lastIdRef.current) {
      form.reset(defaultValues);
      setHasResetContacts(false);
      setHasLoadedAddresses(false);
      lastIdRef.current = initialValues?.id;
    }
  }, [initialValues?.id, defaultValues, form]);

  useEffect(() => {
    if (mode === "edit" && addressesQuery.data && !hasLoadedAddresses) {
      form.setValue(
        "addresses",
        addressesQuery.data.map((addr) => ({
          id: addr.id,
          addressType: addr.addressType,
          fullAddress: addr.fullAddress ?? "",
          provinceId: addr.provinceId,
          isPrimary: addr.isPrimary ?? false,
        }))
      );
      setHasLoadedAddresses(true);
    }
  }, [addressesQuery.data, hasLoadedAddresses, mode, form]);

  useEffect(() => {
    if (mode === "edit" && contactsQuery.data && !hasResetContacts) {
      form.setValue(
        "contacts",
        contactsQuery.data.map((c) => ({
          id: c.id,
          fullName: c.fullName ?? "",
          phone: c.phone ?? "",
          email: c.email ?? "",
          position: c.position ?? "",
          address: c.address ?? "",
          notes: c.notes ?? "",
          isPrimary: c.isPrimary ?? false,
        }))
      );
      setHasResetContacts(true);
    }
  }, [contactsQuery.data, hasResetContacts, mode, form]);

  const mockSubmit = async (values: CustomerFormValues) => {
    console.info("Mock customer payload:", values);
    await onSubmit(values);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.getAttribute("type") === "submit"
      ) {
        return;
      }
      e.preventDefault();
      const form = e.currentTarget;
      const focusableElements = Array.from(
        form.querySelectorAll(
          "input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), button[type='submit']:not([disabled])"
        )
      ).filter((el: any) => {
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
      }) as HTMLElement[];

      const currentIndex = focusableElements.indexOf(target);
      if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
      }
    }
  };

  const submitHandler = form.handleSubmit(mockSubmit);

  const statusError = form.formState.errors.statusId?.message;
  const tierError = form.formState.errors.tierId?.message;

  const tabs: Array<{ key: TabKey; label: string; icon: ReactNode }> = [
    { key: "management", label: "Quản lý & Phụ trách", icon: <Info size={14} /> },
    { key: "address", label: "Địa chỉ", icon: <ChevronRight size={14} /> },
    { key: "contacts", label: "Liên hệ", icon: <Users size={14} /> },
    { key: "notes", label: "Mô tả / Ghi chú", icon: <Check size={14} /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-form-title"
      aria-describedby="customer-form-description"
    >
      <div className="mx-auto flex h-[calc(100vh-1.5rem)] w-full max-w-[900px] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:h-[calc(100vh-2rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                CRM 360
              </span>
              <span className="text-[11px] text-slate-500">Compact enterprise form</span>
            </div>
            <h2 id="customer-form-title" className="mt-2 text-[16px] font-bold tracking-tight text-slate-900">
              {mode === "create" ? "Tạo khách hàng" : "Chỉnh sửa khách hàng"}
            </h2>
            <p id="customer-form-description" className="mt-1 text-[11px] text-slate-500">
              Thông tin cốt lõi theo mô hình CRM 360 độ
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submitHandler} onKeyDown={handleKeyDown} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="space-y-4">
              <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[12px] font-semibold text-slate-900">Phân loại nhanh</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">3 nhóm dữ liệu để sàng lọc và phân luồng CRM.</p>
                    </div>
                    <CircleX size={14} className="text-slate-400" />
                  </div>

                  <div className="grid gap-3">
                    <FieldFrame label="Loại khách hàng" error={form.formState.errors.type?.message}>
                      <select className={inputClass} {...form.register("type")}>
                        {CUSTOMER_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FieldFrame>

                    <FieldFrame label="Trạng thái" error={statusError}>
                      <select
                        className={inputClass}
                        {...form.register("statusId", {
                          setValueAs: (value) => (value === "" ? undefined : Number(value)),
                        })}
                      >
                        <option value="">Chọn trạng thái</option>
                        {CUSTOMER_STATUS_OPTIONS.map((option, index) => (
                          <option key={option.value} value={index + 1}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FieldFrame>

                    <FieldFrame label="Phân hạng" error={tierError}>
                      <select
                        className={inputClass}
                        {...form.register("tierId", {
                          setValueAs: (value) => (value === "" ? undefined : Number(value)),
                        })}
                      >
                        <option value="">Chọn phân hạng</option>
                        {CUSTOMER_TIER_OPTIONS.map((option, index) => (
                          <option key={option.value} value={index + 1}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FieldFrame>
                  </div>
                </div>

                <div className="rounded-[14px] border border-slate-200 p-4">
                  <div className="mb-3">
                    <h3 className="text-[12px] font-semibold text-slate-900">Thông tin lõi</h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">Bố cục 2 cột để nhập nhanh, tối ưu cho thao tác data entry.</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <FieldFrame
                      label="Tên khách hàng"
                      required
                      error={form.formState.errors.name?.message}
                      className="md:col-span-2"
                    >
                      <input className={inputClass} {...form.register("name")} />
                    </FieldFrame>

                    <FieldFrame label="Tên viết tắt" error={form.formState.errors.shortName?.message}>
                      <input className={inputClass} {...form.register("shortName")} />
                    </FieldFrame>

                    <FieldFrame label="Mã số thuế" error={form.formState.errors.taxCode?.message}>
                      <input className={inputClass} {...form.register("taxCode")} />
                    </FieldFrame>

                    <FieldFrame label="Số điện thoại" error={form.formState.errors.phone?.message}>
                      <input className={inputClass} {...form.register("phone")} />
                    </FieldFrame>

                    <FieldFrame label="Email" error={form.formState.errors.email?.message}>
                      <input className={inputClass} inputMode="email" {...form.register("email")} />
                    </FieldFrame>

                    <FieldFrame label="Số fax" error={form.formState.errors.fax?.message}>
                      <input className={inputClass} {...form.register("fax")} />
                    </FieldFrame>
                  </div>
                </div>
              </section>

              <section className="rounded-[14px] border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-900">Thông tin mở rộng</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">Tách tab để giảm chiều cao form và giữ nhịp nhập liệu.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pb-4">
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab.key;

                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveTab(tab.key)}
                          className={`inline-flex items-center gap-2 rounded-[999px] border px-3 py-1.5 text-[11px] font-semibold transition ${
                            isActive
                              ? "border-sky-200 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4">
                  {activeTab === "management" && (
                    <div className="grid gap-3 md:grid-cols-3">
                      <FieldFrame label="Nguồn khách hàng" error={form.formState.errors.sourceId?.message}>
                        <select
                          className={inputClass}
                          {...form.register("sourceId", {
                            setValueAs: (value) => (value === "" ? undefined : Number(value)),
                          })}
                        >
                          <option value="">Chọn nguồn khách hàng</option>
                          {sourceOptions.length > 0 ? (
                            sourceOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              {referencesQuery.isLoading ? "Đang tải nguồn..." : "Không có dữ liệu"}
                            </option>
                          )}
                        </select>
                      </FieldFrame>

                      <FieldFrame label="Sale phụ trách" error={form.formState.errors.assignedTo?.message}>
                        <select
                          className={inputClass}
                          {...form.register("assignedTo", {
                            setValueAs: (value) => (value === "" ? undefined : Number(value)),
                          })}
                          disabled={lockSaleAssignee}
                        >
                          <option value="">Chọn sale phụ trách</option>
                          {saleOptions.length > 0 ? (
                            saleOptions.map((sale) => (
                              <option key={sale.id} value={sale.id}>
                                {sale.fullName}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              {salesUsersQuery.isLoading ? "Đang tải danh sách..." : "Không có dữ liệu"}
                            </option>
                          )}
                        </select>
                      </FieldFrame>

                      <FieldFrame label="Ngày thành lập" error={form.formState.errors.establishedDate?.message}>
                        <div className="relative">
                          <CalendarDays
                            size={14}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input className={`${inputClass} pl-9`} type="date" {...form.register("establishedDate")} />
                        </div>
                      </FieldFrame>
                    </div>
                  )}

                  {activeTab === "address" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider">
                            Danh sách địa chỉ ({addressFields.length})
                          </h4>
                          <p className="text-[11px] text-slate-550 mt-0.5">
                            Thêm các địa chỉ liên quan đến khách hàng này. Chọn chính xác 1 địa chỉ chính.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            appendAddress({
                              addressType: "OFFICE",
                              fullAddress: "",
                              provinceId: undefined,
                              isPrimary: addressFields.length === 0,
                            })
                          }
                          className="inline-flex h-8 items-center justify-center rounded-[6px] bg-sky-50 border border-sky-200 px-3 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 transition"
                        >
                          + Thêm địa chỉ
                        </button>
                      </div>

                      {(() => {
                        const addressesErr = form.formState.errors.addresses;
                        const message =
                          addressesErr?.message || (addressesErr as any)?.root?.message;
                        if (!message) return null;
                        return (
                          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[11px] text-red-700">
                            <CircleX size={14} />
                            <span>{message}</span>
                          </div>
                        );
                      })()}

                      {addressFields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-slate-300 text-center">
                          <Info className="text-slate-400 mb-2" size={24} />
                          <p className="text-[11px] text-slate-600 font-medium">Chưa có địa chỉ nào.</p>
                          <p className="text-[10px] text-slate-455 mt-0.5">Nhấp vào nút &quot;Thêm địa chỉ&quot; ở trên để bắt đầu.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {addressFields.map((field, index) => {
                            const errors = form.formState.errors.addresses?.[index];

                            return (
                              <div
                                key={field.id}
                                className={`rounded-xl border p-4 transition ${
                                  form.watch(`addresses.${index}.isPrimary`)
                                    ? "border-sky-300 bg-sky-50/10"
                                    : "border-slate-200 bg-slate-50/20"
                                }`}
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                                      {index + 1}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-750">
                                      Địa chỉ {index + 1}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeAddress(index)}
                                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-[11px] font-semibold transition"
                                  >
                                    <Trash2 size={13} />
                                    Xóa
                                  </button>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  <FieldFrame label="Loại địa chỉ" error={errors?.addressType?.message}>
                                    <select
                                      className={inputClass}
                                      {...form.register(`addresses.${index}.addressType`)}
                                    >
                                      <option value="OFFICE">Văn phòng</option>
                                      <option value="BILLING">Xuất hoá đơn</option>
                                      <option value="SHIPPING">Giao hàng</option>
                                    </select>
                                  </FieldFrame>

                                  <FieldFrame label="Tỉnh/thành" error={errors?.provinceId?.message}>
                                    <select
                                      className={inputClass}
                                      {...form.register(`addresses.${index}.provinceId`, {
                                        setValueAs: (value) => (value === "" ? undefined : Number(value)),
                                      })}
                                    >
                                      <option value="">Chọn tỉnh/thành</option>
                                      {provinceOptions.length > 0 ? (
                                        provinceOptions.map((prov) => (
                                          <option key={prov.id} value={prov.id}>
                                            {prov.name}
                                          </option>
                                        ))
                                      ) : (
                                        <option value="" disabled>
                                          {referencesQuery.isLoading ? "Đang tải danh sách..." : "Không có dữ liệu"}
                                        </option>
                                      )}
                                    </select>
                                  </FieldFrame>

                                  <FieldFrame
                                    label="Địa chỉ đầy đủ"
                                    required
                                    error={errors?.fullAddress?.message}
                                    className="md:col-span-2"
                                  >
                                    <textarea
                                      rows={2}
                                      className={textareaClass}
                                      placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                                      {...form.register(`addresses.${index}.fullAddress`)}
                                    />
                                  </FieldFrame>

                                  <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 md:col-span-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 self-center align-middle !mr-[5px]"
                                      checked={form.watch(`addresses.${index}.isPrimary`) || false}
                                      onChange={() => handleSetPrimaryAddress(index)}
                                    />
                                    <div>
                                      <span className="block text-[12px] font-medium text-slate-800">Đặt làm địa chỉ chính</span>
                                      <span className="block text-[11px] text-slate-500">Ưu tiên cho hiển thị và đồng bộ CRM.</span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "contacts" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider">
                            Danh sách liên hệ ({fields.length})
                          </h4>
                          <p className="text-[11px] text-slate-550 mt-0.5">
                            Thêm các liên hệ liên quan đến khách hàng này. Chọn chính xác 1 liên hệ chính.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            append({
                              fullName: "",
                              phone: "",
                              email: "",
                              position: "",
                              address: "",
                              notes: "",
                              isPrimary: fields.length === 0,
                            })
                          }
                          className="inline-flex h-8 items-center justify-center rounded-[6px] bg-sky-50 border border-sky-200 px-3 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 transition"
                        >
                          + Thêm liên hệ
                        </button>
                      </div>

                      {(() => {
                        const contactsErr = form.formState.errors.contacts;
                        const message =
                          contactsErr?.message || (contactsErr as any)?.root?.message;
                        if (!message) return null;
                        return (
                          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[11px] text-red-700">
                            <CircleX size={14} />
                            <span>{message}</span>
                          </div>
                        );
                      })()}

                      {fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-slate-300 text-center">
                          <Users className="text-slate-400 mb-2" size={24} />
                          <p className="text-[11px] text-slate-600 font-medium">Chưa có liên hệ nào.</p>
                          <p className="text-[10px] text-slate-455 mt-0.5">Nhấp vào nút &quot;Thêm liên hệ&quot; ở trên để bắt đầu.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {fields.map((field, index) => {
                            const errors = form.formState.errors.contacts?.[index];

                            return (
                              <div
                                key={field.id}
                                className={`rounded-xl border p-4 transition ${
                                  form.watch(`contacts.${index}.isPrimary`)
                                    ? "border-sky-300 bg-sky-50/10"
                                    : "border-slate-200 bg-slate-50/20"
                                }`}
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                                      {index + 1}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-750">
                                      Liên hệ {index + 1}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-[11px] font-semibold transition"
                                  >
                                    <Trash2 size={13} />
                                    Xóa
                                  </button>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  <FieldFrame
                                    label="Họ và tên"
                                    required
                                    error={errors?.fullName?.message}
                                  >
                                    <input
                                      className={inputClass}
                                      placeholder="VD: Nguyễn Văn A"
                                      {...form.register(`contacts.${index}.fullName`)}
                                    />
                                  </FieldFrame>

                                  <FieldFrame
                                    label="Chức vụ"
                                    error={errors?.position?.message}
                                  >
                                    <input
                                      className={inputClass}
                                      placeholder="VD: Giám đốc kinh doanh"
                                      {...form.register(`contacts.${index}.position`)}
                                    />
                                  </FieldFrame>

                                  <FieldFrame
                                    label="Số điện thoại"
                                    error={errors?.phone?.message}
                                  >
                                    <input
                                      className={inputClass}
                                      placeholder="VD: 0987654321"
                                      {...form.register(`contacts.${index}.phone`)}
                                    />
                                  </FieldFrame>

                                  <FieldFrame
                                    label="Email"
                                    error={errors?.email?.message}
                                  >
                                    <input
                                      className={inputClass}
                                      placeholder="VD: email@example.com"
                                      {...form.register(`contacts.${index}.email`)}
                                    />
                                  </FieldFrame>

                                  <FieldFrame
                                    label="Địa chỉ"
                                    className="md:col-span-2"
                                    error={errors?.address?.message}
                                  >
                                    <input
                                      className={inputClass}
                                      placeholder="VD: 123 Đường Láng, Đống Đa, Hà Nội"
                                      {...form.register(`contacts.${index}.address`)}
                                    />
                                  </FieldFrame>

                                  <FieldFrame
                                    label="Ghi chú"
                                    className="md:col-span-2"
                                    error={errors?.notes?.message}
                                  >
                                    <textarea
                                      rows={2}
                                      className={textareaClass}
                                      placeholder="Nhập ghi chú liên hệ..."
                                      {...form.register(`contacts.${index}.notes`)}
                                    />
                                  </FieldFrame>

                                  <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-1.5 md:col-span-2 cursor-pointer transition hover:bg-slate-100">
                                    <input
                                      type="checkbox"
                                      className="h-3.5 w-3.5 rounded-full border-slate-350 text-sky-600 focus:ring-sky-500 self-center align-middle !mr-[5px]"
                                      checked={!!form.watch(`contacts.${index}.isPrimary`)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          handleSetPrimaryContact(index);
                                        }
                                      }}
                                    />
                                    <div>
                                      <span className="block text-[11px] font-semibold text-slate-700 font-medium">
                                        Đặt làm liên hệ chính
                                      </span>
                                      <span className="block text-[10px] text-slate-500 mt-0.5">
                                        Đây là người liên hệ chính khi trao đổi công việc.
                                      </span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "notes" && (
                    <div className="grid gap-3">
                      <FieldFrame label="Mô tả / Ghi chú" error={form.formState.errors.description?.message}>
                        <textarea
                          rows={8}
                          className={`${textareaClass} min-h-[220px]`}
                          placeholder="Nhập ghi chú nội bộ, mô tả doanh nghiệp, lưu ý chăm sóc..."
                          {...form.register("description")}
                        />
                      </FieldFrame>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-10 items-center justify-center rounded-[6px] border border-slate-300 bg-white px-4 text-[12px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-[6px] bg-sky-600 px-4 text-[12px] font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo khách hàng" : "Cập nhật khách hàng"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}