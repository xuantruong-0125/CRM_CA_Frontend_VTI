// hooks/useOrganization.ts

import { useEffect, useState } from 'react';
import { getTree } from '../useCases/getTree';
import { createOrganization } from '../useCases/createOrganization';
import { updateOrganization } from '../useCases/updateOrganization';
import { deleteOrganization } from '../useCases/deleteOrganization';
import { toast } from 'react-toastify';
import { Organization, OrganizationPayload } from '../types/organization.type';

export const useOrganization = () => {
  const [data, setData] = useState<Organization[]>([]);

  const fetchData = async () => {
    try {
      const res = await getTree();
      setData(res || []);
    } catch (error: any) {
      console.error("Error fetching organizations:", error);
      toast.error(error?.message || "Không thể tải danh sách tổ chức");
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const create = async (payload: OrganizationPayload) => {
    await createOrganization(payload);
    toast.success('Thêm mới thành công');
    fetchData();
  };

  const update = async (id: number, payload: OrganizationPayload) => {
    await updateOrganization(id, payload);
    toast.success('Cập nhật thành công');
    fetchData();
  };

  const remove = async (id: number) => {
    await deleteOrganization(id);
    // toast.success('Xóa thành công');
    fetchData();
  };

  return { data, create, update, remove };
};