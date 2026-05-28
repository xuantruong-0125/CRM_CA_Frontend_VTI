"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    SlidersHorizontal,
    X,
    Send,
    CheckCircle,
} from "lucide-react";
import { useQuote } from "./hooks/useQuote";
import { quoteApi } from "./api/quote.api";
import { Quote, QuoteFilter, QuoteFormDataCustomer } from "./types/quote.type";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import styles from "./styles/quote.module.css";

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
    1: { label: "Bản nháp", cls: styles.badgeDraft },
    2: { label: "Đã gửi", cls: styles.badgeSent },
    3: { label: "Khách chấp nhận", cls: styles.badgeAccepted },
    4: { label: "Đã hủy", cls: styles.badgeCancelled },
};

const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "0";
    return new Intl.NumberFormat("vi-VN").format(amount);
};

export default function QuoteListPage() {
    const router = useRouter();
    const { data, loading, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, pagination, filters, applyFilter, resetFilter, remove, refresh } = useQuote();

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [localFilters, setLocalFilters] = useState<QuoteFilter>({ sort: "id,desc" });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [customers, setCustomers] = useState<QuoteFormDataCustomer[]>([]);
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
        quoteApi.getFormCustomers().then(setCustomers).catch(() => { });
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === "n" && (isSales || isAdmin)) {
                e.preventDefault();
                router.push("/quotes/new");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router, isSales, isAdmin]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusTab = (statusId: string | number) => {
        const next = { ...localFilters, statusId: statusId as any };
        setLocalFilters(next);
        applyFilter(next);
    };

    const handleSortToggle = (field: string) => {
        const [curField, curDir] = (localFilters.sort ?? "id,desc").split(",");
        const newDir = curField === field && curDir === "asc" ? "desc" : "asc";
        const next = { ...localFilters, sort: `${field},${newDir}` };
        setLocalFilters(next);
        applyFilter(next);
    };

    const [sortField, sortDir] = (localFilters.sort ?? filters.sort ?? "id,desc").split(",");
    const sortIcon = (field: string) => {
        if (sortField !== field) return <ArrowUpDown size={12} style={{ opacity: 0.5 }} />;
        return sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
    };

    const handleApplyFilter = () => {
        if (localFilters.fromDate && localFilters.toDate && localFilters.toDate < localFilters.fromDate) {
            toast.error("Ngày kết thúc không được trước ngày bắt đầu");
            return;
        }
        applyFilter(localFilters);
        setShowAdvanced(false);
    };

    const handleResetFilter = () => {
        const reset: QuoteFilter = { sort: "id,desc" };
        setLocalFilters(reset);
        resetFilter();
        setShowAdvanced(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await remove(deleteId);
            toast.success("Xóa báo giá thành công");
        } catch {
            toast.error("Không thể xóa báo giá");
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    const handleProgressStatus = async (quote: Quote) => {
        const next = quote.statusId + 1;
        if (next > 3) return;
        try {
            await quoteApi.updateStatus(quote.id, next);
            toast.success(`Đã chuyển sang: ${STATUS_MAP[next]?.label}`);
            refresh();
        } catch {
            toast.error("Không thể cập nhật trạng thái");
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

    const currentStatusId = localFilters.statusId ?? filters.statusId ?? "";

    return (
        <div className={styles.container}>
            {/* Page top bar */}
            <div className={styles.pageTopBar}>
                <span className={styles.pageTopBarTitle}>Báo giá</span>
            </div>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.statusTabs}>
                    <button
                        className={`${styles.statusTab} ${!currentStatusId ? styles.active : ""}`}
                        onClick={() => handleStatusTab("")}
                    >
                        Tất cả
                    </button>
                    {Object.entries(STATUS_MAP).map(([id, info]) => (
                        <button
                            key={id}
                            className={`${styles.statusTab} ${String(currentStatusId) === id ? styles.active : ""}`}
                            onClick={() => handleStatusTab(id)}
                        >
                            {info.label}
                        </button>
                    ))}
                </div>

                <div className={styles.toolbarRight}>
                    <div className={styles.searchBox}>
                        <Search className={styles.searchIcon} size={14} />
                        <input
                            type="text"
                            name="keyword"
                            className={styles.searchInput}
                            placeholder="Mã BG hoặc tên khách..."
                            value={localFilters.keyword ?? ""}
                            onChange={handleFilterChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { applyFilter(localFilters); }
                            }}
                        />
                    </div>
                    <button className={styles.btnFilter} onClick={() => setShowAdvanced(true)} title="Bộ lọc nâng cao">
                        <SlidersHorizontal size={14} />
                    </button>
                </div>
            </div>

            {/* Advanced filter modal */}
            {showAdvanced && (
                <div className={styles.modalOverlay} onClick={() => setShowAdvanced(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Bộ lọc nâng cao</h3>
                            <button className={styles.closeBtn} onClick={() => setShowAdvanced(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Mã báo giá chính xác</label>
                                <input type="text" name="quoteNumber" className={styles.formControl} placeholder="VD: QT-2024..." value={localFilters.quoteNumber ?? ""} onChange={handleFilterChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Khách hàng</label>
                                <select name="customerId" className={styles.formControl} value={localFilters.customerId ?? ""} onChange={handleFilterChange}>
                                    <option value="">-- Tất cả khách hàng --</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGrid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Từ ngày</label>
                                    <input type="date" name="fromDate" className={styles.formControl} value={localFilters.fromDate ?? ""} onChange={handleFilterChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Đến ngày</label>
                                    <input type="date" name="toDate" className={styles.formControl} value={localFilters.toDate ?? ""} min={localFilters.fromDate ?? ""} onChange={handleFilterChange} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnOutline} onClick={handleResetFilter}>Xóa bộ lọc</button>
                            <button className={styles.btnPrimary} onClick={handleApplyFilter}>Áp dụng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>
                                <button className={styles.thSortBtn} onClick={() => handleSortToggle("id")} title="Sắp xếp theo Mã BG">
                                    Mã BG {sortIcon("id")}
                                </button>
                            </th>
                            <th>Khách hàng</th>
                            <th style={{ textAlign: "right" }}>
                                <button className={styles.thSortBtn} style={{ justifyContent: "flex-end", width: "100%" }} onClick={() => handleSortToggle("totalAmount")} title="Sắp xếp theo Tổng tiền">
                                    Tổng tiền {sortIcon("totalAmount")}
                                </button>
                            </th>
                            <th>Đồng tiền</th>
                            <th>
                                <button className={styles.thSortBtn} onClick={() => handleSortToggle("validUntil")} title="Sắp xếp theo Hiệu lực đến">
                                    Hiệu lực đến {sortIcon("validUntil")}
                                </button>
                            </th>
                            <th>
                                <button className={styles.thSortBtn} onClick={() => handleSortToggle("statusId")} title="Sắp xếp theo Trạng thái">
                                    Trạng thái {sortIcon("statusId")}
                                </button>
                            </th>
                            <th style={{ textAlign: "right", paddingRight: "16px" }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className={styles.loadingRow}>Đang tải dữ liệu...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={7} className={styles.emptyRow}>Không tìm thấy báo giá nào.</td></tr>
                        ) : (
                            data.map((quote: Quote) => {
                                const statusInfo = STATUS_MAP[quote.statusId] ?? { label: "Chưa xác định", cls: styles.badgeDraft };
                                return (
                                    <tr key={quote.id}>
                                        <td className={styles.quoteNumber}>{quote.quoteNumber}</td>
                                        <td>{quote.customerName}</td>
                                        <td className={styles.amountCell}>{formatCurrency(quote.totalAmount)}</td>
                                        <td>{quote.currencyCode}</td>
                                        <td>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("vi-VN") : "—"}</td>
                                        <td><span className={statusInfo.cls}>{statusInfo.label}</span></td>
                                        <td className={styles.actionsCell} style={{ paddingRight: "16px" }}>
                                            <div className={styles.actions}>
                                                {/* Xem — tất cả */}
                                                <button className={styles.btnIcon} onClick={() => router.push(`/quotes/${quote.id}`)} title="Xem chi tiết">
                                                    <Eye size={16} />
                                                </button>

                                                {/* Chỉnh sửa — Sales + Admin */}
                                                {(isSales || isAdmin) && (
                                                    <button className={styles.btnIcon} onClick={() => router.push(`/quotes/${quote.id}/edit`)} title="Chỉnh sửa">
                                                        <Edit size={16} />
                                                    </button>
                                                )}

                                                {/* Tiến trạng thái: 1→2 (Sales/Admin), 2→3 (SaleManager/Admin) */}
                                                {quote.statusId === 1 && (isSales || isAdmin) && (
                                                    <button className={`${styles.btnIcon} ${styles.btnIconSend}`} onClick={() => handleProgressStatus(quote)} title="Gửi khách">
                                                        <Send size={16} />
                                                    </button>
                                                )}
                                                {quote.statusId === 2 && (isSaleManager || isAdmin) && (
                                                    <button className={`${styles.btnIcon} ${styles.btnIconSuccess}`} onClick={() => handleProgressStatus(quote)} title="Duyệt">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}

                                                {/* Xóa — chỉ Sales + Admin */}
                                                {(isSales || isAdmin) && (
                                                    <button className={`${styles.btnIcon} ${styles.btnIconDanger}`} onClick={() => setDeleteId(quote.id)} title="Xóa">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && data.length > 0 && (
                    <div className={styles.pagination}>
                        <p className={styles.paginationInfo}>
                            Total: <strong>{pagination.totalElements}</strong> items
                        </p>
                        <div className={styles.paginationControls}>
                            <span className={styles.perPageLabel}>Số dòng:</span>
                            <select
                                className={styles.perPageSelect}
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            >
                                {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>

                            <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(1)} title="Trang đầu">
                                <ChevronsLeft size={16} />
                            </button>
                            <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} title="Trang trước">
                                <ChevronLeft size={16} />
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
                            <button className={styles.pageBtn} disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage(currentPage + 1)} title="Trang sau">
                                <ChevronRight size={16} />
                            </button>
                            <button className={styles.pageBtn} disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage(pagination.totalPages)} title="Trang cuối">
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDeleteModal
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                loading={deleting}
            />
        </div>
    );
}
