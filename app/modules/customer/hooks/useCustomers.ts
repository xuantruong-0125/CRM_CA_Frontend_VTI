"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/modules/customer/api/customer.api";
import { userApi } from "@/modules/system/user/api/user.api";
import type { CustomerListQuery } from "@/modules/customer/types/customer.types";
import type { CustomerSaleUserResponseDTO } from "@/modules/customer/types/customer.types";
import { queryKeys } from "@/shared/constants/query-keys";

function toQueryKeyValue(params: object): string {
  return JSON.stringify(params);
}

export function useCustomers(params: CustomerListQuery) {
  const queryKeyValue = useMemo(() => toQueryKeyValue(params), [params]);

  // debug: show params used to build query key
  // eslint-disable-next-line no-console
  console.debug("useCustomers params ->", params);

  return useQuery({
    queryKey: queryKeys.customer.list(queryKeyValue),
    queryFn: () => customerApi.getCustomers(params),
    staleTime: 30_000,
  });
}

export function useCustomerById(id?: number) {
  return useQuery({
    queryKey: queryKeys.customer.detail(id ?? 0),
    queryFn: () => customerApi.getCustomerById(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}

export function useCustomerCount() {
  return useQuery({
    queryKey: queryKeys.customer.count,
    queryFn: () => customerApi.getCustomerCount(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomerSalesUsers() {
  return useQuery({
    queryKey: queryKeys.customer.salesUsers,
    queryFn: async (): Promise<CustomerSaleUserResponseDTO[]> => {
      const users = await userApi.getUsers();

      return users
        .filter((user) => user.roleId === 3)
        .map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          roleId: user.roleId,
          organizationId: user.organizationId,
          status: user.status,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomerAddresses(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.addresses(customerId ?? 0),
    queryFn: () => customerApi.getAddressesByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerContacts(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.contacts(customerId ?? 0),
    queryFn: () => customerApi.getContactsByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerOpportunities(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.opportunities(customerId ?? 0),
    queryFn: () => customerApi.getOpportunitiesByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerQuotes(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.quotes(customerId ?? 0),
    queryFn: () => customerApi.getQuotesByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerContracts(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.contracts(customerId ?? 0),
    queryFn: () => customerApi.getContractsByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerInvoices(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.invoices(customerId ?? 0),
    queryFn: () => customerApi.getInvoicesByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerActivities(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.activities(customerId ?? 0),
    queryFn: () => customerApi.getActivitiesByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerFeedbacks(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.feedbacks(customerId ?? 0),
    queryFn: () => customerApi.getFeedbacksByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerAttachments(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.attachments(customerId ?? 0),
    queryFn: () => customerApi.getAttachmentsByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useCustomerNotes(customerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.notes(customerId ?? 0),
    queryFn: () => customerApi.getNotesByCustomerId(customerId as number),
    enabled: enabled && typeof customerId === "number" && Number.isFinite(customerId),
    staleTime: 30_000,
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["users", "all"],
    queryFn: () => userApi.getUsers(),
    staleTime: 5 * 60 * 1000,
  });
}