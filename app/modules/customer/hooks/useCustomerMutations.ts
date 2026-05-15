"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/modules/customer/api/customer.api";
import type { CreateCustomerDTO, UpdateCustomerDTO } from "@/modules/customer/types/customer.types";
import { queryKeys } from "@/shared/constants/query-keys";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerDTO) => customerApi.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCustomerDTO }) =>
      customerApi.updateCustomer(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(data.id) });
      }
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
    },
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      customerApi.updateCustomerStatus(id, statusId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(variables.id) });
    },
  });
}

export function useUpdateCustomerTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tierId }: { id: number; tierId: number }) =>
      customerApi.updateCustomerTier(id, tierId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(variables.id) });
    },
  });
}

export function useAssignCustomerToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) =>
      customerApi.assignCustomerToUser(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(variables.id) });
    },
  });
}