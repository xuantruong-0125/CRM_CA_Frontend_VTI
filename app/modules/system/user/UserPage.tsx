"use client";

import { useState, useRef, useEffect } from "react";
import {
    Pencil,
    Trash2,
    X,
    Filter,
    RotateCcw,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";
import { toast } from "react-toastify";

import { useRole } from "../role/hooks/useRole";
import { useOrganization } from "../organization/hooks/useOrganization";
import type { Organization } from "@/modules/system/organization/types/organization.type";

import styles from "./styles/user.module.css";
import { useUser } from "./hooks/userUser";
import {
    User,
    UserPayload,
    UserStatus,
} from "./types/user.type";

import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";

export default function UserPage() {
    const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);
    const { data: roles } = useRole();
    const { data: organizations = [] } = useOrganization();
    const [filters, setFilters] = useState({
        roleId: "",
        organizationId: "",
    });

    const [form, setForm] = useState<UserPayload>({
        username: "",
        password: "",
        email: "",
        fullName: "",
        roleId: 1,
        organizationId: 1,
        status: "ACTIVE",
    });

    const {
        data: users,
        pagination,
        page,
        setPage,
        loading,
        create,
        update,
        remove,
        applyFilter,
        clearFilter,
    } = useUser();


    const focusNext = (index: number) => {
        const next = inputRefs.current[index + 1];
        if (next) {
            next.focus();
        }
        // ❌ KHÔNG auto submit nữa
    };

    const handleKeyDown = (
        e: React.KeyboardEvent,
        index: number
    ) => {
        const tag = (e.target as HTMLElement).tagName;
        const isLast = index === inputRefs.current.length - 1;

        if (e.key === "Enter") {
            e.preventDefault();

            if (isLast) {
                handleSaveUser(); // 👉 ô cuối → submit
            } else {
                focusNext(index); // 👉 ô khác → next
            }

            return;
        }

        // chỉ apply arrow cho INPUT
        if (tag !== "INPUT") return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            focusNext(index);
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        }
    };

    // State bổ sung
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<UserPayload>({
        username: "",
        password: "",
        email: "",
        fullName: "",
        roleId: 1,
        organizationId: 1,
        status: "ACTIVE",
    });

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const [inputPage, setInputPage] = useState(page + 1);
    const handleGoToPage = () => {
        let target = Number(inputPage);

        if (isNaN(target)) return;

        // giới hạn trong khoảng hợp lệ
        if (target < 1) target = 1;
        if (target > pagination.totalPages) target = pagination.totalPages;

        setPage(target - 1);
    };

    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 0);
        }
    }, [isModalOpen]);

    const getRoleName = (roleId: number) =>
        roles.find((role) => role.id === roleId)?.name || "N/A";

    // const getOrganizationName = (organizationId: number) =>
    //     organizations.find((org) => org.id === organizationId)?.name || "N/A";
    const getOrganizationName = (
        organizationId: number
    ): string => {
        const findOrganization = (
            nodes: Organization[]
        ): string | null => {
            for (const node of nodes) {
                if (node.id === organizationId) {
                    return node.name;
                }

                if (node.children?.length) {
                    const childResult =
                        findOrganization(node.children);

                    if (childResult) {
                        return childResult;
                    }
                }
            }

            return null;
        };

        return findOrganization(organizations) || "N/A";
    };
    // Hàm mở modal thêm mới
    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);

        setForm({
            username: "",
            password: "",
            email: "",
            fullName: "",
            roleId: roles[0]?.id ?? 1,
            organizationId: organizationOptions[0]?.id ?? 1,
            status: "ACTIVE",
        });

        setIsModalOpen(true);
    };

    const validate = (payload: UserPayload) => {
        if (!payload.username.trim()) {
            toast.warning("Tên đăng nhập không được để trống");
            return false;
        }

        if (!payload.email.trim()) {
            toast.warning("Email không được để trống");
            return false;
        }

        if (!payload.fullName.trim()) {
            toast.warning("Họ tên không được để trống");
            return false;
        }

        if (!editingId && !(payload.password ?? "").trim()) {
            toast.warning("Mật khẩu không được để trống");
            return false;
        }

        const emailRegex =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(payload.email)) {
            toast.warning("Email không hợp lệ");
            return false;
        }

        return true;
    };

    const resetForm = () => {
        setForm({
            username: "",
            password: "",
            email: "",
            fullName: "",
            roleId: 1,
            organizationId: 1,
            status: "ACTIVE",
        });
    };

    const handleSubmit = async () => {
        if (!validate(form)) return;

        try {
            await create(form);
            toast.success("Thêm người dùng thành công");
            resetForm();
        } catch {
            toast.error("Thêm người dùng thất bại");
        }
    };

    // Sửa lại hàm edit
    const handleEdit = (user: User) => {
        setIsEditing(true);
        setEditingId(user.id);

        setForm({
            username: user.username,
            password: "",
            email: user.email,
            fullName: user.fullName,
            roleId: user.roleId,
            organizationId: user.organizationId,
            status: user.status,
        });

        setIsModalOpen(true);
    };

    // Submit dùng chung
    const handleSaveUser = async () => {
        if (!validate(form)) return;

        try {
            if (isEditing && editingId) {
                const res = await update(editingId, form);
                localStorage.setItem("fullName", res.fullName);
                window.dispatchEvent(new Event("storage")); // trigger realtime hiển thị fullname
                toast.success("Cập nhật người dùng thành công");
            } else {
                await create(form);
                toast.success("Thêm người dùng thành công");
            }

            setIsModalOpen(false);
            resetForm();
            setEditingId(null);
            setIsEditing(false);
        } catch (error: any) {
            const message = error?.message || "Thao tác thất bại";

            toast.error(message);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!validate(editData)) return;

        try {
            await update(id, editData);
            toast.success("Cập nhật người dùng thành công");
            setEditingId(null);
        } catch {
            toast.error("Cập nhật thất bại");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            setLoadingDelete(true);
            await remove(deleteId);
            toast.success("Xóa người dùng thành công");
            setDeleteId(null);
        } catch {
            toast.error("Xóa người dùng thất bại");
        } finally {
            setLoadingDelete(false);
        }
    };


    // ===== BUILD ORGANIZATION TREE OPTIONS =====
    const buildOrganizationOptions = (
        nodes: Organization[],
        level = 0
    ): { id: number; name: string }[] => {
        let result: { id: number; name: string }[] = [];

        nodes.forEach((node) => {
            result.push({
                id: node.id,
                name: `${"— ".repeat(level)}${node.name}`,
            });

            if (node.children?.length) {
                result = result.concat(
                    buildOrganizationOptions(node.children, level + 1)
                );
            }
        });

        return result;
    };

    // ===== DATA =====
    const organizationOptions = buildOrganizationOptions(
        organizations ?? []
    );

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleApplyFilter = () => {
        applyFilter({
            roleId: filters.roleId
                ? Number(filters.roleId)
                : undefined,
            organizationId: filters.organizationId
                ? Number(filters.organizationId)
                : undefined,
        });
    };

    const handleResetFilter = () => {
        setFilters({
            roleId: "",
            organizationId: "",
        });

        clearFilter();
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Quản lý người dùng</h2>

            {/* FORM
            <div className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Tên đăng nhập</label>
                    <input
                        value={form.username}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                username: e.target.value,
                            })
                        }
                        placeholder="Nhập tên đăng nhập"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                password: e.target.value,
                            })
                        }
                        placeholder="Nhập mật khẩu"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                        value={form.email}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                email: e.target.value,
                            })
                        }
                        placeholder="Nhập email"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Họ tên</label>
                    <input
                        value={form.fullName}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                fullName: e.target.value,
                            })
                        }
                        placeholder="Nhập họ tên"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Quyền quản lý</label>
                    <select
                        value={form.roleId}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                roleId: Number(e.target.value),
                            })
                        }
                    >
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* <div className={styles.formGroup}>
                    <label>Tổ chức</label>
                    <select
                        value={form.organizationId}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                organizationId: Number(e.target.value),
                            })
                        }
                    >
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div> 

                <div className={styles.formGroup}>
                    <label>Tổ chức</label>
                    <select
                        value={form.organizationId ?? ""}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                organizationId: Number(e.target.value),
                            })
                        }
                    >
                        <option value="">-- Chọn tổ chức--</option>

                        {organizationOptions.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Trạng thái</label>
                    <select
                        value={form.status}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                status: e.target.value as UserStatus,
                            })
                        }
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="LOCKED">LOCKED</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>

                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                >
                    Thêm người dùng mới
                </button>
            </div> */}

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label>Vai trò</label>
                    <select
                        name="roleId"
                        value={filters.roleId}
                        onChange={handleFilterChange}
                    >
                        <option value="">Tất cả vai trò</option>

                        {roles.map((role) => (
                            <option
                                key={role.id}
                                value={role.id}
                            >
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Tổ chức</label>
                    <select
                        name="organizationId"
                        value={filters.organizationId}
                        onChange={handleFilterChange}
                    >
                        <option value="">
                            Tất cả tổ chức
                        </option>

                        {organizationOptions.map((org) => (
                            <option
                                key={org.id}
                                value={org.id}
                            >
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterActions}>
                    <button
                        className={styles.filterButton}
                        onClick={handleApplyFilter}
                    >
                        <Filter size={18} />
                        Lọc
                    </button>

                    <button
                        className={styles.resetButton}
                        onClick={handleResetFilter}
                    >
                        <RotateCcw size={18} />
                        Đặt lại
                    </button>

                    <button
                        className={styles.addButton}
                        onClick={handleOpenCreateModal}
                    >
                        <Plus size={18} />
                        Thêm mới
                    </button>
                </div>
            </div>
            {/* TABLE */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên đăng nhập</th>
                        <th>Email</th>
                        <th>Họ tên</th>
                        <th>Quyền</th>
                        <th>Tổ chức</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.fullName}</td>
                            <td>{getRoleName(user.roleId)}</td>
                            <td>{getOrganizationName(user.organizationId)}</td>

                            {/* <td>
                                <span
                                    className={`${styles.status} ${styles[user.status.toLowerCase()]
                                        }`}
                                >
                                    {user.status}
                                </span>
                            </td> */}

                            <td>
                                <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                    {user.status}
                                </span>
                            </td>

                            <td className={styles.actions}>
                                <Pencil
                                    className={styles.editIcon}
                                    onClick={() => handleEdit(user)}
                                />

                                <Trash2
                                    className={styles.deleteIcon}
                                    onClick={() => setDeleteId(user.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className={styles.pagination}>

                <span className={styles.userNum}>
                    {" "}Total: {pagination.totalElements} users
                </span>
                {/* First page */}
                <button
                    disabled={page === 0}
                    onClick={() => setPage(0)}
                >
                    <ChevronsLeft size={18} />
                </button>

                {/* Prev */}
                <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Info */}
                <span>
                    Trang {pagination.page + 1} / {pagination.totalPages}

                </span>

                {/* Input jump */}
                <div className={styles.pageInput}>
                    <input
                        type="number"
                        min={1}
                        max={pagination.totalPages}
                        value={inputPage}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInputPage(value === "" ? 1 : Number(value));
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleGoToPage();
                        }}
                    />

                </div>
                <button onClick={handleGoToPage}>
                    Đi
                </button>

                {/* Next */}
                <button
                    disabled={pagination.last}
                    onClick={() => setPage(page + 1)}
                >
                    <ChevronRight size={18} />
                </button>

                {/* Last page */}
                <button
                    disabled={pagination.last}
                    onClick={() => setPage(pagination.totalPages - 1)}
                >
                    <ChevronsRight size={18} />
                </button>
            </div>

            {/* USER MODAL */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>
                                {isEditing
                                    ? "Cập nhật người dùng"
                                    : "Thêm người dùng"}
                            </h3>

                            <button
                                className={styles.closeButton}
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Tên đăng nhập</label>
                                    <input
                                        ref={(el) => {
                                            inputRefs.current[0] = el;
                                        }}
                                        value={form.username}
                                        onKeyDown={(e) => handleKeyDown(e, 0)}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                username: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Mật khẩu</label>
                                    <input
                                        ref={(el) => {
                                            inputRefs.current[1] = el;
                                        }}
                                        type="password"
                                        value={form.password}
                                        onKeyDown={(e) => handleKeyDown(e, 1)}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input
                                        ref={(el) => {
                                            inputRefs.current[2] = el;
                                        }}
                                        value={form.email}
                                        onKeyDown={(e) => handleKeyDown(e, 2)}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Họ tên</label>
                                    <input
                                        ref={(el) => {
                                            inputRefs.current[3] = el;
                                        }}
                                        value={form.fullName}
                                        onKeyDown={(e) => handleKeyDown(e, 3)}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                fullName: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Vai trò</label>
                                    <select
                                        ref={(el) => {
                                            inputRefs.current[4] = el;
                                        }}
                                        value={form.roleId}
                                        onKeyDown={(e) => handleKeyDown(e, 4)}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                roleId: Number(e.target.value),
                                            })
                                        }
                                    >
                                        {roles.map((role) => (
                                            <option
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Tổ chức</label>
                                    <select
                                        ref={(el) => {
                                            inputRefs.current[5] = el;
                                        }}
                                        value={form.organizationId}
                                        onKeyDown={(e) => handleKeyDown(e, 5)}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                organizationId: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                    >
                                        {organizationOptions.map((org) => (
                                            <option
                                                key={org.id}
                                                value={org.id}
                                            >
                                                {org.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Trạng thái</label>
                                    <select
                                        ref={(el) => {
                                            inputRefs.current[6] = el;
                                        }}
                                        value={form.status}
                                        onKeyDown={(e) => handleKeyDown(e, 6)}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target
                                                    .value as UserStatus,
                                            })
                                        }
                                    >
                                        <option value="ACTIVE">
                                            ACTIVE
                                        </option>
                                        <option value="LOCKED">
                                            LOCKED
                                        </option>
                                        <option value="INACTIVE">
                                            INACTIVE
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.submitButton}
                                onClick={handleSaveUser}
                            >
                                {isEditing ? "Cập nhật" : "Thêm mới"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmDeleteModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                loading={loadingDelete}
            />
        </div>

    );
}