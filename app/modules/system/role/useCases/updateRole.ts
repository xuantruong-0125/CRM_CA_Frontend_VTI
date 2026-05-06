import { roleApi } from "../api/role.api";
import { RolePayload } from "../types/role.type";

export const updateRole = async (id: number, data: RolePayload) => {
  return await roleApi.update(id, data);
};