"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import type { CreateFeedbackDTO, FeedbackResponseDTO } from "@/modules/customer/types/customer.types";
import { useCreateFeedback, useUpdateFeedback } from "@/modules/customer/hooks/useCustomerMutations";
import { useCurrentUser } from "@/core/auth/useCurrentUser";
import { useAllUsers } from "@/modules/customer/hooks/useCustomers";

type FeedbackFormProps = {
  customerId: number;
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: Partial<FeedbackResponseDTO> | null;
  id?: number;
};

const FEEDBACK_PRIORITIES = [
  { label: "Cao", value: "HIGH" },
  { label: "Trung bình", value: "MEDIUM" },
  { label: "Thấp", value: "LOW" },
];

const FEEDBACK_STATUSES = [
  { label: "Mới", value: "NEW" },
  { label: "Đang xử lý", value: "IN_PROGRESS" },
  { label: "Đã giải quyết", value: "RESOLVED" },
  { label: "Đóng", value: "CLOSED" },
];

export default function FeedbackForm({
  customerId,
  onClose,
  mode = "create",
  initialValues,
  id,
}: FeedbackFormProps) {
  const { mounted, currentUser, isSale } = useCurrentUser();
  const usersQuery = useAllUsers();
  const users = usersQuery.data ?? [];

  const [subject, setSubject] = useState(initialValues?.subject || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [priority, setPriority] = useState(initialValues?.priority || "MEDIUM");
  const [status, setStatus] = useState(initialValues?.status || "NEW");
  const [assignedTo, setAssignedTo] = useState<number | "">(
    typeof initialValues?.assignedTo === "number" ? initialValues.assignedTo : ""
  );

  const createFeedback = useCreateFeedback();
  const updateFeedback = useUpdateFeedback();

  // Auto-fill assignedTo for SALE users on create
  useEffect(() => {
    if (mounted && isSale && currentUser && mode === "create") {
      setAssignedTo(currentUser.id);
    }
  }, [mounted, isSale, currentUser, mode]);

  const inputClass =
    "h-8 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600";
  const selectClass =
    "h-8 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 text-[11px] text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 disabled:bg-slate-100 disabled:cursor-not-allowed";

  const isSubmitting = createFeedback.isPending || updateFeedback.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Vui lòng nhập tiêu đề khiếu nại");
      return;
    }

    const payload: CreateFeedbackDTO = {
      customerId,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status,
      assignedTo: assignedTo !== "" ? assignedTo : undefined,
    };

    try {
      if (mode === "edit" && typeof id === "number") {
        await updateFeedback.mutateAsync({ id, payload: payload as any } as any);
      } else {
        await createFeedback.mutateAsync(payload as any);
      }
      toast.success(mode === "create" ? "Tạo khiếu nại thành công" : "Cập nhật khiếu nại thành công");
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
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

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col gap-4">
      <div>
        <label htmlFor="subject" className={labelClass}>
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Nhập tiêu đề khiếu nại"
          className={inputClass}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Mô tả
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả chi tiết"
          className="h-20 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 py-2 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 resize-none disabled:opacity-50"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="priority" className={labelClass}>
            Mức độ
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={selectClass}
            disabled={isSubmitting}
          >
            {FEEDBACK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Trạng thái
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectClass}
            disabled={isSubmitting}
          >
            {FEEDBACK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Người phụ trách */}
      <div>
        <label htmlFor="assignedTo" className={labelClass}>
          Người phụ trách
        </label>
        <select
          id="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : "")}
          className={selectClass}
          disabled={isSubmitting || isSale}
        >
          <option value="">-- Chọn người phụ trách --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName || u.username}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-[6px] border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[6px] bg-sky-600 px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Lưu"}
        </button>
      </div>
    </form>
  );
}
