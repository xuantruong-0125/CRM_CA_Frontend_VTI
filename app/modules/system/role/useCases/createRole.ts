import { roleApi } from "../api/role.api";
import { RolePayload } from "../types/role.type";

export const createRole = async (data: RolePayload) => {
  return await roleApi.create(data);
};