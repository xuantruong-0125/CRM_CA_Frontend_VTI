"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useCreateLeadActivity,
  useCreateLeadTask,
  useUpdateLeadActivity,
} from "@/modules/lead/hooks/useLeadMutations";
import type { LeadActivityResponse, LeadResponse } from "@/modules/lead/types/lead.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import { LEAD_SHORTCUTS } from "@/modules/lead/utils/keyboard-shortcuts";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";

type InteractionMode = "activity" | "task";

type LeadInteractionPanelProps = {
  lead: LeadResponse;
  defaultMode?: InteractionMode;
  activityToEdit?: LeadActivityResponse | null;
  onClose?: () => void;
};

const inputClassName =
  "h-[26px] w-full rounded-sm border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const textAreaClassName =
  "w-full rounded-sm border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const labelClassName = "text-[10px] font-medium text-slate-700";

const ACTIVITY_STATUS_OPTIONS = [
  { value: 0, label: "PLANNED" },
  { value: 1, label: "COMPLETED" },
  { value: 2, label: "CANCELED" },
] as const;

function mapStatusLabelToValue(status?: number | string) {
  if (status == null) return "0";
  if (typeof status === "number") return String(status);
  const upper = String(status).toUpperCase();
  if (upper === "COMPLETED") return "1";
  if (upper === "CANCELED") return "2";
  return "0";
}

