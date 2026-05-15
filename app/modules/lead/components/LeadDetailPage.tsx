"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import LeadDetailCard from "@/modules/lead/components/LeadDetailCard";
import LeadForm from "@/modules/lead/components/LeadForm";
import {
  useAssigneeMetadata,
  useProductMetadata,
  useProvinceMetadata,
} from "@/modules/lead/hooks/useLeadMetadata";
import { useLeadReferences } from "@/modules/lead/hooks/useLeadReferences";
import { useUpdateLead } from "@/modules/lead/hooks/useLeadMutations";
import {
  useLeadActivities,
  useLeadActivityStatistics,
  useLeadById,
} from "@/modules/lead/hooks/useLeads";
import LeadInteractionPanel from "@/modules/lead/components/LeadInteractionPanel";
import type { LeadFormValues } from "@/modules/lead/schemas/lead.schema";
import type { MetadataItem } from "@/modules/lead/types/lead.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { LEAD_SHORTCUTS, matchesShortcut } from "@/modules/lead/utils/keyboard-shortcuts";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";

type LeadDetailPageProps = {
  id: number;
};

export default function LeadDetailPage({ id }: LeadDetailPageProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInteractionFormVisible, setIsInteractionFormVisible] = useState(false);
  const [interactionMode, setInteractionMode] = useState<"activity" | "task">("activity");

  const leadQuery = useLeadById(id);
  const activitiesQuery = useLeadActivities(id);
  const activityStatisticsQuery = useLeadActivityStatistics(id);
  const referencesQuery = useLeadReferences();
  const provincesQuery = useProvinceMetadata({ page: 0, size: 100, sortBy: "name" });
  const assigneesQuery = useAssigneeMetadata({ page: 0, size: 50, sortBy: "fullName", status: "ACTIVE" });
  const productsQuery = useProductMetadata({ page: 0, size: 50, sortBy: "name", isActive: true });
  const updateLeadMutation = useUpdateLead();

  const handleUpdateLead = async (values: LeadFormValues) => {
    const confirmed = window.confirm("Bạn có chắc muốn cập nhật lead này?");
    if (!confirmed) {
      return;
    }

    try {
      await updateLeadMutation.mutateAsync({
        id,
        payload: values,
      });
      setIsEditMode(false);
      toast.success("Cập nhật lead thành công!");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const provinces = (provincesQuery.data?.content || []) as MetadataItem[];
  const statuses = referencesQuery.data?.statuses || [];
  const sources = referencesQuery.data?.sources || [];
  const campaigns = referencesQuery.data?.campaigns || [];
  const assignees = (assigneesQuery.data?.content || []) as MetadataItem[];
  const products = (productsQuery.data?.content || []) as MetadataItem[];

  const openInteractionForm = (mode: "activity" | "task") => {
    setInteractionMode(mode);
    setIsInteractionFormVisible(true);
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
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              Chi tiết lead: {leadQuery.data?.contactName || "-"}
            </h1>
            <div className="flex gap-2">
              {!isEditMode && leadQuery.data && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 inline-flex items-center gap-2"
                  title={LEAD_SHORTCUTS.EDIT_LEAD.label}
                >
                  Chỉnh sửa
                  <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.EDIT_LEAD} />
                </button>
              )}
              <Link
                href="/leads"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                title="Quay lại danh sách"
              >
                Quay lại danh sách
              </Link>
            </div>
          </div>

          {leadQuery.isLoading && (
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Đang tải thông tin lead...
            </p>
          )}

          {leadQuery.error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getApiErrorMessage(leadQuery.error)}
            </p>
          )}

          {leadQuery.data && isEditMode ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
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
                  activityStatistics={activityStatisticsQuery.data}
                  activityStatisticsLoading={activityStatisticsQuery.isLoading}
                  activityStatisticsError={
                    activityStatisticsQuery.error
                      ? getApiErrorMessage(activityStatisticsQuery.error)
                      : undefined
                  }
                  onCreateActivityClick={() => openInteractionForm("activity")}
                  onCreateTaskClick={() => openInteractionForm("task")}
                />
              </div>
            )
          )}

          {leadQuery.data && isInteractionFormVisible && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <LeadInteractionPanel
                  key={interactionMode}
                  lead={leadQuery.data}
                  defaultMode={interactionMode}
                  onClose={() => setIsInteractionFormVisible(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}