"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadApi } from "@/modules/lead/api/lead.api";
import type {
  ConvertLeadRequest,
  CreateLeadRequest,
  CreateLeadActivityRequest,
  CreateLeadMeetingRequest,
  UpdateLeadRequest,
} from "@/modules/lead/types/lead.types";
import { queryKeys } from "@/shared/constants/query-keys";

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLeadRequest) => leadApi.createLead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lead.all });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateLeadRequest;
    }) => leadApi.updateLead(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lead.all });
      if (data.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.lead.detail(data.id),
        });
      }
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => leadApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lead.all });
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ConvertLeadRequest;
    }) => leadApi.convertLead(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lead.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.detail(variables.id),
      });
    },
  });
}

export function useCreateLeadActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: number;
      payload: CreateLeadActivityRequest;
    }) => leadApi.createActivity(leadId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.activities(variables.leadId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.activityStatistics(variables.leadId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.detail(variables.leadId),
      });
    },
  });
}

export function useCreateLeadMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: number;
      payload: CreateLeadMeetingRequest;
    }) => leadApi.createMeeting(leadId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.activities(variables.leadId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.activityStatistics(variables.leadId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.detail(variables.leadId),
      });
    },
  });
}
