"use client";

import { useMenu } from "@/modules/system/menu/hooks/useMenu";
import styles from "@/modules/system/menu/styles/menu.module.css";
import { useState } from "react";
import { Menu, MenuPayload } from "./types/menu.type";
import {
    ChevronDown,
    ChevronRight,
    Pencil,
    Trash2,
    Check,
    X,
} from "lucide-react";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import { toast } from "react-toastify";

export default function MenuPage() {
    const { data, create, update, remove } = useMenu();

    const [form, setForm] = useState<MenuPayload>({
        name: "",
        code: "",
        parentId: null,
    });

    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    
    const handleSubmit = async () => {
        if (!form.name) {
            toast.warning("Tên không được để trống");
            return;
        }

        if (!form.code) {
            toast.warning("Code không được để trống");
            return;
        }

        const codeRegex = /^[A-Z]+(_[A-Z]+)*$/;
        if (!codeRegex.test(form.code)) {
            toast.warning("Code phải dạng UPPER_CASE_WITH_UNDERSCORE");
            return;
        }

        try {
            if (editingId) {
                // 👉 UPDATE
                await update(editingId, form);
                toast.success("Cập nhật thành công");
            } else {
                // 👉 CREATE
                await create(form);
                toast.success("Thêm menu thành công");
            }

            // reset
            setForm({
                name: "",
                code: "",
                parentId: null,
            });

            setEditingId(null);
        } catch {
            toast.error("Thao tác thất bại");
        }
    };

    const toggle = (id: number) => {
        setExpanded((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleEdit = (node: Menu) => {
        setEditingId(node.id);

        setForm({
            name: node.name,
            code: node.code,
            parentId: node.parentId,
        });

        // 👇 scroll lên form cho UX đẹp
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // const handleUpdate = async (node: Menu) => {
    //     if (!editName) {
    //         toast.warning("Tên không được để trống");
    //         return;
    //     }

    //     if (editName.length > 50) {
    //         toast.warning("Tên không được quá 50 ký tự");
    //         return;
    //     }

    //     const regex = /^[a-zA-Z0-9À-ỹ\s]+$/;

    //     if (!regex.test(editName)) {
    //         toast.warning("Tên không được chứa ký tự đặc biệt");
    //         return;
    //     }

    //     try {
    //         await update(node.id, {
    //             name: editName,
    //             code: editCode,
    //             parentId: node.parentId,
    //         });

    //         toast.success("Cập nhật thành công");
    //         setEditingId(null);
    //     } catch {
    //         toast.error("Cập nhật thất bại");
    //     }
    // };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            setLoadingDelete(true);
            await remove(deleteId);

            toast.success("Xóa menu thành công");
            setDeleteId(null); // ✅ đóng modal
        } catch {
            toast.error("Xóa thất bại");
        } finally {
            setLoadingDelete(false);
        }
    };

    // ===== TREE =====
    const renderTree = (nodes: Menu[], level = 0): React.ReactNode => {
        return nodes.map((node) => {
            const hasChildren = node.children && node.children.length > 0;

            return (
                <div key={node.id}>
                    <div style={{ marginLeft: level * 25 }}>
                        {/* <div
                            className={styles.treeItem}
                            style={{
                                backgroundColor: getColor(level),
                                color: level === 0 ? "#fff" : "#000",
                            }}
                        > */}
                        <div
                            className={`${styles.treeItem} ${editingId === node.id ? styles.activeItem : ""
                                }`}
                            style={{
                                backgroundColor: getColor(level),
                                color: level === 0 ? "#fff" : "#000",
                            }}
                        >
                            {/* LEFT */}
                            <div className={styles.left}>
                                <span
                                    className={styles.expandIcon}
                                    onClick={() => toggle(node.id)}
                                >
                                    {hasChildren ? (
                                        expanded[node.id] ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )
                                    ) : (
                                        <span style={{ width: 16 }} />
                                    )}
                                </span>

                                <span className={styles.nodeName}>
                                    {node.name}
                                </span>
                            </div>

                            {/* RIGHT */}
                            <div className={styles.actions}>

                                <>
                                    <Pencil
                                        size={18}
                                        className={`${styles.icon} ${styles.editIcon}`}
                                        onClick={() => handleEdit(node)}
                                    />
                                    <Trash2
                                        size={18}
                                        className={`${styles.icon} ${styles.deleteIcon}`}
                                        onClick={() => setDeleteId(node.id)}
                                    />
                                </>
                            </div>
                        </div>
                    </div>

                    {/* CHILDREN */}
                    {(expanded[node.id] ?? true) &&
                        hasChildren &&
                        renderTree(node.children!, level + 1)}
                </div>
            );
        });
    };

    // ===== BUILD SELECT TREE =====
    const buildOptions = (
        nodes: Menu[],
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
                    buildOptions(node.children, level + 1)
                );
            }
        });

        return result;
    };

    const getColor = (level: number) => {
        const colors = [
            "#4a6cf7",  // level 0 (cha)
            "#c9d4f9",  // level 1
            "#dfefff",  // level 2
            "#ffffff",  // level 3+
        ];

        return colors[level] || "#ffffff";
    };

    const options = buildOptions(data);

    // ===== UI =====
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Quản lý menu</h2>

            {/* FORM */}
            <div className={styles.form}>
                {/* TÊN MENU */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Tên menu
                        <span className={styles.required}>*</span>
                    </label>
                    <input
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Nhập tên menu"
                    />
                </div>

                {/* MENU CHA */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Menu cha</label>
                    <select
                        value={form.parentId ?? ""}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                parentId: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                            })
                        }
                    >
                        <option value="">-- Không có --</option>
                        {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CODE MENU */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Code
                        <span className={styles.required}>*</span>
                    </label>
                    <input
                        value={form.code}
                        onChange={(e) => {
                            const raw = e.target.value;

                            // 👇 convert sang UPPER_CASE_WITH_UNDERSCORE
                            const formatted = raw
                                .replace(/[^a-zA-Z0-9_\s]/g, "") // bỏ ký tự đặc biệt
                                .trim()
                                .replace(/\s+/g, "_") // space -> _
                                .toUpperCase();

                            setForm({
                                ...form,
                                code: formatted,
                            });
                        }}
                        placeholder="VD: USER_MANAGEMENT"
                    />
                </div>

                {/* BUTTON */}
                <div className={styles.formGroup}>
                    <label className={styles.label} style={{ opacity: 0 }}>
                        hidden
                    </label>
                    <div className={styles.formActions}>
                        <button onClick={handleSubmit}>
                            {editingId ? "Cập nhật menu" : "Thêm menu"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setEditingId(null);
                                    setForm({
                                        name: "",
                                        code: "",
                                        parentId: null,
                                    });
                                }}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
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
                        - Trường Code dùng để phân quyền menu trong hệ thống
                    </li>

                    <li>
                        - Không nhập ký tự đặc biệt, chỉ dùng chữ cái, số và dấu gạch dưới (_)
                    </li>
                </ul>
            </div>

            {/* TREE */}
            <div className={styles.treeContainer}>
                {renderTree(data)}
            </div>

            <ConfirmDeleteModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                loading={loadingDelete}
            />
        </div>
    );
}