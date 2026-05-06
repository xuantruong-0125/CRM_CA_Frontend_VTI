"use client";

import { useEffect, useState } from "react";
import { usePermission } from "../hooks/userPermission";
import { toast } from "react-toastify";
import PermissionTreeNode from "./PermissionTreeNode";
import "./permisson-modal.css";

// ===== TYPES =====
type PermissionNode = {
    menuId: number;
    menuName: string;
    parentId: number | null;
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    children: PermissionNode[];
};

type PermissionField = "canView" | "canCreate" | "canUpdate" | "canDelete";

export default function PermissionModal({ role, onClose }: any) {
    const [treeData, setTreeData] = useState<PermissionNode[]>([]);
    const { getByRole, update } = usePermission();

    const buildTree = (list: any[]): PermissionNode[] => {
        const map: Record<number, PermissionNode> = {};
        const roots: PermissionNode[] = [];

        list.forEach((item) => {
            map[item.menuId] = { ...item, children: [] };
        });

        list.forEach((item) => {
            if (item.parentId !== null && item.parentId !== undefined) {
                const parent = map[item.parentId];
                if (parent) {
                    parent.children.push(map[item.menuId]);
                } else {
                    roots.push(map[item.menuId]); // fallback
                }
            } else {
                roots.push(map[item.menuId]);
            }
        });

        return roots;
    };

    const fetchData = async () => {
        const res = await getByRole(role.id);
        setTreeData(buildTree(res));
        // console.log(res);
    };

    useEffect(() => {
        fetchData();
    }, [role.id]);

    const updateAllChildren = (
        children: PermissionNode[],
        field: PermissionField,
        value: boolean
    ): PermissionNode[] => {
        return children.map((child) => ({
            ...child,
            [field]: value,
            ...(field === "canView" && !value
                ? {
                    canCreate: false,
                    canUpdate: false,
                    canDelete: false,
                }
                : {}),
            children: updateAllChildren(child.children || [], field, value),
        }));
    };

    const updateNode = (
        nodes: PermissionNode[],
        menuId: number,
        field: PermissionField
    ): PermissionNode[] => {
        return nodes.map((node) => {
            if (node.menuId === menuId) {
                const newValue = !node[field];

                const updated: PermissionNode = {
                    ...node,
                    [field]: newValue,
                };

                if (field === "canView" && !newValue) {
                    updated.canCreate = false;
                    updated.canUpdate = false;
                    updated.canDelete = false;
                }

                if (node.children) {
                    updated.children = updateAllChildren(
                        node.children,
                        field,
                        newValue
                    );
                }

                return updated;
            }

            if (node.children) {
                return {
                    ...node,
                    children: updateNode(node.children, menuId, field),
                };
            }

            return node;
        });
    };

    const handleChange = (menuId: number, field: PermissionField) => {
        setTreeData(updateNode(treeData, menuId, field));
    };

    const flattenTree = (nodes: PermissionNode[]): any[] => {
        let result: any[] = [];

        nodes.forEach((node) => {
            if (!node.menuId) return;
            result.push({
                menuId: node.menuId,
                canView: node.canView,
                canCreate: node.canCreate,
                canUpdate: node.canUpdate,
                canDelete: node.canDelete,
            });

            if (node.children && node.children.length > 0) {
                result = result.concat(flattenTree(node.children));
            }
        });

        return result;
    };

    const handleSave = async () => {
        try {
            const payload = {
                roleId: role.id,
                permissions: flattenTree(treeData),
            };

            console.log("🔥 PAYLOAD:", payload); // debug

            await update(payload); // ✅ sửa ở đây

            toast.success("Cập nhật quyền thành công");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi cập nhật quyền");
        }
    };

    return (
        <div className="permission-modal">
            <div className="permission-modal-content">
                <h3 className="permission-title">
                    Phân quyền: {role.name}
                </h3>

                {/* HEADER */}
                <div className="permission-header">
                    <span className="col-menu">Menu</span>
                    <div className="col-check">
                        <span>View</span>
                        <span>Create</span>
                        <span>Update</span>
                        <span>Delete</span>
                    </div>

                </div>

                {/* TREE */}
                <div className="permission-tree">
                    {treeData.map((node) => (
                        <PermissionTreeNode
                            key={node.menuId}
                            node={node}
                            onChange={handleChange}
                        />
                    ))}
                </div>

                {/* ACTION */}
                <div className="permission-actions-footer">

                    <button className="btn-close" onClick={onClose}>
                        Đóng
                    </button>

                    <button className="btn-save" onClick={handleSave}>
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}