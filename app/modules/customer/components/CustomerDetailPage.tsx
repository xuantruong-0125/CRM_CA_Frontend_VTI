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
import type { CustomerFormValues } from "@/modules/customer/schemas/customer.schema";
import { normalizeCustomerStatus, normalizeCustomerTier, toUpdateCustomerPayload } from "@/modules/customer/utils/customer.mapper";
import { getApiErrorMessage } from "@/shared/utils/api-error";

type CustomerDetailPageProps = {
  id: number;
};

type DetailTab = (typeof CUSTOMER_DETAIL_TABS)[number]["key"];

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
}: {
  title: string;
  primary: string;
  meta: Array<{ label: string; value?: ReactNode }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-[13px] font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-[13px] font-medium text-slate-700">{primary}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {meta.map((item) => (
          <div key={item.label}>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</dt>
            <dd className="mt-1 text-[12px] text-slate-800">{item.value ?? "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-[12px] text-slate-500">{message}</div>;
}

export default function CustomerDetailPage({ id }: CustomerDetailPageProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [isEditMode, setIsEditMode] = useState(false);

  const customerQuery = useCustomerById(id);
  const updateMutation = useUpdateCustomer();

  const addressesQuery = useCustomerAddresses(id, activeTab === "addresses");
  const contactsQuery = useCustomerContacts(id, activeTab === "contacts");
  const activitiesQuery = useCustomerActivities(id, activeTab === "activities");
  const attachmentsQuery = useCustomerAttachments(id, activeTab === "attachments");
  const opportunitiesQuery = useCustomerOpportunities(id, activeTab === "opportunities");
  const quotesQuery = useCustomerQuotes(id, activeTab === "quotes");
  const contractsQuery = useCustomerContracts(id, activeTab === "contracts");
  const invoicesQuery = useCustomerInvoices(id, activeTab === "invoices");
  const feedbacksQuery = useCustomerFeedbacks(id, activeTab === "feedbacks");

  const customer = customerQuery.data;

  const handleUpdate = async (values: CustomerFormValues) => {
    if (!customer?.id) {
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: customer.id, payload: toUpdateCustomerPayload(values) });
      setIsEditMode(false);
      toast.success("Cập nhật khách hàng thành công");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const customerStatus = normalizeCustomerStatus(customer?.statusName);
  const customerTier = normalizeCustomerTier(customer?.tierName);

  const renderOverview = () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionTitle title="Thông tin cốt lõi" description="Dữ liệu chính cho hồ sơ customer 360." />
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard label="Mã khách hàng" value={customer?.customerCode ?? "-"} />
          <MetricCard label="Loại khách hàng" value={customer?.type ?? "-"} />
          <MetricCard label="Trạng thái" value={CUSTOMER_STATUS_LABELS[customerStatus]} />
          <MetricCard label="Phân hạng" value={CUSTOMER_TIER_LABELS[customerTier]} />
          <MetricCard label="Mã số thuế" value={customer?.taxCode ?? "-"} />
          <MetricCard label="Sale phụ trách" value={typeof customer?.assignedTo === "number" ? `NV #${customer.assignedTo}` : "-"} />
          <MetricCard label="Tên viết tắt" value={customer?.shortName ?? "-"} />
          <MetricCard label="Nguồn khách hàng ID" value={customer?.sourceId ?? "-"} />
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

  const renderNotes = () => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionTitle title="Ghi chú nhanh" description="Dùng description như vùng note ngắn cho CRM." />
      {customer?.description ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-[12px] leading-6 text-slate-700">{customer.description}</div>
      ) : (
        <EmptyState message="Chưa có ghi chú nào cho khách hàng này." />
      )}
    </div>
  );

  const renderCustomerAddresses = () => {
    const items = addressesQuery.data ?? [];

    if (!items.length) {
      return <EmptyState message="Chưa có địa chỉ nào." />;
    }

    return (
      <div className="grid gap-4">
        {items.map((item) => (
          <EntityCard
            key={item.id}
            title={item.addressType}
            primary={item.fullAddress}
            meta={[
              { label: "Mặc định", value: item.isPrimary ? "Có" : "Không" },
              { label: "Province ID", value: item.provinceId ?? "-" },
              { label: "Cập nhật", value: formatDate(item.updatedAt) },
            ]}
          />
        ))}
      </div>
    );
  };

  const renderContacts = () => {
    const items = contactsQuery.data ?? [];

    if (!items.length) {
      return <EmptyState message="Chưa có người liên hệ nào." />;
    }

    return (
      <div className="grid gap-4">
        {items.map((item) => (
          <EntityCard
            key={item.id}
            title={item.fullName}
            primary={item.position ?? (item.isPrimary ? "Liên hệ chính" : "Liên hệ phụ")}
            meta={[
              { label: "Điện thoại", value: item.phone },
              { label: "Email", value: item.email },
              { label: "Ngày sinh", value: item.dateOfBirth ? formatDate(item.dateOfBirth) : "-" },
              { label: "Địa chỉ", value: item.address },
            ]}
          />
        ))}
      </div>
    );
  };

  const renderPageItems = <T extends { id: number }>(items: T[], renderItem: (item: T) => ReactNode) => {
    if (!items.length) {
      return <EmptyState message="Chưa có dữ liệu." />;
    }

    return <div className="grid gap-4">{items.map(renderItem)}</div>;
  };

  const renderOpportunities = () => renderPageItems(opportunitiesQuery.data?.content ?? [], (item) => (
    <EntityCard
      key={item.id}
      title={item.name}
      primary={item.healthStatus ?? "-"}
      meta={[
        { label: "Tổng tiền", value: formatCurrency(item.totalAmount) },
        { label: "Ngày chốt dự kiến", value: item.expectedCloseDate ? formatDate(item.expectedCloseDate) : "-" },
        { label: "Assigned User ID", value: item.assignedUserId ?? "-" },
        { label: "Stage ID", value: item.stageId ?? "-" },
      ]}
    />
  ));

  const renderQuotes = () => renderPageItems(quotesQuery.data?.content ?? [], (item) => (
    <EntityCard
      key={item.id}
      title={item.quoteName}
      primary={item.status ?? "-"}
      meta={[
        { label: "Mã báo giá", value: item.quoteCode },
        { label: "Tổng tiền", value: formatCurrency(item.totalAmount) },
        { label: "Hiệu lực đến", value: item.validUntil ? formatDate(item.validUntil) : "-" },
        { label: "Ngày báo giá", value: item.quoteDate ? formatDate(item.quoteDate) : "-" },
      ]}
    />
  ));

  const renderContracts = () => renderPageItems(contractsQuery.data?.content ?? [], (item) => (
    <EntityCard
      key={item.id}
      title={item.contractName}
      primary={item.status ?? "-"}
      meta={[
        { label: "Mã hợp đồng", value: item.contractCode },
        { label: "Ngày hiệu lực", value: item.startDate ? formatDate(item.startDate) : "-" },
        { label: "Ngày hết hạn", value: item.endDate ? formatDate(item.endDate) : "-" },
        { label: "Tổng giá trị", value: formatCurrency(item.totalValue) },
      ]}
    />
  ));

  const renderInvoices = () => renderPageItems(invoicesQuery.data?.content ?? [], (item) => (
    <EntityCard
      key={item.id}
      title={item.invoiceName}
      primary={item.status ?? "-"}
      meta={[
        { label: "Mã hóa đơn", value: item.invoiceCode },
        { label: "Ngày hóa đơn", value: item.invoiceDate ? formatDate(item.invoiceDate) : "-" },
        { label: "Hạn thanh toán", value: item.dueDate ? formatDate(item.dueDate) : "-" },
        { label: "Đã thanh toán", value: formatCurrency(item.paidAmount) },
      ]}
    />
  ));

  const renderActivities = () => renderPageItems(activitiesQuery.data?.content ?? [], (item) => (
    <EntityCard
      key={item.id}
      title={item.subject}
      primary={item.activityType}
      meta={[
        { label: "Mô tả", value: item.description },
        { label: "Kết quả", value: item.outcome },
        { label: "Ưu tiên", value: item.isImportant ? "Quan trọng" : "Bình thường" },
        { label: "Thời gian", value: item.createdAt ? formatDate(item.createdAt) : "-" },
      ]}
    />
  ));

  const renderFeedbacks = () => renderPageItems(feedbacksQuery.data?.content ?? [], (item) => (
    <EntityCard
      key={item.id}
      title={item.subject}
      primary={item.status ?? "-"}
      meta={[
        { label: "Mức độ ưu tiên", value: item.priority },
        { label: "Nội dung", value: item.description },
        { label: "Assigned To", value: item.assignedTo ?? "-" },
        { label: "Cập nhật", value: item.updatedAt ? formatDate(item.updatedAt) : "-" },
      ]}
    />
  ));

  const renderAttachments = () => renderPageItems(attachmentsQuery.data?.content ?? [], (item) => (
    <EntityCard
      key={item.id}
      title={item.fileName}
      primary={item.fileType ?? "-"}
      meta={[
        { label: "Đường dẫn", value: item.filePath ? <a className="text-sky-700 hover:underline" href={item.filePath} target="_blank" rel="noreferrer">Mở file</a> : "-" },
        { label: "Dung lượng", value: item.fileSize ? `${item.fileSize} bytes` : "-" },
        { label: "Related To", value: item.relatedToType },
        { label: "Uploaded By", value: item.uploadedBy ?? "-" },
      ]}
    />
  ));

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

      {isEditMode && customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Chỉnh sửa khách hàng</h2>
                <p className="text-[12px] text-slate-500">Cập nhật dữ liệu nghiệp vụ theo form CRM chuẩn.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="rounded-[5px] border border-slate-300 px-3 py-2 text-[12px] text-slate-700"
              >
                Đóng
              </button>
            </div>

            <CustomerForm
              mode="edit"
              initialValues={customer}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditMode(false)}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        </div>
      )}
    </main>
  );
}