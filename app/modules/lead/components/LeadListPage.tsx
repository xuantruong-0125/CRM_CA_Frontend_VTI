"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { leadApi } from "@/modules/lead/api/lead.api";
import LeadFilters, { type LeadFilterValues } from "@/modules/lead/components/LeadFilters";
import LeadForm from "@/modules/lead/components/LeadForm";
import { type LeadFormValues } from "@/modules/lead/schemas/lead.schema";
import LeadTable from "@/modules/lead/components/LeadTable";
import {
  useAssigneeMetadata,
  useOrganizationMetadata,
  useProductMetadata,
  useProvinceMetadata,
} from "@/modules/lead/hooks/useLeadMetadata";
import {
  useConvertLead,
  useCreateLead,
  useDeleteLead,
  useUpdateLead,
} from "@/modules/lead/hooks/useLeadMutations";
import { useLeadReferences } from "@/modules/lead/hooks/useLeadReferences";
import { useLeadDashboardStats, useSearchLeads } from "@/modules/lead/hooks/useLeads";
import type {
  LeadResponse,
  OrganizationMetadataItem,
  LeadReferenceOptionResponse,
} from "@/modules/lead/types/lead.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { LEAD_SHORTCUTS, matchesShortcut } from "@/modules/lead/utils/keyboard-shortcuts";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";

