"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  SlidersHorizontal,
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
  toCreateCustomerAddressPayload,
  toCreateCustomerPayload,
  toUpdateCustomerPayload,
} from "@/modules/customer/utils/customer.mapper";
import { customerApi } from "@/modules/customer/api/customer.api";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";

type FormMode = "hidden" | "create" | "edit";

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
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
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

        const addressPayload = toCreateCustomerAddressPayload(values, createdCustomer.id);
        if (addressPayload) {
          await customerApi.createCustomerAddress(addressPayload);
        }

        toast.success("Tạo khách hàng thành công");
      } else if (editingCustomer?.id) {
        await updateMutation.mutateAsync({ id: editingCustomer.id, payload: toUpdateCustomerPayload(values) });

        const addressPayload = toCreateCustomerAddressPayload(values, editingCustomer.id);
        if (addressPayload) {
          const currentAddresses = await customerApi.getAddressesByCustomerId(editingCustomer.id);
          const primaryAddress = currentAddresses.find((item) => item.isPrimary) ?? currentAddresses[0];

          if (primaryAddress?.id) {
            await customerApi.updateCustomerAddress(primaryAddress.id, addressPayload);
          } else {
            await customerApi.createCustomerAddress(addressPayload);
          }
        }

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

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[rgb(21,0,211)] px-6 py-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Customer module</p>
            <h1 className="mt-1 text-[18px] font-bold leading-tight text-white">Quản lý khách hàng</h1>
          </div>

          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <label className="relative block w-full min-w-[240px] max-w-[420px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setPage(0);
                      setSearchTerm(event.target.value);
                    }}
                    placeholder="Tìm theo tên, mã, MST, email..."
                    className="w-full rounded-[5px] border border-slate-300 bg-white py-2 pl-10 pr-4 text-[12px] text-slate-900 outline-none transition focus:border-[rgb(21,0,211)] focus:ring-2 focus:ring-[rgb(21,0,211)]/20"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCustomerTypeSelect("")}
                    className={`rounded-[5px] px-3 py-2 text-[12px] font-semibold transition ${customerType === "" ? "bg-[rgb(21,0,211)] text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    Tất cả
                  </button>
                  {CUSTOMER_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleCustomerTypeSelect(option.value)}
                      className={`rounded-[5px] px-3 py-2 text-[12px] font-semibold transition ${customerType === option.value ? "bg-[rgb(21,0,211)] text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <select
                  value={size}
                  onChange={(event) => {
                    setPage(0);
                    setSize(Number(event.target.value));
                  }}
                  className="w-full min-w-[120px] max-w-[140px] rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition focus:border-[rgb(21,0,211)] focus:ring-2 focus:ring-[rgb(21,0,211)]/20"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowFilters((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <SlidersHorizontal size={16} />
                  Bộ lọc
                </button>
              </div>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[5px] bg-emerald-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-emerald-500"
              >
                Thêm khách hàng
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl lg:flex-1">
                  <select
                    value={status}
                    onChange={(event) => {
                      setPage(0);
                      setStatus(event.target.value as CustomerStatus | "");
                    }}
                    className="w-full rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition focus:border-[rgb(21,0,211)] focus:ring-2 focus:ring-[rgb(21,0,211)]/20"
                  >
                    <option value="">Trạng thái</option>
                    {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={tier}
                    onChange={(event) => {
                      setPage(0);
                      setTier(event.target.value as CustomerTier | "");
                    }}
                    className="w-full rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition focus:border-[rgb(21,0,211)] focus:ring-2 focus:ring-[rgb(21,0,211)]/20"
                  >
                    <option value="">Phân hạng</option>
                    {Object.entries(CUSTOMER_TIER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPage(0);
                      setShowFilters(false);
                    }}
                    className="rounded-[5px] bg-[rgb(21,0,211)] px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
                  >
                    Lọc
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("");
                      setTier("");
                      setPage(0);
                      setShowFilters(false);
                    }}
                    className="rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {customerQuery.isLoading ? (
              <div className="p-8 text-sm text-slate-500">Đang tải danh sách khách hàng...</div>
            ) : customerQuery.error ? (
              <div className="p-8 text-sm text-red-700">{getApiErrorMessage(customerQuery.error)}</div>
            ) : customers.length === 0 ? (
              <div className="p-8">{emptyMessage("Chưa có dữ liệu khách hàng phù hợp bộ lọc hiện tại.")}</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 text-left text-[12px]">
                <thead className="bg-[rgb(21,0,211)] text-[12px] uppercase tracking-[0.14em] text-white">
                  <tr>
                    <th className="px-4 py-3">Mã KH</th>
                    <th className="px-4 py-3">Tên KH</th>
                    <th className="px-4 py-3">MST</th>
                    <th className="px-4 py-3">Nhóm KH</th>
                    <th className="px-4 py-3">Sale phụ trách</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Phân hạng</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {customers.map((customer) => {
                    const currentStatus = normalizeCustomerStatus(customer.statusName);
                    const currentTier = normalizeCustomerTier(customer.tierName);

                    return (
                      <tr key={customer.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-4 font-medium text-slate-900">{customer.customerCode}</td>
                        <td className="px-4 py-4">
                          <Link href={`/customers/${customer.id}`} className="font-semibold text-blue-700 hover:underline">
                            {getCustomerDisplayName(customer)}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-slate-800">{getCustomerTaxCode(customer) ?? "-"}</td>
                        <td className="px-4 py-4 text-slate-800">{getTypeLabel(customer.type)}</td>
                        <td className="px-4 py-4 text-slate-800">{getAssignedLabel(customer.assignedTo, saleNameById)}</td>
                        <td className="px-4 py-4">
                          <StatusBadge
                            value={currentStatus}
                            onStatusChange={(value) => updateStatus(customer, value)}
                            isLoading={statusMutation.isPending}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <ClassificationBadge
                            value={currentTier}
                            onClassificationChange={(value) => updateTier(customer, value)}
                            isLoading={tierMutation.isPending}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(customer)}
                              className="inline-flex items-center gap-1 rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Pencil size={14} />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(customer)}
                              className="inline-flex items-center gap-1 rounded-[5px] border border-red-200 px-3 py-2 text-[12px] font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
              <div className="text-[12px] font-medium text-slate-600">
                Total: {countQuery.data ?? customerQuery.data?.totalElements ?? 0} users
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => setPage(0)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Trang đầu"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-semibold text-slate-700">
                  Trang {page + 1} / {totalPages}
                </div>

                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(totalPages - 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Trang cuối"
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
