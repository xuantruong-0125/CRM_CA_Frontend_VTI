"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/modules/customer/api/customer.api";
import type {
  AttachmentResponseDTO,
  CreateActivityDTO,
  CreateContactDTO,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  UploadCustomerAttachmentRequest,
} from "@/modules/customer/types/customer.types";
import { queryKeys } from "@/shared/constants/query-keys";

type CreateFeedbackDTO = {
  customerId: number;
  subject: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: number;
};

type CreateNoteDTO = {
  content: string;
  notableType: "CUSTOMER";
  notableId: number;
  privateNote?: boolean;
};

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

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContactDTO) => customerApi.createContact(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.contacts(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(variables.customerId) });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateContactDTO }) =>
      customerApi.updateContact(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.contacts(variables.payload.customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(variables.payload.customerId) });
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateActivityDTO) => customerApi.createActivity(payload),
    onSuccess: (_, variables) => {
      const relatedCustomerId = variables.relatedToId ?? 0;
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.activities(relatedCustomerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(relatedCustomerId) });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateActivityDTO }) =>
      customerApi.updateActivity(id, payload),
    onSuccess: (_, variables) => {
      const relatedCustomerId = variables.payload.relatedToId ?? 0;
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.activities(relatedCustomerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(relatedCustomerId) });
    },
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadCustomerAttachmentRequest) => customerApi.uploadAttachment(payload),
    onSuccess: (data: AttachmentResponseDTO) => {
      const relatedId = data.relatedToId;
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.attachments(relatedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(relatedId) });
    },
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFeedbackDTO) => customerApi.createFeedback(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.feedbacks(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(variables.customerId) });
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateFeedbackDTO }) =>
      customerApi.updateFeedback(id, payload),
    onSuccess: (_, variables) => {
      const customerId = (variables.payload as any).customerId;
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.feedbacks(customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(customerId) });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    // accept { id, customerId }
    mutationFn: ({ id }: { id: number; customerId?: number }) => customerApi.deleteFeedback(id),
    onSuccess: (_, variables) => {
      const cid = (variables as any).customerId;
      if (typeof cid === "number") {
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.feedbacks(cid) });
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(cid) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
      }
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNoteDTO) => customerApi.createNote(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.notes(variables.notableId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(variables.notableId) });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateNoteDTO }) =>
      customerApi.updateNote(id, payload),
    onSuccess: (_, variables) => {
      const customerId = (variables.payload as any).notableId;
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.notes(customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(customerId) });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; notableId?: number }) => customerApi.deleteNote(id),
    onSuccess: (_, variables) => {
      const nid = (variables as any).notableId;
      if (typeof nid === "number") {
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.notes(nid) });
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(nid) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
      }
    },
  });
}