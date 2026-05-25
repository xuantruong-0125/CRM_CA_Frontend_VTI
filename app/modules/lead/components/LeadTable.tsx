"use client";

import Link from "next/link";
import { useLeadActivityStatistics } from "@/modules/lead/hooks/useLeads";
import type { LeadResponse } from "@/modules/lead/types/lead.types";

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

type LeadActivityCellsProps = {
  leadId?: number;
};

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

function getStatusBadgeClass(statusName?: string) {
  const normalizedStatus = (statusName || "").toLowerCase();

  if (normalizedStatus.includes("mới") || normalizedStatus.includes("new")) {
    return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
  }

  if (
    normalizedStatus.includes("liên hệ") ||
    normalizedStatus.includes("contact")
  ) {
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  }

  if (
    normalizedStatus.includes("chuyển đổi") ||
    normalizedStatus.includes("convert")
  ) {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (
    normalizedStatus.includes("giao dịch") ||
    normalizedStatus.includes("transaction")
  ) {
    return "bg-violet-100 text-violet-700 ring-1 ring-violet-200";
  }

  if (
    normalizedStatus.includes("ngừng") ||
    normalizedStatus.includes("stop")
  ) {
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function LeadActivityCells({ leadId }: LeadActivityCellsProps) {
  const statisticsQuery = useLeadActivityStatistics(leadId);

  if (!leadId) {
    return <span className="text-slate-400">-</span>;
  }

  if (statisticsQuery.isLoading) {
    return <span className="text-slate-400">...</span>;
  }

  const statistics = statisticsQuery.data;

  if (!statistics) {
    return <span className="text-slate-400">-</span>;
  }

  return (
    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
      <span className="inline-flex items-center gap-1">
        <span className="text-[12px]">☎</span>
        <span>{statistics.callCount}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="text-[12px]">👤</span>
        <span>{statistics.meetingCount}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="text-[12px]">✉</span>
        <span>{statistics.emailCount}</span>
      </span>
    </div>
  );
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
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-[12px] text-slate-500">
        Đang tải danh sách Lead...
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-[12px] text-slate-500">
        Không có dữ liệu lead.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
      <table className="min-w-full border-collapse text-[12px] text-slate-700">
        <thead className="border-b border-slate-200 bg-[rgb(21,0,211)] text-left font-semibold text-white">
          <tr>
            <th className="whitespace-nowrap px-3 py-2">Tên liên hệ</th>
            <th className="whitespace-nowrap px-3 py-2">Công ty</th>
            <th className="whitespace-nowrap px-3 py-2">Điện thoại</th>
            <th className="whitespace-nowrap px-3 py-2">Email</th>
            <th className="whitespace-nowrap px-3 py-2">Tỉnh/TP</th>
            <th className="whitespace-nowrap px-3 py-2">Doanh số DK</th>
            <th className="whitespace-nowrap px-3 py-2">Trạng thái</th>
            <th className="whitespace-nowrap px-3 py-2">Hoạt động</th>
            <th className="whitespace-nowrap px-3 py-2 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50/80">
              <td className="whitespace-nowrap px-3 py-2 align-middle font-medium text-slate-900">
                {lead.id ? (
                  <Link href={`/leads/${lead.id}`} className="hover:text-sky-600 hover:underline">
                    {lead.contactName || "-"}
                  </Link>
                ) : (
                  lead.contactName || "-"
                )}
              </td>
              <td className="max-w-[150px] truncate px-3 py-2 align-middle" title={lead.companyName || ""}>
                {lead.companyName || "-"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 align-middle">
                {maskPhoneEnabled ? maskPhone(lead.phone) : (lead.phone || "-")}
              </td>
              <td className="max-w-[150px] truncate px-3 py-2 align-middle" title={lead.email || ""}>
                {maskEmailEnabled ? maskEmail(lead.email) : (lead.email || "-")}
              </td>
              <td className="whitespace-nowrap px-3 py-2 align-middle">
                {lead.provinceId ? provinceNameById[lead.provinceId] ?? `#${lead.provinceId}` : "-"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 align-middle font-medium text-slate-900">
                {(lead.expectedRevenue ?? 0).toLocaleString("vi-VN")} đ
              </td>
              <td className="whitespace-nowrap px-3 py-2 align-middle">
                {(() => {
                  const isConvertedStatus = lead.statusId && statusNameById[lead.statusId] &&
                    (statusNameById[lead.statusId].toLowerCase().includes("chuyển đổi") ||
                     statusNameById[lead.statusId].toLowerCase().includes("converted"));

                  // Nếu đã chuyển đổi thì khóa dropdown lại thành text
                  if (isConvertedStatus) {
                    const statusName = statusNameById[lead.statusId!];
                    return (
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium cursor-not-allowed ${getStatusBadgeClass(
                          statusName
                        )}`}
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
                      className={`cursor-pointer appearance-none rounded border-none px-2 py-0.5 text-[11px] font-medium outline-none ring-0 focus:ring-2 focus:ring-purple-500 ${
                        lead.statusId && statusNameById[lead.statusId]
                          ? getStatusBadgeClass(statusNameById[lead.statusId])
                          : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
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
                          <option key={id} value={id} className="bg-white text-slate-700">
                            {name}
                          </option>
                      ))}
                    </select>
                  );
                })()}
              </td>
              <td className="whitespace-nowrap px-3 py-2 align-middle">
                <LeadActivityCells leadId={lead.id} />
              </td>
              <td className="whitespace-nowrap px-3 py-2 align-middle">
                <div className="flex justify-end gap-2 text-[14px]">
                  <button
                    type="button"
                    onClick={() => onEdit(lead)}
                    disabled={Boolean(lead.id && loadingEditLeadId === lead.id)}
                    className="text-emerald-600 transition hover:text-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Chỉnh sửa"
                  >
                    {lead.id && loadingEditLeadId === lead.id ? "..." : "✎"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(lead)}
                    className="text-red-500 transition hover:text-red-400"
                    title="Xóa"
                  >
                    🗑
                  </button>
                  {!lead.isConverted && (
                    <button
                      type="button"
                      onClick={() => onConvert(lead)}
                      className="text-blue-500 transition hover:text-blue-400"
                      title="Chuyển đổi"
                    >
                      ⦿
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