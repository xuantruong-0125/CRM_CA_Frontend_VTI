"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { useForm, FieldError, Controller } from "react-hook-form";
import { leadFormSchema, type LeadFormValues } from "@/modules/lead/schemas/lead.schema";
import type {
  LeadReferenceOptionResponse,
  MetadataItem,
} from "@/modules/lead/types/lead.types";
import { LEAD_SHORTCUTS, matchesShortcut } from "@/modules/lead/utils/keyboard-shortcuts";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";
import { useCurrentUser } from "@/core/auth/useCurrentUser";

type LeadFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<LeadFormValues>;
  statuses: LeadReferenceOptionResponse[];
  sources: LeadReferenceOptionResponse[];
  campaigns: LeadReferenceOptionResponse[];
  assignees: MetadataItem[];
  provinces: LeadReferenceOptionResponse[];
  products: MetadataItem[];
  onSubmit: (values: LeadFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Ultra Compact ERP style (Fits in 1 screen)
// ═══════════════════════════════════════════════════════════════════════════

const DS = {
  spacing: {
    colGap: "gap-x-3",
    rowGap: "gap-y-1",
    innerGap: "gap-x-1",
  },
  input: {
    height: "h-[27px]",
    padding: "px-2 py-0.5",
    border: "border border-slate-300",
    borderError: "border border-red-500",
    borderRadius: "rounded-[3px]",
    focus: "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
    focusError: "focus:border-red-500 focus:ring-1 focus:ring-red-500",
  },
  sectionSpacing: "flex flex-col gap-y-1 rounded-md border border-slate-200 bg-white/80 p-2",
  formSpacing: "flex flex-col gap-y-1",
};

const getInputClassName = (hasError: boolean, isSelect: boolean = false) => {
  let baseClasses = `w-full ${DS.input.height} ${DS.input.padding} ${DS.input.borderRadius} bg-white text-[12px] text-slate-900 outline-none transition-all duration-200`;
  
  // Custom arrow cho select với màu slate-300 (#cbd5e1)
  if (isSelect) {
    baseClasses += ` appearance-none pr-7 bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20fill='none'%20viewBox='0%200%2020%2020'%3E%3Cpath%20stroke='%23cbd5e1'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20d='M6%208l4%204%204-4'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.25rem_center] bg-[length:1.25rem_1.25rem]`;
  }

  const borderClasses = hasError ? DS.input.borderError : DS.input.border;
  const focusClasses = hasError ? DS.input.focusError : DS.input.focus;
  return `${baseClasses} ${borderClasses} ${focusClasses}`;
};

const FormLabel = ({ children, required = false }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-[12px] font-medium text-slate-700 leading-none">
    {children}
    {required && <span className="ml-0.5 text-red-500 font-bold">*</span>}
  </label>
);

const ErrorText = ({ error }: { error?: unknown }) => {
  if (!error || typeof error !== "object" || !("message" in error)) return null;
  return (
    <span
      className="text-[9px] text-red-500 font-medium leading-tight break-words text-right"
      title={String(error.message)}
    >
      {String(error.message)}
    </span>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <h5 className="text-[10px] font-semibold tracking-wide text-slate-600 uppercase mb-0.5 mt-0">
    {title}
  </h5>
);

const isConvertedStatus = (status: LeadReferenceOptionResponse) => {
  const normalizedCode = status.code.toLowerCase();
  const normalizedName = status.name.toLowerCase();

  return (
    normalizedCode.includes("converted") ||
    normalizedName.includes("converted") ||
    normalizedName.includes("chuyển đổi")
  );
};

const FormField = ({ 
  children, 
  error, 
  label, 
  required = false,
  className = ""
}: { 
  children: React.ReactNode; 
  error?: unknown;
  label?: React.ReactNode;
  required?: boolean;
  className?: string;
}) => {
  const hasError = !!(error && typeof error === "object" && "message" in error);
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-0.5 flex min-h-[11px] items-start justify-between gap-2">
        {label ? <FormLabel required={required}>{label}</FormLabel> : <div></div>}
        {hasError && <ErrorText error={error} />}
      </div>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: MODAL CHỌN SẢN PHẨM CÓ PHÂN TRANG (CHUẨN ERP)
// ═══════════════════════════════════════════════════════════════════════════
function ProductSelectionModal({
  products,
  initialSelectedIds,
  onConfirm,
  onClose,
}: {
  products: MetadataItem[];
  initialSelectedIds: number[];
  onConfirm: (selectedIds: number[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 50;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const displayedProducts = filteredProducts.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const isAllPageSelected = displayedProducts.length > 0 && displayedProducts.every(p => selectedIds.includes(Number(p.id)));

  const handleToggleAllPage = () => {
    const pageIds = displayedProducts.map(p => Number(p.id));
    if (isAllPageSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(0, page), totalPages - 1));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="flex h-[82vh] max-h-[640px] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">Chọn sản phẩm quan tâm</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">Tìm kiếm nhanh và chọn nhiều sản phẩm trong một lần thao tác.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Search & Bulk Action */}
        <div className="space-y-2 border-b border-slate-200 bg-white px-3 py-2.5">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              className="h-8 w-full rounded-md border border-slate-300 bg-slate-50 pl-8 pr-3 text-[13px] text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/70 px-2.5 py-1.5">
            <label className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-slate-700 transition-colors hover:text-blue-600">
              <input
                type="checkbox"
                checked={isAllPageSelected}
                onChange={handleToggleAllPage}
                className="h-4 w-4 rounded-[5px] border-slate-300 text-blue-600 focus:ring-blue-500 self-center align-middle !mr-[5px]"
              />
              Chọn tất cả {displayedProducts.length} sản phẩm trang này
            </label>
            <div className="text-[12px] text-slate-600">
              Đã chọn: <span className="rounded bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-700">{selectedIds.length}</span>
            </div>
          </div>
        </div>

        {/* Danh sách Sản phẩm */}
        <div className="flex-1 overflow-y-auto bg-slate-50/60 p-2">
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {displayedProducts.map((p) => (
                <label
                  key={p.id}
                  className={`group flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-2 transition-all ${
                    selectedIds.includes(Number(p.id))
                      ? "border-blue-300 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-100/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(Number(p.id))}
                    onChange={() => handleToggle(Number(p.id))}
                    className="h-4 w-4 rounded-[5px] border-slate-300 text-blue-600 focus:ring-blue-500 self-center align-middle !mr-[5px]"
                  />
                  <span className="flex-1 select-none text-[12px] font-medium text-slate-800">{p.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-slate-500">
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          )}
        </div>

        {/* Phân trang (Pagination) */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600">
          <div>
            Hiển thị {filteredProducts.length === 0 ? 0 : currentPage * ITEMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * ITEMS_PER_PAGE, filteredProducts.length)} / {filteredProducts.length}
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 0}
              onClick={() => goToPage(0)}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              «
            </button>
            <button
              type="button"
              disabled={currentPage <= 0}
              onClick={() => goToPage(currentPage - 1)}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              ‹
            </button>
              <span className="px-2 font-medium text-[13px]">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => goToPage(currentPage + 1)}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              ›
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => goToPage(totalPages - 1)}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[12px] text-slate-600">
            Tổng sản phẩm đã chọn: <span className="font-semibold text-blue-700">{selectedIds.length}</span>
          </div>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md border border-slate-300 bg-white px-4 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedIds)}
            className="h-8 rounded-md bg-blue-600 px-5 text-[12px] font-medium text-white transition-colors shadow-sm hover:bg-blue-700"
          >
            Xác nhận
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadForm({
  mode,
  initialValues,
  statuses,
  sources,
  campaigns,
  assignees,
  provinces,
  products,
  onSubmit,
  onCancel,
  isSubmitting,
}: LeadFormProps) {
  const { mounted, currentUser, isSale } = useCurrentUser();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const convertedStatusIds = new Set(
    statuses.filter(isConvertedStatus).map((status) => Number(status.id))
  );
  const selectableStatuses = statuses.filter((status) => !isConvertedStatus(status));
  const isConvertedLead =
    mode === "edit" &&
    initialValues?.statusId !== undefined &&
    initialValues?.statusId !== null &&
    convertedStatusIds.has(Number(initialValues.statusId));
  const isFormLocked = isConvertedLead;
  const lockAssignee = mounted && isSale && !!currentUser;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm({
    // @ts-expect-error - Zod schema type inference differs from react-hook-form strict types
    resolver: zodResolver(leadFormSchema),
    mode: "onChange",
    defaultValues: initialValues || {},
  });

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const safeValues = { ...initialValues };
      
      if (safeValues.productInterestIds) {
        if (Array.isArray(safeValues.productInterestIds)) {
          safeValues.productInterestIds = safeValues.productInterestIds
            .map((item: unknown) => {
              if (item && typeof item === "object" && "id" in item) {
                return Number((item as { id: unknown }).id);
              }
              if (item && typeof item === "object" && "productId" in item) {
                return Number((item as { productId: unknown }).productId);
              }
              return Number(item);
            })
            .filter((id: number) => !isNaN(id) && id > 0);
        } else if (typeof safeValues.productInterestIds === "string") {
          safeValues.productInterestIds = (safeValues.productInterestIds as string)
            .split(",")
            .map(Number)
            .filter((id: number) => !isNaN(id) && id > 0);
        }
      }

      if (safeValues.expectedRevenue !== undefined && safeValues.expectedRevenue !== null) {
        safeValues.expectedRevenue = Number(safeValues.expectedRevenue);
      }

      reset(safeValues);
    }
  }, [initialValues, reset]);

  useEffect(() => {
    if (lockAssignee && currentUser) {
      setValue("assignedTo", currentUser.id, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [currentUser, lockAssignee, setValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesShortcut(e, LEAD_SHORTCUTS.SAVE_FORM)) {
        e.preventDefault();
        submitButtonRef.current?.click();
      } else if (matchesShortcut(e, LEAD_SHORTCUTS.CANCEL_FORM)) {
        e.preventDefault();
        cancelButtonRef.current?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (!form) return;
      
      const focusableElements = Array.from(
        form.querySelectorAll("input:not([type='hidden']), select, textarea, button[type='submit']")
      ) as HTMLElement[];
      
      const currentIndex = focusableElements.indexOf(e.currentTarget);
      if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
      }
    }
  };

  const handleFormSubmit = async (values: LeadFormValues) => {
    if (isFormLocked) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`${DS.formSpacing} text-[13px]`}>
      {isFormLocked && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-1.5 text-[14px] text-amber-700">
          Lead đang ở trạng thái &quot;Đã chuyển đổi&quot;, không thể chỉnh sửa thông tin.
        </div>
      )}

      <fieldset disabled={isSubmitting || isFormLocked} className="min-w-0 space-y-0.5">
      {/* SECTION 1: Contact & Classification (2 columns) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${DS.spacing.colGap}`}>
        
        {/* --- Left Column: Contact Info --- */}
        <div className={DS.sectionSpacing}>
          <SectionHeader title="Thông tin liên hệ" />
          
          <FormField label="Tên liên hệ" required error={errors.contactName}>
            <input
              type="text"
              className={getInputClassName(!!errors.contactName)}
              {...register("contactName")}
              onKeyDown={handleKeyDown}
            />
          </FormField>

          <FormField label="Tên công ty" error={errors.companyName}>
            <input
              type="text"
              className={getInputClassName(!!errors.companyName)}
              {...register("companyName")}
              onKeyDown={handleKeyDown}
            />
          </FormField>

          <div className={`grid grid-cols-2 ${DS.spacing.innerGap}`}>
            <FormField label="Điện thoại" error={errors.phone}>
              <input
                type="text"
                className={getInputClassName(!!errors.phone)}
                {...register("phone")}
                onKeyDown={handleKeyDown}
              />
            </FormField>
            
            <FormField label="Email" error={errors.email}>
              <input
                type="email"
                className={getInputClassName(!!errors.email)}
                {...register("email")}
                onKeyDown={handleKeyDown}
              />
            </FormField>
          </div>

          <div className={`grid grid-cols-2 ${DS.spacing.innerGap}`}>
            <FormField label="CCCD / CMND" error={errors.citizenId}>
              <input
                type="text"
                className={getInputClassName(!!errors.citizenId)}
                {...register("citizenId")}
                onKeyDown={handleKeyDown}
              />
            </FormField>
            
            <FormField label="Mã số thuế" error={errors.taxCode}>
              <input
                type="text"
                className={getInputClassName(!!errors.taxCode)}
                {...register("taxCode")}
                onKeyDown={handleKeyDown}
              />
            </FormField>
          </div>
        </div>

        {/* --- Right Column: CRM Classification --- */}
        <div className={DS.sectionSpacing}>
          <SectionHeader title="Phân loại" />
          
          <div className={`grid grid-cols-2 ${DS.spacing.innerGap}`}>
            <FormField label="Trạng thái" required error={errors.statusId}>
              {isFormLocked ? (
                <input
                  type="text"
                  readOnly
                  value="Đã chuyển đổi"
                  className={getInputClassName(false)}
                />
              ) : (
                <select
                  className={getInputClassName(!!errors.statusId, true)}
                  {...register("statusId")}
                  onKeyDown={handleKeyDown}
                >
                  <option value=""></option>
                  {selectableStatuses.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              )}
            </FormField>
            
            <FormField label="Nguồn Lead" error={errors.sourceId}>
              <select
                className={getInputClassName(!!errors.sourceId, true)}
                {...register("sourceId")}
                onKeyDown={handleKeyDown}
              >
                <option value=""></option>
                {sources.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className={`grid grid-cols-2 ${DS.spacing.innerGap}`}>
            <FormField label="Chiến dịch" error={errors.campaignId}>
              <select
                className={getInputClassName(!!errors.campaignId, true)}
                {...register("campaignId")}
                onKeyDown={handleKeyDown}
              >
                <option value=""></option>
                {campaigns.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </FormField>
            
            <FormField label="Người phụ trách" error={errors.assignedTo}>
              <select
                className={getInputClassName(!!errors.assignedTo, true)}
                {...register("assignedTo")}
                disabled={lockAssignee}
                onKeyDown={handleKeyDown}
              >
                <option value=""></option>
                {assignees.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Doanh thu dự kiến" error={errors.expectedRevenue}>
            <Controller
              name="expectedRevenue"
              control={control}
              render={({ field: { onChange, value, ref } }) => {
                const displayValue = value !== undefined && value !== null && !isNaN(Number(value))
                  ? new Intl.NumberFormat('vi-VN').format(Number(value))
                  : '';
                return (
                  <div className="relative">
                    <input
                      type="text"
                      ref={ref}
                      value={displayValue}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        onChange(rawValue ? Number(rawValue) : undefined);
                      }}
                      onKeyDown={handleKeyDown}
                      className={`${getInputClassName(!!errors.expectedRevenue)} pr-14 text-right`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-[3px] border-l border-slate-200 bg-slate-50 text-[12px] font-medium text-slate-500">
                      ₫
                    </span>
                  </div>
                );
              }}
            />
          </FormField>

          <FormField label="Sản phẩm quan tâm" error={errors.productInterestIds as FieldError}>
            <Controller
              name="productInterestIds"
              control={control}
              render={({ field: { onChange, value } }) => {
                let selectedIds: number[] = [];
                if (Array.isArray(value)) {
                  selectedIds = value.map(Number).filter(id => !isNaN(id));
                }

                const selectedProducts = products.filter((p) => selectedIds.includes(Number(p.id)));

                const handleRemove = (id: number) => {
                  const numId = Number(id);
                  onChange(selectedIds.filter((v) => v !== numId));
                };

                return (
                  <div className="flex items-start gap-2">
                    <div className={`min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5`}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[12px] font-medium text-slate-600">Danh sách đã chọn</span>
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">{selectedProducts.length}</span>
                      </div>
                      <div className="flex max-h-[60px] min-h-[26px] flex-wrap items-center gap-1 overflow-auto pr-0.5">
                        {selectedProducts.length === 0 && (
                          <span className="text-[11px] italic text-slate-400">Chưa chọn sản phẩm</span>
                        )}
                        {selectedProducts.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700"
                          >
                            {p.name}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(Number(p.id));
                              }}
                              className="flex h-3.5 w-3.5 items-center justify-center rounded hover:bg-blue-200 hover:text-red-500 transition-colors"
                            >
                              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(true)}
                      className="inline-flex h-[31px] flex-shrink-0 items-center gap-1 rounded-md border border-blue-600 border-dashed bg-white px-2.5 text-[12px] font-medium text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      Chọn
                    </button>

                    {/* Render Modal có phân trang */}
                    {isProductModalOpen && (
                      <ProductSelectionModal
                        products={products}
                        initialSelectedIds={selectedIds}
                        onConfirm={(newSelectedIds) => {
                          onChange(newSelectedIds);
                          setIsProductModalOpen(false);
                        }}
                        onClose={() => setIsProductModalOpen(false)}
                      />
                    )}
                  </div>
                );
              }}
            />
          </FormField>
        </div>
      </div>

      {/* SECTION 2: Address & Notes */}
      <div className={DS.sectionSpacing}>
        <SectionHeader title="Địa chỉ & Ghi chú" />
        
        <div className={`grid grid-cols-1 md:grid-cols-2 ${DS.spacing.colGap}`}>
          <div className="flex flex-col gap-y-2">
            <div className={`grid grid-cols-3 ${DS.spacing.innerGap}`}>
              <div className="col-span-1">
                <FormField label="Tỉnh / Thành phố" error={errors.provinceId}>
                  <select
                    className={getInputClassName(!!errors.provinceId, true)}
                    {...register("provinceId")}
                    onKeyDown={handleKeyDown}
                  >
                    <option value=""></option>
                    {provinces.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="Địa chỉ cụ thể" error={errors.address}>
                  <input
                    type="text"
                    className={getInputClassName(!!errors.address)}
                    {...register("address")}
                    onKeyDown={handleKeyDown}
                  />
                </FormField>
              </div>
            </div>

            <FormField label="Website" error={errors.website}>
              <input
                type="url"
                className={getInputClassName(!!errors.website)}
                {...register("website")}
                onKeyDown={handleKeyDown}
              />
            </FormField>
          </div>

          <div className="flex flex-col gap-y-2 h-full">
            <FormField label="Mô tả / Ghi chú" error={errors.description} className="h-full">
              <textarea
                rows={2}
                className={`${getInputClassName(!!errors.description)} min-h-[56px] resize-none py-1`}
                {...register("description")}
              />
            </FormField>
          </div>
        </div>
      </div>
      </fieldset>
      
      {/* ACTION BUTTONS */}
      <div className="mt-0.5 flex items-center justify-end gap-2 border-t border-slate-200 pt-1">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex h-[27px] items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          title={LEAD_SHORTCUTS.CANCEL_FORM.label}
        >
          Hủy
          <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.CANCEL_FORM} />
        </button>
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={isSubmitting || !isValid || isFormLocked}
          className="inline-flex h-[27px] items-center gap-1.5 rounded-sm bg-blue-600 px-4 text-[12px] font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          title={LEAD_SHORTCUTS.SAVE_FORM.label}
        >
          {isSubmitting && (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>
            {isFormLocked
              ? "Đã chuyển đổi"
              : isSubmitting
                ? "Đang lưu..."
                : "Lưu"}
          </span>
          {!isFormLocked && !isSubmitting && (
            <KeyboardShortcutBadge 
              shortcut={LEAD_SHORTCUTS.SAVE_FORM} 
              className="ml-auto"
            />
          )}
        </button>
      </div>

      {/* REQUIRED FIELDS EXPLANATION */}
      <div className="mt-0.5 flex items-start gap-2 rounded-sm border border-blue-100 bg-blue-50/50 p-1.5">
        <svg className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
        <div className="flex flex-1 flex-col text-[11px] text-blue-700 md:flex-row md:gap-4">
          <span><span className="text-red-500 font-bold">*</span> <strong>Tên liên hệ:</strong> Dùng để xưng hô và định danh khách hàng.</span>
          <span><span className="text-red-500 font-bold">*</span> <strong>Trạng thái:</strong> Xác định tiến độ trong quy trình Sales.</span>
        </div>
      </div>
    </form>
  );
}