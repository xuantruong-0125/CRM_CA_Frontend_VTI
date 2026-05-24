"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { leadApi } from "@/modules/lead/api/lead.api";
import LeadFilters, { type LeadFilterValues } from "@/modules/lead/components/LeadFilters";
import LeadForm from "@/modules/lead/components/LeadForm";
import { type LeadFormValues } from "@/modules/lead/schemas/lead.schema";
import LeadTable from "@/modules/lead/components/LeadTable";
import {
  useAssigneeMetadata,
  useOrganizationMetadata,
  useProductMetadata,
} from "@/modules/lead/hooks/useLeadMetadata";
import {
  useConvertLead,
  useCreateLead,
  useDeleteLead,
  useUpdateLead,
} from "@/modules/lead/hooks/useLeadMutations";
import { useLeadReferences } from "@/modules/lead/hooks/useLeadReferences";
import { useSearchLeads } from "@/modules/lead/hooks/useLeads";
import type {
  LeadResponse,
  MetadataItem,
  LeadReferenceOptionResponse,
} from "@/modules/lead/types/lead.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { LEAD_SHORTCUTS, matchesShortcut } from "@/modules/lead/utils/keyboard-shortcuts";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";

type FormMode = "hidden" | "create" | "edit";

type PendingSubmission = {
  mode: "create" | "edit";
  values: LeadFormValues;
  label: string;
};

type OrganizationOption = {
  id: number;
  name: string;
};

