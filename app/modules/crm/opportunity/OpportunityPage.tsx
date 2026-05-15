"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, SlidersHorizontal, Pencil, Trash2,
    ChevronLeft, ChevronRight, X, TrendingUp, RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import { useOpportunity } from "./hooks/useOpportunity";
import { usePipeline } from "../pipeline/hooks/usePipeline";
import { usePipelineStage } from "../pipelineStage/hooks/usePipelineStage";
import { useLossReason } from "../lossReason/hooks/useLossReason";
import { HealthStatus, OpportunityPayload } from "./types/opportunity.type";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import styles from "./styles/opportunity.module.css";

const HEALTH_OPTIONS = [
    { value: "" as const, label: "Tất cả" },
    { value: "ON_TRACK" as const, label: "Tốt" },
    { value: "AT_RISK" as const, label: "Rủi ro" },
    { value: "OFF_TRACK" as const, label: "Nguy hiểm" },
];

const EMPTY_FORM: OpportunityPayload = {
    name: "",
    customerId: null,
    assignedUserId: null,
    pipelineId: null,
    stageId: null,
    lossReasonId: null,
    totalAmount: null,
    depositAmount: null,
    currencyCode: "VND",
    exchangeRate: 1,
    healthStatus: "ON_TRACK",
    expectedCloseDate: "",
};

const fmt = (n: number | null | undefined) =>
    n != null ? Number(n).toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "—";

const fmtDate = (d: string) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
};

const healthBadgeClass = (status: string) => {
    if (status === "ON_TRACK") return styles.badgeSuccess;
    if (status === "AT_RISK") return styles.badgeWarning;
    return styles.badgeDanger;
};

const healthLabel = (status: string) => {
    if (status === "ON_TRACK") return "Tốt";
    if (status === "AT_RISK") return "Rủi ro";
    return "Nguy hiểm";
};

const rowHealthClass = (status: string) => {
    if (status === "ON_TRACK") return styles.rowOnTrack;
    if (status === "AT_RISK") return styles.rowAtRisk;
    return styles.rowOffTrack;
};

