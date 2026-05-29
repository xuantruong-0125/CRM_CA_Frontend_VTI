"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import LeadDetailCard from "@/modules/lead/components/LeadDetailCard";
import LeadForm from "@/modules/lead/components/LeadForm";
import {
  useAssigneeMetadata,
  useProductMetadata,
} from "@/modules/lead/hooks/useLeadMetadata";
import { useLeadReferences } from "@/modules/lead/hooks/useLeadReferences";
import { useUpdateLead } from "@/modules/lead/hooks/useLeadMutations";
import {
  useLeadActivities,
  useLeadActivityStatistics,
  useLeadById,
  useLeadTasks,
} from "@/modules/lead/hooks/useLeads";
import LeadInteractionPanel from "./LeadInteractionPanel";
import type { LeadFormValues } from "@/modules/lead/schemas/lead.schema";
import type { LeadActivityResponse, LeadReferenceOptionResponse, MetadataItem } from "@/modules/lead/types/lead.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { LEAD_SHORTCUTS, matchesShortcut } from "@/modules/lead/utils/keyboard-shortcuts";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";

type LeadDetailPageProps = {
  id: number;
};

export default function LeadDetailPage({ id }: LeadDetailPageProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInteractionFormVisible, setIsInteractionFormVisible] = useState(false);
  const [interactionMode, setInteractionMode] = useState<"activity" | "task">("activity");
  const [editingActivity, setEditingActivity] = useState<LeadActivityResponse | null>(null);
  const [pendingUpdateValues, setPendingUpdateValues] = useState<LeadFormValues | null>(null);

  const leadQuery = useLeadById(id);
  const activitiesQuery = useLeadActivities(id);
  const activityStatisticsQuery = useLeadActivityStatistics(id);
  const tasksQuery = useLeadTasks(id, { page: 0, size: 100, sortBy: "createdAt", sortDir: "desc" });
  const referencesQuery = useLeadReferences();
  const assigneesQuery = useAssigneeMetadata({ page: 0, size: 50, sortBy: "name", status: "ACTIVE" });
  const productsQuery = useProductMetadata({ page: 0, size: 50, sortBy: "name", isActive: true });
  const updateLeadMutation = useUpdateLead();

  const handleUpdateLead = async (values: LeadFormValues) => {
    setPendingUpdateValues(values);
  };

  const confirmUpdateLead = async () => {
    if (!pendingUpdateValues) {
      return;
    }

    try {
      await updateLeadMutation.mutateAsync({
        id,
        payload: pendingUpdateValues,
      });
      setIsEditMode(false);
      setPendingUpdateValues(null);
      toast.success("Cập nhật lead thành công!");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const provinces = (referencesQuery.data?.provinces || []) as LeadReferenceOptionResponse[];
  const statuses = referencesQuery.data?.statuses || [];
  const sources = referencesQuery.data?.sources || [];
  const campaigns = referencesQuery.data?.campaigns || [];
  const assignees = (assigneesQuery.data?.content || []) as MetadataItem[];
  const products = (productsQuery.data?.content || []) as MetadataItem[];
  const tasks = tasksQuery.data || [];

  const openInteractionForm = (mode: "activity" | "task") => {
    setEditingActivity(null);
    setInteractionMode(mode);
    setIsInteractionFormVisible(true);
  };

  const openActivityEditor = (activity: LeadActivityResponse) => {
    setIsInteractionFormVisible(false);
    setInteractionMode("activity");
    setEditingActivity(activity);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditMode) {
        // Khi đang edit, Esc cancel
        if (matchesShortcut(e, LEAD_SHORTCUTS.CANCEL_FORM)) {
          e.preventDefault();
          setIsEditMode(false);
        }
      } else if (isInteractionFormVisible) {
        // Interaction panel có keyboard shortcuts riêng
        return;
      } else {
        // Khi view lead detail
        if (matchesShortcut(e, LEAD_SHORTCUTS.EDIT_LEAD)) {
          e.preventDefault();
          setIsEditMode(true);
        } else if (matchesShortcut(e, LEAD_SHORTCUTS.CREATE_ACTIVITY)) {
          e.preventDefault();
          openInteractionForm("activity");
        } else if (matchesShortcut(e, LEAD_SHORTCUTS.CREATE_TASK)) {
          e.preventDefault();
          openInteractionForm("task");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditMode, isInteractionFormVisible]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[rgb(21,0,211)] px-6 py-4 text-white">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Lead detail</p>
                <h1 className="mt-1 text-[18px] font-bold leading-tight text-white">
                  Chi tiết lead: {leadQuery.data?.contactName || "-"}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                {!isEditMode && leadQuery.data && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="inline-flex items-center gap-2 rounded-[5px] bg-emerald-500 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-emerald-400"
                    title={LEAD_SHORTCUTS.EDIT_LEAD.label}
                  >
                    Chỉnh sửa
                    <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.EDIT_LEAD} />
                  </button>
                )}
                <Link
                  href="/leads"
                  className="rounded-[5px] border border-white/40 bg-white/10 px-3 py-2 text-[12px] font-semibold text-white no-underline shadow-sm transition hover:bg-white/20 hover:text-white"
                  title="Quay lại danh sách"
                  style={{ textDecoration: "none" }}
                >
                  Quay lại danh sách
                </Link>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            {leadQuery.isLoading && (
              <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Đang tải thông tin lead...
              </p>
            )}

            {leadQuery.error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {getApiErrorMessage(leadQuery.error)}
              </p>
            )}

            {leadQuery.data && isEditMode ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Chỉnh sửa thông tin lead</h2>
                <LeadForm
                  mode="edit"
                  initialValues={leadQuery.data}
                  statuses={statuses}
                  sources={sources}
                  campaigns={campaigns}
                  assignees={assignees}
                  provinces={provinces}
                  products={products}
                  onSubmit={handleUpdateLead}
                  onCancel={() => setIsEditMode(false)}
                  isSubmitting={updateLeadMutation.isPending}
                />
              </div>
            ) : (
              leadQuery.data && (
                <div className="space-y-6">
                  <LeadDetailCard
                    lead={leadQuery.data}
                    activities={activitiesQuery.data || []}
                    tasks={tasks}
                    activityStatistics={activityStatisticsQuery.data}
                    activityStatisticsLoading={activityStatisticsQuery.isLoading}
                    activityStatisticsError={
                      activityStatisticsQuery.error
                        ? getApiErrorMessage(activityStatisticsQuery.error)
                        : undefined
                    }
                    onCreateActivityClick={() => openInteractionForm("activity")}
                    onCreateTaskClick={() => openInteractionForm("task")}
                    onActivityClick={openActivityEditor}
                  />
                </div>
              )
            )}
          </div>
        </section>

        {leadQuery.data && isInteractionFormVisible && (
          <div className="fixed inset-y-0 left-[var(--sidebar-width)] z-[100] flex w-[calc(100vw-var(--sidebar-width))] items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm md:p-4">
            <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <LeadInteractionPanel
                key={interactionMode}
                lead={leadQuery.data}
                defaultMode={interactionMode}
                onClose={() => setIsInteractionFormVisible(false)}
              />
            </div>
          </div>
        )}

        {leadQuery.data && editingActivity && (
          <div className="fixed inset-y-0 left-[var(--sidebar-width)] z-[110] flex w-[calc(100vw-var(--sidebar-width))] items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm md:p-4">
            <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <LeadInteractionPanel
                key={`edit-activity-${editingActivity.id}`}
                lead={leadQuery.data}
                defaultMode="activity"
                activityToEdit={editingActivity}
                onClose={() => setEditingActivity(null)}
              />
            </div>
          </div>
        )}

        <ConfirmDeleteModal
          open={!!pendingUpdateValues}
          title="Xác nhận cập nhật lead"
          message="Bạn có chắc muốn cập nhật lead này?"
          confirmLabel="Cập nhật"
          cancelLabel="Hủy"
          onClose={() => setPendingUpdateValues(null)}
          onConfirm={confirmUpdateLead}
          loading={updateLeadMutation.isPending}
        />
      </div>
    </main>
  );
}