import { useEffect, useState } from "react";
import { Role, RolePayload } from "../types/role.type";
import { getRoles } from "../useCases/getAll";
import { createRole } from "../useCases/createRole";
import { updateRole } from "../useCases/updateRole";
import { deleteRole } from "../useCases/deleteRole";

export const useRole = () => {
  const [data, setData] = useState<Role[]>([]);

  const fetchData = async () => {
    const res = await getRoles();
    setData(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    create: async (payload: RolePayload) => {
      await createRole(payload);
      fetchData();
    },
    update: async (id: number, payload: RolePayload) => {
      await updateRole(id, payload);
      fetchData();
    },
    remove: async (id: number) => {
      await deleteRole(id);
      fetchData();
    },
  };
};