function toIsoOrUndefined(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

export default function LeadInteractionPanel({
  lead,
  defaultMode = "activity",
  activityToEdit,
  onClose,
}: LeadInteractionPanelProps) {
  const [mode, setMode] = useState<InteractionMode>(defaultMode);
  const [activityType, setActivityType] = useState("CALL");
  const [activitySubject, setActivitySubject] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityNoteContent, setActivityNoteContent] = useState("");
  const [activityStartDate, setActivityStartDate] = useState("");
  const [activityEndDate, setActivityEndDate] = useState("");
  const [activityCompletedAt, setActivityCompletedAt] = useState("");
  const [activityOutcome, setActivityOutcome] = useState("");
  const [activityImportant, setActivityImportant] = useState(false);
  const [activityStatus, setActivityStatus] = useState("0");

  const [taskSubject, setTaskSubject] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState("NOT_STARTED");
  const [taskPriority, setTaskPriority] = useState("NORMAL");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const createActivityMutation = useCreateLeadActivity();
  const updateActivityMutation = useUpdateLeadActivity();
  const createTaskMutation = useCreateLeadTask();

  const submitActivityFormRef = useRef<HTMLButtonElement>(null);
  const resetActivityFormRef = useRef<HTMLButtonElement>(null);
  const submitTaskFormRef = useRef<HTMLButtonElement>(null);
  const resetTaskFormRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const leadContactLabel = useMemo(
    () => lead.contactName || lead.companyName || `Lead #${lead.id ?? ""}`,
    [lead.companyName, lead.contactName, lead.id]
  );

  const isEditingActivity = Boolean(activityToEdit);

  useEffect(() => {
    if (!activityToEdit) {
      return;
    }

    const timer = setTimeout(() => {
      setActivityType(activityToEdit.activityType || "CALL");
      setActivitySubject(activityToEdit.subject || "");
      setActivityDescription(activityToEdit.description || "");
      setActivityNoteContent(activityToEdit.noteContent || "");
      setActivityStartDate(activityToEdit.startDate ? activityToEdit.startDate.slice(0, 16) : "");
      setActivityEndDate(activityToEdit.endDate ? activityToEdit.endDate.slice(0, 16) : "");
      setActivityCompletedAt(activityToEdit.completedAt ? activityToEdit.completedAt.slice(0, 16) : "");
      setActivityOutcome(activityToEdit.outcome || "");
      setActivityImportant(Boolean(activityToEdit.isImportant));
      setActivityStatus(mapStatusLabelToValue(activityToEdit.status));
    }, 0);

    return () => clearTimeout(timer as unknown as number);
  }, [activityToEdit]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        event.preventDefault();
        onClose();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (mode === "activity") {
          submitActivityFormRef.current?.click();
        } else {
          submitTaskFormRef.current?.click();
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        if (mode === "activity") {
          resetActivityFormRef.current?.click();
        } else {
          resetTaskFormRef.current?.click();
        }
        return;
      }

      if (event.altKey && event.key === "a") {
        event.preventDefault();
        setMode("activity");
        return;
      }

      if (event.altKey && event.key === "t") {
        event.preventDefault();
        setMode("task");
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [mode, onClose]);

  const resetActivityForm = () => {
    if (activityToEdit) {
      setActivityType(activityToEdit.activityType || "CALL");
      setActivitySubject(activityToEdit.subject || "");
      setActivityDescription(activityToEdit.description || "");
      setActivityNoteContent(activityToEdit.noteContent || "");
      setActivityStartDate(activityToEdit.startDate ? activityToEdit.startDate.slice(0, 16) : "");
      setActivityEndDate(activityToEdit.endDate ? activityToEdit.endDate.slice(0, 16) : "");
      setActivityCompletedAt(activityToEdit.completedAt ? activityToEdit.completedAt.slice(0, 16) : "");
      setActivityOutcome(activityToEdit.outcome || "");
      setActivityImportant(Boolean(activityToEdit.isImportant));
      setActivityStatus(mapStatusLabelToValue(activityToEdit.status));
      return;
    }

    setActivityType("CALL");
    setActivitySubject("");
    setActivityDescription("");
    setActivityNoteContent("");
    setActivityStartDate("");
    setActivityEndDate("");
    setActivityCompletedAt("");
    setActivityOutcome("");
    setActivityImportant(false);
    setActivityStatus("0");
  };

  const resetTaskForm = () => {
    setTaskSubject("");
    setTaskDescription("");
    setTaskStatus("NOT_STARTED");
    setTaskPriority("NORMAL");
    setTaskStartDate("");
    setTaskDueDate("");
  };

  const handleCreateActivity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("Không tìm thấy thông tin người dùng.");
        return;
      }
      const subject = activitySubject.trim();
      if (!subject) {
        toast.error("Vui lòng nhập tiêu đề hoạt động.");
        return;
      }

      await createActivityMutation.mutateAsync({
        leadId: lead.id as number,
        payload: {
          activityType,
          subject,
          description: activityDescription.trim() || undefined,
          noteContent: activityNoteContent.trim() || undefined,
          startDate: toIsoOrUndefined(activityStartDate),
          endDate: toIsoOrUndefined(activityEndDate),
          performedBy: currentUser.id,
        },
      });

      toast.success("Đã lưu log tương tác.");
      resetActivityForm();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleUpdateActivity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activityToEdit?.id) {
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("Không tìm thấy thông tin người dùng.");
        return;
      }
      const subject = activitySubject.trim();
      if (!subject) {
        toast.error("Vui lòng nhập tiêu đề hoạt động.");
        return;
      }

      await updateActivityMutation.mutateAsync({
        leadId: lead.id as number,
        activityId: activityToEdit.id,
        payload: {
          activityType,
          subject,
          description: activityDescription.trim() || undefined,
          startDate: toIsoOrUndefined(activityStartDate),
          endDate: toIsoOrUndefined(activityEndDate),
          completedAt: toIsoOrUndefined(activityCompletedAt),
          outcome: activityOutcome.trim() || undefined,
          performedBy: currentUser.id,
          updatedBy: currentUser.id,
          isImportant: activityImportant,
          status: Number(activityStatus),
        },
      });

      toast.success("Đã cập nhật hoạt động.");
      onClose?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("Không tìm thấy thông tin người dùng.");
        return;
      }
      await createTaskMutation.mutateAsync({
        leadId: lead.id as number,
        payload: {
          subject: taskSubject.trim() || undefined,
          description: taskDescription.trim() || undefined,
          status: taskStatus || undefined,
          priority: taskPriority || undefined,
          startDate: toIsoOrUndefined(taskStartDate),
          dueDate: toIsoOrUndefined(taskDueDate),
          assignedTo: lead.assignedTo,
          assignedBy: currentUser.id,
        },
      });

      toast.success("Đã tạo nhắc việc.");
      resetTaskForm();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <section className="font-sans flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Form tương tác với khách hàng</h2>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
            Ghi nhận cuộc gọi, email, buổi gặp mặt và tạo nhắc việc ngay trên hồ sơ lead.
          </p>
        </div>

        {onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="group relative flex h-[26px] w-[26px] items-center justify-center rounded-sm bg-rose-500 text-[14px] font-semibold text-white transition hover:bg-rose-600"
            title={LEAD_SHORTCUTS.INTERACTION_CLOSE.label}
          >
            ✕
            <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
              {LEAD_SHORTCUTS.INTERACTION_CLOSE.label}
            </div>
          </button>
        )}
      </div>

      {!isEditingActivity && (
        <div className="mb-3 inline-flex rounded-sm border border-slate-300 bg-slate-50 p-0.5 text-[10px] font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setMode("activity")}
            className={`flex items-center gap-1 rounded-sm px-2.5 py-1 transition ${
              mode === "activity" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
            }`}
            title={LEAD_SHORTCUTS.INTERACTION_ACTIVITY_TAB.label}
          >
            Log hoạt động
            {mode !== "activity" && <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_ACTIVITY_TAB} />}
          </button>
          <button
            type="button"
            onClick={() => setMode("task")}
            className={`flex items-center gap-1 rounded-sm px-2.5 py-1 transition ${
              mode === "task" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
            }`}
            title={LEAD_SHORTCUTS.INTERACTION_TASK_TAB.label}
          >
            Tạo nhắc việc
            {mode !== "task" && <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_TASK_TAB} />}
          </button>
        </div>
      )}

      {mode === "activity" ? (
        <form onSubmit={isEditingActivity ? handleUpdateActivity : handleCreateActivity} className="grid gap-x-2 gap-y-1.5 lg:grid-cols-2">
          <label className="space-y-1">
            <span className={labelClassName}>Loại tương tác</span>
            <select value={activityType} onChange={(event) => setActivityType(event.target.value)} className={inputClassName}>
              <option value="CALL">Call - Cuộc gọi</option>
              <option value="EMAIL">Email - Gửi email</option>
              <option value="MEETING">Meeting - Gặp mặt</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Tiêu đề</span>
            <input
              value={activitySubject}
              onChange={(event) => setActivitySubject(event.target.value)}
              className={inputClassName}
              placeholder={`Ví dụ: Ghi nhận tương tác với ${leadContactLabel}`}
            />
          </label>

          <div className="grid gap-2 lg:col-span-2 lg:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClassName}>Nội dung trao đổi</span>
              <textarea
                value={activityDescription}
                onChange={(event) => setActivityDescription(event.target.value)}
                rows={2}
                className={textAreaClassName}
                placeholder="Ghi chú nội dung cuộc gọi / email / buổi gặp..."
              />
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Ghi chú</span>
              <input
                value={activityNoteContent}
                onChange={(event) => setActivityNoteContent(event.target.value)}
                className={inputClassName}
                placeholder="Ví dụ: Hẹn gửi báo giá hôm nay"
              />
            </label>
          </div>

          {isEditingActivity && (
            <>
              <label className="space-y-1 lg:col-span-2">
                <span className={labelClassName}>Kết quả</span>
                <textarea
                  value={activityOutcome}
                  onChange={(event) => setActivityOutcome(event.target.value)}
                  rows={2}
                  className={textAreaClassName}
                  placeholder="Kết quả sau tương tác"
                />
              </label>

              <label className="flex items-center gap-2 lg:col-span-2">
                <input
                  type="checkbox"
                  checked={activityImportant}
                  onChange={(event) => setActivityImportant(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[10px] font-semibold tracking-wide text-slate-700">Đánh dấu quan trọng</span>
              </label>
            </>
          )}

          <div className="grid gap-2 lg:col-span-2 lg:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-1">
              <span className={labelClassName}>Trạng thái hoạt động</span>
              <select value={activityStatus} onChange={(event) => setActivityStatus(event.target.value)} className={inputClassName}>
                {ACTIVITY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Bắt đầu</span>
              <input
                type="datetime-local"
                value={activityStartDate}
                onChange={(event) => setActivityStartDate(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Kết thúc</span>
              <input
                type="datetime-local"
                value={activityEndDate}
                onChange={(event) => setActivityEndDate(event.target.value)}
                className={inputClassName}
              />
            </label>
          </div>

          {isEditingActivity && (
            <label className="space-y-1 lg:col-span-2 xl:col-span-1">
              <span className={labelClassName}>Hoàn thành lúc</span>
              <input
                type="datetime-local"
                value={activityCompletedAt}
                onChange={(event) => setActivityCompletedAt(event.target.value)}
                className={inputClassName}
              />
            </label>
          )}

          <div className="flex items-center justify-end gap-2 lg:col-span-2 xl:col-span-4">
            <button
              ref={resetActivityFormRef}
              type="button"
              onClick={resetActivityForm}
              className="inline-flex h-[26px] items-center gap-1 rounded-sm border border-slate-300 bg-white px-3 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
              title={LEAD_SHORTCUTS.INTERACTION_RESET.label}
            >
              {isEditingActivity ? "Khôi phục" : "Reset form"}
              <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_RESET} />
            </button>
            <button
              ref={submitActivityFormRef}
              type="submit"
              disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
              className="inline-flex h-[26px] items-center gap-1 rounded-sm bg-blue-600 px-3 text-[11px] font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              title={LEAD_SHORTCUTS.INTERACTION_SUBMIT.label}
            >
              {isEditingActivity
                ? updateActivityMutation.isPending
                  ? "Đang cập nhật..."
                  : "Cập nhật hoạt động"
                : createActivityMutation.isPending
                ? "Đang lưu..."
                : "Lưu log tương tác"}
              {!createActivityMutation.isPending && !updateActivityMutation.isPending && (
                <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_SUBMIT} />
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateTask} className="grid gap-x-2 gap-y-1.5 lg:grid-cols-2">
          <label className="space-y-1 lg:col-span-2">
            <span className={labelClassName}>Nội dung nhắc việc</span>
            <input
              value={taskSubject}
              onChange={(event) => setTaskSubject(event.target.value)}
              className={inputClassName}
              placeholder={`Ví dụ: Nhắc gọi lại ${leadContactLabel}`}
            />
          </label>

          <label className="space-y-1 lg:col-span-2">
            <span className={labelClassName}>Chi tiết</span>
            <textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              rows={2}
              className={textAreaClassName}
              placeholder="Ghi chú nội dung cần làm, người liên hệ, bối cảnh..."
            />
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Trạng thái</span>
            <select value={taskStatus} onChange={(event) => setTaskStatus(event.target.value)} className={inputClassName}>
              <option value="NOT_STARTED">NOT_STARTED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING">WAITING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="DEFERRED">DEFERRED</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Độ ưu tiên</span>
            <select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value)} className={inputClassName}>
              <option value="LOW">LOW</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Bắt đầu</span>
            <input
              type="datetime-local"
              value={taskStartDate}
              onChange={(event) => setTaskStartDate(event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Hạn hoàn thành</span>
            <input
              type="datetime-local"
              value={taskDueDate}
              onChange={(event) => setTaskDueDate(event.target.value)}
              className={inputClassName}
            />
          </label>

          <div className="flex items-center justify-end gap-2 lg:col-span-2 xl:col-span-4">
            <button
              ref={resetTaskFormRef}
              type="button"
              onClick={resetTaskForm}
              className="inline-flex h-[26px] items-center gap-1 rounded-sm border border-slate-300 bg-white px-3 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
              title={LEAD_SHORTCUTS.INTERACTION_RESET.label}
            >
              Xoá form
              <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_RESET} />
            </button>
            <button
              ref={submitTaskFormRef}
              type="submit"
              disabled={createTaskMutation.isPending}
              className="inline-flex h-[26px] items-center gap-1 rounded-sm bg-blue-600 px-3 text-[11px] font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              title={LEAD_SHORTCUTS.INTERACTION_SUBMIT.label}
            >
              {createTaskMutation.isPending ? "Đang tạo..." : "Tạo nhắc việc"}
              {!createTaskMutation.isPending && <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_SUBMIT} />}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
