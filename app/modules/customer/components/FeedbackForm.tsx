"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import type { CreateFeedbackDTO, FeedbackResponseDTO } from "@/modules/customer/types/customer.types";
import { useCreateFeedback, useUpdateFeedback } from "@/modules/customer/hooks/useCustomerMutations";

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
  const [subject, setSubject] = useState(initialValues?.subject || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [priority, setPriority] = useState(initialValues?.priority || "MEDIUM");
  const [status, setStatus] = useState(initialValues?.status || "NEW");
  const createFeedback = useCreateFeedback();
  const updateFeedback = useUpdateFeedback();

  const inputClass =
    "h-8 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600";
  const selectClass =
    "h-8 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 text-[11px] text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Vui lòng nhập tiêu đề kiếu nại");
      return;
    }

    // use mutation's loading state
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("Không tìm thấy thông tin người dùng.");
        return;
      }
      if (mode === "edit" && typeof id === "number") {
        const payload: CreateFeedbackDTO = {
          customerId,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          status,
        };
        await updateFeedback.mutateAsync({ id, payload: payload as any } as any);
      } else {
        const payload: CreateFeedbackDTO = {
          customerId,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          status,
          assignedTo: currentUser.id,
        } as any;
        await createFeedback.mutateAsync(payload as any);
      }
      toast.success(mode === "create" ? "Tạo kiếu nại thành công" : "Cập nhật kiếu nại thành công");
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="subject" className={labelClass}>
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Nhập tiêu đề kiếu nại"
          className={inputClass}
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
          className="h-20 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 py-2 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 resize-none"
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
          >
            {FEEDBACK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[6px] border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={createFeedback.isPending || updateFeedback.isPending}
          className="rounded-[6px] bg-sky-600 px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
        >
          {createFeedback.isPending || updateFeedback.isPending ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}
