"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Printer, Package, User, Calendar, Tag, FileText, TrendingDown, DollarSign } from "lucide-react";
import { getQuoteById } from "./useCases/getQuoteById";
import { Quote } from "./types/quote.type";
import styles from "./styles/quote.module.css";

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
    1: { label: "Bản nháp", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    2: { label: "Đã gửi", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    3: { label: "Khách chấp nhận", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    4: { label: "Đã hủy", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const formatCurrency = (amount: number | null | undefined, currency = "VND") => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
};

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

function InfoRow({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
    return (
        <div className={styles.infoRow}>
            <div className={styles.infoIcon}><Icon size={15} /></div>
            <div className={styles.infoContent}>
                <div className={styles.infoLabel}>{label}</div>
                <div className={highlight ? styles.infoValueHighlight : styles.infoValue}>{value}</div>
            </div>
        </div>
    );
}

export default function QuoteDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getQuoteById(Number(id))
            .then(setQuote)
            .catch(() => setError("Không thể tải thông tin báo giá."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}>
                <p style={{ marginBottom: "1rem" }}>{error || "Không tìm thấy báo giá."}</p>
                <button className={styles.btnOutline} onClick={() => router.push("/crm/quotes")}>
                    <ArrowLeft size={16} /> Quay lại
                </button>
            </div>
        );
    }

    const status = STATUS_MAP[quote.statusId] ?? { label: "Chưa xác định", color: "#888", bg: "rgba(0,0,0,0.06)" };
    const lineItems = quote.lineItems ?? [];
    const subtotal = lineItems.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
    const totalDiscount = lineItems.reduce((s, item) => s + (item.discountValue || 0), 0);
    const grandTotal = subtotal - totalDiscount;

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Header */}
            <div className={styles.detailHeader}>
                <div>
                    <button className={styles.backLink} onClick={() => router.push("/crm/quotes")}>
                        <ArrowLeft size={15} /> Quay lại danh sách
                    </button>
                    <div className={styles.detailTitle}>
                        {quote.quoteNumber}
                        <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: "13px", fontWeight: 600, color: status.color, background: status.bg, border: `1px solid ${status.color}40` }}>
                            {status.label}
                        </span>
                    </div>
                    <p className={styles.detailSubtitle}>Khách hàng: <strong>{quote.customerName}</strong></p>
                </div>
                <div className={styles.detailActions}>
                    <button className={styles.btnOutline} onClick={() => window.print()}><Printer size={15} /> In</button>
                    <button className={styles.btnPrimary} onClick={() => router.push(`/crm/quotes/${id}/edit`)}><Edit size={15} /> Chỉnh sửa</button>
                </div>
            </div>

            {/* Info cards */}
            <div className={styles.cardsGrid}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}><FileText size={16} className={styles.cardTitleIcon} /> Thông tin báo giá</h3>
                    <InfoRow icon={Tag} label="Mã báo giá" value={quote.quoteNumber} />
                    <InfoRow icon={User} label="Khách hàng" value={quote.customerName || "—"} />
                    <InfoRow icon={Calendar} label="Ngày hiệu lực" value={formatDate(quote.validUntil)} />
                    <InfoRow icon={FileText} label="Mẫu template" value={quote.templateName || "—"} />
                    <InfoRow icon={Calendar} label="Ngày tạo" value={formatDate(quote.createdAt)} />
                </div>

                <div className={styles.card}>
                    <h3 className={styles.cardTitle}><DollarSign size={16} className={styles.cardTitleIcon} /> Tổng quan tài chính</h3>
                    <InfoRow icon={Package} label="Số sản phẩm" value={`${lineItems.length} dòng`} />
                    <InfoRow icon={DollarSign} label="Tạm tính" value={formatCurrency(subtotal, quote.currencyCode)} />
                    <InfoRow icon={TrendingDown} label="Tổng chiết khấu" value={totalDiscount > 0 ? `- ${formatCurrency(totalDiscount, quote.currencyCode)}` : "0 ₫"} />
                    <div className={styles.grandTotalBox}>
                        <span className={styles.grandTotalLabel}>Tổng cộng ({quote.currencyCode})</span>
                        <span className={styles.grandTotalAmount}>{formatCurrency(quote.totalAmount || grandTotal, quote.currencyCode)}</span>
                    </div>
                </div>
            </div>

            {/* Line items table */}
            <div className={styles.lineItemsCard}>
                <div className={styles.lineItemsHeader}>
                    <Package size={16} style={{ color: "#2563eb" }} />
                    <h3 className={styles.lineItemsTitle}>Danh sách sản phẩm</h3>
                    <span className={styles.itemCount}>{lineItems.length} sản phẩm</span>
                </div>
                {lineItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                        <Package size={36} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
                        <p>Không có sản phẩm nào trong báo giá này.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>#</th>
                                    <th>Sản phẩm</th>
                                    <th style={{ textAlign: "center" }}>Số lượng</th>
                                    <th style={{ textAlign: "right" }}>Đơn giá</th>
                                    <th style={{ textAlign: "right" }}>Chiết khấu</th>
                                    <th style={{ textAlign: "right" }}>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((item, idx) => {
                                    const lineSubtotal = item.unitPrice * item.quantity;
                                    const lineTotal = lineSubtotal - (item.discountValue || 0);
                                    const discountPct = lineSubtotal > 0 ? ((item.discountValue || 0) / lineSubtotal * 100).toFixed(1) : "0";
                                    return (
                                        <tr key={idx}>
                                            <td style={{ color: "#9ca3af" }}>{idx + 1}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{item.productName || `Sản phẩm #${item.productId}`}</div>
                                                <div style={{ fontSize: 12, color: "#9ca3af" }}>ID: {item.productId}</div>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <span style={{ display: "inline-block", padding: "2px 12px", borderRadius: 20, background: "#f3f4f6", fontWeight: 600 }}>{item.quantity}</span>
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: 500 }}>{formatCurrency(item.unitPrice, quote.currencyCode)}</td>
                                            <td style={{ textAlign: "right" }}>
                                                {(item.discountValue ?? 0) > 0 ? (
                                                    <span className={styles.discountValue}>
                                                        — {formatCurrency(item.discountValue, quote.currencyCode)}
                                                        <span className={styles.discountPct}>({discountPct}%)</span>
                                                    </span>
                                                ) : <span style={{ color: "#9ca3af" }}>—</span>}
                                            </td>
                                            <td style={{ textAlign: "right" }} className={styles.primaryValue}>{formatCurrency(lineTotal, quote.currencyCode)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f9fafb" }}>
                                    <td colSpan={4} />
                                    <td style={{ textAlign: "right", fontWeight: 600, padding: "12px 14px", color: "#6b7280" }}>Tổng cộng</td>
                                    <td className={styles.primaryValue} style={{ textAlign: "right", padding: "12px 14px", fontWeight: 800, fontSize: 15 }}>
                                        {formatCurrency(quote.totalAmount || grandTotal, quote.currencyCode)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
