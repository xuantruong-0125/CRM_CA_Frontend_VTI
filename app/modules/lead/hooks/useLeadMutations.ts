"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadApi } from "@/modules/lead/api/lead.api";
import type {
  ConvertLeadRequest,
  CreateLeadRequest,
  CreateLeadActivityRequest,
  CreateLeadTaskRequest,
  LeadActivityResponse,
  UpdateLeadActivityRequest,
  UpdateLeadRequest,
  UpdateLeadTaskRequest,
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
    onSuccess: (updatedActivity, variables) => {
      queryClient.setQueryData<LeadActivityResponse[]>(
        queryKeys.lead.activities(variables.leadId),
        (currentActivities) =>
          currentActivities?.map((activity) =>
            activity.id === updatedActivity.id ? { ...activity, ...updatedActivity } : activity
          ) ?? currentActivities
      );
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

export function useUpdateLeadActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      activityId,
      payload,
    }: {
      leadId: number;
      activityId: number;
      payload: UpdateLeadActivityRequest;
    }) => leadApi.updateActivity(leadId, activityId, payload),
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

export function useCreateLeadTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: number;
      payload: CreateLeadTaskRequest;
    }) => leadApi.createLeadTask(leadId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.taskList(variables.leadId),
      });
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

export function useUpdateLeadTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      taskId,
      payload,
    }: {
      leadId: number;
      taskId: number;
      payload: UpdateLeadTaskRequest;
    }) => leadApi.updateLeadTask(taskId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lead.taskList(variables.leadId),
      });
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

export const useCreateLeadMeeting = useCreateLeadTask;
