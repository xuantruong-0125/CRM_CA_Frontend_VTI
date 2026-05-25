"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, GitBranch } from "lucide-react";
import { toast } from "react-toastify";
import { pipelineApi } from "./api/pipeline.api";
import { Pipeline, PipelinePayload } from "./types/pipeline.type";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import styles from "./styles/pipeline.module.css";

const EMPTY_FORM: PipelinePayload = { name: "" };

export default function PipelineListPage() {
    const [data, setData] = useState<Pipeline[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<PipelinePayload>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Pipeline | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await pipelineApi.getAll();
            setData(res);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const openEdit = (p: Pipeline) => { setEditId(p.id); setForm({ name: p.name }); setModalOpen(true); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("Tên quy trình không được để trống!"); return; }
        setSaving(true);
        try {
            if (editId) {
                await pipelineApi.update(editId, form);
                toast.success("Cập nhật quy trình thành công!");
            } else {
                await pipelineApi.create(form);
                toast.success("Tạo quy trình thành công!");
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
            await pipelineApi.delete(deleteTarget.id);
            toast.success("Xóa quy trình thành công!");
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
                <span className={styles.pageTopBarTitle}>Quy trình bán hàng</span>
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
                            <th>Tên quy trình</th>
                            <th className={styles.thCenter}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className={styles.emptyCell}>Đang tải...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={3} className={styles.emptyCell}>Không có dữ liệu</td></tr>
                        ) : data.map((p, idx) => (
                            <tr key={p.id}>
                                <td className={styles.tdNum}>{idx + 1}</td>
                                <td className={styles.tdName}>{p.name}</td>
                                <td className={styles.tdActions}>
                                    <button className={styles.iconBtn} title="Sửa" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Xóa" onClick={() => setDeleteTarget(p)}><Trash2 size={14} /></button>
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
                            <h2 className={styles.modalTitle}>{editId ? "Chỉnh sửa quy trình" : "Tạo quy trình mới"}</h2>
                            <button className={styles.modalClose} onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tên quy trình <span className={styles.required}>*</span></label>
                                    <input className={styles.input} required value={form.name} onChange={e => setForm({ name: e.target.value })} />
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
