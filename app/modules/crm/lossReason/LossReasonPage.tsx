"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, AlertOctagon } from "lucide-react";
import { toast } from "react-toastify";
import { useLossReason } from "./hooks/useLossReason";
import { LossReasonPayload } from "./types/lossReason.type";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import styles from "./styles/lossReason.module.css";

const EMPTY_FORM: LossReasonPayload = { name: "", description: "", isActive: true };

export default function LossReasonPage() {
    const { data, loading, getById, create, update, remove } = useLossReason();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<LossReasonPayload>(EMPTY_FORM);
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
            setForm({ name: item.name, description: item.description || "", isActive: item.isActive ?? true });
            setModalOpen(true);
        } catch {
            toast.error("Không tải được dữ liệu!");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.warning("Tên lý do không được để trống");
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await update(editingId, form);
                toast.success("Cập nhật thành công");
            } else {
                await create(form);
                toast.success("Thêm lý do thành công");
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
            toast.success("Xóa thành công");
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
                        <AlertOctagon size={24} color="#ef4444" />
                        Lý do thất bại
                    </h1>
                    <p className={styles.pageDescription}>Danh mục nguyên nhân thất bại trong cơ hội bán hàng</p>
                </div>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <Plus size={16} /> Thêm (Alt + N)
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>#</th>
                            <th>Tên lý do</th>
                            <th>Mô tả</th>
                            <th style={{ textAlign: "center" }}>Trạng thái</th>
                            <th style={{ textAlign: "center", width: 100 }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className={styles.loadingRow}>Đang tải...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={5} className={styles.emptyRow}>Chưa có lý do nào</td></tr>
                        ) : data.map((row, i) => (
                            <tr key={row.id}>
                                <td className={styles.muted}>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{row.name}</td>
                                <td>
                                    <span className={styles.descCell}>{row.description || "—"}</span>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    {row.isActive
                                        ? <span className={styles.badgeSuccess}>Hoạt động</span>
                                        : <span className={styles.badgeDanger}>Không hoạt động</span>}
                                </td>
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
                            <h3>{editingId ? "Chỉnh sửa lý do" : "Thêm lý do thất bại"}</h3>
                            <button className={styles.closeButton} onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Tên lý do <span style={{ color: "#ef4444" }}>*</span></label>
                                    <input
                                        autoFocus
                                        value={form.name}
                                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="VD: Giá quá cao, Không phù hợp nhu cầu..."
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Mô tả</label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Mô tả chi tiết về lý do..."
                                        style={{ resize: "vertical" }}
                                    />
                                </div>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={!!form.isActive}
                                        onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                        style={{ width: 16, height: 16 }}
                                    />
                                    Đang hoạt động
                                </label>
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
