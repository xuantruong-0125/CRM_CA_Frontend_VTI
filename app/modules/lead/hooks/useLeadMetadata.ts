"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { leadApi } from "@/modules/lead/api/lead.api";
import {
  AssigneeMetadataQuery,
  OrganizationMetadataQuery,
  ProductMetadataQuery,
  ProvinceMetadataQuery,
} from "@/modules/lead/types/lead.types";
import { queryKeys } from "@/shared/constants/query-keys";

function toQueryKeyValue(params: object): string {
  return JSON.stringify(params);
}

export function useAssigneeMetadata(params: AssigneeMetadataQuery) {
  const queryKeyValue = useMemo(() => toQueryKeyValue(params), [params]);
  return useQuery({
    queryKey: queryKeys.lead.assignees(queryKeyValue),
    queryFn: () => leadApi.getAssigneeMetadata(params),
  });
}

export function useProductMetadata(params: ProductMetadataQuery) {
  const queryKeyValue = useMemo(() => toQueryKeyValue(params), [params]);
  return useQuery({
    queryKey: queryKeys.lead.products(queryKeyValue),
    queryFn: () => leadApi.getProductMetadata(params),
  });
}

export function useProvinceMetadata(params: ProvinceMetadataQuery) {
  const queryKeyValue = useMemo(() => toQueryKeyValue(params), [params]);
  return useQuery({
    queryKey: queryKeys.lead.provinces(queryKeyValue),
    queryFn: () => leadApi.getProvinceMetadata(params),
  });
}

export function useOrganizationMetadata(params: OrganizationMetadataQuery = {}) {
  const queryKeyValue = useMemo(() => toQueryKeyValue(params), [params]);
  return useQuery({
    queryKey: queryKeys.lead.organizations(queryKeyValue),
    queryFn: () => leadApi.getOrganizationMetadata(params),
  });
}
