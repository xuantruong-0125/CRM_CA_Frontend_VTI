"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Calendar,
  CheckSquare,
  Clock,
  AlertCircle,
  X,
  Save,
  RotateCcw,
  Flag,
  FileText
  , ChevronDown, ChevronUp
} from "lucide-react";
import {
  useCreateLeadActivity,
  useCreateLeadTask,
  useUpdateLeadActivity,
  useUpdateLeadTask,
} from "@/modules/lead/hooks/useLeadMutations";
import type { LeadActivityResponse, LeadResponse, LeadTaskResponse } from "@/modules/lead/types/lead.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import { http } from "@/shared/api/http";
import { LEAD_SHORTCUTS } from "@/modules/lead/utils/keyboard-shortcuts";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";

type InteractionMode = "activity" | "task";

type LeadInteractionPanelProps = {
  lead: LeadResponse;
  defaultMode?: InteractionMode;
  activityToEdit?: LeadActivityResponse | null;
  taskToEdit?: LeadTaskResponse | null;
  onClose?: () => void;
};

const inputClassName =
  "block h-8 w-full rounded-md border border-slate-200 bg-transparent px-2 py-0.5 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

// Slightly taller input for datetime-local so browser calendar icon isn't clipped
const datetimeInputClassName =
  "block h-7 w-full leading-6 rounded-md border border-slate-200 bg-transparent px-2 py-0.5 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

const textAreaClassName =
  "block min-h-[40px] w-full rounded-md border border-slate-200 bg-transparent px-2 py-1 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y";

const labelClassName = "text-xs font-medium text-slate-700 leading-none mb-1 flex items-center gap-2";