function getUserIdFromStorage(): number | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const candidateValues = [
    window.localStorage.getItem("userId"),
    window.localStorage.getItem("user_id"),
    window.localStorage.getItem("currentUserId"),
  ];

  for (const value of candidateValues) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  const rawAuthUser = window.localStorage.getItem("authUser");
  if (rawAuthUser) {
    try {
      const parsedAuthUser = JSON.parse(rawAuthUser) as {
        id?: number;
        userId?: number;
      };
      const nestedId = Number(parsedAuthUser.userId ?? parsedAuthUser.id);
      if (Number.isFinite(nestedId) && nestedId > 0) {
        return nestedId;
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export default function LeadListPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [pageInput, setPageInput] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [maskPhoneEnabled, setMaskPhoneEnabled] = useState(true);
  const [maskEmailEnabled, setMaskEmailEnabled] = useState(true);
  const [showMaskFilterMenu, setShowMaskFilterMenu] = useState(false);
  const [showPageSizeMenu, setShowPageSizeMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LeadFilterValues>({});
  const [formMode, setFormMode] = useState<FormMode>("hidden");
  const [editingLead, setEditingLead] = useState<LeadResponse | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<number | null>(null);
  const [deleteLeadTarget, setDeleteLeadTarget] = useState<LeadResponse | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<PendingSubmission | null>(null);
  const [convertLeadTarget, setConvertLeadTarget] = useState<LeadResponse | null>(null);
  const searchDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      const normalizedSearchTerm = searchTerm.trim();
      const isPhoneSearch = /^[0-9+\-\s()]{8,}$/.test(normalizedSearchTerm);

      setPage(0);
      setPageInput("1");
      setFilters((currentFilters) => ({
        ...currentFilters,
        phone: normalizedSearchTerm && isPhoneSearch ? normalizedSearchTerm : undefined,
        email: normalizedSearchTerm && !isPhoneSearch ? normalizedSearchTerm : undefined,
      }));
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm]);

  const searchParams = useMemo(
    () => ({
      page,
      size,
      sortBy: "createdAt",
      sortDir: "desc" as const,
      ...filters,
    }),
    [filters, page, size]
  );

  const referencesQuery = useLeadReferences();
  const organizationsQuery = useOrganizationMetadata();
  const assigneesQuery = useAssigneeMetadata({ page: 0, size: 50, sortBy: "name", status: "ACTIVE" });
  const productsQuery = useProductMetadata({ page: 0, size: 3000, sortBy: "name", isActive: true });
  const leadsQuery = useSearchLeads(searchParams);

  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const convertLeadMutation = useConvertLead();

  const references = referencesQuery.data;
  const leadsPage = leadsQuery.data;
  const totalPages = Math.max(leadsPage?.totalPages ?? 1, 1);

  const leadStatuses = useMemo<LeadReferenceOptionResponse[]>(() => {
    const statuses = [...(references?.statuses || [])];
    const hasConvertedStatus = statuses.some((status) => {
      const normalizedName = status.name.toLowerCase();
      const normalizedCode = status.code.toLowerCase();

      return (
        normalizedName.includes("chuyển đổi") ||
        normalizedName.includes("converted") ||
        normalizedCode.includes("converted")
      );
    });

    if (!hasConvertedStatus) {
      statuses.push({
        id: 3,
        code: "CONVERTED",
        name: "Đã chuyển đổi",
        order: statuses.length + 1,
      });
    }

    return statuses;
  }, [references?.statuses]);

  const provinceNameById = useMemo(() => {
    return Object.fromEntries(
      (references?.provinces || []).map((province) => [province.id, province.name])
    ) as Record<number, string>;
  }, [references?.provinces]);

  const statusNameById = useMemo(() => {
    return Object.fromEntries(
      leadStatuses.map((status) => [status.id, status.name])
    ) as Record<number, string>;
  }, [leadStatuses]);

  const organizationOptions = useMemo<OrganizationOption[]>(() => {
    const orgs = organizationsQuery.data?.content || [];
    return orgs.map((organization: MetadataItem) => ({
      id: organization.id,
      name: organization.name,
    }));
  }, [organizationsQuery.data]);

  const visibleLeadFilters = useMemo(
    () => ({
      phone: filters.phone,
      email: filters.email,
      provinceId: filters.provinceId,
      organizationId: filters.organizationId,
      statusId: filters.statusId,
      sourceId: filters.sourceId,
    }),
    [
      filters.email,
      filters.phone,
      filters.organizationId,
      filters.provinceId,
      filters.statusId,
      filters.sourceId,
    ]
  );

  const formInitialValues = useMemo(() => {
    if (!editingLead) {
      return undefined;
    }

    const rawEditingLead = editingLead as Record<string, unknown>;
    const rawProductInterests =
      rawEditingLead.productInterestIds ??
      rawEditingLead.productInterestId ??
      rawEditingLead.productinterestId ??
      rawEditingLead.productInterests ??
      rawEditingLead.products;

    return {
      contactName: editingLead.contactName,
      companyName: editingLead.companyName,
      phone: editingLead.phone,
      email: editingLead.email,
      address: editingLead.address,
      website: editingLead.website,
      taxCode: editingLead.taxCode,
      citizenId: editingLead.citizenId,
      provinceId: editingLead.provinceId,
      campaignId: editingLead.campaignId,
      description: editingLead.description,
      expectedRevenue: editingLead.expectedRevenue,
      sourceId: editingLead.sourceId,
      organizationId: editingLead.organizationId,
      assignedTo: editingLead.assignedTo,
      statusId: editingLead.statusId,
      productInterestIds: rawProductInterests as LeadFormValues["productInterestIds"],
    };
  }, [editingLead]);

  const submitLeadForm = async (values: LeadFormValues) => {
    if (formMode === "create") {
      setPendingSubmission({
        mode: "create",
        values,
        label: "lead mới",
      });
      return;
    }

    if (formMode === "edit" && editingLead?.id) {
      setPendingSubmission({
        mode: "edit",
        values,
        label: editingLead.contactName || `#${editingLead.id}`,
      });
      return;
    }
  };

  const confirmLeadSubmission = async () => {
    if (!pendingSubmission) {
      return;
    }

    try {
      if (pendingSubmission.mode === "create") {
        await createLeadMutation.mutateAsync({
          ...pendingSubmission.values,
          companyName: pendingSubmission.values.companyName ?? "",
        });
        toast.success("Tạo lead thành công");
      } else if (editingLead?.id) {
        await updateLeadMutation.mutateAsync({
          id: editingLead.id,
          payload: pendingSubmission.values,
        });
        toast.success("Cập nhật lead thành công");
      }

      setPendingSubmission(null);
      setFormMode("hidden");
      setEditingLead(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const deleteLead = async (lead: LeadResponse) => {
    if (!lead.id) {
      return;
    }

    setDeleteLeadTarget(lead);
  };

  const confirmDeleteLead = async () => {
    if (!deleteLeadTarget?.id) {
      return;
    }

    try {
      await deleteLeadMutation.mutateAsync(deleteLeadTarget.id);
      toast.success("Xóa lead thành công");
      setDeleteLeadTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const convertLead = async (lead: LeadResponse) => {
    if (!lead.id) {
      return;
    }

    setConvertLeadTarget(lead);
  };

  const confirmConvertLead = async () => {
    if (!convertLeadTarget?.id) {
      return;
    }

    const userId = getUserIdFromStorage() ?? convertLeadTarget.assignedTo;
    if (!userId || userId <= 0) {
      toast.error("Không tìm thấy userId hợp lệ để chuyển đổi lead");
      setConvertLeadTarget(null);
      return;
    }

    try {
      await convertLeadMutation.mutateAsync({
        id: convertLeadTarget.id,
        payload: { userId },
      });
      toast.success("Chuyển đổi lead thành công");
      setConvertLeadTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleStatusChange = async (lead: LeadResponse, newStatusId: number) => {
    if (!lead.id) {
      return;
    }

    try {
      await updateLeadMutation.mutateAsync({
        id: lead.id,
        payload: {
          statusId: newStatusId,
        },
      });
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isBusy =
    createLeadMutation.isPending ||
    updateLeadMutation.isPending ||
    deleteLeadMutation.isPending ||
    convertLeadMutation.isPending;

  const navigateToPage = useCallback(
    (nextPage: number) => {
      const clampedPage = Math.min(Math.max(nextPage, 0), totalPages - 1);
      setPage(clampedPage);
      setPageInput(String(clampedPage + 1));
    },
    [totalPages]
  );

  const applyPageSize = (nextSize: number) => {
    setSize(nextSize);
    setPage(0);
    setPageInput("1");
    setShowPageSizeMenu(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesShortcut(e, LEAD_SHORTCUTS.CREATE_LEAD)) {
        e.preventDefault();
        setEditingLead(null);
        setFormMode("create");
      } else if (matchesShortcut(e, LEAD_SHORTCUTS.TOGGLE_FILTER)) {
        e.preventDefault();
        setShowFilters((current) => !current);
      } else if (matchesShortcut(e, LEAD_SHORTCUTS.TOGGLE_SECURITY)) {
        e.preventDefault();
        setShowMaskFilterMenu((current) => !current);
        setShowPageSizeMenu(false);
      } else if (matchesShortcut(e, LEAD_SHORTCUTS.TOGGLE_PAGE_SIZE)) {
        e.preventDefault();
        setShowPageSizeMenu((current) => !current);
        setShowMaskFilterMenu(false);
      } else if (matchesShortcut(e, LEAD_SHORTCUTS.FIRST_PAGE)) {
        e.preventDefault();
        navigateToPage(0);
      } else if (matchesShortcut(e, LEAD_SHORTCUTS.PREV_PAGE)) {
        e.preventDefault();
        navigateToPage(page - 1);
      } else if (matchesShortcut(e, LEAD_SHORTCUTS.NEXT_PAGE)) {
        e.preventDefault();
        navigateToPage(page + 1);
      } else if (matchesShortcut(e, LEAD_SHORTCUTS.LAST_PAGE)) {
        e.preventDefault();
        navigateToPage(totalPages - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, totalPages, navigateToPage]);

  const submitPageInput = () => {
    const nextPage = Number.parseInt(pageInput, 10);

    if (!Number.isInteger(nextPage) || nextPage < 1 || nextPage > totalPages) {
      toast.error(`Vui lòng nhập số trang từ 1 đến ${totalPages}`);
      setPageInput(String((leadsPage?.page ?? page) + 1));
      return;
    }

    navigateToPage(nextPage - 1);
  };

  if (formMode !== "hidden") {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-[rgb(21,0,211)] px-6 py-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Lead module</p>
              <h1 className="mt-1 text-[18px] font-bold leading-tight text-white">
                {formMode === "create" ? "Thêm khách hàng tiềm năng" : "Chỉnh sửa khách hàng tiềm năng"}
              </h1>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <LeadForm
                  mode={formMode === "create" ? "create" : "edit"}
                  initialValues={formInitialValues}
                  statuses={leadStatuses}
                  sources={references?.sources || []}
                  campaigns={references?.campaigns || []}
                  assignees={assigneesQuery.data?.content || []}
                  provinces={references?.provinces || []}
                  products={productsQuery.data?.content || []}
                  onSubmit={submitLeadForm}
                  onCancel={() => {
                    setFormMode("hidden");
                    setEditingLead(null);
                  }}
                  isSubmitting={isBusy}
                />
              </div>
            </div>
          </section>
        </div>

        <ConfirmDeleteModal
          open={!!deleteLeadTarget}
          title="Xóa lead"
          message={deleteLeadTarget ? `Bạn có chắc muốn xóa lead ${deleteLeadTarget.contactName || "này"}?` : "Bạn có chắc muốn xóa lead này?"}
          onClose={() => setDeleteLeadTarget(null)}
          onConfirm={confirmDeleteLead}
          loading={deleteLeadMutation.isPending}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[rgb(21,0,211)] px-6 py-4 text-white">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Lead module</p>
                <h1 className="mt-1 text-[18px] font-bold leading-tight text-white">Quản lý khách hàng tiềm năng</h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLead(null);
                    setFormMode("create");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-emerald-500 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-emerald-400"
                  title={LEAD_SHORTCUTS.CREATE_LEAD.label}
                >
                  Thêm lead mới
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setPage(0);
                  setPageInput("1");
                  setFilters((prev) => ({ ...prev, statusId: undefined }));
                }}
                className={`whitespace-nowrap rounded-[5px] px-3 py-2 text-[12px] font-medium transition ${
                  !filters.statusId ? "bg-[rgb(21,0,211)] text-white" : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Tất cả
              </button>
              {leadStatuses.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => {
                    setPage(0);
                    setPageInput("1");
                    setFilters((prev) => ({ ...prev, statusId: status.id }));
                  }}
                  className={`whitespace-nowrap rounded-[5px] px-3 py-2 text-[12px] font-medium transition ${
                    filters.statusId === status.id
                      ? "bg-[rgb(21,0,211)] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {status.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <label className="relative w-full max-w-[340px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm theo điện thoại hoặc email..."
                    className="w-full rounded-[5px] border border-slate-300 bg-white py-2 pl-10 pr-4 text-[12px] text-slate-900 outline-none transition focus:border-[rgb(21,0,211)] focus:ring-2 focus:ring-[rgb(21,0,211)]/20"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setShowFilters((current) => !current);
                    setShowMaskFilterMenu(false);
                    setShowPageSizeMenu(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <SlidersHorizontal size={16} />
                  Bộ lọc nâng cao
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMaskFilterMenu((current) => !current);
                    setShowPageSizeMenu(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {maskPhoneEnabled || maskEmailEnabled ? <EyeOff size={16} /> : <Eye size={16} />}
                  Bảo mật
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPageSizeMenu((current) => !current);
                      setShowMaskFilterMenu(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                    title={LEAD_SHORTCUTS.TOGGLE_PAGE_SIZE.label}
                  >
                    Lead/trang: {size}
                  </button>

                  {showPageSizeMenu && (
                    <div className="absolute left-0 z-20 mt-2 min-w-[140px] rounded-[5px] border border-slate-200 bg-white p-1 shadow-xl">
                      {[20, 50, 100].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => applyPageSize(option)}
                          className={`flex w-full items-center justify-between rounded-[5px] px-2 py-1.5 text-[12px] transition ${
                            size === option ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{option}</span>
                          {size === option && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
              <LeadFilters
                statuses={leadStatuses}
                sources={references?.sources || []}
                provinces={references?.provinces || []}
                organizations={organizationOptions}
                defaultValues={visibleLeadFilters}
                onChange={(nextFilters) => {
                  setPage(0);
                  setPageInput("1");
                  setFilters(nextFilters);
                }}
                onReset={() => {
                  setPage(0);
                  setPageInput("1");
                  setSearchTerm("");
                  setFilters({ phone: undefined, email: undefined });
                }}
              />
            </div>
          )}

          {showMaskFilterMenu && (
            <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 text-[12px] text-slate-700">
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maskPhoneEnabled}
                    onChange={(event) => setMaskPhoneEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Ẩn SĐT
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maskEmailEnabled}
                    onChange={(event) => setMaskEmailEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Ẩn Email
                </label>
              </div>
            </div>
          )}

          {leadsQuery.error && (
            <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-[12px] text-red-700">
              {getApiErrorMessage(leadsQuery.error)}
            </div>
          )}

          <div className="overflow-hidden">
            <LeadTable
              leads={leadsPage?.content || []}
              loading={leadsQuery.isLoading}
              provinceNameById={provinceNameById}
              statusNameById={statusNameById}
              maskPhoneEnabled={maskPhoneEnabled}
              maskEmailEnabled={maskEmailEnabled}
              loadingEditLeadId={editingLeadId}
              onEdit={async (lead) => {
                if (!lead.id) {
                  toast.error("Không tìm thấy ID lead để chỉnh sửa");
                  return;
                }

                try {
                  setEditingLeadId(lead.id);
                  const fullLead = await leadApi.getLeadById(lead.id);
                  setEditingLead(fullLead);
                  setFormMode("edit");
                } catch (error) {
                  toast.error(getApiErrorMessage(error));
                } finally {
                  setEditingLeadId(null);
                }
              }}
              onDelete={deleteLead}
              onConvert={convertLead}
              onStatusChange={handleStatusChange}
            />
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
              <div className="text-[12px] font-medium text-slate-600">
                Total: {(leadsPage?.totalElements ?? 0).toLocaleString("vi-VN")} leads
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => navigateToPage(0)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title={LEAD_SHORTCUTS.FIRST_PAGE.label}
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => navigateToPage(page - 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title={LEAD_SHORTCUTS.PREV_PAGE.label}
                >
                  <ChevronLeft size={16} />
                </button>

                <form
                  className="flex items-center gap-2 rounded-[5px] border border-slate-200 bg-slate-50 px-3 py-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitPageInput();
                  }}
                >
                  <span className="text-[12px] font-semibold text-slate-700">Trang</span>
                  <input
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value)}
                    onBlur={() => {
                      if (pageInput.trim() === "") {
                        setPageInput(String((leadsPage?.page ?? page) + 1));
                      }
                    }}
                    inputMode="numeric"
                    className="h-8 w-14 rounded-[5px] border border-slate-300 bg-white px-2 text-center text-[12px] text-slate-900 outline-none transition focus:border-[rgb(21,0,211)] focus:ring-2 focus:ring-[rgb(21,0,211)]/20"
                  />
                  <span className="text-[12px] text-slate-600">/ {totalPages}</span>
                  <button
                    type="submit"
                    className="rounded-[5px] bg-[rgb(21,0,211)] px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
                  >
                    Đi
                  </button>
                </form>

                <button
                  type="button"
                  disabled={!leadsPage?.hasNext}
                  onClick={() => navigateToPage(page + 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title={LEAD_SHORTCUTS.NEXT_PAGE.label}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  disabled={!leadsPage?.hasNext}
                  onClick={() => navigateToPage(totalPages - 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title={LEAD_SHORTCUTS.LAST_PAGE.label}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>

              <div className="hidden lg:block" />
            </div>
          </div>
        </section>
      </div>

      {formMode !== "hidden" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <LeadForm
              key={formMode}
              mode={formMode === "create" ? "create" : "edit"}
              initialValues={formInitialValues}
              statuses={leadStatuses}
              sources={references?.sources || []}
              campaigns={references?.campaigns || []}
              assignees={assigneesQuery.data?.content || []}
              provinces={references?.provinces || []}
              products={productsQuery.data?.content || []}
              onSubmit={submitLeadForm}
              onCancel={() => {
                setFormMode("hidden");
                setEditingLead(null);
              }}
              isSubmitting={isBusy}
            />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!pendingSubmission}
        title={pendingSubmission?.mode === "create" ? "Xác nhận tạo lead" : "Xác nhận cập nhật lead"}
        message={
          pendingSubmission
            ? pendingSubmission.mode === "create"
              ? `Bạn có chắc muốn thêm ${pendingSubmission.label}?`
              : `Bạn có chắc muốn cập nhật lead ${pendingSubmission.label}?`
            : "Bạn có chắc chắn muốn tiếp tục?"
        }
        confirmLabel={pendingSubmission?.mode === "create" ? "Tạo lead" : "Cập nhật"}
        cancelLabel="Hủy"
        onClose={() => setPendingSubmission(null)}
        onConfirm={confirmLeadSubmission}
        loading={createLeadMutation.isPending || updateLeadMutation.isPending}
      />

      <ConfirmDeleteModal
        open={!!convertLeadTarget}
        title="Xác nhận chuyển đổi lead"
        message={convertLeadTarget ? `Bạn có chắc muốn chuyển đổi lead ${convertLeadTarget.contactName || `#${convertLeadTarget.id}`}?` : "Bạn có chắc muốn chuyển đổi lead này?"}
        confirmLabel="Chuyển đổi"
        cancelLabel="Hủy"
        onClose={() => setConvertLeadTarget(null)}
        onConfirm={confirmConvertLead}
        loading={convertLeadMutation.isPending}
      />
    </main>
  );
}
