"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TIER_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
} from "@/modules/customer/constants/customer.constants";
import { customerFormSchema, type CustomerFormValues } from "@/modules/customer/schemas/customer.schema";
import type { CustomerResponseDTO } from "@/modules/customer/types/customer.types";
import { normalizeCustomerStatus, normalizeCustomerTier } from "@/modules/customer/utils/customer.mapper";

type CustomerFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<CustomerResponseDTO> | null;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

const fieldClass =
  "w-full rounded-[5px] border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="text-[12px] text-red-600">{message}</span>;
}

export default function CustomerForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      type: initialValues?.type ?? "B2B",
      name: initialValues?.name ?? "",
      shortName: initialValues?.shortName ?? "",
      phone: initialValues?.phone ?? "",
      taxCode: initialValues?.taxCode ?? "",
      email: initialValues?.email ?? "",
      fax: initialValues?.fax ?? "",
      description: initialValues?.description ?? "",
      establishedDate: toDateInputValue(initialValues?.establishedDate),
      sourceId: initialValues?.sourceId,
      statusId: parseStatusId(initialValues?.statusName),
      tierId: parseTierId(initialValues?.tierName),
      assignedTo: initialValues?.assignedTo,
    },
  });

  useEffect(() => {
    form.reset({
      type: initialValues?.type ?? "B2B",
      name: initialValues?.name ?? "",
      shortName: initialValues?.shortName ?? "",
      phone: initialValues?.phone ?? "",
      taxCode: initialValues?.taxCode ?? "",
      email: initialValues?.email ?? "",
      fax: initialValues?.fax ?? "",
      description: initialValues?.description ?? "",
      establishedDate: toDateInputValue(initialValues?.establishedDate),
      sourceId: initialValues?.sourceId,
      statusId: parseStatusId(initialValues?.statusName),
      tierId: parseTierId(initialValues?.tierName),
      assignedTo: initialValues?.assignedTo,
    });
  }, [form, initialValues]);

  const submitHandler = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const statusError = form.formState.errors.statusId?.message;
  const tierError = form.formState.errors.tierId?.message;

  return (
    <form onSubmit={submitHandler} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Loại khách hàng</span>
          <select className={fieldClass} {...form.register("type")}>
            {CUSTOMER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.type?.message} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Trạng thái</span>
          <select
            className={fieldClass}
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
          <FieldError message={statusError} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Phân hạng</span>
          <select
            className={fieldClass}
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
          <FieldError message={tierError} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Tên khách hàng</span>
          <input className={fieldClass} {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Tên viết tắt</span>
          <input className={fieldClass} {...form.register("shortName")} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Số điện thoại</span>
          <input className={fieldClass} {...form.register("phone")} />
          <FieldError message={form.formState.errors.phone?.message} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Email</span>
          <input className={fieldClass} {...form.register("email")} />
          <FieldError message={form.formState.errors.email?.message} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
            Mã số thuế
          </span>
          <input className={fieldClass} {...form.register("taxCode")} />
          <FieldError message={form.formState.errors.taxCode?.message} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Số fax</span>
          <input className={fieldClass} {...form.register("fax")} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Nguồn khách hàng ID</span>
          <input
            type="number"
            className={fieldClass}
            {...form.register("sourceId", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Sale phụ trách ID</span>
          <input
            type="number"
            className={fieldClass}
            {...form.register("assignedTo", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Ngày thành lập</span>
          <input type="date" className={fieldClass} {...form.register("establishedDate")} />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Mô tả / ghi chú</span>
          <textarea rows={4} className={fieldClass} {...form.register("description")} />
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo khách hàng" : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}