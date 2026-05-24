"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { leadApi } from "@/modules/lead/api/lead.api";
import type {
  LeadDashboardStats,
  LeadListQuery,
  LeadResponse,
  LeadTaskListQuery,
  SearchLeadRequest,
} from "@/modules/lead/types/lead.types";
import { queryKeys } from "@/shared/constants/query-keys";

function toQueryKeyValue(params: object): string {
  return JSON.stringify(params);
}

export function useLeads(params: LeadListQuery) {
  const queryKeyValue = useMemo(() => toQueryKeyValue(params), [params]);
  return useQuery({
    queryKey: queryKeys.lead.list(queryKeyValue),
    queryFn: () => leadApi.getLeads(params),
  });
}

export function useSearchLeads(params: SearchLeadRequest) {
  const queryKeyValue = useMemo(() => toQueryKeyValue(params), [params]);
  return useQuery({
    queryKey: queryKeys.lead.list(queryKeyValue),
    queryFn: () => leadApi.searchLeads(params),
  });
}

export function useLeadById(id?: number) {
  return useQuery({
    queryKey: queryKeys.lead.detail(id ?? 0),
    queryFn: () => leadApi.getLeadById(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}

export function useLeadActivities(leadId?: number) {
  return useQuery({
    queryKey: queryKeys.lead.activities(leadId ?? 0),
    queryFn: () => leadApi.getActivities(leadId as number),
    enabled: typeof leadId === "number" && Number.isFinite(leadId),
  });
}

export function useLeadActivityStatistics(leadId?: number) {
  return useQuery({
    queryKey: queryKeys.lead.activityStatistics(leadId ?? 0),
    queryFn: () => leadApi.getActivityStatistics(leadId as number),
    enabled: typeof leadId === "number" && Number.isFinite(leadId),
  });
}

export function useLeadTasks(leadId?: number, params: LeadTaskListQuery = {}) {
  const queryKeyValue = useMemo(() => toQueryKeyValue(params), [params]);
  return useQuery({
    queryKey: queryKeys.lead.tasks(leadId ?? 0, queryKeyValue),
    queryFn: () => leadApi.getLeadTasks(leadId as number, params),
    enabled: typeof leadId === "number" && Number.isFinite(leadId),
  });
}

export function useLeadDashboardStats() {
  return useQuery<LeadDashboardStats>({
    queryKey: ["lead", "dashboard-stats"] as const,
    queryFn: async () => {
      const pageSize = 100;
      let page = 0;
      const allLeads: LeadResponse[] = [];

      while (true) {
        const response = await leadApi.searchLeads({
          page,
          size: pageSize,
          sortBy: "createdAt",
          sortDir: "desc",
        });

        allLeads.push(...response.content);

        if (!response.hasNext) {
          break;
        }

        page += 1;
      }

      return {
        totalLeads: allLeads.length,
        newLeads: allLeads.filter((lead) => lead.statusId === 1).length,
        contactingLeads: allLeads.filter((lead) => lead.statusId === 2).length,
        convertedLeads: allLeads.filter((lead) => lead.statusId === 3).length,
        expectedRevenueTotal: allLeads.reduce(
          (sum, lead) => sum + (lead.expectedRevenue || 0),
          0
        ),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
