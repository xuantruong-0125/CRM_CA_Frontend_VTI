"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, ChevronsRight } from "lucide-react";
import type { LeadResponse } from "@/modules/lead/types/lead.types";
import styles from "@/modules/lead/styles/lead.module.css";
import { useCurrentUser } from "@/core/auth/useCurrentUser";

type LeadTableProps = {
  leads: LeadResponse[];
  loading: boolean;
  provinceNameById: Record<number, string>;
  statusNameById: Record<number, string>;
  maskPhoneEnabled: boolean;
  maskEmailEnabled: boolean;
  loadingEditLeadId?: number | null;
  onEdit: (lead: LeadResponse) => void;
  onDelete: (lead: LeadResponse) => void;
  onConvert: (lead: LeadResponse) => void;
  onStatusChange?: (lead: LeadResponse, newStatusId: number) => void;
};

type ColumnKey =
  | "contactName"
  | "companyName"
  | "phone"
  | "email"
  | "province"
  | "expectedRevenue"
  | "status"
  | "actions";

type ColumnConfig = {
  key: ColumnKey;
  label: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  align?: "left" | "right";
};

const COLUMN_CONFIG: ColumnConfig[] = [
  { key: "contactName", label: "Tên liên hệ", defaultWidth: 140, minWidth: 30, maxWidth: 220 },
  { key: "companyName", label: "Công ty", defaultWidth: 140, minWidth: 30, maxWidth: 220 },
  { key: "phone", label: "Điện thoại", defaultWidth: 100, minWidth: 30, maxWidth: 160 },
  { key: "email", label: "Email", defaultWidth: 160, minWidth: 30, maxWidth: 240 },
  { key: "province", label: "Tỉnh/TP", defaultWidth: 110, minWidth: 30, maxWidth: 160 },
  { key: "expectedRevenue", label: "Doanh số DK", defaultWidth: 120, minWidth: 30, maxWidth: 180 },
  { key: "status", label: "Trạng thái", defaultWidth: 130, minWidth: 30, maxWidth: 190 },
  { key: "actions", label: "Thao tác", defaultWidth: 120, minWidth: 30, maxWidth: 260, align: "left" },
];

function maskPhone(phone?: string) {
  if (!phone) {
    return "-";
  }

  const trimmedPhone = phone.trim();
  if (trimmedPhone.length <= 4) {
    return "*".repeat(trimmedPhone.length);
  }

  const visibleTail = trimmedPhone.slice(-4);
  const maskedHead = "*".repeat(trimmedPhone.length - 4);
  return `${maskedHead}${visibleTail}`;
}

function maskEmail(email?: string) {
  if (!email) {
    return "-";
  }

  const trimmedEmail = email.trim();
  const atIndex = trimmedEmail.indexOf("@");
  if (atIndex <= 0) {
    return "***";
  }

  const localPart = trimmedEmail.slice(0, atIndex);
  const domainPart = trimmedEmail.slice(atIndex + 1);

  const visibleLocalPrefix = localPart.slice(0, 1);
  const visibleLocalSuffix = localPart.length > 2 ? localPart.slice(-1) : "";
  const maskedLocalCoreLength = Math.max(localPart.length - (visibleLocalPrefix.length + visibleLocalSuffix.length), 1);
  const maskedLocal = `${visibleLocalPrefix}${"*".repeat(maskedLocalCoreLength)}${visibleLocalSuffix}`;

  const dotIndex = domainPart.lastIndexOf(".");
  if (dotIndex <= 0) {
    return `${maskedLocal}@***`;
  }

  const domainName = domainPart.slice(0, dotIndex);
  const domainExt = domainPart.slice(dotIndex);
  const visibleDomainPrefix = domainName.slice(0, 1);
  const maskedDomainCoreLength = Math.max(domainName.length - visibleDomainPrefix.length, 1);
  const maskedDomain = `${visibleDomainPrefix}${"*".repeat(maskedDomainCoreLength)}`;

  return `${maskedLocal}@${maskedDomain}${domainExt}`;
}

function getStatusToneClass(statusName?: string) {
  const normalizedStatus = (statusName || "").toLowerCase();

  if (normalizedStatus.includes("mới") || normalizedStatus.includes("new")) {
    return styles.statusToneNew;
  }

  if (
    normalizedStatus.includes("liên hệ") ||
    normalizedStatus.includes("contact")
  ) {
    return styles.statusToneContact;
  }

  if (
    normalizedStatus.includes("chuyển đổi") ||
    normalizedStatus.includes("convert")
  ) {
    return styles.statusToneConverted;
  }

  if (
    normalizedStatus.includes("giao dịch") ||
    normalizedStatus.includes("transaction")
  ) {
    return styles.statusToneTransaction;
  }

  if (
    normalizedStatus.includes("ngừng") ||
    normalizedStatus.includes("stop")
  ) {
    return styles.statusToneStopped;
  }

  return styles.statusToneDefault;
}

