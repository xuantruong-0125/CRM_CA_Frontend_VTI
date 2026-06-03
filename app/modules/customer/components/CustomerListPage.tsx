"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Pencil,
  Search,
  Trash2,
  SlidersHorizontal,
  Plus
} from "lucide-react";
import { toast } from "react-toastify";
import ClassificationBadge from "@/modules/customer/components/ClassificationBadge";
import CustomerForm from "@/modules/customer/components/CustomerForm";
import StatusBadge from "@/modules/customer/components/StatusBadge";
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_TIER_LABELS,
  CUSTOMER_TYPE_OPTIONS,
} from "@/modules/customer/constants/customer.constants";
import { useCustomerSalesUsers, useCustomerCount, useCustomers } from "@/modules/customer/hooks/useCustomers";
import { useCreateCustomer, useDeleteCustomer, useUpdateCustomer, useUpdateCustomerStatus, useUpdateCustomerTier } from "@/modules/customer/hooks/useCustomerMutations";
import type { CustomerFormValues } from "@/modules/customer/schemas/customer.schema";
import type { CustomerResponseDTO, CustomerStatus, CustomerTier, CustomerType } from "@/modules/customer/types/customer.types";
import {
  getCustomerDisplayName,
  getCustomerTaxCode,
  normalizeCustomerStatus,
  normalizeCustomerTier,
  toCreateCustomerPayload,
  toUpdateCustomerPayload,
  saveCustomerContacts,
  saveCustomerAddresses,
} from "@/modules/customer/utils/customer.mapper";
import { customerApi } from "@/modules/customer/api/customer.api";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import { KeyboardShortcutBadge } from "@/modules/lead/components/KeyboardShortcutBadge";
import { CUSTOMER_SHORTCUTS, matchesShortcut, shouldIgnoreShortcutTarget } from "@/modules/customer/utils/keyboard-shortcuts";
import styles from "@/modules/customer/styles/customer.module.css";
import { useCurrentUser } from "@/core/auth/useCurrentUser";

type FormMode = "hidden" | "create" | "edit";

type ColumnKey =
  | "customerCode"
  | "customerName"
  | "taxCode"
  | "customerType"
  | "assignedTo"
  | "status"
  | "tier"
  | "actions";

type ColumnConfig = {
  key: ColumnKey;
  label: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  align?: "left" | "right";
};

const COLUMN_CONFIG: ColumnConfig[] = [
  { key: "customerCode", label: "Mã KH", defaultWidth: 100, minWidth: 30, maxWidth: 180 },
  { key: "customerName", label: "Tên KH", defaultWidth: 150, minWidth: 30, maxWidth: 200 },
  { key: "taxCode", label: "Mã số thuế", defaultWidth: 120, minWidth: 30, maxWidth: 220 },
  { key: "customerType", label: "Nhóm KH", defaultWidth: 80, minWidth: 30, maxWidth: 150 },
  { key: "assignedTo", label: "Sale phụ trách", defaultWidth: 180, minWidth: 30, maxWidth: 260 },
  { key: "status", label: "Trạng thái", defaultWidth: 140, minWidth: 30, maxWidth: 220 },
  { key: "tier", label: "Phân hạng", defaultWidth: 140, minWidth: 30, maxWidth: 220 },
  { key: "actions", label: "Thao tác", defaultWidth: 180, minWidth: 30, maxWidth: 260, align: "left" },
];

const STATUS_ID_MAP: Record<CustomerStatus, number> = {
  CARING: 1,
  PAUSED: 2,
  BLACKLIST: 3,
  OTHER: 4,
};

const TIER_ID_MAP: Record<CustomerTier, number> = {
  SILVER: 1,
  GOLD: 2,
  DIAMOND: 3,
};

function getTypeLabel(type?: CustomerType) {
  return type ?? "B2B";
}

function getAssignedLabel(assignedTo?: number, saleNameById?: Record<number, string>) {
  if (typeof assignedTo !== "number") {
    return "-";
  }

  return saleNameById?.[assignedTo] ?? `Chưa rõ #${assignedTo}`;
}

function getStatusId(status: CustomerStatus) {
  return STATUS_ID_MAP[status] ?? 1;
}

function getTierId(tier: CustomerTier) {
  return TIER_ID_MAP[tier] ?? 1;
}

