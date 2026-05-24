"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Check, ChevronRight, CircleX, Info, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TIER_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
} from "@/modules/customer/constants/customer.constants";
import { useCustomerSalesUsers } from "@/modules/customer/hooks/useCustomers";
import type {
  CustomerAddressResponseDTO,
  CustomerResponseDTO,
} from "@/modules/customer/types/customer.types";
import { getCustomerTaxCode, normalizeCustomerStatus, normalizeCustomerTier } from "@/modules/customer/utils/customer.mapper";
import { useLeadReferences } from "@/modules/lead/hooks/useLeadReferences";

type CustomerFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<CustomerResponseDTO> | null;
  initialAddress?: Partial<CustomerAddressResponseDTO> | null;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

type TabKey = "management" | "address" | "notes";

function optionalNumber() {
  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number().int().positive().optional());
}

function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    });
}

const customerFormSchema = z
  .object({
    type: z.enum(["B2B", "B2C"]),
    name: z
      .string()
      .trim()
      .min(2, "Tên khách hàng phải có ít nhất 2 ký tự")
      .max(120, "Tên khách hàng không được vượt quá 120 ký tự"),
    shortName: optionalText(120),
    phone: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập số điện thoại")
      .max(20, "Số điện thoại không được vượt quá 20 ký tự"),
    taxCode: optionalText(20),
    email: z
      .string()
      .trim()
      .max(120, "Email không được vượt quá 120 ký tự")
      .optional()
      .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: "Email không hợp lệ",
      })
      .transform((value) => {
        const trimmed = value?.trim();
        return trimmed ? trimmed : undefined;
      }),
    fax: optionalText(20),
    description: optionalText(1000),
    establishedDate: optionalText(10),
    sourceId: optionalNumber(),
    statusId: optionalNumber(),
    tierId: optionalNumber(),
    assignedTo: optionalNumber(),
    addressType: z.enum(["OFFICE", "BILLING", "SHIPPING"]).optional(),
    provinceId: optionalNumber(),
    fullAddress: optionalText(500),
    isPrimaryAddress: z.boolean().optional(),
  })
  .superRefine((values, context) => {
    if (values.type === "B2B" && !values.taxCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxCode"],
        message: "Mã số thuế là bắt buộc với khách hàng B2B",
      });
    }
  });

type CustomerFormInput = z.input<typeof customerFormSchema>;
type CustomerFormValues = z.infer<typeof customerFormSchema>;

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
  const referencesQuery = useLeadReferences();
  const salesUsersQuery = useCustomerSalesUsers();
  const [activeTab, setActiveTab] = useState<TabKey>("management");

  const sourceOptions = referencesQuery.data?.sources ?? [];
  const saleOptions = salesUsersQuery.data ?? [];

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
      addressType: normalizeAddressType(initialAddress?.addressType),
      provinceId: initialAddress?.provinceId,
      fullAddress: initialAddress?.fullAddress ?? "",
      isPrimaryAddress: initialAddress?.isPrimary ?? true,
    }),
    [initialAddress, initialValues],
  );

  const form = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const mockSubmit = async (values: CustomerFormValues) => {
    console.info("Mock customer payload:", values);
    await onSubmit(values);
  };

  const submitHandler = form.handleSubmit(mockSubmit);

  const statusError = form.formState.errors.statusId?.message;
  const tierError = form.formState.errors.tierId?.message;

  const tabs: Array<{ key: TabKey; label: string; icon: ReactNode }> = [
    { key: "management", label: "Quản lý & Phụ trách", icon: <Info size={14} /> },
    { key: "address", label: "Địa chỉ", icon: <ChevronRight size={14} /> },
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

        <form onSubmit={submitHandler} className="flex min-h-0 flex-1 flex-col">
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
                    <div className="grid gap-3 md:grid-cols-2">
                      <FieldFrame label="Loại địa chỉ" error={form.formState.errors.addressType?.message}>
                        <select className={inputClass} {...form.register("addressType")}>
                          <option value="OFFICE">Văn phòng</option>
                          <option value="BILLING">Xuất hoá đơn</option>
                          <option value="SHIPPING">Giao hàng</option>
                        </select>
                      </FieldFrame>

                      <FieldFrame label="Mã tỉnh/thành" error={form.formState.errors.provinceId?.message}>
                        <input
                          className={inputClass}
                          inputMode="numeric"
                          placeholder="Nhập mã hoặc chọn mã"
                          {...form.register("provinceId", {
                            setValueAs: (value) => (value === "" ? undefined : Number(value)),
                          })}
                        />
                      </FieldFrame>

                      <FieldFrame
                        label="Địa chỉ đầy đủ"
                        error={form.formState.errors.fullAddress?.message}
                        className="md:col-span-2"
                      >
                        <textarea rows={3} className={textareaClass} {...form.register("fullAddress")} />
                      </FieldFrame>

                      <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 md:col-span-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          {...form.register("isPrimaryAddress")}
                        />
                        <div>
                          <span className="block text-[12px] font-medium text-slate-800">Đặt làm địa chỉ chính</span>
                          <span className="block text-[11px] text-slate-500">Ưu tiên cho hiển thị và đồng bộ CRM.</span>
                        </div>
                      </label>
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