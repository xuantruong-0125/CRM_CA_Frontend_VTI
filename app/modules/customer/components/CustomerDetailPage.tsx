"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import CustomerForm from "@/modules/customer/components/CustomerForm";
import {
  CUSTOMER_DETAIL_TABS,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_TIER_LABELS,
} from "@/modules/customer/constants/customer.constants";
import {
  useCustomerActivities,
  useCustomerAddresses,
  useCustomerAttachments,
  useCustomerById,
  useCustomerContacts,
  useCustomerContracts,
  useCustomerFeedbacks,
  useCustomerInvoices,
  useCustomerOpportunities,
  useCustomerQuotes,
} from "@/modules/customer/hooks/useCustomers";
import { useUpdateCustomer } from "@/modules/customer/hooks/useCustomerMutations";
import { useCustomerSalesUsers } from "@/modules/customer/hooks/useCustomers";
import type { CustomerFormValues } from "@/modules/customer/schemas/customer.schema";
import {
  getCustomerTaxCode,
  normalizeCustomerStatus,
  normalizeCustomerTier,
  toCreateCustomerAddressPayload,
  toUpdateCustomerPayload,
} from "@/modules/customer/utils/customer.mapper";
import ContactForm from "@/modules/customer/components/ContactForm";
import ActivityForm from "@/modules/customer/components/ActivityForm";
import AttachmentUploadForm from "@/modules/customer/components/AttachmentUploadForm";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { useLeadReferences } from "@/modules/lead/hooks/useLeadReferences";
import { customerApi } from "@/modules/customer/api/customer.api";
import type {
  ActivityResponseDTO,
  AttachmentResponseDTO,
  ContactResponseDTO,
  ContractResponseDTO,
  CustomerAddressResponseDTO,
  FeedbackResponseDTO,
  InvoiceResponseDTO,
  OpportunityResponseDTO,
  QuoteResponseDTO,
} from "@/modules/customer/types/customer.types";

type CustomerDetailPageProps = {
  id: number;
};

type DetailTab = (typeof CUSTOMER_DETAIL_TABS)[number]["key"];
type AddressType = "HQ" | "BILLING" | "SHIPPING";
const TEMP_ADD_ROUTE = "/customers";

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "-";
}

function formatCurrency(value?: number) {
  return typeof value === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
    : "-";
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-slate-200 pb-4">
      <h3 className="text-[16px] font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 text-[12px] text-slate-500">{description}</p> : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-2 text-[13px] font-medium text-slate-900">{value}</div>
    </div>
  );
}

