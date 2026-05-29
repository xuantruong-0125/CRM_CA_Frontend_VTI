"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "@/modules/lead/styles/lead.module.css";
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
  X,
  Plus
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
      setPageInput(String(page + 1));
      return;
    }

    navigateToPage(nextPage - 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageShell}>
        <section>
          <div className={styles.pageTopBar}>
            <h1 className={styles.pageTopBarTitle}>Quản lý khách hàng tiềm năng</h1>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.statusTabs}>
                <button
                  type="button"
                  onClick={() => {
                    setPage(0);
                    setPageInput("1");
                    setFilters((prev) => ({ ...prev, statusId: undefined }));
                  }}
                  className={`${styles.statusTab} ${!filters.statusId ? styles.statusTabActive : ""}`}
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
                    className={`${styles.statusTab} ${filters.statusId === status.id ? styles.statusTabActive : ""}`}
                  >
                    {status.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingLead(null);
                setFormMode("create");
              }}
              className={`${styles.btnPrimary} ${styles.btnPrimarySuccess}`}
              title={LEAD_SHORTCUTS.CREATE_LEAD.label}
            >
              <Plus size={17}/>
              Thêm mới
            </button>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchBox}>
                <Search className={styles.searchIcon} size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm theo tên, phone, email..."
                  className={styles.searchInput}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowFilters((current) => !current);
                  setShowMaskFilterMenu(false);
                  setShowPageSizeMenu(false);
                }}
                className={styles.btnFilter}
                title={LEAD_SHORTCUTS.TOGGLE_FILTER.label}
              >
                <SlidersHorizontal size={14} />
                Bộ lọc
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMaskFilterMenu((current) => !current);
                  setShowPageSizeMenu(false);
                }}
                className={styles.btnOutline}
                title={LEAD_SHORTCUTS.TOGGLE_SECURITY.label}
              >
                {maskPhoneEnabled || maskEmailEnabled ? <EyeOff size={14} /> : <Eye size={14} />}
                Bảo mật
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPageSizeMenu((current) => !current);
                    setShowMaskFilterMenu(false);
                  }}
                  className={styles.btnOutline}
                  title={LEAD_SHORTCUTS.TOGGLE_PAGE_SIZE.label}
                >
                  {size} / trang
                </button>

                {showPageSizeMenu && (
                  <div className={styles.dropdownMenu}>
                    {[20, 50, 100].map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.dropdownMenuItem} ${size === option ? styles.dropdownMenuItemActive : ""}`}
                        onClick={() => applyPageSize(option)}
                      >
                        <span>{option}</span>
                        {size === option && <span className={styles.dropdownCheckmark}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className={styles.filterSection}>
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
            <div className={styles.maskFilterMenu}>
              <div className={styles.maskFilterOptions}>
                <label className={styles.maskFilterCheckbox}>
                  <input
                    type="checkbox"
                    checked={maskPhoneEnabled}
                    onChange={(event) => setMaskPhoneEnabled(event.target.checked)}
                  />
                  Ẩn số điện thoại
                </label>
                <label className={styles.maskFilterCheckbox}>
                  <input
                    type="checkbox"
                    checked={maskEmailEnabled}
                    onChange={(event) => setMaskEmailEnabled(event.target.checked)}
                  />
                  Ẩn email
                </label>
              </div>
            </div>
          )}

          {leadsQuery.error && <div className={styles.errorMessage}>{getApiErrorMessage(leadsQuery.error)}</div>}

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
          <div className={styles.pagination}>
            <span className={styles.userNum}>
              Total: <strong>{(leadsPage?.totalElements ?? 0).toLocaleString("vi-VN")}</strong> leads
            </span>

            <div className={styles.paginationControls}>
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => navigateToPage(0)}
                className={styles.pageBtn}
                title={LEAD_SHORTCUTS.FIRST_PAGE.label}
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                type="button"
                disabled={page <= 0}
                onClick={() => navigateToPage(page - 1)}
                className={styles.pageBtn}
                title={LEAD_SHORTCUTS.PREV_PAGE.label}
              >
                <ChevronLeft size={16} />
              </button>

              <div className={styles.pageInputWrapper}>
                <span>Trang</span>
                <input
                  type="number"
                  className={styles.pageInput}
                  value={pageInput}
                  min={1}
                  max={totalPages}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPageInput(value === "" ? "1" : value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitPageInput();
                    }
                  }}
                />
                <span>/ {totalPages}</span>
              </div>

              <button type="button" onClick={() => submitPageInput()} className={styles.btnPrimary}>
                Đi
              </button>

              <button
                type="button"
                disabled={!leadsPage?.hasNext}
                onClick={() => navigateToPage(page + 1)}
                className={styles.pageBtn}
                title={LEAD_SHORTCUTS.NEXT_PAGE.label}
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                disabled={!leadsPage?.hasNext}
                onClick={() => navigateToPage(totalPages - 1)}
                className={styles.pageBtn}
                title={LEAD_SHORTCUTS.LAST_PAGE.label}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Form */}
      {formMode !== "hidden" && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setFormMode("hidden");
            setEditingLead(null);
          }}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {formMode === "create" ? "Thêm khách hàng tiềm năng" : "Chỉnh sửa khách hàng tiềm năng"}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => {
                  setFormMode("hidden");
                  setEditingLead(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
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
        </div>
      )}

      {/* Confirmation Modals */}
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
        open={!!deleteLeadTarget}
        title="Xóa lead"
        message={deleteLeadTarget ? `Bạn có chắc muốn xóa lead ${deleteLeadTarget.contactName || "này"}?` : "Bạn có chắc muốn xóa lead này?"}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onClose={() => setDeleteLeadTarget(null)}
        onConfirm={confirmDeleteLead}
        loading={deleteLeadMutation.isPending}
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
    </div>
  );
}
