export const queryKeys = {
  lead: {
    all: ["lead"] as const,
    list: (params: string) => ["lead", "list", params] as const,
    detail: (id: number) => ["lead", "detail", id] as const,
    references: ["lead", "references"] as const,
    assignees: (params: string) => ["lead", "assignees", params] as const,
    products: (params: string) => ["lead", "products", params] as const,
    provinces: (params: string) => ["lead", "provinces", params] as const,
    organizations: (params: string) => ["lead", "organizations", params] as const,
    activities: (leadId: number) => ["lead", "activities", leadId] as const,
  },
};
