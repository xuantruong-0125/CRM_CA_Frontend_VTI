"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useCreateLeadActivity, useCreateLeadMeeting } from "@/modules/lead/hooks/useLeadMutations";
import type { LeadResponse } from "@/modules/lead/types/lead.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import { LEAD_SHORTCUTS } from "@/modules/lead/utils/keyboard-shortcuts";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";

type InteractionMode = "activity" | "task";

type LeadInteractionPanelProps = {
  lead: LeadResponse;
  defaultMode?: InteractionMode;
  onClose?: () => void;
};

const inputClassName =
  "h-[30px] w-full rounded-sm border border-slate-300 bg-white px-2.5 py-1 text-[12px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const textAreaClassName =
  "w-full rounded-sm border border-slate-300 bg-white px-2.5 py-1 text-[12px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const labelClassName = "text-[11px] font-medium text-slate-700";

function toIsoOrUndefined(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

export default function LeadInteractionPanel({
  lead,
  defaultMode = "activity",
  onClose,
}: LeadInteractionPanelProps) {
  const [mode, setMode] = useState<InteractionMode>(defaultMode);
  const [activityType, setActivityType] = useState("CALL");
  const [activitySubject, setActivitySubject] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityOutcome, setActivityOutcome] = useState("");
  const [activityStartDate, setActivityStartDate] = useState("");
  const [activityCompletedAt, setActivityCompletedAt] = useState("");
  const [activityImportant, setActivityImportant] = useState(false);

  const [taskSubject, setTaskSubject] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState("NOT_STARTED");
  const [taskPriority, setTaskPriority] = useState("NORMAL");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const createActivityMutation = useCreateLeadActivity();
  const createMeetingMutation = useCreateLeadMeeting();

  const submitActivityFormRef = useRef<HTMLButtonElement>(null);
  const resetActivityFormRef = useRef<HTMLButtonElement>(null);
  const submitTaskFormRef = useRef<HTMLButtonElement>(null);
  const resetTaskFormRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const leadContactLabel = useMemo(
    () => lead.contactName || lead.companyName || `Lead #${lead.id ?? ""}`,
    [lead.companyName, lead.contactName, lead.id]
  );

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Escape: Close panel
      if (e.key === "Escape" && onClose) {
        e.preventDefault();
        onClose();
        return;
      }

      // Ctrl/Cmd + S: Submit form
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (mode === "activity") {
          submitActivityFormRef.current?.click();
        } else {
          submitTaskFormRef.current?.click();
        }
        return;
      }

      // Ctrl/Cmd + R: Reset form
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        if (mode === "activity") {
          resetActivityFormRef.current?.click();
        } else {
          resetTaskFormRef.current?.click();
        }
        return;
      }

      // Alt + A: Switch to Activity tab
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        setMode("activity");
        return;
      }

      // Alt + T: Switch to Task tab
      if (e.altKey && e.key === "t") {
        e.preventDefault();
        setMode("task");
        return;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [mode, onClose]);

  const resetActivityForm = () => {
    setActivityType("CALL");
    setActivitySubject("");
    setActivityDescription("");
    setActivityOutcome("");
    setActivityStartDate("");
    setActivityCompletedAt("");
    setActivityImportant(false);
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
      await createActivityMutation.mutateAsync({
        leadId: lead.id as number,
        payload: {
          activityType,
          subject: activitySubject.trim() || undefined,
          description: activityDescription.trim() || undefined,
          outcome: activityOutcome.trim() || undefined,
          startDate: toIsoOrUndefined(activityStartDate),
          completedAt: toIsoOrUndefined(activityCompletedAt),
          isImportant: activityImportant,
          performedBy: currentUser.id,
        },
      });

      toast.success("Đã lưu log tương tác.");
      resetActivityForm();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const currentUser = getCurrentUser();
      await createMeetingMutation.mutateAsync({
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
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold uppercase tracking-wider text-slate-800">Form tương tác với khách hàng</h2>
          <p className="text-[12px] text-slate-500">
            Ghi nhận cuộc gọi, email, buổi gặp mặt và tạo nhắc việc ngay trên hồ sơ lead.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="h-[30px] w-[30px] rounded-sm bg-red-500 flex items-center justify-center text-[16px] font-bold text-white transition hover:bg-red-600 relative group"
              title={LEAD_SHORTCUTS.INTERACTION_CLOSE.label}
            >
              ✕
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {LEAD_SHORTCUTS.INTERACTION_CLOSE.label}
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 inline-flex rounded-sm border border-slate-300 bg-slate-50 p-0.5 text-[12px] font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setMode("activity")}
            className={`rounded-sm px-3 py-1.5 transition flex items-center gap-1.5 ${
              mode === "activity" ? "bg-white text-slate-900" : "hover:text-slate-900"
            }`}
            title={LEAD_SHORTCUTS.INTERACTION_ACTIVITY_TAB.label}
          >
            Log hoạt động
            {mode !== "activity" && <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_ACTIVITY_TAB} />}
          </button>
          <button
            type="button"
            onClick={() => setMode("task")}
            className={`rounded-sm px-3 py-1.5 transition flex items-center gap-1.5 ${
              mode === "task" ? "bg-white text-slate-900" : "hover:text-slate-900"
            }`}
            title={LEAD_SHORTCUTS.INTERACTION_TASK_TAB.label}
          >
            Tạo nhắc việc
            {mode !== "task" && <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_TASK_TAB} />}
          </button>
      </div>

      {mode === "activity" ? (
        <form onSubmit={handleCreateActivity} className="grid gap-x-3 gap-y-2 lg:grid-cols-2">
          <label className="space-y-1">
            <span className={labelClassName}>Loại tương tác</span>
            <select
              value={activityType}
              onChange={(event) => setActivityType(event.target.value)}
              className={inputClassName}
            >
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

          <label className="space-y-1 lg:col-span-2">
            <span className={labelClassName}>Nội dung trao đổi</span>
            <textarea
              value={activityDescription}
              onChange={(event) => setActivityDescription(event.target.value)}
              rows={4}
              className={textAreaClassName}
              placeholder="Ghi chú nội dung cuộc gọi / email / buổi gặp..."
            />
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Kết quả</span>
            <input
              value={activityOutcome}
              onChange={(event) => setActivityOutcome(event.target.value)}
              className={inputClassName}
              placeholder="Ví dụ: Hẹn gửi báo giá hôm nay"
            />
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
            <span className={labelClassName}>Hoàn tất lúc</span>
            <input
              type="datetime-local"
              value={activityCompletedAt}
              onChange={(event) => setActivityCompletedAt(event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="flex items-center gap-2 text-[12px] font-medium text-slate-700 lg:col-span-2">
            <input
              type="checkbox"
              checked={activityImportant}
              onChange={(event) => setActivityImportant(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Đánh dấu quan trọng
          </label>

          <div className="lg:col-span-2 flex items-center justify-end gap-3">
            <button
              ref={resetActivityFormRef}
              type="button"
              onClick={resetActivityForm}
              className="h-[30px] rounded-sm border border-slate-300 bg-white px-4 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-1.5"
              title={LEAD_SHORTCUTS.INTERACTION_RESET.label}
            >
              Reset form
              <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_RESET} />
            </button>
            <button
              ref={submitActivityFormRef}
              type="submit"
              disabled={createActivityMutation.isPending}
              className="h-[30px] rounded-sm bg-blue-600 px-4 text-[12px] font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center gap-1.5"
              title={LEAD_SHORTCUTS.INTERACTION_SUBMIT.label}
            >
              {createActivityMutation.isPending ? "Đang lưu..." : "Lưu log tương tác"}
              {!createActivityMutation.isPending && (
                <KeyboardShortcutBadge 
                  shortcut={LEAD_SHORTCUTS.INTERACTION_SUBMIT}
                />
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateTask} className="grid gap-x-3 gap-y-2 lg:grid-cols-2">
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
              rows={4}
              className={textAreaClassName}
              placeholder="Ghi chú nội dung cần làm, người liên hệ, bối cảnh..."
            />
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Trạng thái</span>
            <select
              value={taskStatus}
              onChange={(event) => setTaskStatus(event.target.value)}
              className={inputClassName}
            >
              <option value="NOT_STARTED">NOT_STARTED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING">WAITING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="DEFERRED">DEFERRED</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Độ ưu tiên</span>
            <select
              value={taskPriority}
              onChange={(event) => setTaskPriority(event.target.value)}
              className={inputClassName}
            >
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

          <div className="lg:col-span-2 flex items-center justify-end gap-3">
            <button
              ref={resetTaskFormRef}
              type="button"
              onClick={resetTaskForm}
              className="h-[30px] rounded-sm border border-slate-300 bg-white px-4 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-1.5"
              title={LEAD_SHORTCUTS.INTERACTION_RESET.label}
            >
              Xoá form
              <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_RESET} />
            </button>
            <button
              ref={submitTaskFormRef}
              type="submit"
              disabled={createMeetingMutation.isPending}
              className="h-[30px] rounded-sm bg-blue-600 px-4 text-[12px] font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center gap-1.5"
              title={LEAD_SHORTCUTS.INTERACTION_SUBMIT.label}
            >
              {createMeetingMutation.isPending ? "Đang tạo..." : "Tạo nhắc việc"}
              {!createMeetingMutation.isPending && (
                <KeyboardShortcutBadge 
                  shortcut={LEAD_SHORTCUTS.INTERACTION_SUBMIT}
                />
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}