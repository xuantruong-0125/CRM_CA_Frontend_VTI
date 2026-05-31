import type {
  CreateCustomerAddressDTO,
  CreateCustomerDTO,
  CustomerResponseDTO,
  CustomerStatus,
  CustomerTier,
  CustomerType,
  UpdateCustomerDTO,
} from "@/modules/customer/types/customer.types";
import type { CustomerFormValues } from "@/modules/customer/schemas/customer.schema";
import { customerApi } from "@/modules/customer/api/customer.api";

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

export function getCustomerTaxCode(customer?: Partial<CustomerResponseDTO> | null) {
  if (!customer) {
    return undefined;
  }

  const rawCustomer = customer as Record<string, unknown>;
  const candidate =
    customer.taxCode ??
    (rawCustomer.tax_code as string | undefined) ??
    (rawCustomer.taxNo as string | undefined) ??
    (rawCustomer.tax_number as string | undefined);

  const trimmed = typeof candidate === "string" ? candidate.trim() : "";
  return trimmed ? trimmed : undefined;
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

export function toCreateCustomerAddressPayload(
  values: CustomerFormValues,
  customerId: number
): CreateCustomerAddressDTO | null {
  const fullAddress = cleanString(values.fullAddress);
  if (!fullAddress) {
    return null;
  }

  return {
    customerId,
    addressType: cleanString(values.addressType) ?? "OFFICE",
    fullAddress,
    provinceId: cleanNumber(values.provinceId),
    isPrimary: values.isPrimaryAddress ?? true,
  };
}

export async function saveCustomerContacts(customerId: number, formContacts: any[]) {
  // 1. Fetch current contacts from BE
  const currentContacts = await customerApi.getContactsByCustomerId(customerId);
  const formContactIds = new Set(formContacts.map((c) => c.id).filter(Boolean));

  // 2. Delete contacts that are no longer in formContacts
  const toDelete = currentContacts.filter((c) => c.id && !formContactIds.has(c.id));
  await Promise.all(toDelete.map((c) => customerApi.deleteContact(c.id)));

  // 3. Create or update form contacts
  await Promise.all(
    formContacts.map(async (c) => {
      const payload = {
        customerId,
        fullName: c.fullName.trim(),
        phone: c.phone?.trim() || undefined,
        email: c.email?.trim() || undefined,
        position: c.position?.trim() || undefined,
        address: c.address?.trim() || undefined,
        notes: c.notes?.trim() || undefined,
        isPrimary: c.isPrimary ?? false,
        isActive: true,
      };

      if (c.id) {
        await customerApi.updateContact(c.id, payload);
      } else {
        await customerApi.createContact(payload);
      }
    })
  );
}

export async function saveCustomerAddresses(customerId: number, formAddresses: any[]) {
  // 1. Fetch current addresses from BE
  const currentAddresses = await customerApi.getAddressesByCustomerId(customerId);
  const formAddressIds = new Set(formAddresses.map((a) => a.id).filter(Boolean));

  // 2. Delete addresses that are no longer in formAddresses
  const toDelete = currentAddresses.filter((a) => a.id && !formAddressIds.has(a.id));
  await Promise.all(toDelete.map((a) => customerApi.deleteCustomerAddress(a.id)));

  // 3. Create or update form addresses
  await Promise.all(
    formAddresses.map(async (a) => {
      const payload = {
        customerId,
        addressType: a.addressType || "OFFICE",
        fullAddress: a.fullAddress.trim(),
        provinceId: typeof a.provinceId === "number" && Number.isFinite(a.provinceId) ? a.provinceId : undefined,
        isPrimary: a.isPrimary ?? false,
      };

      if (a.id) {
        await customerApi.updateCustomerAddress(a.id, payload);
      } else {
        await customerApi.createCustomerAddress(payload);
      }
    })
  );
}
