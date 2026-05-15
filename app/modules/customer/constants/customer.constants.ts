import type { CustomerStatus, CustomerTier, CustomerType } from "@/modules/customer/types/customer.types";

export const CUSTOMER_TYPE_OPTIONS: Array<{ value: CustomerType; label: string }> = [
  { value: "B2B", label: "B2B" },
  { value: "B2C", label: "B2C" },
];

export const CUSTOMER_STATUS_OPTIONS: Array<{ value: CustomerStatus; label: string }> = [
  { value: "CARING", label: "Đang chăm sóc" },
  { value: "PAUSED", label: "Ngừng chăm sóc" },
  { value: "BLACKLIST", label: "Blacklist" },
  { value: "OTHER", label: "Khác" },
];

export const CUSTOMER_TIER_OPTIONS: Array<{ value: CustomerTier; label: string }> = [
  { value: "SILVER", label: "Bạc" },
  { value: "GOLD", label: "Vàng" },
  { value: "DIAMOND", label: "Kim cương" },
];

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  CARING: "Đang chăm sóc",
  PAUSED: "Ngừng chăm sóc",
  BLACKLIST: "Blacklist",
  OTHER: "Khác",
};

export const CUSTOMER_TIER_LABELS: Record<CustomerTier, string> = {
  SILVER: "Bạc",
  GOLD: "Vàng",
  DIAMOND: "Kim cương",
};

export const CUSTOMER_DETAIL_TABS = [
  { key: "overview", label: "Tổng quan" },
  { key: "addresses", label: "Địa chỉ" },
  { key: "contacts", label: "Liên hệ" },
  { key: "activities", label: "Hoạt động" },
  { key: "attachments", label: "Tệp đính kèm" },
  { key: "opportunities", label: "Thương vụ" },
  { key: "quotes", label: "Báo giá" },
  { key: "contracts", label: "Hợp đồng" },
  { key: "invoices", label: "Hóa đơn" },
  { key: "feedbacks", label: "Khiếu nại" },
  { key: "notes", label: "Ghi chú nhanh" },
] as const;

export type CustomerDetailTabKey = (typeof CUSTOMER_DETAIL_TABS)[number]["key"];
