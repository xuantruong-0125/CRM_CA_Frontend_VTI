import httpClient from "@/core/http/httpClient";

// ===== TYPES =====
export type PermissionItem = {
    menuId: number;
    menuName: string;
    parentId: number | null;
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
};

export type UpdatePermissionPayload = {
    roleId: number;
    permissions: {
        menuId: number;
        canView: boolean;
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
    }[];
};

// ===== BASE URL =====
const BASE_URL = "/api/permissions";

// ===== API =====
export const permissionApi = {
    // GET BY ROLE
    getByRole: async (roleId: number): Promise<PermissionItem[]> => {
        const res = await httpClient.get<PermissionItem[]>(
            `${BASE_URL}/full/${roleId}`
        );
        return res.data;
    },

    // UPSERT (CREATE / UPDATE)
    updateBatch: async (data: {
        roleId: number;
        permissions: any[];
    }) => {
        const res = await httpClient.post(`${BASE_URL}/batch`, data);
        return res.data;
    },

    // DELETE ONE
    deleteOne: async (roleId: number, menuId: number) => {
        await httpClient.delete(BASE_URL, {
            params: { roleId, menuId },
        });
    },

    // DELETE ALL BY ROLE
    deleteByRole: async (roleId: number) => {
        await httpClient.delete(`${BASE_URL}/role/${roleId}`);
    },
};