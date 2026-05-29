"use client";

import React, { useState, useEffect } from "react";
import {
    Plus, Search, SlidersHorizontal, ArrowUpDown, Pencil, Trash2, Eye,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    X, TrendingUp, RefreshCw, ChevronDown,
} from "lucide-react";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useOpportunity } from "./hooks/useOpportunity";
import { opportunityApi } from "./api/opportunity.api";
import { pipelineApi } from "@/modules/opportunity/pipeline/api/pipeline.api";
import { pipelineStageApi } from "@/modules/opportunity/pipeline-stage/api/pipeline-stage.api";
import { lossReasonApi } from "@/modules/opportunity/loss-reason/api/loss-reason.api";
import { getOpportunityById } from "./useCases/getOpportunityById";
import { createOpportunity } from "./useCases/createOpportunity";
import { updateOpportunity } from "./useCases/updateOpportunity";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import { Pipeline } from "@/modules/opportunity/pipeline/types/pipeline.type";
import { PipelineStage } from "@/modules/opportunity/pipeline-stage/types/pipeline-stage.type";
import { LossReason } from "@/modules/opportunity/loss-reason/types/loss-reason.type";
import { HealthStatus, Opportunity, OpportunityFilter, OpportunityFormState } from "./types/opportunity.type";
import styles from "./styles/opportunity.module.css";

const HEALTH_OPTIONS = [
    { value: "" as const, label: "Tất cả" },
    { value: "ON_TRACK" as HealthStatus, label: "Tốt" },
    { value: "AT_RISK" as HealthStatus, label: "Rủi ro" },
    { value: "OFF_TRACK" as HealthStatus, label: "Nguy hiểm" },
];

const EMPTY_FORM: OpportunityFormState = {
    id: null,
    name: "",
    customerId: "",
    assignedUserId: "",
    pipelineId: "",
    stageId: "",
    lossReasonId: "",
    totalAmount: "",
    depositAmount: "",
    currencyCode: "VND",
    exchangeRate: 1,
    healthStatus: "ON_TRACK",
    expectedCloseDate: "",
};

function healthBadgeClass(status: string): string {
    const map: Record<string, string> = {
        ON_TRACK: styles.badgeSuccess,
        AT_RISK: styles.badgeWarning,
        OFF_TRACK: styles.badgeDanger,
    };
    return map[status] ?? styles.badgePrimary;
}

function healthLabel(status: string): string {
    const map: Record<string, string> = {
        ON_TRACK: "Tốt",
        AT_RISK: "Rủi ro",
        OFF_TRACK: "Nguy hiểm",
    };
    return map[status] ?? status;
}

function fmt(n: number | null | undefined): string {
    if (n == null) return "—";
    return Number(n).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    try {
        const [y, m, d] = dateStr.split("-");
        return `${d}/${m}/${y}`;
    } catch {
        return dateStr;
    }
}

