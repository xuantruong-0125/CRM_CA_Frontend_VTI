export type RoleScope = "ALL" | "TEAM" | "OWN" | "BRANCH";

export interface Role {
  id: number;
  name: string;
  description: string;
  scope: RoleScope;
}

export interface RolePayload {
  name: string;
  description: string;
  scope: RoleScope;
}