function EntityCard({
  title,
  primary,
  meta,
  onClick,
}: {
  title: string;
  primary: string;
  meta: Array<{ label: string; value?: ReactNode }>;
  onClick?: () => void;
}) {
  const classes = `w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition ${
    onClick ? "hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-md" : ""
  }`;

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-[13px] font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-[13px] font-medium text-slate-700">{primary}</p>
        </div>
        {onClick ? <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">Mở</span> : null}
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {meta.map((item) => (
          <div key={item.label}>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</dt>
            <dd className="mt-1 text-[12px] text-slate-800">{item.value ?? "-"}</dd>
          </div>
        ))}
      </dl>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-[12px] text-slate-500">{message}</div>;
}

type DetailSelection =
  | { kind: "address"; item: CustomerAddressResponseDTO }
  | { kind: "contact"; item: ContactResponseDTO }
  | { kind: "activity"; item: ActivityResponseDTO }
  | { kind: "attachment"; item: AttachmentResponseDTO }
  | { kind: "opportunity"; item: OpportunityResponseDTO }
  | { kind: "quote"; item: QuoteResponseDTO }
  | { kind: "contract"; item: ContractResponseDTO }
  | { kind: "invoice"; item: InvoiceResponseDTO }
  | { kind: "feedback"; item: FeedbackResponseDTO };

function DetailDialog({
  open,
  title,
  subtitle,
  fields,
  onClose,
  onEdit,
  editLabel = "Chỉnh sửa",
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  fields: Array<{ label: string; value?: ReactNode }>;
  onClose: () => void;
  onEdit?: () => void;
  editLabel?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-[12px] text-slate-500">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700">
            Đóng
          </button>
        </div>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{field.label}</dt>
              <dd className="mt-1 text-[12px] text-slate-800">{field.value ?? "-"}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex justify-end gap-3">
          {onEdit ? (
            <button type="button" onClick={onEdit} className="rounded-[5px] border border-sky-200 bg-sky-50 px-3 py-2 text-[12px] font-semibold text-sky-700">
              {editLabel}
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="rounded-[5px] bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeAddressTypeForDetail(addressType?: string): AddressType {
  switch (addressType) {
    case "HQ":
    case "BILLING":
    case "SHIPPING":
      return addressType;
    case "OFFICE":
    default:
      return "HQ";
  }
}

function toCustomerAddressPayload(address: CustomerAddressResponseDTO, isPrimary: boolean) {
  return {
    customerId: address.customerId,
    addressType: address.addressType,
    fullAddress: address.fullAddress,
    provinceId: address.provinceId,
    isPrimary,
  };
}

async function clearOtherPrimaryAddresses(
  addresses: CustomerAddressResponseDTO[],
  selectedAddressId?: number
) {
  const otherPrimaryAddresses = addresses.filter(
    (address) => address.isPrimary && address.id !== selectedAddressId
  );

  await Promise.all(
    otherPrimaryAddresses.map((address) =>
      customerApi.updateCustomerAddress(address.id, toCustomerAddressPayload(address, false))
    )
  );
}

function AddressEditorDialog({
  open,
  customerId,
  initialValues,
  provinces,
  existingAddresses,
  onClose,
  onSaved,
}: {
  open: boolean;
  customerId: number;
  initialValues?: Partial<CustomerAddressResponseDTO> | null;
  provinces: Array<{ id: number; name: string; code: string }>;
  existingAddresses: CustomerAddressResponseDTO[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [addressType, setAddressType] = useState<AddressType>(normalizeAddressTypeForDetail(initialValues?.addressType));
  const [fullAddress, setFullAddress] = useState(initialValues?.fullAddress ?? "");
  const [provinceId, setProvinceId] = useState(initialValues?.provinceId ? String(initialValues.provinceId) : "");
  const [isPrimary, setIsPrimary] = useState(initialValues?.isPrimary ?? !existingAddresses.some((item) => item.isPrimary));

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        customerId,
        addressType,
        fullAddress: fullAddress.trim(),
        provinceId: provinceId ? Number(provinceId) : undefined,
        isPrimary,
      };

      if (!payload.fullAddress) {
        toast.error("Vui lòng nhập địa chỉ đầy đủ");
        return;
      }

      if (payload.isPrimary) {
        await clearOtherPrimaryAddresses(existingAddresses, initialValues?.id);
      }

      if (initialValues?.id) {
        await customerApi.updateCustomerAddress(initialValues.id, payload);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await customerApi.createCustomerAddress(payload);
        toast.success("Thêm địa chỉ thành công");
      }

      await onSaved();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-slate-900">{initialValues?.id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}</h3>
            <p className="mt-1 text-[12px] text-slate-500">Thông tin địa chỉ khách hàng.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700">
            Đóng
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-900">Loại địa chỉ</span>
            <select
              className="h-8 rounded-[6px] border border-slate-300 px-2.5 text-[11px] text-slate-900"
              value={addressType}
              onChange={(e) => setAddressType(e.target.value as AddressType)}
            >
              <option value="HQ">Văn phòng</option>
              <option value="BILLING">Xuất hoá đơn</option>
              <option value="SHIPPING">Giao hàng</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-900">Tỉnh / Thành phố</span>
            <select
              className="h-8 rounded-[6px] border border-slate-300 px-2.5 text-[11px] text-slate-900"
              value={provinceId}
              onChange={(e) => setProvinceId(e.target.value)}
            >
              <option value="">Chọn tỉnh / thành phố</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-900">Địa chỉ đầy đủ</span>
            <textarea className="rounded-[6px] border border-slate-300 px-2.5 py-2 text-[11px] text-slate-900" rows={4} value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
          </label>

          <label className="inline-flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
            <span className="text-[12px] text-slate-900">Đặt làm địa chỉ chính</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700">
            Hủy
          </button>
          <button type="button" onClick={handleSubmit} className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white">
            {initialValues?.id ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetailPage({ id }: CustomerDetailPageProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DetailSelection | null>(null);
  const [contactFormState, setContactFormState] = useState<{ mode: "create" | "edit"; item?: ContactResponseDTO | null } | null>(null);
  const [activityFormState, setActivityFormState] = useState<{ mode: "create" | "edit"; item?: ActivityResponseDTO | null } | null>(null);
  const [addressFormState, setAddressFormState] = useState<{ mode: "create" | "edit"; item?: CustomerAddressResponseDTO | null } | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [deleteAddressTarget, setDeleteAddressTarget] = useState<CustomerAddressResponseDTO | null>(null);

  const customerQuery = useCustomerById(id);
  const updateMutation = useUpdateCustomer();
  const salesUsersQuery = useCustomerSalesUsers();
  const referencesQuery = useLeadReferences();

  const addressesQuery = useCustomerAddresses(id, true);
  const contactsQuery = useCustomerContacts(id, activeTab === "contacts");
  const activitiesQuery = useCustomerActivities(id, activeTab === "activities");
  const attachmentsQuery = useCustomerAttachments(id, activeTab === "attachments");
  const opportunitiesQuery = useCustomerOpportunities(id, activeTab === "opportunities");
  const quotesQuery = useCustomerQuotes(id, activeTab === "quotes");
  const contractsQuery = useCustomerContracts(id, activeTab === "contracts");
  const invoicesQuery = useCustomerInvoices(id, activeTab === "invoices");
  const feedbacksQuery = useCustomerFeedbacks(id, activeTab === "feedbacks");

  const customer = customerQuery.data;
  const provinces = referencesQuery.data?.provinces ?? [];
  const provinceNameById = Object.fromEntries(provinces.map((province) => [province.id, province.name])) as Record<
    number,
    string
  >;
  const saleNameById = Object.fromEntries((salesUsersQuery.data ?? []).map((sale) => [sale.id, sale.fullName])) as Record<number, string>;
  const sourceNameById = Object.fromEntries((referencesQuery.data?.sources ?? []).map((source) => [source.id, source.name])) as Record<number, string>;
  const customerAddresses = addressesQuery.data ?? [];

  const handleUpdate = async (values: CustomerFormValues) => {
    if (!customer?.id) {
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: customer.id, payload: toUpdateCustomerPayload(values) });

      const addressPayload = toCreateCustomerAddressPayload(values, customer.id);
      if (addressPayload) {
        const currentAddresses = await customerApi.getAddressesByCustomerId(customer.id);
        const primaryAddress = currentAddresses.find((item) => item.isPrimary) ?? currentAddresses[0];

        if (primaryAddress?.id) {
          await customerApi.updateCustomerAddress(primaryAddress.id, addressPayload);
        } else {
          await customerApi.createCustomerAddress(addressPayload);
        }
      }

      setIsEditMode(false);
      toast.success("Cập nhật khách hàng thành công");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const refreshCoreData = async () => {
    await Promise.all([customerQuery.refetch(), addressesQuery.refetch()]);
  };

  const openDetail = (selection: DetailSelection) => {
    setSelectedDetail(selection);
  };

  const closeDetail = () => {
    setSelectedDetail(null);
  };

  const openNewAddress = () => setAddressFormState({ mode: "create" });
  const openNewContact = () => setContactFormState({ mode: "create" });
  const openNewActivity = () => setActivityFormState({ mode: "create" });

  const handleAddressSaved = async () => {
    await refreshCoreData();
    setAddressFormState(null);
  };

  const handleSetPrimaryAddress = async (address: CustomerAddressResponseDTO) => {
    if (address.isPrimary) {
      return;
    }

    try {
      await clearOtherPrimaryAddresses(customerAddresses, address.id);
      await customerApi.updateCustomerAddress(address.id, toCustomerAddressPayload(address, true));
      toast.success("Đã đặt địa chỉ chính");
      await refreshCoreData();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDeleteAddress = async (address: CustomerAddressResponseDTO) => {
    if (address.isPrimary) {
      toast.error("Không thể xóa địa chỉ chính");
      return;
    }

    setDeleteAddressTarget(address);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteAddressTarget) {
      return;
    }

    try {
      await customerApi.deleteCustomerAddress(deleteAddressTarget.id);
      toast.success("Xóa địa chỉ thành công");
      setDeleteAddressTarget(null);
      await refreshCoreData();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const customerStatus = normalizeCustomerStatus(customer?.statusName);
  const customerTier = normalizeCustomerTier(customer?.tierName);

  const renderPageItems = <T extends { id: number }>(items: T[], renderItem: (item: T) => ReactNode) => {
    if (!items.length) {
      return <EmptyState message="Chưa có dữ liệu." />;
    }

    return <div className="grid gap-4">{items.map(renderItem)}</div>;
  };

  const renderOverview = () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionTitle title="Thông tin cốt lõi" description="Dữ liệu chính cho hồ sơ customer 360." />
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard label="Mã khách hàng" value={customer?.customerCode ?? "-"} />
          <MetricCard label="Loại khách hàng" value={customer?.type ?? "-"} />
          <MetricCard label="Trạng thái" value={CUSTOMER_STATUS_LABELS[customerStatus]} />
          <MetricCard label="Phân hạng" value={CUSTOMER_TIER_LABELS[customerTier]} />
          <MetricCard label="Mã số thuế" value={getCustomerTaxCode(customer) ?? "-"} />
          <MetricCard label="Sale phụ trách" value={typeof customer?.assignedTo === "number" ? saleNameById[customer.assignedTo] ?? `Chưa rõ #${customer.assignedTo}` : "-"} />
          <MetricCard label="Tên viết tắt" value={customer?.shortName ?? "-"} />
          <MetricCard label="Nguồn khách hàng" value={typeof customer?.sourceId === "number" ? sourceNameById[customer.sourceId] ?? `#${customer.sourceId}` : "-"} />
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionTitle title="Liên hệ và thời gian" description="Thông tin vận hành từ hồ sơ gốc." />
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard label="Tên khách hàng" value={customer?.name ?? "-"} />
          <MetricCard label="Email" value={customer?.email ?? "-"} />
          <MetricCard label="Số điện thoại" value={customer?.phone ?? "-"} />
          <MetricCard label="Số fax" value={customer?.fax ?? "-"} />
          <MetricCard label="Ngày tạo" value={formatDate(customer?.createdAt)} />
          <MetricCard label="Cập nhật gần nhất" value={formatDate(customer?.updatedAt)} />
        </div>
      </div>
    </div>
  );

  const renderCustomerAddresses = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Địa chỉ</h3>
          <p className="mt-1 text-[12px] text-slate-500">Danh sách địa chỉ khách hàng, nhấn vào từng dòng để xem và sửa.</p>
        </div>
        <button
          type="button"
          onClick={openNewAddress}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm địa chỉ
        </button>
      </div>

      {renderPageItems(customerAddresses, (item) => (
        <div
          key={item.id}
          role="button"
          tabIndex={0}
          onClick={() => openDetail({ kind: "address", item })}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openDetail({ kind: "address", item });
            }
          }}
          className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
            item.isPrimary ? "border-sky-300 bg-sky-50/40" : "border-slate-200 hover:border-sky-300 hover:bg-sky-50/30"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-[13px] font-semibold text-slate-900">{normalizeAddressTypeForDetail(item.addressType)}</h4>
              <p className="mt-1 text-[13px] font-medium text-slate-700">{item.fullAddress}</p>
            </div>

            <div className="flex items-center gap-2">
              <label
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 shadow-sm"
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={item.isPrimary}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    event.stopPropagation();
                    if (event.target.checked) {
                      void handleSetPrimaryAddress(item);
                    }
                  }}
                />
                <span>Địa chỉ chính</span>
              </label>

              {!item.isPrimary ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDeleteAddress(item);
                  }}
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Xóa
                </button>
              ) : null}
            </div>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Loại địa chỉ</dt>
              <dd className="mt-1 text-[12px] text-slate-800">{normalizeAddressTypeForDetail(item.addressType)}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Mặc định</dt>
              <dd className="mt-1 text-[12px] text-slate-800">{item.isPrimary ? "Có" : "Không"}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tỉnh/Thành</dt>
              <dd className="mt-1 text-[12px] text-slate-800">
                {item.provinceId ? provinceNameById[item.provinceId] ?? `#${item.provinceId}` : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Cập nhật</dt>
              <dd className="mt-1 text-[12px] text-slate-800">
                {item.updatedAt ? formatDate(item.updatedAt) : item.createdAt ? formatDate(item.createdAt) : "-"}
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Liên hệ</h3>
          <p className="mt-1 text-[12px] text-slate-500">Danh sách người liên hệ gắn với khách hàng.</p>
        </div>
        <button
          type="button"
          onClick={openNewContact}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm người liên hệ
        </button>
      </div>

      {renderPageItems(contactsQuery.data ?? [], (item) => (
        <EntityCard
          key={item.id}
          title={item.fullName}
          primary={item.position ?? item.phone ?? item.email ?? "-"}
          onClick={() => openDetail({ kind: "contact", item })}
          meta={[
            { label: "Số điện thoại", value: item.phone ?? "-" },
            { label: "Email", value: item.email ?? "-" },
            { label: "Địa chỉ", value: item.address ?? "-" },
            { label: "Ngày sinh", value: item.dateOfBirth ? formatDate(item.dateOfBirth) : "-" },
          ]}
        />
      ))}
    </div>
  );

  const renderOpportunities = () => {
    return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Cơ hội</h3>
          <p className="mt-1 text-[12px] text-slate-500">Danh sách cơ hội gắn với khách hàng.</p>
        </div>
        <Link
          href={TEMP_ADD_ROUTE}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm mới
        </Link>
      </div>

      {renderPageItems(opportunitiesQuery.data?.content ?? [], (item) => (
        <EntityCard
          key={item.id}
          title={item.name}
          primary={item.healthStatus ?? "-"}
          onClick={() => openDetail({ kind: "opportunity", item })}
          meta={[
            { label: "Tổng tiền", value: formatCurrency(item.totalAmount) },
            { label: "Ngày chốt dự kiến", value: item.expectedCloseDate ? formatDate(item.expectedCloseDate) : "-" },
            { label: "Assigned User ID", value: item.assignedUserId ?? "-" },
            { label: "Stage ID", value: item.stageId ?? "-" },
          ]}
        />
      ))}
    </div>
    );
  };

  const renderQuotes = () => {
    return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Báo giá</h3>
          <p className="mt-1 text-[12px] text-slate-500">Danh sách báo giá gắn với khách hàng.</p>
        </div>
        <Link
          href={TEMP_ADD_ROUTE}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm mới
        </Link>
      </div>

      {renderPageItems(quotesQuery.data?.content ?? [], (item) => (
        <EntityCard
          key={item.id}
          title={item.quoteName}
          primary={item.status ?? "-"}
          onClick={() => openDetail({ kind: "quote", item })}
          meta={[
            { label: "Mã báo giá", value: item.quoteCode },
            { label: "Tổng tiền", value: formatCurrency(item.totalAmount) },
            { label: "Hiệu lực đến", value: item.validUntil ? formatDate(item.validUntil) : "-" },
            { label: "Ngày báo giá", value: item.quoteDate ? formatDate(item.quoteDate) : "-" },
          ]}
        />
      ))}
    </div>
    );
  };

  const renderContracts = () => {
    return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Hợp đồng</h3>
          <p className="mt-1 text-[12px] text-slate-500">Danh sách hợp đồng gắn với khách hàng.</p>
        </div>
        <Link
          href={TEMP_ADD_ROUTE}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm mới
        </Link>
      </div>

      {renderPageItems(contractsQuery.data?.content ?? [], (item) => (
        <EntityCard
          key={item.id}
          title={item.contractName}
          primary={item.status ?? "-"}
          onClick={() => openDetail({ kind: "contract", item })}
          meta={[
            { label: "Mã hợp đồng", value: item.contractCode },
            { label: "Ngày hiệu lực", value: item.startDate ? formatDate(item.startDate) : "-" },
            { label: "Ngày hết hạn", value: item.endDate ? formatDate(item.endDate) : "-" },
            { label: "Tổng giá trị", value: formatCurrency(item.totalValue) },
          ]}
        />
      ))}
    </div>
    );
  };

  const renderInvoices = () => {
    return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Hóa đơn</h3>
          <p className="mt-1 text-[12px] text-slate-500">Danh sách hóa đơn gắn với khách hàng.</p>
        </div>
        <Link
          href={TEMP_ADD_ROUTE}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm mới
        </Link>
      </div>

      {renderPageItems(invoicesQuery.data?.content ?? [], (item) => (
        <EntityCard
          key={item.id}
          title={item.invoiceName}
          primary={item.status ?? "-"}
          onClick={() => openDetail({ kind: "invoice", item })}
          meta={[
            { label: "Mã hóa đơn", value: item.invoiceCode },
            { label: "Ngày hóa đơn", value: item.invoiceDate ? formatDate(item.invoiceDate) : "-" },
            { label: "Hạn thanh toán", value: item.dueDate ? formatDate(item.dueDate) : "-" },
            { label: "Đã thanh toán", value: formatCurrency(item.paidAmount) },
          ]}
        />
      ))}
    </div>
    );
  };

  const renderActivities = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Hoạt động</h3>
          <p className="mt-1 text-[12px] text-slate-500">Lịch sử tương tác và xử lý khách hàng.</p>
        </div>
        <button
          type="button"
          onClick={openNewActivity}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm hoạt động
        </button>
      </div>

      {renderPageItems(activitiesQuery.data?.content ?? [], (item) => (
        <EntityCard
          key={item.id}
          title={item.subject}
          primary={item.activityType}
          onClick={() => openDetail({ kind: "activity", item })}
          meta={[
            { label: "Mô tả", value: item.description },
            { label: "Kết quả", value: item.outcome },
            { label: "Ưu tiên", value: item.isImportant ? "Quan trọng" : "Bình thường" },
            { label: "Thời gian", value: item.createdAt ? formatDate(item.createdAt) : "-" },
          ]}
        />
      ))}
    </div>
  );

  const renderFeedbacks = () => {
    return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Phản hồi</h3>
          <p className="mt-1 text-[12px] text-slate-500">Danh sách phản hồi gắn với khách hàng.</p>
        </div>
        <Link
          href={TEMP_ADD_ROUTE}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm mới
        </Link>
      </div>

      {renderPageItems(feedbacksQuery.data?.content ?? [], (item) => (
        <EntityCard
          key={item.id}
          title={item.subject}
          primary={item.status ?? "-"}
          onClick={() => openDetail({ kind: "feedback", item })}
          meta={[
            { label: "Mức độ ưu tiên", value: item.priority },
            { label: "Nội dung", value: item.description },
            { label: "Assigned To", value: item.assignedTo ?? "-" },
            { label: "Cập nhật", value: item.updatedAt ? formatDate(item.updatedAt) : "-" },
          ]}
        />
      ))}
    </div>
    );
  };

  const renderNotes = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Ghi chú</h3>
          <p className="mt-1 text-[12px] text-slate-500">Chưa có ghi chú nhanh cho khách hàng này.</p>
        </div>
        <Link
          href={TEMP_ADD_ROUTE}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Thêm mới
        </Link>
      </div>

      <EmptyState message="Chưa có ghi chú nhanh cho khách hàng này." />
    </div>
  );

  const renderAttachments = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">Tệp đính kèm</h3>
          <p className="mt-1 text-[12px] text-slate-500">Tài liệu và file liên quan đến khách hàng.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAttachmentModal(true)}
          className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
        >
          Tải file
        </button>
      </div>

      {renderPageItems(attachmentsQuery.data?.content ?? [], (item) => (
        <EntityCard
          key={item.id}
          title={item.fileName}
          primary={item.fileType ?? "-"}
          onClick={() => openDetail({ kind: "attachment", item })}
          meta={[
            { label: "Đường dẫn", value: item.filePath ? <a className="text-sky-700 hover:underline" href={item.filePath} target="_blank" rel="noreferrer">Mở file</a> : "-" },
            { label: "Dung lượng", value: item.fileSize ? `${item.fileSize} bytes` : "-" },
            { label: "Related To", value: item.relatedToType },
            { label: "Uploaded By", value: item.uploadedBy ?? "-" },
          ]}
        />
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "addresses":
        return renderCustomerAddresses();
      case "contacts":
        return renderContacts();
      case "activities":
        return renderActivities();
      case "attachments":
        return renderAttachments();
      case "opportunities":
        return renderOpportunities();
      case "quotes":
        return renderQuotes();
      case "contracts":
        return renderContracts();
      case "invoices":
        return renderInvoices();
      case "feedbacks":
        return renderFeedbacks();
      case "notes":
        return renderNotes();
      default:
        return null;
    }
  };

  const detailDialog = (() => {
    if (!selectedDetail) {
      return null;
    }

    switch (selectedDetail.kind) {
      case "address":
        return (
          <DetailDialog
            open
            title={normalizeAddressTypeForDetail(selectedDetail.item.addressType)}
            subtitle={selectedDetail.item.fullAddress}
            fields={[
              { label: "Loại địa chỉ", value: normalizeAddressTypeForDetail(selectedDetail.item.addressType) },
              { label: "Địa chỉ đầy đủ", value: selectedDetail.item.fullAddress },
              {
                label: "Tỉnh/Thành",
                value: selectedDetail.item.provinceId ? provinceNameById[selectedDetail.item.provinceId] ?? `#${selectedDetail.item.provinceId}` : "-",
              },
              { label: "Mặc định", value: selectedDetail.item.isPrimary ? "Có" : "Không" },
              { label: "Ngày tạo", value: selectedDetail.item.createdAt ? formatDate(selectedDetail.item.createdAt) : "-" },
              { label: "Cập nhật", value: selectedDetail.item.updatedAt ? formatDate(selectedDetail.item.updatedAt) : "-" },
            ]}
            onClose={closeDetail}
            onEdit={() => setAddressFormState({ mode: "edit", item: selectedDetail.item })}
          />
        );
      case "contact":
        return (
          <DetailDialog
            open
            title={selectedDetail.item.fullName}
            subtitle={selectedDetail.item.position ?? selectedDetail.item.phone ?? selectedDetail.item.email ?? "Liên hệ khách hàng"}
            fields={[
              { label: "Họ tên", value: selectedDetail.item.fullName },
              { label: "Chức vụ", value: selectedDetail.item.position ?? "-" },
              { label: "Số điện thoại", value: selectedDetail.item.phone ?? "-" },
              { label: "Email", value: selectedDetail.item.email ?? "-" },
              { label: "Địa chỉ", value: selectedDetail.item.address ?? "-" },
              { label: "Ngày sinh", value: selectedDetail.item.dateOfBirth ? formatDate(selectedDetail.item.dateOfBirth) : "-" },
            ]}
            onClose={closeDetail}
            onEdit={() => setContactFormState({ mode: "edit", item: selectedDetail.item })}
          />
        );
      case "activity":
        return (
          <DetailDialog
            open
            title={selectedDetail.item.subject}
            subtitle={selectedDetail.item.activityType}
            fields={[
              { label: "Loại hoạt động", value: selectedDetail.item.activityType },
              { label: "Tiêu đề", value: selectedDetail.item.subject },
              { label: "Mô tả", value: selectedDetail.item.description ?? "-" },
              { label: "Kết quả", value: selectedDetail.item.outcome ?? "-" },
              { label: "Bắt đầu", value: selectedDetail.item.startDate ? formatDate(selectedDetail.item.startDate) : "-" },
              { label: "Quan trọng", value: selectedDetail.item.isImportant ? "Có" : "Không" },
            ]}
            onClose={closeDetail}
            onEdit={() => setActivityFormState({ mode: "edit", item: selectedDetail.item })}
          />
        );
      case "attachment":
        return (
          <DetailDialog
            open
            title={selectedDetail.item.fileName}
            subtitle={selectedDetail.item.fileType ?? "File đính kèm"}
            fields={[
              { label: "Tên file", value: selectedDetail.item.fileName },
              { label: "Loại file", value: selectedDetail.item.fileType ?? "-" },
              { label: "Dung lượng", value: selectedDetail.item.fileSize ? `${selectedDetail.item.fileSize} bytes` : "-" },
              { label: "Đường dẫn", value: selectedDetail.item.filePath ? <a className="text-sky-700 hover:underline" href={selectedDetail.item.filePath} target="_blank" rel="noreferrer">Mở file</a> : "-" },
              { label: "Related To", value: selectedDetail.item.relatedToType },
              { label: "Uploaded By", value: selectedDetail.item.uploadedBy ?? "-" },
            ]}
            onClose={closeDetail}
          />
        );
      case "opportunity":
        return <DetailDialog open title={selectedDetail.item.name} subtitle={selectedDetail.item.healthStatus} fields={[
          { label: "Tổng tiền", value: formatCurrency(selectedDetail.item.totalAmount) },
          { label: "Ngày chốt dự kiến", value: selectedDetail.item.expectedCloseDate ? formatDate(selectedDetail.item.expectedCloseDate) : "-" },
          { label: "Pipeline ID", value: selectedDetail.item.pipelineId ?? "-" },
          { label: "Stage ID", value: selectedDetail.item.stageId ?? "-" },
          { label: "Assigned User ID", value: selectedDetail.item.assignedUserId ?? "-" },
          { label: "Ngày tạo", value: selectedDetail.item.createdAt ? formatDate(selectedDetail.item.createdAt) : "-" },
        ]} onClose={closeDetail} />;
      case "quote":
        return <DetailDialog open title={selectedDetail.item.quoteName} subtitle={selectedDetail.item.status} fields={[
          { label: "Mã báo giá", value: selectedDetail.item.quoteCode ?? "-" },
          { label: "Tổng tiền", value: formatCurrency(selectedDetail.item.totalAmount) },
          { label: "Hiệu lực đến", value: selectedDetail.item.validUntil ? formatDate(selectedDetail.item.validUntil) : "-" },
          { label: "Ngày báo giá", value: selectedDetail.item.quoteDate ? formatDate(selectedDetail.item.quoteDate) : "-" },
        ]} onClose={closeDetail} />;
      case "contract":
        return <DetailDialog open title={selectedDetail.item.contractName} subtitle={selectedDetail.item.status} fields={[
          { label: "Mã hợp đồng", value: selectedDetail.item.contractCode ?? "-" },
          { label: "Ngày hiệu lực", value: selectedDetail.item.startDate ? formatDate(selectedDetail.item.startDate) : "-" },
          { label: "Ngày hết hạn", value: selectedDetail.item.endDate ? formatDate(selectedDetail.item.endDate) : "-" },
          { label: "Tổng giá trị", value: formatCurrency(selectedDetail.item.totalValue) },
        ]} onClose={closeDetail} />;
      case "invoice":
        return <DetailDialog open title={selectedDetail.item.invoiceName} subtitle={selectedDetail.item.status} fields={[
          { label: "Mã hóa đơn", value: selectedDetail.item.invoiceCode ?? "-" },
          { label: "Ngày hóa đơn", value: selectedDetail.item.invoiceDate ? formatDate(selectedDetail.item.invoiceDate) : "-" },
          { label: "Hạn thanh toán", value: selectedDetail.item.dueDate ? formatDate(selectedDetail.item.dueDate) : "-" },
          { label: "Đã thanh toán", value: formatCurrency(selectedDetail.item.paidAmount) },
        ]} onClose={closeDetail} />;
      case "feedback":
        return <DetailDialog open title={selectedDetail.item.subject} subtitle={selectedDetail.item.status} fields={[
          { label: "Mức độ ưu tiên", value: selectedDetail.item.priority ?? "-" },
          { label: "Nội dung", value: selectedDetail.item.description ?? "-" },
          { label: "Assigned To", value: selectedDetail.item.assignedTo ?? "-" },
          { label: "Ngày cập nhật", value: selectedDetail.item.updatedAt ? formatDate(selectedDetail.item.updatedAt) : "-" },
        ]} onClose={closeDetail} />;
      default:
        return null;
    }
  })();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sky-600">Customer 360</p>
              <h1 className="mt-2 text-[16px] font-bold text-slate-900">{customer?.name ?? "Đang tải khách hàng..."}</h1>
              <p className="mt-2 text-[12px] text-slate-600">
                {customer?.customerCode ?? "-"} · {CUSTOMER_STATUS_LABELS[customerStatus]} · {CUSTOMER_TIER_LABELS[customerTier]}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/customers"
                className="rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Quay lại danh sách
              </Link>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="rounded-[5px] bg-sky-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-sky-500"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </section>

        {customerQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-[12px] text-slate-500 shadow-sm">
            Đang tải chi tiết khách hàng...
          </div>
        ) : customerQuery.error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-[12px] text-red-700 shadow-sm">
            {getApiErrorMessage(customerQuery.error)}
          </div>
        ) : customer ? (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {CUSTOMER_DETAIL_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-[5px] px-3 py-2 text-[12px] font-medium transition ${activeTab === tab.key ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">{renderTabContent()}</section>
          </>
        ) : null}
      </div>

      {detailDialog}

      {isEditMode && customer && (
        <CustomerForm
          mode="edit"
          initialValues={customer}
          initialAddress={(addressesQuery.data ?? []).find((item) => item.isPrimary) ?? (addressesQuery.data ?? [])[0]}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditMode(false)}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {addressFormState && customer && (
        <AddressEditorDialog
          key={`${addressFormState.mode}-${addressFormState.item?.id ?? "new"}`}
          open
          customerId={customer.id}
          initialValues={addressFormState.item}
          existingAddresses={customerAddresses}
          provinces={provinces}
          onClose={() => setAddressFormState(null)}
          onSaved={handleAddressSaved}
        />
      )}

      {contactFormState && customer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">{contactFormState.mode === "edit" ? "Chỉnh sửa người liên hệ" : "Tạo người liên hệ"}</h2>
              </div>
              <button type="button" onClick={() => setContactFormState(null)} className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700">Đóng</button>
            </div>

            <ContactForm
              key={`${contactFormState.mode}-${contactFormState.item?.id ?? "new"}`}
              customerId={customer.id}
              onClose={() => setContactFormState(null)}
              mode={contactFormState.mode}
              initialValues={contactFormState.item}
              contactId={contactFormState.item?.id}
            />
          </div>
        </div>
      )}

      {activityFormState && customer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">{activityFormState.mode === "edit" ? "Chỉnh sửa hoạt động" : "Ghi hoạt động"}</h2>
              </div>
              <button type="button" onClick={() => setActivityFormState(null)} className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700">Đóng</button>
            </div>

            <ActivityForm
              key={`${activityFormState.mode}-${activityFormState.item?.id ?? "new"}`}
              customerId={customer.id}
              onClose={() => setActivityFormState(null)}
              mode={activityFormState.mode}
              initialValues={activityFormState.item}
              activityId={activityFormState.item?.id}
            />
          </div>
        </div>
      )}

      {showAttachmentModal && customer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Tải file đính kèm</h2>
              </div>
              <button type="button" onClick={() => setShowAttachmentModal(false)} className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700">Đóng</button>
            </div>

            <AttachmentUploadForm customerId={customer.id} onClose={() => setShowAttachmentModal(false)} />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteAddressTarget}
        title="Xóa địa chỉ"
        message={deleteAddressTarget ? `Bạn có chắc chắn muốn xóa địa chỉ này?\n\n${deleteAddressTarget.fullAddress}` : "Bạn có chắc chắn muốn xóa địa chỉ này?"}
        onClose={() => setDeleteAddressTarget(null)}
        onConfirm={confirmDeleteAddress}
      />
    </main>
  );
}