import { useEffect, useState } from "react";
import { Menu, MenuPayload } from "../types/menu.type";
import { getMenuTree } from "../useCases/getTree";
import { createMenu } from "../useCases/createMenu";
import { updateMenu } from "../useCases/updateMenu";
import { deleteMenu } from "../useCases/deleteMenu";

export const useMenu = () => {
  const [data, setData] = useState<Menu[]>([]);

  const fetchData = async () => {
    const res = await getMenuTree();
    setData(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    create: async (payload: MenuPayload) => {
      await createMenu(payload);
      fetchData();
    },
    update: async (id: number, payload: MenuPayload) => {
      await updateMenu(id, payload);
      fetchData();
    },
    remove: async (id: number) => {
      await deleteMenu(id);
      fetchData();
    },
  };
};