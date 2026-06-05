"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateActivity, useUpdateActivity } from "@/modules/customer/hooks/useCustomerMutations";
import type { ActivityResponseDTO, CreateActivityDTO } from "@/modules/customer/types/customer.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { Phone, Video, Mail, Star } from "lucide-react";

type Props = {
  customerId: number;
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: Partial<ActivityResponseDTO> | null;
  activityId?: number;
};

const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 text-[12px] text-slate-800 outline-none transition duration-150 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/15 disabled:opacity-50";

const textareaClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 py-2 text-[12px] text-slate-800 outline-none transition duration-150 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/15 min-h-[80px] disabled:opacity-50";

const labelClass = "block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5";

// Convert ISO string from backend (e.g. "2025-06-05T10:30:00" or "2025-06-05T10:30:00.000Z")
// to the "YYYY-MM-DDTHH:mm" format required by datetime-local input
function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return "";
  // Take only first 16 chars: "YYYY-MM-DDTHH:mm"
  return iso.slice(0, 16);
}

// Convert datetime-local value ("YYYY-MM-DDTHH:mm" — 16 chars)
// or a full ISO string (already has seconds) to "YYYY-MM-DDTHH:mm:ss" for Spring
function toISOWithSeconds(val?: string): string | undefined {
  if (!val) return undefined;
  const trimmed = val.trim();
  if (trimmed.length === 16) {
    // "YYYY-MM-DDTHH:mm" — append seconds
    return trimmed + ":00";
  }
  if (trimmed.length >= 19) {
    // Already has seconds — return exactly 19 chars "YYYY-MM-DDTHH:mm:ss"
    return trimmed.slice(0, 19);
  }
  return trimmed;
}

export default function ActivityForm({ customerId, onClose, mode = "create", initialValues, activityId }: Props) {
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const [activityType, setActivityType] = useState(initialValues?.activityType ?? "MEETING");
  const [subject, setSubject] = useState(initialValues?.subject ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [startDate, setStartDate] = useState(toDatetimeLocalValue(initialValues?.startDate));
  const [endDate, setEndDate] = useState(toDatetimeLocalValue(initialValues?.endDate));
  const [completedAt, setCompletedAt] = useState(toDatetimeLocalValue(initialValues?.completedAt));
  const [outcome, setOutcome] = useState(initialValues?.outcome ?? "");
  const [isImportant, setIsImportant] = useState(Boolean(initialValues?.isImportant));
  const [status, setStatus] = useState(String(initialValues?.status ?? 1));

  const isSubmitting = createActivity.isPending || updateActivity.isPending;

  const submit = async () => {
    if (!subject.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoạt động");
      return;
    }

    const payload: CreateActivityDTO = {
      activityType,
      subject: subject.trim(),
      description: description.trim() || undefined,
      relatedToType: "CUSTOMER",
      relatedToId: customerId,
      performedBy: undefined,
      startDate: toISOWithSeconds(startDate),
      endDate: toISOWithSeconds(endDate),
      completedAt: toISOWithSeconds(completedAt),
      outcome: outcome.trim() || undefined,
      isImportant,
      status: Number(status),
    };

    try {
      if (mode === "edit" && activityId) {
        await updateActivity.mutateAsync({ id: activityId, payload });
        toast.success("Cập nhật hoạt động thành công");
      } else {
        await createActivity.mutateAsync(payload);
        toast.success("Đã lưu hoạt động");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const activityTypes = [
    { value: "CALL", label: "Cuộc gọi", icon: Phone },
    { value: "MEETING", label: "Cuộc họp", icon: Video },
    { value: "EMAIL", label: "Email", icon: Mail },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      const container = e.currentTarget;
      const focusableElements = Array.from(
        container.querySelectorAll(
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

  return (
    <div onKeyDown={handleKeyDown} className="space-y-5">
      {/* Activity Type Segmented Control */}
      <div>
        <span className={labelClass}>Loại hoạt động</span>
        <div className="flex gap-2 mt-1.5">
          {activityTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = activityType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setActivityType(t.value)}
                disabled={isSubmitting}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[12px] font-semibold transition-all duration-150 ${
                  isSelected
                    ? "border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                    : "border-slate-200 bg-white text-slate-650 hover:border-slate-350 hover:bg-slate-50"
                } disabled:opacity-50`}
              >
                <Icon size={14} className={isSelected ? "text-white" : "text-slate-400"} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Subject */}
        <label className="block sm:col-span-2">
          <span className={labelClass}>
            Tiêu đề <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            placeholder="VD: Gọi điện tư vấn sản phẩm mới"
            className={inputClass}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {/* Description */}
        <label className="block sm:col-span-2">
          <span className={labelClass}>Mô tả chi tiết</span>
          <textarea
            placeholder="Nội dung trao đổi, yêu cầu của khách hàng..."
            className={textareaClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {/* Outcome */}
        <label className="block sm:col-span-2">
          <span className={labelClass}>Kết quả thực hiện</span>
          <input
            type="text"
            placeholder="VD: Khách hàng đồng ý nhận báo giá qua mail"
            className={inputClass}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {/* Start Date */}
        <label className="block">
          <span className={labelClass}>Thời gian bắt đầu</span>
          <input
            type="datetime-local"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {/* End Date */}
        <label className="block">
          <span className={labelClass}>Thời gian kết thúc</span>
          <input
            type="datetime-local"
            className={inputClass}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {/* Completed At */}
        <label className="block">
          <span className={labelClass}>Hoàn thành lúc</span>
          <input
            type="datetime-local"
            className={inputClass}
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {/* Priority / Status */}
        <label className="block">
          <span className={labelClass}>Mức độ ưu tiên</span>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)} disabled={isSubmitting}>
            <option value="1">Thấp</option>
            <option value="2">Trung bình</option>
            <option value="3">Cao</option>
            <option value="4">Khẩn cấp</option>
          </select>
        </label>

        {/* Is Important */}
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 sm:col-span-2 cursor-pointer transition hover:bg-slate-50">
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
            disabled={isSubmitting}
            className="h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <div className="flex items-center gap-1.5">
            <Star size={14} className={isImportant ? "text-amber-500 fill-amber-500" : "text-slate-400"} />
            <div>
              <span className="block text-[12px] font-semibold text-slate-800">Đánh dấu quan trọng</span>
              <span className="block text-[11px] text-slate-500">Hoạt động này sẽ được đính sao nổi bật trong lịch sử.</span>
            </div>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-sky-600 px-5 text-[12px] font-semibold text-white transition hover:bg-sky-700 shadow-sm shadow-sky-500/10 disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Lưu hoạt động"}
        </button>
      </div>
    </div>
  );
}
