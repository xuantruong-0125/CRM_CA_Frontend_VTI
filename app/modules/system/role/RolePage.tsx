"use client";

import { useRole } from "./hooks/useRole";
import { Role, RolePayload } from "./types/role.type";
import { useState } from "react";
import styles from "./styles/role.module.css";
import { Pencil, Trash2, Key } from "lucide-react";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import { toast } from "react-toastify";
import PermissionModal from "./components/PermissonModal";
import { getCurrentUser } from "@/core/auth/getCurrentUser";

export default function RolePage() {
    const { data, create, update, remove } = useRole();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [form, setForm] = useState<RolePayload>({
        name: "",
        description: "",
        scope: "OWN",
    });

    const [editingId, setEditingId] = useState<number | null>(null);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    /* Phân quyền */
    const user = getCurrentUser();
    const roles = user?.roles || [];
    const isAdmin = roles.includes("ADMIN");
    const isIT = roles.includes("IT");

    // ===== VALIDATE =====
    const validate = (data: RolePayload) => {
        if (!data.name) {
            toast.warning("Tên không được để trống");
            return false;
        }
        if (data.name.length > 50) {
            toast.warning("Tên không quá 50 ký tự");
            return false;
        }

        const regex = /^[a-zA-Z0-9À-ỹ_\s]+$/;

        if (!regex.test(data.name) || !regex.test(data.description)) {
            toast.warning("Không được chứa ký tự đặc biệt");
            return;
        }
        return true;
    };

    // ===== CREATE =====
    const handleSubmit = async () => {
        if (!validate(form)) return;

        try {
            await create(form);
            toast.success("Thêm role thành công");

            setForm({
                name: "",
                description: "",
                scope: "OWN",
            });
        } catch {
            toast.error("Thêm thất bại");
        }
    };

    // ===== EDIT =====
    const handleEdit = (role: Role) => {
        setEditingId(role.id);

        setForm({
            name: role.name,
            description: role.description,
            scope: role.scope,
        });
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        if (!validate(form)) return;

        try {
            await update(editingId, form);

            toast.success("Cập nhật thành công");

            setEditingId(null);
            setForm({
                name: "",
                description: "",
                scope: "OWN",
            });
        } catch {
            toast.error("Cập nhật thất bại");
        }
    };

    // ===== DELETE =====
    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            setLoadingDelete(true);
            await remove(deleteId);
            toast.success("Xóa thành công");
            setDeleteId(null);
        } catch {
            toast.error("Xóa thất bại");
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Quản lý role</h2>


            {isAdmin && (
                <>
                    {/* FORM */}
                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Tên chức vụ
                                <span className={styles.required}>*</span>
                            </label>
                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Nhập tên chức vụ"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Mô tả</label>
                            <input
                                value={form.description}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                                placeholder="Nhập mô tả"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Scope
                                <span className={styles.required}>*</span>
                            </label>
                            <select
                                value={form.scope}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        scope: e.target.value as any,
                                    })
                                }
                            >
                                <option value="ALL">ALL</option>
                                <option value="TEAM">TEAM</option>
                                <option value="OWN">OWN</option>
                                <option value="BRANCH">BRANCH</option>
                            </select>
                        </div>

                        <div className={styles.formActions}>
                            {editingId ? (
                                <>
                                    <button
                                        className={styles.update_btn}
                                        onClick={handleUpdate}
                                    >
                                        Cập nhật
                                    </button>

                                    <button
                                        className={styles.cancel_btn}
                                        onClick={() => {
                                            setEditingId(null);
                                            setForm({
                                                name: "",
                                                description: "",
                                                scope: "OWN",
                                            });
                                        }}
                                    >
                                        Hủy
                                    </button>
                                </>
                            ) : (
                                <button
                                    className={styles.submit_btn}
                                    onClick={handleSubmit}
                                >
                                    Thêm chức vụ mới
                                </button>
                            )}
                        </div>
                    </div>

                    {/* NOTE */}
                    <div className={styles.noteBox}>
                        <p className={styles.noteTitle}>Ghi chú:</p>

                        <ul>
                            <li>
                                - Các trường có dấu <span className={styles.required}>*</span> là bắt buộc nhập
                            </li>
                            <li>
                                - Scope xác định phạm vi dữ liệu role được truy cập

                            </li>
                            - ALL (toàn hệ thống), COMPANY (công ty), BRANCH (chi nhánh),
                            DEPARTMENT (phòng ban), TEAM (nhóm), OWN (cá nhân), NONE (không có quyền)
                            <li>

                            </li>
                        </ul>
                    </div>
                </>
            )}

            {/* TABLE */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Mô tả</th>
                        <th>Scope</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((role) => (
                        <tr key={role.id} className={editingId === role.id ? styles.activeRow : ""}>
                            <td>{role.name}</td>
                            <td>{role.description}</td>
                            <td>{role.scope}</td>
                            <td>
                                <div className={styles.actions}>
                                    {isAdmin && (
                                        <>
                                            <Pencil
                                                size={18}
                                                className={`${styles.icon} ${styles.edit_btn}`}
                                                onClick={() => handleEdit(role)}
                                            />
                                            <Trash2
                                                size={18}
                                                className={`${styles.icon} ${styles.delete_btn}`}
                                                onClick={() => setDeleteId(role.id)}
                                            />
                                        </>
                                    )}

                                    {isIT && (
                                        <Key
                                            size={18}
                                            className={`${styles.icon} ${styles.permission_btn}`}
                                            onClick={() => setSelectedRole(role)}
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDeleteModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                loading={loadingDelete}
            />
            {isIT && selectedRole && (
                <PermissionModal
                    role={selectedRole}
                    onClose={() => setSelectedRole(null)}
                />
            )}
        </div>
    );
}