type FormMode = "hidden" | "create" | "edit";

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
  const searchDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      const normalizedSearchTerm = searchTerm.trim();

      // Heuristic: if it looks like a phone number (at least 8 chars), search by phone.
      // Otherwise, search by email.
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
  const provincesQuery = useProvinceMetadata({ page: 0, size: 100, sortBy: "name" });
  const organizationsQuery = useOrganizationMetadata();
  const assigneesQuery = useAssigneeMetadata({ page: 0, size: 50, sortBy: "fullName", status: "ACTIVE" });
  
  // TĂNG SIZE LÊN 3000 ĐỂ LẤY TOÀN BỘ SẢN PHẨM TRUYỀN VÀO MODAL
  const productsQuery = useProductMetadata({ page: 0, size: 3000, sortBy: "name", isActive: true });
  
  const leadsQuery = useSearchLeads(searchParams);
  const leadDashboardStatsQuery = useLeadDashboardStats();

  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const convertLeadMutation = useConvertLead();

  const references = referencesQuery.data;
  const leadsPage = leadsQuery.data;
  const leadDashboardStats = leadDashboardStatsQuery.data;
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
      (provincesQuery.data?.content || []).map((province) => [province.id, province.name])
    ) as Record<number, string>;
  }, [provincesQuery.data?.content]);

  const statusNameById = useMemo(() => {
    return Object.fromEntries(
      leadStatuses.map((status) => [status.id, status.name])
    ) as Record<number, string>;
  }, [leadStatuses]);

  const organizationOptions = useMemo<OrganizationOption[]>(() => {
    const flattenTree = (nodes: OrganizationMetadataItem[], level = 0): OrganizationOption[] => {
      return nodes.flatMap((node) => {
        const prefix = level > 0 ? `${"- ".repeat(level)}` : "";
        const current: OrganizationOption = {
          id: node.id,
          name: `${prefix}${node.name}`,
        };

        const children = node.children?.length
          ? flattenTree(node.children, level + 1)
          : [];

        return [current, ...children];
      });
    };

    const orgs = Array.isArray(organizationsQuery.data)
      ? organizationsQuery.data
      : ((organizationsQuery.data as Record<string, unknown>)?.content as OrganizationMetadataItem[] | undefined) || [];
    
    return flattenTree(orgs);
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
    try {
      if (formMode === "create") {
        const confirmed = window.confirm("Bạn có chắc muốn thêm lead mới?");
        if (!confirmed) {
          return;
        }

        await createLeadMutation.mutateAsync({
          ...values,
          companyName: values.companyName ?? "",
        });
        toast.success("Tạo lead thành công");
      }

      if (formMode === "edit" && editingLead?.id) {
        const confirmed = window.confirm(
          `Bạn có chắc muốn cập nhật lead ${editingLead.contactName || `#${editingLead.id}`}?`
        );
        if (!confirmed) {
          return;
        }

        await updateLeadMutation.mutateAsync({
          id: editingLead.id,
          payload: values,
        });
        toast.success("Cập nhật lead thành công");
      }

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

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lead ${lead.contactName || "này"}?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteLeadMutation.mutateAsync(lead.id);
      toast.success("Xóa lead thành công");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const convertLead = async (lead: LeadResponse) => {
    if (!lead.id) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn chuyển đổi lead ${lead.contactName || `#${lead.id}`}?`
    );
    if (!confirmed) {
      return;
    }

    const userId = getUserIdFromStorage() ?? lead.assignedTo;
    if (!userId || userId <= 0) {
      toast.error("Không tìm thấy userId hợp lệ để chuyển đổi lead");
      return;
    }

    try {
      await convertLeadMutation.mutateAsync({
        id: lead.id,
        payload: { userId },
      });
      toast.success("Chuyển đổi lead thành công");
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

  const navigateToPage = useCallback((nextPage: number) => {
    const clampedPage = Math.min(Math.max(nextPage, 0), totalPages - 1);
    setPage(clampedPage);
    setPageInput(String(clampedPage + 1));
  }, [totalPages]);

  const applyPageSize = (nextSize: number) => {
    setSize(nextSize);
    setPage(0);
    setPageInput("1");
    setShowPageSizeMenu(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesShortcut(e, LEAD_SHORTCUTS.CREATE_LEAD)) {
        console.log("✅ Alt+N triggered!", e);
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
  }, [page, totalPages, navigateToPage, setPage, setPageInput]);

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
      <main className="min-h-screen bg-slate-50 px-2 py-3 md:px-4">
        <div className="mx-auto max-w-[1600px]">
          <div className="space-y-3">
            <header className="space-y-0.5">
              <h1 className="text-[16px] font-semibold text-slate-900">
                {formMode === "create" ? "Thêm khách hàng tiềm năng" : "Chỉnh sửa khách hàng tiềm năng"}
              </h1>
              <p className="text-[12px] text-slate-600">
                Điền đầy đủ thông tin để lưu dữ liệu khách hàng tiềm năng.
              </p>
            </header>

            <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <LeadForm
                mode={formMode === "create" ? "create" : "edit"}
                initialValues={formInitialValues}
                statuses={leadStatuses}
                sources={references?.sources || []}
                campaigns={references?.campaigns || []}
                assignees={assigneesQuery.data?.content || []}
                provinces={provincesQuery.data?.content || []}
                products={productsQuery.data?.content || []}
                onSubmit={submitLeadForm}
                onCancel={() => {
                  setFormMode("hidden");
                  setEditingLead(null);
                }}
                isSubmitting={isBusy}
              />
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-2 py-3 md:px-4">
      <div className="mx-auto max-w-[1600px]">

        <div className="space-y-3">
          <header className="space-y-0.5">
            <h1 className="text-[16px] font-semibold text-slate-900">
              Quản lý Khách hàng Tiềm năng
            </h1>
            <p className="text-[12px] text-slate-600">
              Theo dõi và quản lý toàn bộ khách hàng tiềm năng của bạn
            </p>
          </header>

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-slate-600">Tổng số KHTN</p>
                <p className="mt-0.5 text-[15px] font-bold text-slate-950">
                  {leadDashboardStatsQuery.isLoading
                    ? "..."
                    : (leadDashboardStats?.totalLeads ?? 0).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <span className="text-[12px]">👥</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-slate-600">Mới</p>
                <p className="mt-0.5 text-[15px] font-bold text-blue-600">
                  {leadDashboardStatsQuery.isLoading ? "..." : leadDashboardStats?.newLeads ?? 0}
                </p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <span className="text-[11px] font-bold">N</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
             <div className="flex items-start justify-between">
               <div>
                 <p className="text-[11px] text-slate-600">Đang liên hệ</p>
                 <p className="mt-0.5 text-[15px] font-bold text-amber-600">
                   {leadDashboardStatsQuery.isLoading ? "..." : leadDashboardStats?.contactingLeads ?? 0}
                 </p>
               </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <span className="text-[12px]">📞</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
             <div className="flex items-start justify-between">
               <div>
                 <p className="text-[11px] text-slate-600">Phát sinh giao dịch</p>
                 <p className="mt-0.5 text-[15px] font-bold text-sky-600">
                   {leadDashboardStatsQuery.isLoading ? "..." : leadDashboardStats?.contactingLeads ?? 0}
                 </p>
               </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                <span className="text-[12px]">🤝</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
             <div className="flex items-start justify-between">
               <div>
                  <p className="text-[11px] text-slate-600">Đã chuyển đổi</p>
                  <p className="mt-0.5 text-[15px] font-bold text-emerald-600">
                    {leadDashboardStatsQuery.isLoading ? "..." : leadDashboardStats?.convertedLeads ?? 0}
                  </p>
               </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <span className="text-[12px]">↗</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
             <div className="flex items-start justify-between">
               <div>
                 <p className="text-[11px] text-slate-600">Doanh số dự kiến</p>
                 <p className="mt-0.5 text-[13px] font-bold text-violet-600">
                   {leadDashboardStatsQuery.isLoading
                     ? "..."
                     : `${(leadDashboardStats?.expectedRevenueTotal ?? 0).toLocaleString("vi-VN")} đ`}
                 </p>
               </div>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500">
                <span className="text-[12px]">↗</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- KHU VỰC TOOLBAR & BẢNG DANH SÁCH --- */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col">
          
          {/* Toolbar: Tabs Trạng thái + Search + Action Buttons */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-2 xl:flex-row xl:items-center xl:justify-between bg-slate-50/50 rounded-t-lg">
            
            {/* Tabs Trạng thái (Bên Trái) */}
            <div className="flex flex-1 min-w-0 items-center gap-0.5 pb-1 overflow-hidden xl:pb-0">
              <button
                type="button"
                onClick={() => {
                  setPage(0);
                  setPageInput("1");
                  setFilters((prev) => ({ ...prev, statusId: undefined }));
                }}
                className={`shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium leading-none transition-colors ${
                  !filters.statusId
                    ? "bg-purple-100 text-purple-700"
                    : "text-slate-600 hover:bg-slate-200"
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
                  className={`shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium leading-none transition-colors ${
                    filters.statusId === status.id
                      ? "bg-purple-100 text-purple-700"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status.name}
                </button>
              ))}
            </div>

            {/* Các công cụ Lọc, Tìm kiếm, Thêm mới (Bên Phải) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <path
                    d="M21 21l-4.35-4.35m1.85-5.4a7.2 7.2 0 11-14.4 0 7.2 7.2 0 0114.4 0z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm theo SĐT, email..."
                  className="h-8 w-full rounded border border-slate-300 bg-white pl-8 pr-2 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={`inline-flex h-8 items-center gap-1.5 rounded border px-3 text-[12px] font-medium transition ${
                  showFilters
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                title={LEAD_SHORTCUTS.TOGGLE_FILTER.label}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Nâng cao
                <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.TOGGLE_FILTER} className="ml-1" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingLead(null);
                  setFormMode("create");
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-blue-600 px-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
                title={LEAD_SHORTCUTS.CREATE_LEAD.label}
              >
                Thêm mới
                <KeyboardShortcutBadge shortcut={LEAD_SHORTCUTS.CREATE_LEAD} />
              </button>
            </div>
          </div>

          {/* Form Lọc Nâng Cao */}
          {showFilters && (
            <div className="border-b border-slate-200 p-3 bg-slate-50/30">
              {organizationsQuery.error && (
                <p className="mb-2 rounded text-[11px] bg-red-50 px-2 py-1 text-red-700">
                  {getApiErrorMessage(organizationsQuery.error)}
                </p>
              )}
              <LeadFilters
                defaultValues={visibleLeadFilters}
                statuses={leadStatuses}
                sources={references?.sources || []}
                provinces={provincesQuery.data?.content || []}
                organizations={organizationOptions}
                onChange={(nextFilters) => {
                  setPage(0);
                  setPageInput("1");
                  setFilters(nextFilters);
                }}
                onReset={() => {
                  setPage(0);
                  setPageInput("1");
                  setSearchTerm("");
                  setFilters({
                    phone: undefined,
                    email: undefined,
                  });
                }}
              />
            </div>
          )}

          {/* Tiêu đề Bảng */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <h2 className="text-[15px] font-semibold text-slate-900">Danh sách khách hàng tiềm năng</h2>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaskFilterMenu((current) => !current);
                    setShowPageSizeMenu(false);
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                  title={LEAD_SHORTCUTS.TOGGLE_SECURITY.label}
                >
                  Lọc bảo mật
                </button>

                {showMaskFilterMenu && (
                  <div className="absolute right-0 z-20 mt-1 min-w-[180px] rounded border border-slate-200 bg-white p-2 shadow-lg">
                    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[12px] text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={maskPhoneEnabled}
                        onChange={(event) => setMaskPhoneEnabled(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Ẩn số điện thoại
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[12px] text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={maskEmailEnabled}
                        onChange={(event) => setMaskEmailEnabled(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Ẩn Email
                    </label>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPageSizeMenu((current) => !current);
                    setShowMaskFilterMenu(false);
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                  title={LEAD_SHORTCUTS.TOGGLE_PAGE_SIZE.label}
                >
                  Lead/trang: {size}
                </button>

                {showPageSizeMenu && (
                  <div className="absolute right-0 z-20 mt-1 min-w-[130px] rounded border border-slate-200 bg-white p-1 shadow-lg">
                    {[20, 50, 100].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => applyPageSize(option)}
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-[12px] transition ${
                          size === option
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-50"
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

          {leadsQuery.error && (
            <p className="mx-2 mt-2 rounded bg-red-50 px-2 py-1 text-[11px] text-red-700">
              {getApiErrorMessage(leadsQuery.error)}
            </p>
          )}

          {/* Component Bảng */}
          <div className="p-0 text-[12px] flex-1">
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

          {/* Footer Bảng: Số bản ghi và Phân trang */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-[12px]">
            <div className="text-[11px] text-slate-500">{leadsPage?.totalElements ?? 0} bản ghi</div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => navigateToPage(0)}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                title={LEAD_SHORTCUTS.FIRST_PAGE.label}
              >
                <span className="text-xs leading-none">⏮</span>
              </button>
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => navigateToPage(page - 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                title={LEAD_SHORTCUTS.PREV_PAGE.label}
              >
                <span className="text-xs leading-none">◀</span>
              </button>

              <form
                className="flex items-center gap-1.5 px-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitPageInput();
                }}
              >
                <input
                  value={pageInput}
                  onChange={(event) => setPageInput(event.target.value)}
                  onBlur={() => {
                    if (pageInput.trim() === "") {
                      setPageInput(String((leadsPage?.page ?? page) + 1));
                    }
                  }}
                  inputMode="numeric"
                  className="h-7 w-12 rounded border border-slate-300 bg-white px-1 text-center text-[12px] text-slate-900 outline-none transition focus:border-slate-400"
                />
                <span className="text-[11px] text-slate-600">/ {totalPages}</span>
                <button
                  type="submit"
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 transition hover:bg-slate-50"
                >
                  Đi
                </button>
              </form>

              <button
                type="button"
                disabled={!leadsPage?.hasNext}
                onClick={() => navigateToPage(page + 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                title={LEAD_SHORTCUTS.NEXT_PAGE.label}
              >
                <span className="text-xs leading-none">▶</span>
              </button>
              <button
                type="button"
                disabled={!leadsPage?.hasNext}
                onClick={() => navigateToPage(totalPages - 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                title={LEAD_SHORTCUTS.LAST_PAGE.label}
              >
                <span className="text-xs leading-none">⏭</span>
              </button>
            </div>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}