"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateActivity, useUpdateActivity } from "@/modules/customer/hooks/useCustomerMutations";
import type { ActivityResponseDTO, CreateActivityDTO } from "@/modules/customer/types/customer.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";

type Props = {
  customerId: number;
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: Partial<ActivityResponseDTO> | null;
  activityId?: number;
};

export default function ActivityForm({ customerId, onClose, mode = "create", initialValues, activityId }: Props) {
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const [activityType, setActivityType] = useState(initialValues?.activityType ?? "MEETING");
  const [subject, setSubject] = useState(initialValues?.subject ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [completedAt, setCompletedAt] = useState(initialValues?.completedAt ?? "");
  const [outcome, setOutcome] = useState(initialValues?.outcome ?? "");
  const [isImportant, setIsImportant] = useState(Boolean(initialValues?.isImportant));
  const [status, setStatus] = useState(String(initialValues?.status ?? 1));

  const submit = async () => {
    const payload: CreateActivityDTO = {
      activityType,
      subject,
      description: description || undefined,
      relatedToType: "CUSTOMER",
      relatedToId: customerId,
      performedBy: undefined,
      startDate: startDate ? startDate + ":00" : undefined,
      endDate: endDate ? endDate + ":00" : undefined,
      completedAt: completedAt ? completedAt + ":00" : undefined,
      outcome: outcome || undefined,
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

  return (
    <div>
      <div className="space-y-3">
        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Loại hoạt động</span>
          <select className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={activityType} onChange={(e) => setActivityType(e.target.value)}>
            <option value="CALL">CALL</option>
            <option value="MEETING">MEETING</option>
            <option value="EMAIL">EMAIL</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Tiêu đề</span>
          <input className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Mô tả</span>
          <textarea className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Kết quả</span>
          <input className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={outcome} onChange={(e) => setOutcome(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Thời gian bắt đầu</span>
          <input type="datetime-local" className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Thời gian kết thúc</span>
          <input type="datetime-local" className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Hoàn thành lúc</span>
          <input type="datetime-local" className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={completedAt} onChange={(e) => setCompletedAt(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Ưu tiên</span>
          <select className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
          <span className="text-sm font-medium text-slate-900">Quan trọng</span>
        </label>

        <div className="flex gap-2 pt-3">
          <button type="button" onClick={onClose} className="rounded border px-3 py-2">Hủy</button>
          <button type="button" onClick={submit} className="rounded bg-sky-600 px-3 py-2 text-white">
            {mode === "edit" ? "Cập nhật" : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
