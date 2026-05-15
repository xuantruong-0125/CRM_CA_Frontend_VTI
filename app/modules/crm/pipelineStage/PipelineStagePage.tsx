"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { usePipelineStage } from "./hooks/usePipelineStage";
import { usePipeline } from "../pipeline/hooks/usePipeline";
import { PipelineStagePayload } from "./types/pipelineStage.type";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import styles from "./styles/pipelineStage.module.css";

const EMPTY_FORM: PipelineStagePayload = {
    stageName: "",
    probability: "",
    maxDaysAllowed: "",
    sortOrder: "",
    pipelineId: "",
};

export default function PipelineStagePage() {
    const { data, loading, filterPipelineId, setFilterPipelineId, getById, create, update, remove } = usePipelineStage();
    const { data: pipelines } = usePipeline();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<PipelineStagePayload>(EMPTY_FORM);
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
            setForm({
                stageName: item.stageName || "",
                probability: item.probability ?? "",
                maxDaysAllowed: item.maxDaysAllowed ?? "",
                sortOrder: item.sortOrder ?? "",
                pipelineId: item.pipelineId || "",
            });
            setModalOpen(true);
        } catch {
            toast.error("Không tải được dữ liệu!");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.stageName.trim()) {
            toast.warning("Tên giai đoạn không được để trống");
            return;
        }
        if (!form.pipelineId) {
            toast.warning("Vui lòng chọn Pipeline");
            return;
        }
        setSaving(true);
        try {
            const payload: PipelineStagePayload = {
                ...form,
                probability: form.probability !== "" ? Number(form.probability) : "",
                maxDaysAllowed: form.maxDaysAllowed !== "" ? Number(form.maxDaysAllowed) : "",
                sortOrder: form.sortOrder !== "" ? Number(form.sortOrder) : "",
                pipelineId: Number(form.pipelineId),
            };
            if (editingId) {
                await update(editingId, payload);
                toast.success("Cập nhật giai đoạn thành công");
            } else {
                await create(payload);
                toast.success("Thêm giai đoạn thành công");
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
            toast.success("Xóa giai đoạn thành công");
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
                        <Layers size={24} color="#2563eb" />
                        Giai đoạn Pipeline
                    </h1>
                    <p className={styles.pageDescription}>Cấu hình các bước trong quy trình bán hàng</p>
                </div>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <Plus size={16} /> Thêm (Alt + N)
                </button>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label>Lọc theo Pipeline:</label>
                    <select
                        value={filterPipelineId ?? ""}
                        onChange={(e) => setFilterPipelineId(e.target.value ? Number(e.target.value) : undefined)}
                    >
                        <option value="">Tất cả pipeline</option>
                        {pipelines.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                {filterPipelineId && (
                    <button className={styles.btnOutline} onClick={() => setFilterPipelineId(undefined)}>
                        <X size={14} /> Xóa lọc
                    </button>
                )}
                <span style={{ marginLeft: "auto", fontSize: 13, color: "#6b7280" }}>
                    {data.length} giai đoạn
                </span>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>#</th>
                            <th>Tên giai đoạn</th>
                            <th>Pipeline</th>
                            <th style={{ textAlign: "center" }}>Xác suất (%)</th>
                            <th style={{ textAlign: "center" }}>Số ngày tối đa</th>
                            <th style={{ textAlign: "center" }}>Thứ tự</th>
                            <th style={{ textAlign: "center", width: 100 }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className={styles.loadingRow}>Đang tải...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={7} className={styles.emptyRow}>Chưa có giai đoạn nào</td></tr>
                        ) : data.map((row, i) => (
                            <tr key={row.id}>
                                <td className={styles.muted}>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{row.stageName}</td>
                                <td>{row.pipelineName || "—"}</td>
                                <td style={{ textAlign: "center" }}>
                                    {row.probability != null ? `${(Number(row.probability) * 100).toFixed(0)}%` : "—"}
                                </td>
                                <td style={{ textAlign: "center" }}>{row.maxDaysAllowed ?? "—"}</td>
                                <td style={{ textAlign: "center" }}>{row.sortOrder ?? "—"}</td>
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
                            <h3>{editingId ? "Chỉnh sửa giai đoạn" : "Thêm giai đoạn"}</h3>
                            <button className={styles.closeButton} onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                                        <label>Tên giai đoạn <span style={{ color: "#ef4444" }}>*</span></label>
                                        <input
                                            autoFocus
                                            value={form.stageName}
                                            onChange={(e) => setForm(f => ({ ...f, stageName: e.target.value }))}
                                            placeholder="VD: Tiếp cận, Đàm phán, Chốt hợp đồng..."
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                                        <label>Pipeline <span style={{ color: "#ef4444" }}>*</span></label>
                                        <select
                                            value={form.pipelineId}
                                            onChange={(e) => setForm(f => ({ ...f, pipelineId: e.target.value ? Number(e.target.value) : "" }))}
                                        >
                                            <option value="">-- Chọn pipeline --</option>
                                            {pipelines.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Xác suất (0–1)</label>
                                        <input
                                            type="number" step="0.01" min="0" max="1"
                                            value={form.probability}
                                            onChange={(e) => setForm(f => ({ ...f, probability: e.target.value === "" ? "" : Number(e.target.value) }))}
                                            placeholder="0.75"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Số ngày tối đa</label>
                                        <input
                                            type="number" min="0"
                                            value={form.maxDaysAllowed}
                                            onChange={(e) => setForm(f => ({ ...f, maxDaysAllowed: e.target.value === "" ? "" : Number(e.target.value) }))}
                                            placeholder="30"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Thứ tự hiển thị</label>
                                        <input
                                            type="number" min="0"
                                            value={form.sortOrder}
                                            onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value === "" ? "" : Number(e.target.value) }))}
                                            placeholder="1"
                                        />
                                    </div>
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
