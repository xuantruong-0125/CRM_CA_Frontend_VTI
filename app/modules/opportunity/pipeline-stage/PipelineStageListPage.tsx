"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { pipelineStageApi } from "./api/pipeline-stage.api";
import { pipelineApi } from "@/modules/opportunity/pipeline/api/pipeline.api";
import { PipelineStage, PipelineStagePayload } from "./types/pipeline-stage.type";
import { Pipeline } from "@/modules/opportunity/pipeline/types/pipeline.type";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import styles from "./styles/pipeline-stage.module.css";

const EMPTY_FORM: PipelineStagePayload = {
    stageName: "", pipelineId: null, probability: null, maxDaysAllowed: null, sortOrder: null,
};

export default function PipelineStageListPage() {
    const [data, setData] = useState<PipelineStage[]>([]);
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [filterPipeline, setFilterPipeline] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<PipelineStagePayload>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PipelineStage | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await pipelineStageApi.getAll();
            setData(res);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        pipelineApi.getAll().then(setPipelines).catch(() => { });
    }, []);

    const displayed = filterPipeline
        ? data.filter(s => String(s.pipelineId) === filterPipeline)
        : data;

    const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const openEdit = (s: PipelineStage) => {
        setEditId(s.id);
        setForm({
            stageName: s.stageName,
            pipelineId: s.pipelineId,
            probability: s.probability,
            maxDaysAllowed: s.maxDaysAllowed,
            sortOrder: s.sortOrder,
        });
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.stageName.trim()) { toast.error("Tên giai đoạn không được để trống!"); return; }
        setSaving(true);
        try {
            if (editId) {
                await pipelineStageApi.update(editId, form);
                toast.success("Cập nhật giai đoạn thành công!");
            } else {
                await pipelineStageApi.create(form);
                toast.success("Tạo giai đoạn thành công!");
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
            await pipelineStageApi.delete(deleteTarget.id);
            toast.success("Xóa giai đoạn thành công!");
            setDeleteTarget(null);
            fetchData();
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : "Xóa thất bại!";
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    const pipelineName = (id: number) => pipelines.find(p => p.id === id)?.name ?? "—";

    return (
        <div className={styles.page}>
            <div className={styles.pageTopBar}>
                <span className={styles.pageTopBarTitle}>Giai đoạn quy trình</span>
            </div>
            <div className={styles.filterRow}>
                <select className={styles.filterSelect} value={filterPipeline} onChange={e => setFilterPipeline(e.target.value)}>
                    <option value="">Tất cả quy trình</option>
                    {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button className={styles.btnPrimary} style={{ marginLeft: "auto" }} onClick={openCreate}>
                    <Plus size={16} /> Thêm mới
                </button>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thNum}>#</th>
                            <th>Tên giai đoạn</th>
                            <th>Quy trình</th>
                            <th className={styles.thRight}>Xác suất (%)</th>
                            <th className={styles.thRight}>Số ngày tối đa</th>
                            <th className={styles.thRight}>Thứ tự</th>
                            <th className={styles.thCenter}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className={styles.emptyCell}>Đang tải...</td></tr>
                        ) : displayed.length === 0 ? (
                            <tr><td colSpan={7} className={styles.emptyCell}>Không có dữ liệu</td></tr>
                        ) : displayed.map((s, idx) => (
                            <tr key={s.id}>
                                <td className={styles.tdNum}>{idx + 1}</td>
                                <td className={styles.tdName}>{s.stageName}</td>
                                <td><span className={styles.badge}>{pipelineName(s.pipelineId)}</span></td>
                                <td className={styles.tdRight}>{s.probability != null ? `${(s.probability * 100).toFixed(0)}%` : "—"}</td>
                                <td className={styles.tdRight}>{s.maxDaysAllowed ?? "—"}</td>
                                <td className={styles.tdRight}>{s.sortOrder ?? "—"}</td>
                                <td className={styles.tdActions}>
                                    <button className={styles.iconBtn} title="Sửa" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Xóa" onClick={() => setDeleteTarget(s)}><Trash2 size={14} /></button>
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
                            <h2 className={styles.modalTitle}>{editId ? "Chỉnh sửa giai đoạn" : "Tạo giai đoạn mới"}</h2>
                            <button className={styles.modalClose} onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tên giai đoạn <span className={styles.required}>*</span></label>
                                    <input className={styles.input} required value={form.stageName} onChange={e => setForm(f => ({ ...f, stageName: e.target.value }))} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Quy trình</label>
                                    <select className={styles.input} value={form.pipelineId ?? ""} onChange={e => setForm(f => ({ ...f, pipelineId: e.target.value ? Number(e.target.value) : null }))}>
                                        <option value="">-- Chọn quy trình --</option>
                                        {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.grid3}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Xác suất (0–1)</label>
                                        <input type="number" min="0" max="1" step="0.01" className={styles.input}
                                            value={form.probability ?? ""}
                                            onChange={e => setForm(f => ({ ...f, probability: e.target.value ? Number(e.target.value) : null }))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Số ngày tối đa</label>
                                        <input type="number" min="0" className={styles.input}
                                            value={form.maxDaysAllowed ?? ""}
                                            onChange={e => setForm(f => ({ ...f, maxDaysAllowed: e.target.value ? Number(e.target.value) : null }))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Thứ tự</label>
                                        <input type="number" min="0" className={styles.input}
                                            value={form.sortOrder ?? ""}
                                            onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value ? Number(e.target.value) : null }))} />
                                    </div>
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
