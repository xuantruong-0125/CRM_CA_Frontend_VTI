"use client";

import type {
  LeadActivityStatisticsResponse,
  LeadActivityResponse,
  LeadResponse,
} from "@/modules/lead/types/lead.types";
import { LEAD_SHORTCUTS } from "@/modules/lead/utils/keyboard-shortcuts";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";

type LeadDetailCardProps = {
  lead: LeadResponse;
  activities: LeadActivityResponse[];
  activityStatistics?: LeadActivityStatisticsResponse;
  activityStatisticsLoading?: boolean;
  activityStatisticsError?: string;
  onCreateActivityClick?: () => void;
  onCreateTaskClick?: () => void;
};

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActivityTypeClass(activityType?: string) {
  const normalized = (activityType || "").toLowerCase();

  if (normalized.includes("call")) {
    return "bg-sky-100 text-sky-700";
  }
  if (normalized.includes("meeting")) {
    return "bg-amber-100 text-amber-700";
  }
  if (normalized.includes("email")) {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getActivityTypeLabel(activityType?: string) {
  const normalized = (activityType || "").toLowerCase();

  if (normalized.includes("call")) {
    return "Gọi điện";
  }
  if (normalized.includes("meeting")) {
    return "Gặp mặt";
  }
  if (normalized.includes("email")) {
    return "Email";
  }

  return activityType || "Khác";
}

export default function LeadDetailCard({
  lead,
  activities,
  activityStatistics,
  activityStatisticsLoading,
  activityStatisticsError,
  onCreateActivityClick,
  onCreateTaskClick,
}: LeadDetailCardProps) {
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(a.startDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.startDate || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const fallbackStatistics = sortedActivities.reduce(
    (totals, activity) => {
      const normalized = (activity.activityType || "").toLowerCase();

      if (normalized.includes("call")) {
        totals.callCount += 1;
      } else if (normalized.includes("meeting")) {
        totals.meetingCount += 1;
      } else if (normalized.includes("email")) {
        totals.emailCount += 1;
      }

      totals.totalCount += 1;
      return totals;
    },
    { callCount: 0, meetingCount: 0, emailCount: 0, totalCount: 0 }
  );

  const statistics = activityStatistics || fallbackStatistics;
  const hasStatisticsError = Boolean(activityStatisticsError) && !activityStatistics;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Thông tin lead</h2>
        <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <span className="font-medium">Liên hệ:</span> {lead.contactName || "-"}
          </p>
          <p>
            <span className="font-medium">Công ty:</span> {lead.companyName || "-"}
          </p>
          <p>
            <span className="font-medium">Điện thoại:</span> {lead.phone || "-"}
          </p>
          <p>
            <span className="font-medium">Email:</span> {lead.email || "-"}
          </p>
          <p>
            <span className="font-medium">Doanh thu kỳ vọng:</span>{" "}
            {lead.expectedRevenue?.toLocaleString("vi-VN") || "-"}
          </p>
          <p>
            <span className="font-medium">Mô tả:</span> {lead.description || "-"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">Lịch sử hoạt động chi tiết</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
              Tổng: {activityStatisticsLoading ? "..." : statistics.totalCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCreateActivityClick}
              className="h-[30px] rounded-sm border border-blue-600 border-dashed bg-white px-3 text-[12px] font-medium text-blue-600 transition hover:bg-blue-50 inline-flex items-center gap-1.5"
              title={LEAD_SHORTCUTS.CREATE_ACTIVITY.label}
            >
              Thêm log hoạt động
              <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.CREATE_ACTIVITY} />
            </button>
            <button
              type="button"
              onClick={onCreateTaskClick}
              className="h-[30px] rounded-sm border border-slate-300 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-1.5"
              title={LEAD_SHORTCUTS.CREATE_TASK.label}
            >
              Tạo nhắc việc
              <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.CREATE_TASK} />
            </button>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Đã gọi {activityStatisticsLoading ? "..." : statistics.callCount} lần, đã gặp mặt {activityStatisticsLoading ? "..." : statistics.meetingCount} lần, đã gửi email {activityStatisticsLoading ? "..." : statistics.emailCount} lần.
        </p>

        {hasStatisticsError && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {activityStatisticsError}
          </p>
        )}

        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-500">Tổng hoạt động</p>
            <p className="text-[15px] font-bold text-slate-900">{activityStatisticsLoading ? "..." : statistics.totalCount}</p>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
            <p className="text-[11px] text-sky-700">Gọi điện</p>
            <p className="text-[15px] font-bold text-sky-700">{activityStatisticsLoading ? "..." : statistics.callCount}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-[11px] text-amber-700">Meeting</p>
            <p className="text-[15px] font-bold text-amber-700">{activityStatisticsLoading ? "..." : statistics.meetingCount}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <p className="text-[11px] text-emerald-700">Email</p>
            <p className="text-[15px] font-bold text-emerald-700">{activityStatisticsLoading ? "..." : statistics.emailCount}</p>
          </div>
        </div>

        {!sortedActivities.length ? (
          <p className="text-sm text-slate-500">Chưa có hoạt động nào.</p>
        ) : (
          <ul className="space-y-3 text-sm text-slate-700">
            {sortedActivities.map((activity) => (
              <li key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${getActivityTypeClass(
                      activity.activityType
                    )}`}
                  >
                    {getActivityTypeLabel(activity.activityType)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formatDateTime(activity.startDate || activity.createdAt)}
                  </span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      activity.completedAt
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {activity.completedAt ? "Đã hoàn thành" : "Đang theo dõi"}
                  </span>
                </div>

                <p className="text-[13px] font-semibold text-slate-900">
                  {activity.subject || "(Không có tiêu đề)"}
                </p>

                <p className="mt-1 text-[12px] text-slate-700">{activity.description || "-"}</p>

                <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-slate-500 md:grid-cols-2">
                  <p>
                    Kết quả: <span className="font-medium text-slate-700">{activity.outcome || "-"}</span>
                  </p>
                  <p>
                    Hoàn thành lúc: <span className="font-medium text-slate-700">{formatDateTime(activity.completedAt)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}