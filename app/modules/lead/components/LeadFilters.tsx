"use client";

import type {
  LeadReferenceOptionResponse,
} from "@/modules/lead/types/lead.types";
import styles from "@/modules/lead/styles/lead.module.css";

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
  provinces: LeadReferenceOptionResponse[];
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

  return (
    <div>
      <div className={styles.filterGrid}>

        <div className={styles.filterCard}>
          <label>Tỉnh/Thành phố</label>
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
          >
            <option value="">Tất cả</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterCard}>
          <label>Nhóm bán hàng</label>
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
          >
            <option value="">Tất cả</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterCard}>
          <label>Trạng thái</label>
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
          >
            <option value="">Tất cả</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterCard}>
          <label>Nguồn</label>
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

      <div className={styles.filterActions}>
        <button
          type="button"
          onClick={() => {
            onReset();
          }}
          className={styles.btnOutline}
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}