export default function LeadTable({
  leads,
  loading,
  provinceNameById,
  statusNameById,
  maskPhoneEnabled,
  maskEmailEnabled,
  loadingEditLeadId,
  onEdit,
  onDelete,
  onConvert,
  onStatusChange,
}: LeadTableProps) {
  const { mounted, isSale } = useCurrentUser();
  const [columnWidths, setColumnWidths] = useState<Record<ColumnKey, number>>(() => {
    return COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.key] = column.defaultWidth;
      return acc;
    }, {} as Record<ColumnKey, number>);
  });

  const columnMinWidths = useMemo(() => {
    return COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.key] = column.minWidth;
      return acc;
    }, {} as Record<ColumnKey, number>);
  }, []);

  const columnMaxWidths = useMemo(() => {
    return COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.key] = column.maxWidth;
      return acc;
    }, {} as Record<ColumnKey, number>);
  }, []);

  const totalTableWidth = useMemo(() => {
    return COLUMN_CONFIG.reduce((sum, column) => sum + columnWidths[column.key], 0);
  }, [columnWidths]);

  const canDelete = mounted ? !isSale : false;

  const startColumnResize = (columnKey: ColumnKey, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = columnWidths[columnKey];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const nextWidth = Math.min(
        columnMaxWidths[columnKey],
        Math.max(columnMinWidths[columnKey], startWidth + deltaX)
      );
      setColumnWidths((current) => ({
        ...current,
        [columnKey]: nextWidth,
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (loading) {
    return (
      <div className={styles.loadingRow}>
        Đang tải danh sách Lead...
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className={styles.emptyRow}>
        Không có dữ liệu lead.
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table
        className={styles.table}
        style={{ width: `${totalTableWidth}px`, minWidth: "100%" }}
      >
        <colgroup>
          {COLUMN_CONFIG.map((column) => (
            <col key={column.key} style={{ width: `${columnWidths[column.key]}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {COLUMN_CONFIG.map((column) => (
              <th
                key={column.key}
                className={`${styles.headerCell} ${column.align === "right" ? styles.headerCellRight : ""}`}
              >
                <span className={styles.headerLabel}>{column.label}</span>
                <button
                  type="button"
                  aria-label={`Resize ${column.label}`}
                  onMouseDown={(event) => startColumnResize(column.key, event)}
                  className={styles.resizeHandle}
                >
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                {lead.id ? (
                  <Link href={`/leads/${lead.id}`} className={styles.leadLink}>
                    {lead.contactName || "-"}
                  </Link>
                ) : (
                  lead.contactName || "-"
                )}
              </td>
              <td title={lead.companyName || ""}>
                {lead.companyName || "-"}
              </td>
              <td>
                {maskPhoneEnabled ? maskPhone(lead.phone) : (lead.phone || "-")}
              </td>
              <td title={lead.email || ""}>
                {maskEmailEnabled ? maskEmail(lead.email) : (lead.email || "-")}
              </td>
              <td>
                {lead.provinceId ? provinceNameById[lead.provinceId] ?? `#${lead.provinceId}` : "-"}
              </td>
              <td>
                {(lead.expectedRevenue ?? 0).toLocaleString("vi-VN")} đ
              </td>
              <td>
                {(() => {
                  const isConvertedStatus = lead.statusId && statusNameById[lead.statusId] &&
                    (statusNameById[lead.statusId].toLowerCase().includes("chuyển đổi") ||
                     statusNameById[lead.statusId].toLowerCase().includes("converted"));

                  // Nếu đã chuyển đổi thì khóa dropdown lại thành text
                  if (isConvertedStatus) {
                    const statusName = statusNameById[lead.statusId!];
                    return (
                      <span
                        className={`${styles.statusPill} ${getStatusToneClass(statusName)}`}
                        title="Trạng thái không thể thay đổi"
                      >
                        {statusName}
                      </span>
                    );
                  }

                  return (
                    <select
                      value={lead.statusId ?? ""}
                      onChange={(e) => {
                        const newStatusId = Number(e.target.value);
                        if (onStatusChange && newStatusId) {
                          onStatusChange(lead, newStatusId);
                        }
                      }}
                      className={`${styles.statusSelect} ${
                        lead.statusId && statusNameById[lead.statusId]
                          ? getStatusToneClass(statusNameById[lead.statusId])
                          : styles.statusToneDefault
                      }`}
                      title="Thay đổi trạng thái"
                    >
                      {/* Lọc bỏ trạng thái đã chuyển đổi khỏi danh sách dropdown */}
                      {Object.entries(statusNameById)
                        .filter(([, name]) => {
                          const lowerName = name.toLowerCase();
                          return !lowerName.includes("chuyển đổi") && !lowerName.includes("converted");
                        })
                        .map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                      ))}
                    </select>
                  );
                })()}
              </td>
              <td className={styles.actionsCell}>
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => onEdit(lead)}
                    disabled={Boolean(lead.id && loadingEditLeadId === lead.id)}
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    title="Chỉnh sửa"
                  >
                    <Pencil size={14} />
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(lead)}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {lead.isConverted ? (
                    <button
                      type="button"
                      disabled
                      tabIndex={-1}
                      aria-hidden="true"
                      className={`${styles.actionBtn} ${styles.convertBtn} invisible pointer-events-none`}
                      title="Chuyển đổi"
                    >
                      <ChevronsRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onConvert(lead)}
                      className={`${styles.actionBtn} ${styles.convertBtn}`}
                      title="Chuyển đổi"
                    >
                      <ChevronsRight size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}