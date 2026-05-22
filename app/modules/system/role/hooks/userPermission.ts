"use client";

import { useState } from "react";
import { permissionApi, PermissionItem, UpdatePermissionPayload } from "../api/permission.api";

export function usePermission() {
    const [data, setData] = useState<PermissionItem[]>([]);
    const [loading, setLoading] = useState(false);

    // ===== GET BY ROLE =====
    const getByRole = async (roleId: number) => {
        try {
            setLoading(true);
            const res = await permissionApi.getByRole(roleId);
            setData(res);
            return res;
        } finally {
            setLoading(false);
        }
    };

    // ===== UPDATE =====
    const update = async (payload: UpdatePermissionPayload) => {
        setLoading(true);
        try {
            return await permissionApi.updateBatch(payload);
        } finally {
            setLoading(false);
        }
    };

    // ===== DELETE ONE =====
    const deleteOne = async (roleId: number, menuId: number) => {
        setLoading(true);
        try {
            await permissionApi.deleteOne(roleId, menuId);
        } finally {
            setLoading(false);
        }
    };

    // ===== DELETE ALL =====
    const deleteByRole = async (roleId: number) => {
        setLoading(true);
        try {
            await permissionApi.deleteByRole(roleId);
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        getByRole,
        update,
        deleteOne,
        deleteByRole,
    };
}