const ACTIVITY_STATUS_OPTIONS = [
  { value: 0, label: "Kế hoạch", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: 1, label: "Hoàn thành", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: 2, label: "Hủy bỏ", color: "text-slate-600 bg-slate-50 border-slate-200" },
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
  lead = { id: 1, contactName: "Nguyen Van A" }, // Default for standalone preview
  defaultMode = "activity",
  activityToEdit,
  taskToEdit,
  onClose,
}: LeadInteractionPanelProps) {
  const [mode, setMode] = useState<InteractionMode>(defaultMode);
  const [showAdvancedActivity, setShowAdvancedActivity] = useState(false);
  const [showAdvancedTask, setShowAdvancedTask] = useState(false);
  
  // Activity State
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

  // Task State
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskNoteContent, setTaskNoteContent] = useState("");
  const [taskStatus, setTaskStatus] = useState("NOT_STARTED");
  const [taskPriority, setTaskPriority] = useState("NORMAL");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const createActivityMutation = useCreateLeadActivity();
  const updateActivityMutation = useUpdateLeadActivity();
  const createTaskMutation = useCreateLeadTask();
  const updateTaskMutation = useUpdateLeadTask();

  const submitActivityFormRef = useRef<HTMLButtonElement>(null);
  const resetActivityFormRef = useRef<HTMLButtonElement>(null);
  const submitTaskFormRef = useRef<HTMLButtonElement>(null);
  const resetTaskFormRef = useRef<HTMLButtonElement>(null);
  
  const leadContactLabel = useMemo(
    () => lead.contactName || lead.companyName || `Lead #${lead.id ?? ""}`,
    [lead.companyName, lead.contactName, lead.id]
  );

  const isEditingActivity = Boolean(activityToEdit);
  const isEditingTask = Boolean(taskToEdit);

  useEffect(() => {
    if (!activityToEdit) return;

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
    if (!taskToEdit) return;
    const timer = setTimeout(() => {
      setTaskSubject(taskToEdit.subject || "");
      setTaskDescription(taskToEdit.description || "");
      setTaskNoteContent(((taskToEdit as Record<string, unknown>)?.noteContent as string) || "");
      setTaskStatus((taskToEdit.status as string) || "NOT_STARTED");
      setTaskPriority((taskToEdit.priority as string) || "NORMAL");
      setTaskStartDate(taskToEdit.startDate ? taskToEdit.startDate.slice(0, 16) : "");
      setTaskDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.slice(0, 16) : "");
    }, 0);

    return () => clearTimeout(timer as unknown as number);
  }, [taskToEdit]);

  // advanced sections default to hidden to keep form compact

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        event.preventDefault();
        onClose();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (mode === "activity") submitActivityFormRef.current?.click();
        else submitTaskFormRef.current?.click();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        if (mode === "activity") resetActivityFormRef.current?.click();
        else resetTaskFormRef.current?.click();
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
    setActivityType("CALL"); setActivitySubject(""); setActivityDescription("");
    setActivityNoteContent(""); setActivityStartDate(""); setActivityEndDate("");
    setActivityCompletedAt(""); setActivityOutcome(""); setActivityImportant(false);
    setActivityStatus("0");
  };

  const resetTaskForm = () => {
    setTaskSubject(""); setTaskDescription(""); setTaskStatus("NOT_STARTED");
    setTaskPriority("NORMAL"); setTaskStartDate(""); setTaskDueDate("");
    setTaskNoteContent("");
  };

  const handleCreateActivity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return toast.error("Không tìm thấy thông tin người dùng.");
      const subject = activitySubject.trim();
      if (!subject) return toast.error("Vui lòng nhập tiêu đề hoạt động.");

      await createActivityMutation.mutateAsync({
        leadId: lead.id as number,
        payload: {
          activityType, subject,
          description: activityDescription.trim() || undefined,
          noteContent: activityNoteContent.trim() || undefined,
          startDate: toIsoOrUndefined(activityStartDate),
          endDate: toIsoOrUndefined(activityEndDate),
          // include status/complete/outcome/important when creating so FE choice is sent to BE
          status: Number(activityStatus),
          isImportant: activityImportant,
          performedBy: currentUser.id,
        },
      });
      toast.success("Đã lưu log tương tác.");
      resetActivityForm();
    } catch (error) { toast.error(getApiErrorMessage(error)); }
  };

  const handleUpdateActivity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activityToEdit?.id) return;
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return toast.error("Không tìm thấy thông tin người dùng.");
      const subject = activitySubject.trim();
      if (!subject) return toast.error("Vui lòng nhập tiêu đề hoạt động.");

      await updateActivityMutation.mutateAsync({
        leadId: lead.id as number,
        activityId: activityToEdit.id,
        payload: {
          activityType, subject,
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
      // Nếu user nhập ghi chú khi cập nhật, gọi API tạo Note
      if (activityNoteContent.trim()) {
        try {
          await http.post('/api/v1/notes', {
            content: activityNoteContent.trim(),
            notableType: 'ACTIVITY',
            notableId: activityToEdit.id,
            privateNote: false,
          });
        } catch (err) {
          // Không block việc update nếu tạo note lỗi
          console.debug('create note after update activity failed', err);
        }
      }
      toast.success("Đã cập nhật hoạt động.");
      onClose?.();
    } catch (error) { toast.error(getApiErrorMessage(error)); }
  };

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return toast.error("Không tìm thấy thông tin người dùng.");
      const created = await createTaskMutation.mutateAsync({
        leadId: lead.id as number,
        payload: {
          subject: taskSubject.trim() || undefined,
          description: taskDescription.trim() || undefined,
          priority: taskPriority as "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined || undefined,
          startDate: toIsoOrUndefined(taskStartDate),
          dueDate: toIsoOrUndefined(taskDueDate),
          assignedTo: lead.assignedTo,
        },
      });

      // Nếu có ghi chú cho Task, tạo Note tách bước theo tài liệu
      if (taskNoteContent.trim() && created?.id) {
        try {
          await http.post('/api/v1/notes', {
            content: taskNoteContent.trim(),
            notableType: 'TASK',
            notableId: created.id,
            privateNote: false,
          });
        } catch (err) {
          console.debug('create note for task failed', err);
        }
      }
      toast.success("Đã tạo nhắc việc.");
      resetTaskForm();
    } catch (error) { toast.error(getApiErrorMessage(error)); }
  };

  const handleUpdateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskToEdit?.id) return;
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return toast.error("Không tìm thấy thông tin người dùng.");

      await updateTaskMutation.mutateAsync({
        leadId: lead.id as number,
        taskId: taskToEdit.id,
        payload: {
          subject: taskSubject.trim() || undefined,
          description: taskDescription.trim() || undefined,
          status: taskStatus as "NOT_STARTED" | "IN_PROGRESS" | "DEFERRED" | "COMPLETED" | "CANCELED" | undefined || undefined,
          priority: taskPriority as "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined || undefined,
          startDate: toIsoOrUndefined(taskStartDate),
          dueDate: toIsoOrUndefined(taskDueDate),
          assigneeId: lead.assignedTo,
        },
      });

      // Nếu user nhập ghi chú khi cập nhật task, gọi API tạo Note
      if (taskNoteContent.trim()) {
        try {
          await http.post('/api/v1/notes', {
            content: taskNoteContent.trim(),
            notableType: 'TASK',
            notableId: taskToEdit.id,
            privateNote: false,
          });
        } catch (err) {
          console.debug('create note after update task failed', err);
        }
      }

      toast.success("Đã cập nhật nhắc việc.");
      onClose?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  

  const getActivityIconDataUri = (type: string) => {
    const svgs: Record<string, string> = {
      CALL: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='%23006bff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12 1.2.37 2.36.72 3.47a2 2 0 0 1-.45 1.95L8.91 10.09a16 16 0 0 0 6 6l1.95-1.95a2 2 0 0 1 1.95-.45c1.11.35 2.27.6 3.47.72A2 2 0 0 1 22 16.92z'/></svg>`,
      EMAIL: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='%23f43f5e' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M3 8.5v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M21 6H3l9 6 9-6z'/></svg>`,
      MEETING: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='%2317c964' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>`,
      DEFAULT: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='%2373747a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><path d='M14 2v6h6'/></svg>`,
    };

    const svg = svgs[type] ?? svgs.DEFAULT;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  };

  return (
    <div className="relative flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden font-sans w-full max-w-3xl mx-auto lead-interaction-panel" style={{ minHeight: "560px" }}>
      <style>{`@media (max-height:768px){ .hide-on-short{display:none} }`}</style>
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border-b border-slate-100 bg-white">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Tương tác với {leadContactLabel}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Ghi nhận lịch sử làm việc hoặc lên lịch nhắc việc mới.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 justify-end">
          {/* Mode Switcher */}
          {!isEditingActivity && (
            <div className="inline-flex items-center gap-2 rounded-md bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setMode("activity")}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition ${mode === "activity" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
                title={LEAD_SHORTCUTS.INTERACTION_ACTIVITY_TAB.label}
              >
                <FileText className="w-4 h-4" />
                <span>Log hoạt động</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("task")}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition ${mode === "task" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
                title={LEAD_SHORTCUTS.INTERACTION_TASK_TAB.label}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tạo nhắc việc</span>
              </button>
            </div>
          )}

          {/* close button moved outside the flex area and positioned absolutely */}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200 shadow-sm transition-colors"
          title={LEAD_SHORTCUTS.INTERACTION_CLOSE.label}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Main Form Area */}
      <div className="p-3">
        {mode === "activity" ? (
          <form onSubmit={isEditingActivity ? handleUpdateActivity : handleCreateActivity} className="space-y-4">
            
            {/* Row 1: Type and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-4">
                <label className={labelClassName}>
                  Loại tương tác 
                </label>
                <div className="relative">
                  <select
                    value={activityType}
                    onChange={(event) => setActivityType(event.target.value)}
                    className={`${inputClassName} pl-10`}
                    style={{
                      backgroundImage: getActivityIconDataUri(activityType),
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "10px center",
                      backgroundSize: "16px 16px",
                    }}
                  >
                    <option value="CALL">Cuộc gọi</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Gặp mặt</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-8 min-w-0">
                <label className={labelClassName}>
                  <span>Tiêu đề <span className="text-rose-500">*</span></span>
                </label>
                <input
                  required
                  value={activitySubject}
                  onChange={(event) => setActivitySubject(event.target.value)}
                  className={inputClassName}
                  placeholder={`Vd: Ghi nhận cuộc gọi với ${leadContactLabel}`}
                />
              </div>
            </div>

            {/* Row 2: Description & Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <label className={labelClassName}>
                  Nội dung trao đổi
                </label>
                <textarea
                  value={activityDescription}
                  onChange={(event) => setActivityDescription(event.target.value)}
                  rows={2}
                  className={textAreaClassName}
                  placeholder="Ghi chú chi tiết nội dung cuộc gọi / email / buổi gặp..."
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Ghi chú ngắn
                </label>
                <textarea
                  value={activityNoteContent}
                  onChange={(event) => setActivityNoteContent(event.target.value)}
                  rows={2}
                  className={textAreaClassName}
                  placeholder="Điểm nhấn quan trọng, ví dụ: Hẹn gửi báo giá..."
                />
              </div>
            </div>

            {/* Compact Dates - moved up to keep important fields visible */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              <div>
                <label className={labelClassName}>Bắt đầu</label>
                <input
                  type="datetime-local"
                  value={activityStartDate}
                  onChange={(event) => setActivityStartDate(event.target.value)}
                  className={datetimeInputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Kết thúc</label>
                <input
                  type="datetime-local"
                  value={activityEndDate}
                  onChange={(event) => setActivityEndDate(event.target.value)}
                  className={datetimeInputClassName}
                />
              </div>

              <div className="hide-on-short" />
            </div>

            {/* Row 3: Editing specific fields (collapsed by default) */}
            <div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowAdvancedActivity((s) => !s)}
                  className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  {showAdvancedActivity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showAdvancedActivity ? "Ẩn tùy chọn" : "Hiển thị tùy chọn"}</span>
                </button>
              </div>

              {showAdvancedActivity && (
                <div className="space-y-3">
                  <div className="border-t border-slate-100 pt-4">
                    <label className={labelClassName}>
                      Kết quả / Cập nhật
                    </label>
                    <textarea
                      value={activityOutcome}
                      onChange={(event) => setActivityOutcome(event.target.value)}
                      rows={2}
                      className={textAreaClassName}
                      placeholder="Ghi kết quả, hành động tiếp theo..."
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activityImportant}
                        onChange={(event) => setActivityImportant(event.target.checked)}
                        className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500 self-center align-middle !mr-[5px]"
                      />
                      <div className="flex items-center gap-1.5">
                        <Flag className={`w-4 h-4 ${activityImportant ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium text-slate-700">Đánh dấu quan trọng</span>
                      </div>
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Trạng thái:</span>
                      <select
                        value={activityStatus}
                        onChange={(e) => setActivityStatus(e.target.value)}
                        className="h-8 text-sm rounded-md border border-slate-200 bg-white px-2 py-0.5"
                      >
                        {ACTIVITY_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={String(o.value)}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dates & Status moved: status/outcome/important remain in advanced section below */}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-3">
              <button
                ref={resetActivityFormRef}
                type="button"
                onClick={resetActivityForm}
                className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                title={LEAD_SHORTCUTS.INTERACTION_RESET.label}
              >
                <RotateCcw className="w-4 h-4" />
                {isEditingActivity ? "Khôi phục" : "Làm mới"}
                <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_RESET} className="ml-1 hidden sm:inline-flex" />
              </button>
              
              <button
                ref={submitActivityFormRef}
                type="submit"
                disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
                className="inline-flex items-center gap-2 h-8 px-3.5 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title={LEAD_SHORTCUTS.INTERACTION_SUBMIT.label}
              >
                <Save className="w-4 h-4" />
                {isEditingActivity
                  ? updateActivityMutation.isPending ? "Đang lưu..." : "Cập nhật"
                  : createActivityMutation.isPending ? "Đang lưu..." : "Lưu hoạt động"}
                <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_SUBMIT} className="ml-1 hidden sm:inline-flex bg-white" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={isEditingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>
                  <span>Tiêu đề nhắc việc <span className="text-rose-500">*</span></span>
                </label>
                <input
                  required
                  value={taskSubject}
                  onChange={(event) => setTaskSubject(event.target.value)}
                  className={inputClassName}
                  placeholder={`Vd: Gọi lại cho ${leadContactLabel} báo giá`}
                />
              </div>

              <div>
                <label className={labelClassName}>
                 Chi tiết công việc
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(event) => setTaskDescription(event.target.value)}
                  rows={2}
                  className={textAreaClassName}
                  placeholder="Ghi chú nội dung cần làm, bối cảnh..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <label className={labelClassName}>Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={taskStartDate}
                    onChange={(event) => setTaskStartDate(event.target.value)}
                    className={datetimeInputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Hạn hoàn thành</label>
                  <input
                    type="datetime-local"
                    value={taskDueDate}
                    onChange={(event) => setTaskDueDate(event.target.value)}
                    className={datetimeInputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowAdvancedTask((s) => !s)}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                {showAdvancedTask ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{showAdvancedTask ? "Ẩn tùy chọn" : "Hiển thị tùy chọn"}</span>
              </button>
            </div>

            {showAdvancedTask && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <label className={labelClassName}>
                  <AlertCircle className="w-4 h-4 text-slate-400" /> Trạng thái
                </label>
                <select value={taskStatus} onChange={(event) => setTaskStatus(event.target.value)} className={inputClassName}>
                  <option value="NOT_STARTED">Chưa bắt đầu</option>
                  <option value="IN_PROGRESS">Đang làm</option>
                  <option value="WAITING">Đang chờ</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                  <option value="DEFERRED">Đã hoãn</option>
                </select>
              </div>

              <div>
                <label className={labelClassName}>
                  <Flag className="w-4 h-4 text-slate-400" /> Độ ưu tiên
                </label>
                <select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value)} className={inputClassName}>
                  <option value="LOW">Thấp</option>
                  <option value="NORMAL">Bình thường</option>
                  <option value="HIGH">Cao</option>
                  <option value="URGENT">Khẩn cấp</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className={labelClassName}>Ghi chú cho công việc</label>
                <textarea
                  value={taskNoteContent}
                  onChange={(e) => setTaskNoteContent(e.target.value)}
                  rows={2}
                  className={textAreaClassName}
                  placeholder="Ghi chú ngắn cho công việc, sẽ lưu vào Notes"
                />
              </div>
              </div>
            )}

            {/* Task Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                ref={resetTaskFormRef}
                type="button"
                onClick={resetTaskForm}
                className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                title={LEAD_SHORTCUTS.INTERACTION_RESET.label}
              >
                <RotateCcw className="w-4 h-4" />
                Làm mới
                <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_RESET} className="ml-1 hidden sm:inline-flex" />
              </button>
              
              <button
                ref={submitTaskFormRef}
                type="submit"
                disabled={isEditingTask ? updateTaskMutation.isPending : createTaskMutation.isPending}
                className="inline-flex items-center gap-2 h-8 px-4 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title={LEAD_SHORTCUTS.INTERACTION_SUBMIT.label}
              >
                <CheckSquare className="w-4 h-4" />
                {isEditingTask
                  ? updateTaskMutation.isPending ? "Đang cập nhật..." : "Cập nhật"
                  : createTaskMutation.isPending ? "Đang tạo..." : "Tạo nhắc việc"}
                <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.INTERACTION_SUBMIT} className="ml-1 hidden sm:inline-flex bg-white" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
