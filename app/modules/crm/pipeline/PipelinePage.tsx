"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, GitBranch } from "lucide-react";
import { toast } from "react-toastify";
import { usePipeline } from "./hooks/usePipeline";
import { PipelinePayload } from "./types/pipeline.type";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import styles from "./styles/pipeline.module.css";

const EMPTY_FORM: PipelinePayload = { name: "" };

export default function PipelinePage() {
    const { data, loading, getById, create, update, remove } = usePipeline();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<PipelinePayload>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.altKey && (e.key === "n" || e.key === "N")) {
                e.preventDefault();
                openCreate();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = async (id: number) => {
        try {
            const item = await getById(id);
            setEditingId(id);
            setForm({ name: item.name });
            setModalOpen(true);
        } catch {
            toast.error("Không tải được dữ liệu!");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.warning("Tên Pipeline không được để trống");
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await update(editingId, form);
                toast.success("Cập nhật Pipeline thành công");
            } else {
                await create(form);
                toast.success("Thêm Pipeline thành công");
            }
            setModalOpen(false);
        } catch (err: any) {
            toast.error(err?.message || "Lưu thất bại!");
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setLoadingDelete(true);
        try {
            await remove(deleteId);
            toast.success("Xóa Pipeline thành công");
            setDeleteId(null);
        } catch (err: any) {
            toast.error(err?.message || "Xóa thất bại!");
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>
                        <GitBranch size={24} color="#2563eb" />
                        Quản lý Pipeline
                    </h1>
                    <p className={styles.pageDescription}>Cấu hình quy trình bán hàng</p>
                </div>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <Plus size={16} /> Thêm (Alt + N)
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 48 }}>#</th>
                            <th>Tên Pipeline</th>
                            <th style={{ textAlign: "center", width: 120 }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className={styles.loadingRow}>Đang tải...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={3} className={styles.emptyRow}>Chưa có pipeline nào</td></tr>
                        ) : data.map((row, i) => (
                            <tr key={row.id}>
                                <td className={styles.muted}>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{row.name}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <button type="button" className={styles.editIcon} onClick={() => openEdit(row.id)} title="Sửa"><Pencil size={16} /></button>
                                        <button type="button" className={styles.deleteIcon} onClick={() => setDeleteId(row.id)} title="Xóa"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingId ? "Chỉnh sửa Pipeline" : "Thêm Pipeline"}</h3>
                            <button className={styles.closeButton} onClick={() => setModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Tên Pipeline <span style={{ color: "#ef4444" }}>*</span></label>
                                    <input
                                        autoFocus
                                        value={form.name}
                                        onChange={(e) => setForm({ name: e.target.value })}
                                        placeholder="VD: Kinh doanh B2B"
                                    />
                                </div>
                                <p className={styles.formNote}>(*) Các trường bắt buộc nhập</p>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnOutline} onClick={() => setModalOpen(false)}>Hủy</button>
                                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                                    {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
                                </button>
                            </div>
                        </form>
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
