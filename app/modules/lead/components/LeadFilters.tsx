"use client";

import type {
  LeadReferenceOptionResponse,
  MetadataItem,
} from "@/modules/lead/types/lead.types";

export type LeadFilterValues = {
  phone?: string;
  email?: string;
  provinceId?: number;
  organizationId?: number;
  statusId?: number;
  sourceId?: number;
};

type OrganizationFilterOption = {
  id: number;
  name: string;
};

type LeadFiltersProps = {
  statuses: LeadReferenceOptionResponse[];
  sources: LeadReferenceOptionResponse[];
  provinces: MetadataItem[];
  organizations: OrganizationFilterOption[];
  defaultValues: LeadFilterValues;
  onChange: (values: LeadFilterValues) => void;
  onReset: () => void;
};

export default function LeadFilters({
  statuses,
  sources,
  provinces,
  organizations,
  defaultValues,
  onChange,
  onReset,
}: LeadFiltersProps) {
  const normalizeFilterValues = (values: LeadFilterValues): LeadFilterValues => ({
    phone: values.phone?.trim() || undefined,
    email: values.email?.trim() || undefined,
    provinceId: values.provinceId || undefined,
    organizationId: values.organizationId || undefined,
    statusId: values.statusId || undefined,
    sourceId: values.sourceId || undefined,
  });

  const updateFilters = (nextValues: LeadFilterValues) => {
    onChange(normalizeFilterValues(nextValues));
  };

  // Các class dùng chung cho Select và Label để giữ UI đồng nhất
  // Đã thêm các class appearance-none và custom SVG (stroke màu #cbd5e1 giống border slate-300)
  const selectClassName = `h-8 w-full rounded border border-slate-300 bg-white px-2 pr-7 text-[12px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20fill='none'%20viewBox='0%200%2020%2020'%3E%3Cpath%20stroke='%23cbd5e1'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20d='M6%208l4%204%204-4'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.25rem_center] bg-[length:1.25rem_1.25rem]`;
  const labelClassName = "mb-1 block text-[12px] font-medium text-slate-700";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

        <div>
          <label className={labelClassName}>
            Tỉnh/Thành phố
          </label>
          <select
            value={defaultValues.provinceId ?? ""}
            onChange={(event) =>
              updateFilters({
                ...defaultValues,
                provinceId: event.target.value
                  ? Number.parseInt(event.target.value, 10)
                  : undefined,
              })
            }
            className={selectClassName}
          >
            <option value="">Tất cả</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName}>
            Nhóm bán hàng
          </label>
          <select
            value={defaultValues.organizationId ?? ""}
            onChange={(event) =>
              updateFilters({
                ...defaultValues,
                organizationId: event.target.value
                  ? Number.parseInt(event.target.value, 10)
                  : undefined,
              })
            }
            className={selectClassName}
          >
            <option value="">Tất cả</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName}>
            Trạng thái
          </label>
          <select
            value={defaultValues.statusId ?? ""}
            onChange={(event) =>
              updateFilters({
                ...defaultValues,
                statusId: event.target.value
                  ? Number.parseInt(event.target.value, 10)
                  : undefined,
              })
            }
            className={selectClassName}
          >
            <option value="">Tất cả</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName}>
            Nguồn
          </label>
          <select
            value={defaultValues.sourceId ?? ""}
            onChange={(event) =>
              updateFilters({
                ...defaultValues,
                sourceId: event.target.value
                  ? Number.parseInt(event.target.value, 10)
                  : undefined,
              })
            }
            className={selectClassName}
          >
            <option value="">Tất cả</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200/60 pt-3">
        <button
          type="button"
          onClick={() => {
            onReset();
          }}
          className="inline-flex h-7 items-center gap-1.5 rounded bg-slate-200/60 px-3 text-[12px] font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}