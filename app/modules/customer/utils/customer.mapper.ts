import type { CreateCustomerDTO, CustomerResponseDTO, CustomerStatus, CustomerTier, CustomerType, UpdateCustomerDTO } from "@/modules/customer/types/customer.types";
import type { CustomerFormValues } from "@/modules/customer/schemas/customer.schema";

const statusAliasMap: Record<string, CustomerStatus> = {
  CARING: "CARING",
  "Đang chăm sóc": "CARING",
  PAUSED: "PAUSED",
  "Ngừng chăm sóc": "PAUSED",
  BLACKLIST: "BLACKLIST",
  Blacklist: "BLACKLIST",
  OTHER: "OTHER",
  Khác: "OTHER",
};

const tierAliasMap: Record<string, CustomerTier> = {
  SILVER: "SILVER",
  Bạc: "SILVER",
  GOLD: "GOLD",
  Vàng: "GOLD",
  DIAMOND: "DIAMOND",
  "Kim cương": "DIAMOND",
};

export function getCustomerDisplayName(customer?: Partial<CustomerResponseDTO> | null) {
  return customer?.name ?? "-";
}

export function normalizeCustomerType(value?: string | null): CustomerType {
  return value === "B2C" ? "B2C" : "B2B";
}

export function normalizeCustomerStatus(value?: string | null): CustomerStatus {
  if (!value) {
    return "CARING";
  }

  return statusAliasMap[value] ?? "CARING";
}

export function normalizeCustomerTier(value?: string | null): CustomerTier {
  if (!value) {
    return "SILVER";
  }

  return tierAliasMap[value] ?? "SILVER";
}

function cleanString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function cleanNumber(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function toCreateCustomerPayload(values: CustomerFormValues): CreateCustomerDTO {
  return {
    name: values.name.trim(),
    type: values.type,
    phone: values.phone.trim(),
    email: cleanString(values.email),
    taxCode: cleanString(values.taxCode),
    shortName: cleanString(values.shortName),
    fax: cleanString(values.fax),
    description: cleanString(values.description),
    establishedDate: cleanString(values.establishedDate),
    sourceId: cleanNumber(values.sourceId),
    statusId: cleanNumber(values.statusId),
    tierId: cleanNumber(values.tierId),
    assignedTo: cleanNumber(values.assignedTo),
  };
}

export function toUpdateCustomerPayload(values: CustomerFormValues): UpdateCustomerDTO {
  return {
    name: values.name.trim(),
    shortName: cleanString(values.shortName),
    phone: values.phone.trim(),
    email: cleanString(values.email),
    fax: cleanString(values.fax),
    description: cleanString(values.description),
    establishedDate: cleanString(values.establishedDate),
    sourceId: cleanNumber(values.sourceId),
    statusId: cleanNumber(values.statusId),
    tierId: cleanNumber(values.tierId),
    assignedTo: cleanNumber(values.assignedTo),
  };
}