function emptyMessage(message: string) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-[12px] text-slate-500">{message}</div>;
}

export default function CustomerListPage() {
  const { mounted, isSale } = useCurrentUser();
  const [columnWidths, setColumnWidths] = useState<Record<ColumnKey, number>>(() => {
    return COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.key] = column.defaultWidth;
      return acc;
    }, {} as Record<ColumnKey, number>);
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [pageInput, setPageInput] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [customerType, setCustomerType] = useState<"" | CustomerType>("");
  const [status, setStatus] = useState<"" | CustomerStatus>("");
  const [tier, setTier] = useState<"" | CustomerTier>("");
  const [formMode, setFormMode] = useState<FormMode>("hidden");
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponseDTO | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState<CustomerResponseDTO | null>(null);

  const customerQuery = useCustomers({
    page,
    size,
    sortBy: "createdAt",
    sortDirection: "desc",
    q: searchTerm.trim() || undefined,
    customerType: customerType || undefined,
    status: status || undefined,
    tier: tier || undefined,
  });
  const countQuery = useCustomerCount();
  const salesUsersQuery = useCustomerSalesUsers();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const statusMutation = useUpdateCustomerStatus();
  const tierMutation = useUpdateCustomerTier();

  const customers = customerQuery.data?.content ?? [];
  const totalPages = Math.max(customerQuery.data?.totalPages ?? 1, 1);
  const saleNameById = Object.fromEntries((salesUsersQuery.data ?? []).map((sale) => [sale.id, sale.fullName])) as Record<number, string>;

  const columnMinWidths = useMemo(() => {
    return COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.key] = column.minWidth;
      return acc;
    }, {} as Record<ColumnKey, number>);
  }, []);

  const columnMaxWidths = useMemo(() => {
    return COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.key] = column.maxWidth;
      return acc;
    }, {} as Record<ColumnKey, number>);
  }, []);

  const totalTableWidth = useMemo(() => {
    return COLUMN_CONFIG.reduce((sum, column) => sum + columnWidths[column.key], 0);
  }, [columnWidths]);

  const canDelete = mounted ? !isSale : false;

  const openCreateForm = () => {
    setEditingCustomer(null);
    setFormMode("create");
  };

  const openEditForm = (customer: CustomerResponseDTO) => {
    setEditingCustomer(customer);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode("hidden");
    setEditingCustomer(null);
  };

  const handleCustomerTypeSelect = (type: CustomerType | "") => {
    setPage(0);
    setCustomerType(type);
  };

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      if (formMode === "create") {
        const createdCustomer = await createMutation.mutateAsync(toCreateCustomerPayload(values));

        await saveCustomerAddresses(createdCustomer.id, values.addresses ?? []);
        await saveCustomerContacts(createdCustomer.id, values.contacts ?? []);

        toast.success("Tạo khách hàng thành công");
      } else if (editingCustomer?.id) {
        await updateMutation.mutateAsync({ id: editingCustomer.id, payload: toUpdateCustomerPayload(values) });

        await saveCustomerAddresses(editingCustomer.id, values.addresses ?? []);
        await saveCustomerContacts(editingCustomer.id, values.contacts ?? []);

        toast.success("Cập nhật khách hàng thành công");
      }

      closeForm();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (customer: CustomerResponseDTO) => {
    if (!customer.id) {
      return;
    }

    setDeleteCustomerTarget(customer);
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteCustomerTarget?.id) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteCustomerTarget.id);
      toast.success("Đã xóa khách hàng");
      setDeleteCustomerTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const updateStatus = async (customer: CustomerResponseDTO, value: CustomerStatus) => {
    await statusMutation.mutateAsync({ id: customer.id, statusId: getStatusId(value) });
    toast.success("Cập nhật trạng thái thành công");
  };

  const updateTier = async (customer: CustomerResponseDTO, value: CustomerTier) => {
    await tierMutation.mutateAsync({ id: customer.id, tierId: getTierId(value) });
    toast.success("Cập nhật phân hạng thành công");
  };

  const handleGoToPage = () => {
    let target = Number(pageInput);

    if (isNaN(target)) return;

    // giới hạn trong khoảng hợp lệ
    if (target < 1) target = 1;
    if (target > totalPages) target = totalPages;

    setPage(target - 1);
    setPageInput(String(target));
  };

  const startColumnResize = (columnKey: ColumnKey, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = columnWidths[columnKey];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const nextWidth = Math.min(
        columnMaxWidths[columnKey],
        Math.max(columnMinWidths[columnKey], startWidth + deltaX)
      );

      setColumnWidths((current) => ({
        ...current,
        [columnKey]: nextWidth,
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreShortcutTarget(event.target)) {
        return;
      }

      if (matchesShortcut(event, CUSTOMER_SHORTCUTS.ADD_NEW)) {
        event.preventDefault();
        openCreateForm();
      } else if (matchesShortcut(event, CUSTOMER_SHORTCUTS.TOGGLE_FILTER)) {
        event.preventDefault();
        setShowFilters((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.pageShell}>
        <section>
          <div className={styles.pageTopBar}>
            <h1 className={styles.pageTopBarTitle}>Quản lý khách hàng</h1>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchBox}>
                <Search className={styles.searchIcon} size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setPage(0);
                    setPageInput("1");
                    setSearchTerm(event.target.value);
                  }}
                  placeholder="Tìm theo tên, mã, MST, email..."
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.statusTabs}>
                <button
                  type="button"
                  onClick={() => handleCustomerTypeSelect("")}
                  className={`${styles.statusTab} ${customerType === "" ? styles.statusTabActive : ""}`}
                >
                  Tất cả
                </button>
                {CUSTOMER_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleCustomerTypeSelect(option.value)}
                    className={`${styles.statusTab} ${customerType === option.value ? styles.statusTabActive : ""}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className={styles.searchBox}>
                <select
                  value={size}
                  onChange={(event) => {
                    setPage(0);
                    setPageInput("1");
                    setSize(Number(event.target.value));
                  }}
                  className={styles.perPageSelect}
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={styles.btnFilter}
                title={CUSTOMER_SHORTCUTS.TOGGLE_FILTER.label}
              >
                <SlidersHorizontal size={14} />
                Bộ lọc
                <KeyboardShortcutBadge shortcut={CUSTOMER_SHORTCUTS.TOGGLE_FILTER} className="ml-1 border-slate-300 bg-white text-slate-700" />
              </button>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className={`${styles.btnPrimary} ${styles.btnPrimarySuccess}`}
              title={CUSTOMER_SHORTCUTS.ADD_NEW.label}
            >
              Thêm khách hàng
              <KeyboardShortcutBadge shortcut={CUSTOMER_SHORTCUTS.ADD_NEW} className="ml-1 border-white/40 bg-white/15 text-white" />
            </button>
          </div>

          {showFilters && (
            <div className={styles.filterSection}>
              <div className={styles.filterGrid}>
                <div className={styles.filterCard}>
                  <label>Trạng thái</label>
                  <select
                    value={status}
                    onChange={(event) => {
                      setPage(0);
                      setPageInput("1");
                      setStatus(event.target.value as CustomerStatus | "");
                    }}
                  >
                    <option value="">Trạng thái</option>
                    {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterCard}>
                  <label>Phân hạng</label>
                  <select
                    value={tier}
                    onChange={(event) => {
                      setPage(0);
                      setPageInput("1");
                      setTier(event.target.value as CustomerTier | "");
                    }}
                  >
                    <option value="">Phân hạng</option>
                    {Object.entries(CUSTOMER_TIER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.filterActions}>
                <button
                  type="button"
                  onClick={() => {
                    setPage(0);
                    setPageInput("1");
                    setShowFilters(false);
                  }}
                  className={styles.btnPrimary}
                >
                  Lọc
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("");
                    setTier("");
                    setPage(0);
                    setPageInput("1");
                    setShowFilters(false);
                  }}
                  className={styles.btnOutline}
                >
                  Đặt lại
                </button>
              </div>
            </div>
          )}

          {customerQuery.error && <div className={styles.errorMessage}>{getApiErrorMessage(customerQuery.error)}</div>}

          <div className={styles.tableContainer}>
            <div className={styles.tableNote}>KH = Khách hàng</div>

            {customerQuery.isLoading ? (
              <div className={styles.loadingRow}>Đang tải danh sách khách hàng...</div>
            ) : customerQuery.error ? (
              <div className={styles.loadingRow}>{getApiErrorMessage(customerQuery.error)}</div>
            ) : customers.length === 0 ? (
              <div className={styles.emptyRow}>{emptyMessage("Chưa có dữ liệu khách hàng phù hợp bộ lọc hiện tại.")}</div>
            ) : (
              <table className={styles.table} style={{ width: `${totalTableWidth}px`, minWidth: "100%" }}>
                <colgroup>
                  {COLUMN_CONFIG.map((column) => (
                    <col key={column.key} style={{ width: `${columnWidths[column.key]}px` }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    {COLUMN_CONFIG.map((column) => (
                      <th
                        key={column.key}
                        className={`${styles.headerCell} ${column.align === "right" ? styles.headerCellRight : ""}`}
                      >
                        <span className={styles.headerLabel}>{column.label}</span>
                        <button
                          type="button"
                          aria-label={`Resize ${column.label}`}
                          onMouseDown={(event) => startColumnResize(column.key, event)}
                          className={styles.resizeHandle}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const currentStatus = normalizeCustomerStatus(customer.statusName);
                    const currentTier = normalizeCustomerTier(customer.tierName);

                    return (
                      <tr key={customer.id}>
                        <td>{customer.customerCode}</td>
                        <td>
                          <Link href={`/customers/${customer.id}`} className={styles.customerLink}>
                            {getCustomerDisplayName(customer)}
                          </Link>
                        </td>
                        <td>{getCustomerTaxCode(customer) ?? "-"}</td>
                        <td>{getTypeLabel(customer.type)}</td>
                        <td>{getAssignedLabel(customer.assignedTo, saleNameById)}</td>
                        <td className={styles.cellOverflowVisible}>
                          <StatusBadge
                            value={currentStatus}
                            onStatusChange={(value) => updateStatus(customer, value)}
                            isLoading={statusMutation.isPending}
                          />
                        </td>
                        <td className={styles.cellOverflowVisible}>
                          <ClassificationBadge
                            value={currentTier}
                            onClassificationChange={(value) => updateTier(customer, value)}
                            isLoading={tierMutation.isPending}
                          />
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button type="button" onClick={() => openEditForm(customer)} className={`${styles.actionBtn} ${styles.editBtn}`}>
                              <Pencil size={14} />
                              Sửa
                            </button>
                            {canDelete && (
                              <button type="button" onClick={() => handleDelete(customer)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                                <Trash2 size={14} />
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.pagination}>
            <span className={styles.userNum}>Total: {countQuery.data ?? customerQuery.data?.totalElements ?? 0} customers</span>

            <div className={styles.paginationControls}>
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => {
                  setPage(0);
                  setPageInput("1");
                }}
                className={styles.pageBtn}
                title="Trang đầu"
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                type="button"
                disabled={page <= 0}
                onClick={() => {
                  const newPage = Math.max(page - 1, 0);
                  setPage(newPage);
                  setPageInput(String(newPage + 1));
                }}
                className={styles.pageBtn}
                title="Trang trước"
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
                    if (e.key === "Enter") handleGoToPage();
                  }}
                />
                <span>/ {totalPages}</span>
              </div>

              <button type="button" onClick={handleGoToPage} className={styles.btnPrimary}>
                Đi
              </button>

              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => {
                  const newPage = Math.min(page + 1, totalPages - 1);
                  setPage(newPage);
                  setPageInput(String(newPage + 1));
                }}
                className={styles.pageBtn}
                title="Trang sau"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => {
                  setPage(totalPages - 1);
                  setPageInput(String(totalPages));
                }}
                className={styles.pageBtn}
                title="Trang cuối"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {formMode !== "hidden" && (
        <CustomerForm
          mode={formMode === "create" ? "create" : "edit"}
          initialValues={editingCustomer}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteCustomerTarget}
        title="Xóa khách hàng"
        message={deleteCustomerTarget ? `Khách hàng ${getCustomerDisplayName(deleteCustomerTarget)} sẽ được đưa vào thùng rác. Tiếp tục?` : "Khách hàng sẽ được đưa vào thùng rác. Tiếp tục?"}
        onClose={() => setDeleteCustomerTarget(null)}
        onConfirm={confirmDeleteCustomer}
        loading={deleteMutation.isPending}
      />
    </main>
  );
}
