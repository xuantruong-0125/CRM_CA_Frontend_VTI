"use client";

import { useQuery } from "@tanstack/react-query";
import { leadApi } from "@/modules/lead/api/lead.api";
import { queryKeys } from "@/shared/constants/query-keys";

export function useLeadReferences() {
  return useQuery({
    queryKey: queryKeys.lead.references,
    queryFn: leadApi.getReferences,
  });
}