export default function OpportunityListPage() {
    const {
        data, loading, currentPage, setCurrentPage, pagination,
        filters, applyFilter, resetFilter, remove, refresh,
    } = useOpportunity();

    const searchParams = useSearchParams();
    const queryCustomerId = searchParams?.get("customerId");
    const queryCreate = searchParams?.get("create") === "true";

    const [keyword, setKeyword] = useState("");
    const [filterHealth, setFilterHealth] = useState<HealthStatus | "">("");
    const [filterPipeline, setFilterPipeline] = useState<string>("");
    const [filterStage, setFilterStage] = useState<string>("");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showPipelineFilter, setShowPipelineFilter] = useState(false);
    const [showStageFilter, setShowStageFilter] = useState(false);

    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [allStages, setAllStages] = useState<PipelineStage[]>([]);
    const [filteredStages, setFilteredStages] = useState<PipelineStage[]>([]);
    const [lossReasons, setLossReasons] = useState<LossReason[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);
    const [form, setForm] = useState<OpportunityFormState>(EMPTY_FORM);
    const [formStages, setFormStages] = useState<PipelineStage[]>([]);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [pageInput, setPageInput] = useState(currentPage);

    const [isSales, setIsSales] = useState(false);
    const [isSaleManager, setIsSaleManager] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        const roles = user?.roles ?? [];
        setIsSales(roles.includes("SALE"));
        setIsSaleManager(roles.includes("SALE_MANAGER") || roles.includes("MANAGER"));
        setIsAdmin(roles.includes("ADMIN"));
    }, []);

    useEffect(() => { setPageInput(currentPage); }, [currentPage]);

    useEffect(() => {
        if (queryCreate && queryCustomerId) {
            setForm({
                ...EMPTY_FORM,
                customerId: queryCustomerId,
            });
            setViewOnly(false);
            setModalOpen(true);
        }
    }, [queryCustomerId, queryCreate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === "n" && (isSales || isAdmin) && !modalOpen) {
                e.preventDefault();
                openCreate();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSales, isAdmin, modalOpen]);

    useEffect(() => {
        pipelineApi.getAll().then(setPipelines).catch(() => { });
        pipelineStageApi.getAll().then(setAllStages).catch(() => { });
        lossReasonApi.getAll().then(setLossReasons).catch(() => { });
    }, []);

    useEffect(() => {
        if (filterPipeline) {
            setFilteredStages(allStages.filter(s => String(s.pipelineId) === filterPipeline));
            setFilterStage("");
        } else {
            setFilteredStages(allStages);
        }
    }, [filterPipeline, allStages]);

    useEffect(() => {
        if (form.pipelineId) {
            setFormStages(allStages.filter(s => String(s.pipelineId) === form.pipelineId));
        } else {
            setFormStages(allStages);
        }
    }, [form.pipelineId, allStages]);

    const buildFilters = (overrides: Partial<OpportunityFilter> = {}): OpportunityFilter => ({
        keyword,
        pipelineId: filterPipeline || undefined,
        stageId: filterStage || undefined,
        healthStatus: filterHealth || undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
        sortField: sortField || undefined,
        sortDir: sortField ? sortDir : undefined,
        ...overrides,
    });

    const handleApplyFilter = () => {
        if (filterDateFrom && filterDateTo && filterDateTo < filterDateFrom) {
            toast.error("Ngày kết thúc không được trước ngày bắt đầu");
            return;
        }
        applyFilter(buildFilters());
    };

    const handleResetFilter = () => {
        setKeyword("");
        setFilterHealth("");
        setFilterPipeline("");
        setFilterStage("");
        setFilterDateFrom("");
        setFilterDateTo("");
        setSortField("");
        setSortDir("asc");
        resetFilter();
    };

    const toggleSort = (field: string) => {
        let newDir: "asc" | "desc" = "asc";
        if (sortField === field) {
            newDir = sortDir === "asc" ? "desc" : "asc";
            setSortDir(newDir);
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        applyFilter(buildFilters({ sortField: field, sortDir: newDir }));
    };

    const handleHealthTab = (value: HealthStatus | "") => {
        setFilterHealth(value);
        applyFilter(buildFilters({ healthStatus: value || undefined }));
    };

    const handleModalKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== "Enter") return;
        const target = e.target as HTMLElement;
        if (target.tagName === "BUTTON" || target.tagName === "SELECT") return;
        e.preventDefault();
        const form = target.closest("form");
        if (!form) return;
        const focusable = Array.from(
            form.querySelectorAll<HTMLElement>("input:not([disabled]), select:not([disabled]), button[type='submit']:not([disabled])")
        );
        const idx = focusable.indexOf(target);
        if (idx >= 0 && idx < focusable.length - 1) focusable[idx + 1].focus();
    };

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setViewOnly(false);
        setModalOpen(true);
    };

    const openEdit = async (id: number, readOnly = false) => {
        try {
            const d = await getOpportunityById(id);
            setForm({
                id: d.id,
                name: d.name ?? "",
                customerId: d.customerId != null ? String(d.customerId) : "",
                assignedUserId: d.assignedUserId != null ? String(d.assignedUserId) : "",
                pipelineId: d.pipelineId != null ? String(d.pipelineId) : "",
                stageId: d.stageId != null ? String(d.stageId) : "",
                lossReasonId: d.lossReasonId != null ? String(d.lossReasonId) : "",
                totalAmount: d.totalAmount != null ? String(d.totalAmount) : "",
                depositAmount: d.depositAmount != null ? String(d.depositAmount) : "",
                currencyCode: d.currencyCode ?? "VND",
                exchangeRate: d.exchangeRate ?? 1,
                healthStatus: d.healthStatus ?? "ON_TRACK",
                expectedCloseDate: d.expectedCloseDate ?? "",
            });
            setViewOnly(readOnly);
            setModalOpen(true);
        } catch {
            toast.error("Không tải được dữ liệu!");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Tên cơ hội không được để trống!");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                customerId: form.customerId ? Number(form.customerId) : null,
                assignedUserId: form.assignedUserId ? Number(form.assignedUserId) : null,
                pipelineId: form.pipelineId ? Number(form.pipelineId) : null,
                stageId: form.stageId ? Number(form.stageId) : null,
                lossReasonId: form.lossReasonId ? Number(form.lossReasonId) : null,
                totalAmount: form.totalAmount ? Number(form.totalAmount) : null,
                depositAmount: form.depositAmount ? Number(form.depositAmount) : null,
                currencyCode: form.currencyCode,
                exchangeRate: form.exchangeRate ? Number(form.exchangeRate) : null,
                healthStatus: form.healthStatus,
                expectedCloseDate: form.expectedCloseDate || null,
            };
            if (form.id) {
                await updateOpportunity(form.id, payload);
                toast.success("Cập nhật cơ hội thành công!");
            } else {
                await createOpportunity(payload);
                toast.success("Tạo cơ hội thành công!");
            }
            setModalOpen(false);
            refresh();
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "message" in err
                ? (err as { message: string }).message
                : "Lưu thất bại!";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await remove(deleteTarget.id);
            toast.success("Xóa cơ hội thành công!");
            setDeleteTarget(null);
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "message" in err
                ? (err as { message: string }).message
                : "Xóa thất bại!";
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const val = parseInt((e.target as HTMLInputElement).value);
            if (!isNaN(val) && val >= 1 && val <= pagination.totalPages) {
                setCurrentPage(val);
            } else {
                setPageInput(currentPage);
            }
        }
    };

    const today = new Date().toISOString().split("T")[0];
    const hasFilter = keyword || filterPipeline || filterStage || filterHealth || filterDateFrom || filterDateTo;

    return (
        <div className={styles.page}>
            {/* Page top bar */}
            <div className={styles.pageTopBar}>
                <span className={styles.pageTopBarTitle}>Cơ hội bán hàng</span>
            </div>

            {/* Filter bar */}
            <div className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <div className={styles.searchWrap}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Tìm kiếm cơ hội..."
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleApplyFilter()}
                        />
                    </div>

                    <div className={styles.healthTabs}>
                        {HEALTH_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                className={`${styles.healthTab} ${filterHealth === opt.value ? styles.healthTabActive : ""}`}
                                onClick={() => handleHealthTab(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <button
                        className={`${styles.iconBtn} ${showAdvanced ? styles.iconBtnActive : ""}`}
                        onClick={() => setShowAdvanced(v => !v)}
                        title="Bộ lọc nâng cao"
                    >
                        <SlidersHorizontal size={16} />
                    </button>

                    {hasFilter && (
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={handleResetFilter} title="Xóa bộ lọc">
                            <RefreshCw size={16} />
                        </button>
                    )}

                    {(isSales || isAdmin) && (
                        <button className={styles.btnPrimary} style={{ marginLeft: "auto" }} onClick={openCreate} title="Phím tắt: Alt+N">
                            <Plus size={16} /> Thêm mới (Alt+N)
                        </button>
                    )}
                </div>

                {showAdvanced && (
                    <div className={styles.advancedRow}>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Từ ngày:</label>
                            <input
                                type="date"
                                className={styles.filterInput}
                                value={filterDateFrom}
                                onChange={e => { setFilterDateFrom(e.target.value); }}
                                onBlur={handleApplyFilter}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Đến ngày:</label>
                            <input
                                type="date"
                                className={styles.filterInput}
                                value={filterDateTo}
                                min={filterDateFrom}
                                onChange={e => { setFilterDateTo(e.target.value); }}
                                onBlur={handleApplyFilter}
                            />
                        </div>
                        <button className={styles.btnOutline} onClick={handleApplyFilter}>
                            Áp dụng
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thNum}>#</th>
                            <th>
                                <button className={styles.sortBtn} onClick={() => toggleSort("name")}>
                                    Tên cơ hội <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th>Khách hàng</th>
                            <th style={{ position: "relative" }}>
                                <button className={styles.sortBtn} onClick={() => setShowPipelineFilter(v => !v)}>
                                    Pipeline <ChevronDown size={12} />
                                </button>
                                {showPipelineFilter && (
                                    <>
                                        <div className={styles.dropOverlay} onClick={() => setShowPipelineFilter(false)} />
                                        <div className={styles.dropMenu}>
                                            <div
                                                className={`${styles.dropItem} ${filterPipeline === "" ? styles.dropItemActive : ""}`}
                                                onClick={() => { setFilterPipeline(""); setShowPipelineFilter(false); applyFilter(buildFilters({ pipelineId: undefined, stageId: undefined })); }}
                                            >Tất cả quy trình</div>
                                            {pipelines.map(p => (
                                                <div
                                                    key={p.id}
                                                    className={`${styles.dropItem} ${filterPipeline === String(p.id) ? styles.dropItemActive : ""}`}
                                                    onClick={() => { setFilterPipeline(String(p.id)); setShowPipelineFilter(false); applyFilter(buildFilters({ pipelineId: p.id })); }}
                                                >{p.name}</div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </th>
                            <th style={{ position: "relative" }}>
                                <button className={styles.sortBtn} onClick={() => setShowStageFilter(v => !v)}>
                                    Giai đoạn <ChevronDown size={12} />
                                </button>
                                {showStageFilter && (
                                    <>
                                        <div className={styles.dropOverlay} onClick={() => setShowStageFilter(false)} />
                                        <div className={styles.dropMenu}>
                                            <div
                                                className={`${styles.dropItem} ${filterStage === "" ? styles.dropItemActive : ""}`}
                                                onClick={() => { setFilterStage(""); setShowStageFilter(false); applyFilter(buildFilters({ stageId: undefined })); }}
                                            >Tất cả giai đoạn</div>
                                            {filteredStages.map(s => (
                                                <div
                                                    key={s.id}
                                                    className={`${styles.dropItem} ${filterStage === String(s.id) ? styles.dropItemActive : ""}`}
                                                    onClick={() => { setFilterStage(String(s.id)); setShowStageFilter(false); applyFilter(buildFilters({ stageId: s.id })); }}
                                                >{s.stageName}</div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </th>
                            <th>Sức khỏe</th>
                            <th className={styles.thRight}>
                                <button className={`${styles.sortBtn} ${styles.sortBtnRight}`} onClick={() => toggleSort("totalAmount")}>
                                    Tổng tiền <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className={styles.thRight}>Còn lại</th>
                            <th>
                                <button className={styles.sortBtn} onClick={() => toggleSort("expectedCloseDate")}>
                                    Ngày đóng <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className={styles.thCenter}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={10} className={styles.emptyCell}>
                                    <RefreshCw size={16} className={styles.spinIcon} /> Đang tải...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={10} className={styles.emptyCell}>Không có dữ liệu</td>
                            </tr>
                        ) : data.map((r, idx) => (
                            <tr key={r.id}>
                                <td className={styles.tdNum}>{(currentPage - 1) * 20 + idx + 1}</td>
                                <td className={styles.tdName} title={r.name}>{r.name}</td>
                                <td title={r.customerName ?? ""}>{r.customerName || "—"}</td>
                                <td>{r.pipelineName || "—"}</td>
                                <td>{r.stageName || "—"}</td>
                                <td>
                                    <span className={`${styles.badge} ${healthBadgeClass(r.healthStatus)}`}>
                                        {healthLabel(r.healthStatus)}
                                    </span>
                                </td>
                                <td className={styles.tdRight}>{fmt(r.totalAmount)}</td>
                                <td className={`${styles.tdRight} ${styles.tdRemaining}`}>{fmt(r.remainingAmount)}</td>
                                <td>{formatDate(r.expectedCloseDate)}</td>
                                <td className={styles.tdActions}>
                                    {/* Xem — Manager (chỉ xem, không sửa) */}
                                    {isSaleManager && !isSales && !isAdmin && (
                                        <button className={styles.iconBtn} title="Xem chi tiết" onClick={() => openEdit(r.id, true)}>
                                            <Eye size={14} />
                                        </button>
                                    )}
                                    {/* Sửa — Sales + Admin */}
                                    {(isSales || isAdmin) && (
                                        <button className={styles.iconBtn} title="Sửa" onClick={() => openEdit(r.id)}>
                                            <Pencil size={14} />
                                        </button>
                                    )}
                                    {/* Xóa — Sales + Admin */}
                                    {(isSales || isAdmin) && (
                                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Xóa" onClick={() => setDeleteTarget(r)}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && data.length > 0 && (
                    <div className={styles.pagination}>
                        <span className={styles.paginationInfo}>
                            Total: <strong>{pagination.totalElements}</strong> items
                        </span>
                        <div className={styles.paginationControls}>
                            <button className={styles.pageBtn} disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)} title="Trang đầu">
                                <ChevronsLeft size={14} />
                            </button>
                            <button className={styles.pageBtn} disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)} title="Trang trước">
                                <ChevronLeft size={14} />
                            </button>
                            <div className={styles.pageInputWrapper}>
                                <span>Trang</span>
                                <input
                                    type="number"
                                    className={styles.pageInput}
                                    value={pageInput}
                                    min={1}
                                    max={pagination.totalPages}
                                    onChange={(e) => setPageInput(Number(e.target.value))}
                                    onKeyDown={handlePageInput}
                                />
                                <span>/ {pagination.totalPages}</span>
                            </div>
                            <button className={styles.pageBtn} disabled={currentPage === pagination.totalPages}
                                onClick={() => setCurrentPage(p => p + 1)} title="Trang sau">
                                <ChevronRight size={14} />
                            </button>
                            <button className={styles.pageBtn} disabled={currentPage === pagination.totalPages}
                                onClick={() => setCurrentPage(pagination.totalPages)} title="Trang cuối">
                                <ChevronsRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div className={styles.overlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {viewOnly ? "Xem chi tiết cơ hội" : form.id ? "Chỉnh sửa cơ hội" : "Tạo cơ hội mới"}
                            </h2>
                            <button className={styles.modalClose} onClick={() => setModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} onKeyDown={handleModalKeyDown}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Tên cơ hội {!viewOnly && <span className={styles.required}>*</span>}
                                    </label>
                                    <input
                                        className={styles.input}
                                        required={!viewOnly}
                                        disabled={viewOnly}
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    />
                                </div>

                                <div className={styles.grid2}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Quy trình</label>
                                        <select
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.pipelineId}
                                            onChange={e => setForm(f => ({ ...f, pipelineId: e.target.value, stageId: "" }))}
                                        >
                                            <option value="">-- Chọn quy trình --</option>
                                            {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Giai đoạn</label>
                                        <select
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.stageId}
                                            onChange={e => setForm(f => ({ ...f, stageId: e.target.value }))}
                                        >
                                            <option value="">-- Chọn giai đoạn --</option>
                                            {formStages.map(s => <option key={s.id} value={s.id}>{s.stageName}</option>)}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Trạng thái sức khỏe</label>
                                        <select
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.healthStatus}
                                            onChange={e => setForm(f => ({ ...f, healthStatus: e.target.value as HealthStatus }))}
                                        >
                                            <option value="ON_TRACK">Tốt</option>
                                            <option value="AT_RISK">Rủi ro</option>
                                            <option value="OFF_TRACK">Nguy hiểm</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Lý do thua</label>
                                        <select
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.lossReasonId}
                                            onChange={e => setForm(f => ({ ...f, lossReasonId: e.target.value }))}
                                        >
                                            <option value="">-- Không có --</option>
                                            {lossReasons.map(lr => <option key={lr.id} value={lr.id}>{lr.name}</option>)}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Tổng tiền</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.totalAmount}
                                            onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Tiền đặt cọc</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.depositAmount}
                                            onChange={e => setForm(f => ({ ...f, depositAmount: e.target.value }))}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Đơn vị tiền tệ</label>
                                        <select
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.currencyCode}
                                            onChange={e => setForm(f => ({ ...f, currencyCode: e.target.value }))}
                                        >
                                            <option value="VND">VND</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Tỷ giá</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.exchangeRate}
                                            onChange={e => setForm(f => ({ ...f, exchangeRate: Number(e.target.value) }))}
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                                        <label className={styles.label}>Ngày đóng dự kiến</label>
                                        <input
                                            type="date"
                                            min={today}
                                            className={styles.input}
                                            disabled={viewOnly}
                                            value={form.expectedCloseDate}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val && val < today) return;
                                                setForm(f => ({ ...f, expectedCloseDate: val }));
                                            }}
                                        />
                                    </div>
                                </div>
                                {!viewOnly && <p className={styles.requiredNote}>(*) Các trường bắt buộc nhập</p>}
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnOutline} onClick={() => setModalOpen(false)}>
                                    {viewOnly ? "Đóng" : "Hủy"}
                                </button>
                                {!viewOnly && (
                                    <button type="submit" className={styles.btnPrimary} disabled={saving || !form.name.trim()}>
                                        {saving ? "Đang lưu..." : form.id ? "Cập nhật" : "Tạo mới"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
            />
        </div>
    );
}
