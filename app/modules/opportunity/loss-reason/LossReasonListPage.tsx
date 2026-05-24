"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, AlertOctagon } from "lucide-react";
import { toast } from "react-toastify";
import { lossReasonApi } from "./api/loss-reason.api";
import { LossReason, LossReasonPayload } from "./types/loss-reason.type";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import styles from "./styles/loss-reason.module.css";

const EMPTY_FORM: LossReasonPayload = { name: "", description: null, isActive: true };

export default function LossReasonListPage() {
    const [data, setData] = useState<LossReason[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<LossReasonPayload>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<LossReason | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await lossReasonApi.getAll();
            setData(res);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const openEdit = (lr: LossReason) => {
        setEditId(lr.id);
        setForm({ name: lr.name, description: lr.description, isActive: lr.isActive });
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("Tên lý do không được để trống!"); return; }
        setSaving(true);
        try {
            if (editId) {
                await lossReasonApi.update(editId, form);
                toast.success("Cập nhật lý do thành công!");
            } else {
                await lossReasonApi.create(form);
                toast.success("Tạo lý do thành công!");
            }
            setModalOpen(false);
            fetchData();
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : "Lưu thất bại!";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await lossReasonApi.delete(deleteTarget.id);
            toast.success("Xóa lý do thành công!");
            setDeleteTarget(null);
            fetchData();
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : "Xóa thất bại!";
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageTopBar}>
                <span className={styles.pageTopBarTitle}>Lý do thất bại</span>
            </div>
            <div className={styles.actionsBar}>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <Plus size={16} /> Thêm mới
                </button>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thNum}>#</th>
                            <th>Tên lý do</th>
                            <th>Mô tả</th>
                            <th className={styles.thCenter}>Trạng thái</th>
                            <th className={styles.thCenter}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className={styles.emptyCell}>Đang tải...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={5} className={styles.emptyCell}>Không có dữ liệu</td></tr>
                        ) : data.map((lr, idx) => (
                            <tr key={lr.id}>
                                <td className={styles.tdNum}>{idx + 1}</td>
                                <td className={styles.tdName}>{lr.name}</td>
                                <td className={styles.tdDesc}>{lr.description || "—"}</td>
                                <td className={styles.tdCenter}>
                                    <span className={lr.isActive ? styles.badgeSuccess : styles.badgeInactive}>
                                        {lr.isActive ? "Hoạt động" : "Không hoạt động"}
                                    </span>
                                </td>
                                <td className={styles.tdActions}>
                                    <button className={styles.iconBtn} title="Sửa" onClick={() => openEdit(lr)}><Pencil size={14} /></button>
                                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Xóa" onClick={() => setDeleteTarget(lr)}><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className={styles.overlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editId ? "Chỉnh sửa lý do" : "Thêm lý do thất bại"}</h2>
                            <button className={styles.modalClose} onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tên lý do <span className={styles.required}>*</span></label>
                                    <input className={styles.input} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Mô tả</label>
                                    <textarea
                                        className={`${styles.input} ${styles.textarea}`}
                                        rows={3}
                                        value={form.description ?? ""}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value || null }))}
                                    />
                                </div>
                                <div className={styles.checkGroup}>
                                    <input
                                        type="checkbox"
                                        id="lr-active"
                                        checked={form.isActive}
                                        onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                    />
                                    <label htmlFor="lr-active" className={styles.checkLabel}>Đang hoạt động</label>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnOutline} onClick={() => setModalOpen(false)}>Hủy</button>
                                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                                    {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />
        </div>
    );
}