export default function OpportunityPage() {
    const { data, loading, page, setPage, pagination, applyFilter, clearFilter, getById, create, update, remove } = useOpportunity();
    const { data: pipelines } = usePipeline();
    const { data: allStages } = usePipelineStage();
    const { data: lossReasons } = useLossReason();

    const [keyword, setKeyword] = useState("");
    const [filterHealth, setFilterHealth] = useState<HealthStatus | "">("");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<OpportunityPayload>(EMPTY_FORM);
    const [formStages, setFormStages] = useState(allStages);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const today = new Date().toISOString().split("T")[0];

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

    useEffect(() => {
        if (form.pipelineId) {
            setFormStages(allStages.filter((s) => s.pipelineId === form.pipelineId));
        } else {
            setFormStages(allStages);
        }
    }, [form.pipelineId, allStages]);

    const handleApplyFilter = () => {
        applyFilter({
            keyword: keyword || undefined,
            healthStatus: filterHealth || undefined,
            dateFrom: filterDateFrom || undefined,
            dateTo: filterDateTo || undefined,
        });
    };

    const handleClearFilter = () => {
        setKeyword("");
        setFilterHealth("");
        setFilterDateFrom("");
        setFilterDateTo("");
        clearFilter();
    };

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
                name: item.name,
                customerId: item.customerId,
                assignedUserId: item.assignedUserId,
                pipelineId: item.pipelineId,
                stageId: item.stageId,
                lossReasonId: item.lossReasonId,
                totalAmount: item.totalAmount,
                depositAmount: item.depositAmount,
                currencyCode: item.currencyCode || "VND",
                exchangeRate: item.exchangeRate || 1,
                healthStatus: item.healthStatus || "ON_TRACK",
                expectedCloseDate: item.expectedCloseDate || "",
            });
            setModalOpen(true);
        } catch {
            toast.error("Không tải được dữ liệu!");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.warning("Tên cơ hội không được để trống");
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await update(editingId, form);
                toast.success("Cập nhật cơ hội thành công");
            } else {
                await create(form);
                toast.success("Tạo cơ hội thành công");
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
            toast.success("Xóa cơ hội thành công");
            setDeleteId(null);
        } catch (err: any) {
            toast.error(err?.message || "Xóa thất bại!");
        } finally {
            setLoadingDelete(false);
        }
    };

    const totalPages = pagination.totalPages;

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>
                        <TrendingUp size={24} color="#2563eb" />
                        Cơ hội bán hàng
                    </h1>
                    <p className={styles.pageDescription}>Quản lý toàn bộ cơ hội kinh doanh</p>
                </div>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <Plus size={16} /> Thêm (Alt + N)
                </button>
            </div>

            {/* Filter bar */}
            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={15} />
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm kiếm cơ hội..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleApplyFilter(); }}
                    />
                </div>

                <div className={styles.statusTabs}>
                    {HEALTH_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            className={`${styles.statusTab} ${filterHealth === opt.value ? styles.active : ""}`}
                            onClick={() => { setFilterHealth(opt.value as HealthStatus | ""); handleApplyFilter(); }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <button
                    className={`${styles.btnIcon} ${showAdvanced ? styles.btnIconActive : ""}`}
                    onClick={() => setShowAdvanced((v) => !v)}
                    title="Bộ lọc nâng cao"
                >
                    <SlidersHorizontal size={16} />
                </button>

                <button className={styles.btnIcon} onClick={handleClearFilter} title="Đặt lại">
                    <RotateCcw size={16} />
                </button>

                <button className={styles.btnPrimary} onClick={handleApplyFilter}>Lọc</button>

                {showAdvanced && (
                    <div className={styles.advancedFilters}>
                        <div className={styles.filterGroup}>
                            <label>Từ ngày:</label>
                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={(e) => setFilterDateFrom(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Đến ngày:</label>
                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={(e) => setFilterDateTo(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 32 }}>#</th>
                            <th>Tên cơ hội</th>
                            <th>Khách hàng</th>
                            <th>Pipeline</th>
                            <th>Giai đoạn</th>
                            <th style={{ textAlign: "right" }}>Tổng tiền</th>
                            <th style={{ textAlign: "center" }}>Sức khỏe</th>
                            <th>Ngày đóng</th>
                            <th style={{ textAlign: "center" }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className={styles.loadingRow}>Đang tải...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={9} className={styles.emptyRow}>Không có dữ liệu</td></tr>
                        ) : data.map((row, i) => (
                            <tr key={row.id} className={rowHealthClass(row.healthStatus)}>
                                <td className={styles.muted}>{(page - 1) * 20 + i + 1}</td>
                                <td><div className={styles.lineClamp} style={{ fontWeight: 600 }}>{row.name}</div></td>
                                <td><div className={styles.lineClamp}>{row.customerName || "—"}</div></td>
                                <td><div className={styles.lineClamp}>{row.pipelineName || "—"}</div></td>
                                <td><div className={styles.lineClamp}>{row.stageName || "—"}</div></td>
                                <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(row.totalAmount)}</td>
                                <td style={{ textAlign: "center" }}>
                                    <span className={healthBadgeClass(row.healthStatus)}>
                                        {healthLabel(row.healthStatus)}
                                    </span>
                                </td>
                                <td>{fmtDate(row.expectedCloseDate)}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <button type="button" className={styles.editIcon} onClick={() => openEdit(row.id)} title="Sửa"><Pencil size={15} /></button>
                                        <button type="button" className={styles.deleteIcon} onClick={() => setDeleteId(row.id)} title="Xóa"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <span className={styles.pageInfo}>
                            Tổng: <strong>{pagination.totalElements}</strong> cơ hội
                        </span>
                        <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(page - 1)}>
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={`${styles.pageBtn} ${page === p ? styles.activePage : ""}`}
                                onClick={() => setPage(p)}
                            >{p}</button>
                        ))}
                        <button className={styles.pageBtn} disabled={!pagination.hasNext} onClick={() => setPage(page + 1)}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingId ? "Chỉnh sửa cơ hội" : "Tạo cơ hội mới"}</h3>
                            <button className={styles.closeButton} onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.spanFull}`}>
                                        <label>Tên cơ hội <span style={{ color: "#ef4444" }}>*</span></label>
                                        <input
                                            autoFocus
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Quy trình</label>
                                        <select
                                            value={form.pipelineId ?? ""}
                                            onChange={(e) => setForm((f) => ({ ...f, pipelineId: e.target.value ? Number(e.target.value) : null, stageId: null }))}
                                        >
                                            <option value="">-- Chọn quy trình --</option>
                                            {pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Giai đoạn</label>
                                        <select
                                            value={form.stageId ?? ""}
                                            onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value ? Number(e.target.value) : null }))}
                                        >
                                            <option value="">-- Chọn giai đoạn --</option>
                                            {formStages.map((s) => <option key={s.id} value={s.id}>{s.stageName}</option>)}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Trạng thái sức khỏe</label>
                                        <select
                                            value={form.healthStatus}
                                            onChange={(e) => setForm((f) => ({ ...f, healthStatus: e.target.value as HealthStatus }))}
                                        >
                                            <option value="ON_TRACK">Tốt</option>
                                            <option value="AT_RISK">Rủi ro</option>
                                            <option value="OFF_TRACK">Nguy hiểm</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Lý do thua</label>
                                        <select
                                            value={form.lossReasonId ?? ""}
                                            onChange={(e) => setForm((f) => ({ ...f, lossReasonId: e.target.value ? Number(e.target.value) : null }))}
                                        >
                                            <option value="">-- Không có --</option>
                                            {lossReasons.map((lr) => <option key={lr.id} value={lr.id}>{lr.name}</option>)}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Tổng tiền</label>
                                        <input
                                            type="number" min="0"
                                            value={form.totalAmount ?? ""}
                                            onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value ? Number(e.target.value) : null }))}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Tiền đặt cọc</label>
                                        <input
                                            type="number" min="0"
                                            value={form.depositAmount ?? ""}
                                            onChange={(e) => setForm((f) => ({ ...f, depositAmount: e.target.value ? Number(e.target.value) : null }))}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Đơn vị tiền tệ</label>
                                        <select
                                            value={form.currencyCode}
                                            onChange={(e) => setForm((f) => ({ ...f, currencyCode: e.target.value }))}
                                        >
                                            <option value="VND">VND</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Tỷ giá</label>
                                        <input
                                            type="number" min="0"
                                            value={form.exchangeRate}
                                            onChange={(e) => setForm((f) => ({ ...f, exchangeRate: Number(e.target.value) }))}
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.spanFull}`}>
                                        <label>Ngày đóng dự kiến</label>
                                        <input
                                            type="date"
                                            min={today}
                                            value={form.expectedCloseDate}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val && val < today) return;
                                                setForm((f) => ({ ...f, expectedCloseDate: val }));
                                            }}
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
