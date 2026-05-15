"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2, SlidersHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import ClassificationBadge from "@/modules/customer/components/ClassificationBadge";
import CustomerForm from "@/modules/customer/components/CustomerForm";
import StatusBadge from "@/modules/customer/components/StatusBadge";
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_TIER_LABELS,
  CUSTOMER_TYPE_OPTIONS,
} from "@/modules/customer/constants/customer.constants";
import { useCreateCustomer, useDeleteCustomer, useUpdateCustomer, useUpdateCustomerStatus, useUpdateCustomerTier } from "@/modules/customer/hooks/useCustomerMutations";
import { useCustomerCount, useCustomers } from "@/modules/customer/hooks/useCustomers";
import type { CustomerFormValues } from "@/modules/customer/schemas/customer.schema";
import type { CustomerResponseDTO, CustomerStatus, CustomerTier, CustomerType } from "@/modules/customer/types/customer.types";
import {
  getCustomerDisplayName,
  normalizeCustomerStatus,
  normalizeCustomerTier,
  toCreateCustomerPayload,
  toUpdateCustomerPayload,
} from "@/modules/customer/utils/customer.mapper";
import { getApiErrorMessage } from "@/shared/utils/api-error";

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

function getAssignedLabel(assignedTo?: number) {
  return typeof assignedTo === "number" ? `NV #${assignedTo}` : "-";
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

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const statusMutation = useUpdateCustomerStatus();
  const tierMutation = useUpdateCustomerTier();

  const customers = customerQuery.data?.content ?? [];
  const totalPages = Math.max(customerQuery.data?.totalPages ?? 1, 1);

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

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      if (formMode === "create") {
        await createMutation.mutateAsync(toCreateCustomerPayload(values));
        toast.success("Tạo khách hàng thành công");
      } else if (editingCustomer?.id) {
        await updateMutation.mutateAsync({ id: editingCustomer.id, payload: toUpdateCustomerPayload(values) });
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

    const confirmed = window.confirm(`Khách hàng ${getCustomerDisplayName(customer)} sẽ được đưa vào thùng rác. Tiếp tục?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(customer.id);
      toast.success("Đã xóa khách hàng");
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
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sky-600">Customer module</p>
              <h1 className="mt-2 text-[16px] font-bold text-slate-900">Quản lý khách hàng</h1>
              <p className="mt-2 text-[12px] text-slate-600">
                Trung tâm dữ liệu CRM cho B2B/B2C, theo dõi phân hạng, trạng thái và sale phụ trách.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
            >
              <Plus size={16} />
              Thêm khách hàng
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.7fr_repeat(3,minmax(0,1fr))]">
            <label className="relative block lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setPage(0);
                  setSearchTerm(event.target.value);
                }}
                placeholder="Tìm theo tên, mã, MST, email..."
                className="w-full rounded-[5px] border border-slate-300 bg-white py-2 pl-10 pr-4 text-[12px] text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPage(0);
                  setCustomerType("");
                }}
                className={`rounded-[5px] px-3 py-2 text-[12px] font-semibold transition ${customerType === "" ? "bg-sky-600 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                Tất cả
              </button>
              {CUSTOMER_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setPage(0);
                    setCustomerType(option.value);
                  }}
                  className={`rounded-[5px] px-3 py-2 text-[12px] font-semibold transition ${customerType === option.value ? "bg-sky-600 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((s) => !s)}
                className="inline-flex items-center gap-2 rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <SlidersHorizontal size={16} />
                Bộ lọc
              </button>
            </div>

            <select
              value={size}
              onChange={(event) => {
                setPage(0);
                setSize(Number(event.target.value));
              }}
              className="rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>

          {showFilters && (
            <div className="mt-3 rounded-[5px] border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={status}
                    onChange={(event) => {
                      setPage(0);
                      setStatus(event.target.value as CustomerStatus | "");
                    }}
                    className="w-full sm:w-48 rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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
                    className="w-full sm:w-48 rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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
                    className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
                  >
                    Áp dụng
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-600">
            <p>Tổng khách hàng: {countQuery.data ?? 0}</p>
            <p>Trang {page + 1} / {totalPages}</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {customerQuery.isLoading ? (
            <div className="p-8 text-sm text-slate-500">Đang tải danh sách khách hàng...</div>
          ) : customerQuery.error ? (
            <div className="p-8 text-sm text-red-700">{getApiErrorMessage(customerQuery.error)}</div>
          ) : customers.length === 0 ? (
            <div className="p-8">{emptyMessage("Chưa có dữ liệu khách hàng phù hợp bộ lọc hiện tại.")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-[12px]">
                <thead className="bg-slate-50 text-[12px] uppercase tracking-[0.14em] text-slate-500">
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
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer) => {
                    const currentStatus = normalizeCustomerStatus(customer.statusName);
                    const currentTier = normalizeCustomerTier(customer.tierName);

                    return (
                      <tr key={customer.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-4 font-medium text-slate-900">{customer.customerCode}</td>
                        <td className="px-4 py-4">
                          <Link href={`/customers/${customer.id}`} className="font-semibold text-sky-700 hover:underline">
                            {getCustomerDisplayName(customer)}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-slate-800">{customer.taxCode ?? "-"}</td>
                        <td className="px-4 py-4 text-slate-800">{getTypeLabel(customer.type)}</td>
                        <td className="px-4 py-4 text-slate-800">{getAssignedLabel(customer.assignedTo)}</td>
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
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] text-slate-600">
              Hiển thị {customers.length} bản ghi / {customerQuery.data?.totalElements ?? 0}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
                className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </section>
      </div>

      {formMode !== "hidden" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">
                  {formMode === "create" ? "Tạo khách hàng" : "Chỉnh sửa khách hàng"}
                </h2>
                <p className="text-[12px] text-slate-500">Thông tin cốt lõi theo mô hình CRM 360 độ.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700"
              >
                Đóng
              </button>
            </div>

            <CustomerForm
              mode={formMode === "create" ? "create" : "edit"}
              initialValues={editingCustomer}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}
    </main>
  );
}
