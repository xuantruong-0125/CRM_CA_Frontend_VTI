"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useQuoteForm } from "./hooks/useQuoteForm";
import styles from "./styles/quote.module.css";

interface Props {
    mode: "create" | "edit";
}

const formatNumber = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n));

export default function QuoteFormPage({ mode }: Props) {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = mode === "edit" ? Number(params.id) : undefined;

    const {
        formData,
        setFormData,
        products,
        templates,
        customers,
        customerSearch,
        setCustomerSearch,
        showResults,
        setShowResults,
        isSearching,
        loading,
        saving,
        subTotal,
        totalDiscount,
        totalAmount,
        handleAddLineItem,
        handleRemoveLineItem,
        handleLineItemChange,
        handleSave,
    } = useQuoteForm(mode, id);

    const isEdit = mode === "edit";

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className={styles.formPageHeader}>
                <button
                    type="button"
                    className={styles.backLink}
                    onClick={() => router.push("/crm/quotes")}
                >
                    <ArrowLeft size={15} /> Quay lại danh sách
                </button>
                <h1 className={styles.pageTitle}>{isEdit ? "Cập nhật Báo giá" : "Tạo mới Báo giá"}</h1>
                <p className={styles.pageDescription}>Vui lòng điền thông tin chi tiết của báo giá và sản phẩm.</p>
            </div>

            <form onSubmit={handleSave} className={styles.formLayout}>
                {/* Top: info + summary */}
                <div className={styles.formTopGrid}>
                    {/* Info card */}
                    <div className={styles.formCard}>
                        <h3 className={styles.formCardTitle}>Thông tin chung</h3>
                        <div className={styles.formFieldsGrid}>
                            {isEdit && (
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Mã báo giá</label>
                                    <input
                                        type="text"
                                        name="quoteNumber"
                                        className={styles.formControl}
                                        value={formData.quoteNumber}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, quoteNumber: e.target.value }))}
                                    />
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Ngày hiệu lực</label>
                                <input
                                    type="date"
                                    name="validUntil"
                                    className={styles.formControl}
                                    value={formData.validUntil}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, validUntil: e.target.value }))}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Trạng thái</label>
                                <select
                                    name="statusId"
                                    className={styles.formControl}
                                    value={formData.statusId}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, statusId: Number(e.target.value) as any }))}
                                >
                                    <option value={1}>Bản nháp</option>
                                    <option value={2}>Đã gửi</option>
                                    <option value={3}>Chấp nhận</option>
                                    <option value={4}>Đã hủy</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Mẫu template</label>
                                <select
                                    name="templateId"
                                    className={styles.formControl}
                                    value={formData.templateId}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, templateId: e.target.value === "" ? "" : Number(e.target.value) }))}
                                >
                                    <option value="">-- Không sử dụng mẫu --</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Customer autocomplete */}
                            <div className={`${styles.formGroup} ${styles.spanFull}`} style={{ position: "relative" }}>
                                <label className={styles.formLabel}>Khách hàng *</label>
                                <div className={styles.autocompleteWrapper}>
                                    <input
                                        type="text"
                                        className={styles.formControl}
                                        placeholder="Tìm tên hoặc mã khách hàng..."
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            if (formData.customerId) setFormData((prev) => ({ ...prev, customerId: "" }));
                                        }}
                                        onFocus={() => { if (customers.length > 0) setShowResults(true); }}
                                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                                        style={{ paddingRight: isSearching ? "40px" : undefined }}
                                    />
                                    {isSearching && (
                                        <div className={styles.autocompleteSpinner}>
                                            <div className={styles.spinner} />
                                        </div>
                                    )}
                                    {showResults && customers.length > 0 && (
                                        <div className={styles.autocompleteResults}>
                                            {customers.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className={styles.autocompleteItem}
                                                    onMouseDown={() => {
                                                        setFormData((prev) => ({ ...prev, customerId: c.id }));
                                                        setCustomerSearch(c.name);
                                                        setShowResults(false);
                                                    }}
                                                >
                                                    <div className={styles.autocompleteItemName}>{c.name}</div>
                                                    {c.customerCode && <div className={styles.autocompleteItemCode}>Mã: {c.customerCode}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary card */}
                    <div className={styles.summaryCard}>
                        <h3 className={styles.summaryTitle}>Tổng kết báo giá</h3>
                        <div className={styles.summaryRow}>
                            <span>Tổng phụ:</span>
                            <span>{formatNumber(subTotal)} VND</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Giảm giá:</span>
                            <span>— {formatNumber(totalDiscount)} VND</span>
                        </div>
                        <hr className={styles.summaryDivider} />
                        <div className={styles.summaryTotal}>
                            <span className={styles.summaryTotalLabel}>Thành tiền:</span>
                            <span className={styles.summaryTotalAmount}>{formatNumber(totalAmount)}</span>
                        </div>
                        <button type="submit" className={styles.btnSave} disabled={saving}>
                            {saving ? "Đang lưu..." : (<><Save size={18} /> Lưu Báo giá</>)}
                        </button>
                    </div>
                </div>

                {/* Line items */}
                <div className={styles.lineItemsGrid}>
                    <h3 className={styles.lineItemsGridTitle}>Sản phẩm (Line Items)</h3>
                    <div className={styles.lineItemHeader}>
                        <div>Sản phẩm</div>
                        <div style={{ textAlign: "center" }}>Số lượng</div>
                        <div style={{ textAlign: "center" }}>Đơn giá</div>
                        <div style={{ textAlign: "center" }}>GG/Thuế</div>
                        <div style={{ textAlign: "center" }}>Xóa</div>
                    </div>

                    {formData.lineItems.map((item, index) => (
                        <div key={index} className={styles.lineItemRow}>
                            <select
                                className={styles.lineItemInput}
                                value={item.productId}
                                onChange={(e) => handleLineItemChange(index, "productId", e.target.value)}
                                required
                            >
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}{p.skuCode ? ` (${p.skuCode})` : ""}</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                min="1"
                                className={styles.lineItemInput}
                                style={{ textAlign: "center" }}
                                value={item.quantity}
                                onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                            />

                            <div className={styles.inputSuffix}>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className={styles.lineItemInput}
                                    style={{ paddingRight: "44px" }}
                                    value={item.unitPrice}
                                    onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                                />
                                <span className={styles.suffixLabel}>VND</span>
                            </div>

                            <div className={styles.inputSuffix}>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className={styles.lineItemInput}
                                    style={{ paddingRight: "30px" }}
                                    placeholder="0"
                                    value={item.discountPercent}
                                    onChange={(e) => handleLineItemChange(index, "discountPercent", e.target.value)}
                                />
                                <span className={styles.suffixLabel}>%</span>
                            </div>

                            <button type="button" className={styles.btnRemoveLine} onClick={() => handleRemoveLineItem(index)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <button type="button" className={styles.addLineBtn} onClick={handleAddLineItem}>
                        <Plus size={15} /> Thêm sản phẩm
                    </button>
                </div>
            </form>
        </div>
    );
}
