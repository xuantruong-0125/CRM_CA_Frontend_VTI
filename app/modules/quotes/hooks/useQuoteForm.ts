import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { customerApi } from "@/modules/customer/api/customer.api";
import {
    QuoteFormDataCustomer,
    QuoteFormDataProduct,
    QuoteFormDataTemplate,
    QuoteLineItemForm,
    QuotePayload,
} from "../types/quote.type";
import { getQuoteFormData } from "../useCases/getQuoteFormData";
import { getQuoteById } from "../useCases/getQuoteById";
import { createQuote } from "../useCases/createQuote";
import { updateQuote } from "../useCases/updateQuote";
import { checkQuoteNumber } from "../useCases/checkQuoteNumber";
import { quoteApi } from "../api/quote.api";

interface FormData {
    quoteNumber: string;
    customerId: number | "";
    statusId: number;
    currencyCode: string;
    exchangeRate: number;
    validUntil: string;
    templateId: number | "";
    lineItems: QuoteLineItemForm[];
}

const EMPTY_FORM: FormData = {
    quoteNumber: "",
    customerId: "",
    statusId: 1,
    currencyCode: "VND",
    exchangeRate: 1,
    validUntil: "",
    templateId: "",
    lineItems: [],
};

export const useQuoteForm = (mode: "create" | "edit", id?: number) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryCustomerId = searchParams.get("customerId");
    const isEdit = mode === "edit";

    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const [products, setProducts] = useState<QuoteFormDataProduct[]>([]);
    const [templates, setTemplates] = useState<QuoteFormDataTemplate[]>([]);
    const [customers, setCustomers] = useState<QuoteFormDataCustomer[]>([]);

    const [customerSearch, setCustomerSearch] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const { products: prod, templates: tmpl } = await getQuoteFormData();
                setProducts(prod);
                setTemplates(tmpl);
            } catch (err: any) {
                toast.error("Không thể tải danh sách sản phẩm: " + (err?.message || "Lỗi kết nối"));
            }

            if (isEdit && id) {
                try {
                    const quote = await getQuoteById(id);
                    if (quote.customerName) setCustomerSearch(quote.customerName);
                    setFormData({
                        quoteNumber: quote.quoteNumber,
                        customerId: quote.customerId ?? "",
                        statusId: quote.statusId ?? 1,
                        currencyCode: quote.currencyCode || "VND",
                        exchangeRate: quote.exchangeRate || 1,
                        validUntil: quote.validUntil
                            ? new Date(quote.validUntil).toISOString().split("T")[0]
                            : "",
                        templateId: quote.templateId ?? "",
                        lineItems: (quote.lineItems || []).map((item) => {
                            const lineSubTotal = item.quantity * item.unitPrice;
                            const discountPercent =
                                lineSubTotal > 0
                                    ? Math.round((item.discountValue / lineSubTotal) * 100)
                                    : 0;
                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                unitPrice: Math.round(item.unitPrice),
                                discountPercent,
                            };
                        }),
                    });
                } catch {
                    toast.error("Không thể tải dữ liệu báo giá");
                    router.push("/quotes");
                } finally {
                    setLoading(false);
                }
            }

            if (!isEdit && queryCustomerId) {
                try {
                    const cust = await customerApi.getCustomerById(Number(queryCustomerId));
                    if (cust) {
                        setCustomerSearch(cust.name);
                        setFormData((prev) => ({
                            ...prev,
                            customerId: Number(queryCustomerId),
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch customer for quote form", err);
                }
            }
        };
        init();
    }, []);

    // Debounce customer search
    useEffect(() => {
        if (
            customerSearch.trim().length < 1 ||
            (formData.customerId && customers.some((c) => c.name === customerSearch))
        ) {
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await quoteApi.searchCustomers(customerSearch);
                setCustomers(results || []);
                setShowResults(true);
            } catch {
                // ignore
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [customerSearch]);

    const handleAddLineItem = () => {
        const usedIds = new Set(
            formData.lineItems.map((item) => Number(item.productId)).filter(Boolean)
        );
        const availableProduct = products.find((p) => !usedIds.has(p.id));
        if (!availableProduct) {
            toast.warning("Tất cả sản phẩm đã được thêm vào báo giá!");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            lineItems: [
                ...prev.lineItems,
                {
                    productId: availableProduct.id,
                    quantity: 1,
                    unitPrice: availableProduct.price || 0,
                    discountPercent: 0,
                },
            ],
        }));
    };

    const handleRemoveLineItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index),
        }));
    };

    const handleLineItemChange = (
        index: number,
        field: keyof QuoteLineItemForm,
        value: string
    ) => {
        const newItems = [...formData.lineItems];
        if (field === "productId") {
            const isDuplicate = newItems.some(
                (item, i) => i !== index && Number(item.productId) === Number(value)
            );
            if (isDuplicate) {
                toast.warning("Sản phẩm này đã được thêm vào danh sách!");
                return;
            }
            const product = products.find((p) => p.id === Number(value));
            if (product) {
                newItems[index] = { ...newItems[index], unitPrice: product.price || 0 };
            }
        }

        let safeValue: number | string = value;
        if (field === "quantity") {
            safeValue = value === "" ? "" : Math.max(1, parseFloat(value) || 1);
        } else if (field === "unitPrice" || field === "discountPercent") {
            safeValue = value === "" ? "" : Math.max(0, parseFloat(value) || 0);
        }

        (newItems[index] as any)[field] = field === "productId" ? Number(value) : safeValue;
        setFormData((prev) => ({ ...prev, lineItems: newItems }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerId) {
            toast.warning("Vui lòng chọn khách hàng");
            return;
        }
        const validItems = formData.lineItems.filter(
            (item) => item.productId !== "" && item.productId
        );
        if (validItems.length === 0) {
            toast.warning("Vui lòng thêm ít nhất một sản phẩm vào báo giá!");
            return;
        }
        const productIds = validItems.map((item) => Number(item.productId));
        if (productIds.length !== new Set(productIds).size) {
            toast.warning("Báo giá có sản phẩm bị trùng! Vui lòng kiểm tra lại.");
            return;
        }

        if (isEdit && formData.quoteNumber && id) {
            const exists = await checkQuoteNumber(formData.quoteNumber, id);
            if (exists) {
                toast.warning("Mã báo giá đã tồn tại!");
                return;
            }
        }

        setSaving(true);
        try {
            const lineItemsPayload = validItems.map((item) => {
                const qty = Math.max(1, Number(item.quantity) || 1);
                const price = Math.max(0, Math.round(Number(item.unitPrice) || 0));
                const pct = Math.max(0, Math.min(100, Number(item.discountPercent) || 0));
                const absDiscount = Math.round(qty * price * (pct / 100));
                return {
                    productId: Number(item.productId),
                    quantity: qty,
                    unitPrice: price,
                    discountValue: absDiscount,
                };
            });

            const totalAmount = lineItemsPayload.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity - item.discountValue,
                0
            );

            const payload: QuotePayload = {
                quoteNumber: formData.quoteNumber,
                customerId: formData.customerId ? Number(formData.customerId) : null,
                statusId: formData.statusId ? Number(formData.statusId) : 1,
                currencyCode: formData.currencyCode,
                exchangeRate: Number(formData.exchangeRate) || 1,
                validUntil: formData.validUntil || null,
                templateId: formData.templateId ? Number(formData.templateId) : null,
                totalAmount,
                lineItems: lineItemsPayload,
            };

            if (isEdit && id) {
                await updateQuote(id, payload);
                toast.success("Cập nhật báo giá thành công");
            } else {
                await createQuote(payload);
                toast.success("Tạo báo giá thành công");
            }
            router.push("/quotes");
        } catch (err: any) {
            toast.error("Lỗi khi lưu: " + (err?.message || "Thao tác thất bại"));
        } finally {
            setSaving(false);
        }
    };

    const subTotal = formData.lineItems.reduce(
        (acc, curr) => acc + Number(curr.quantity || 0) * Number(curr.unitPrice || 0),
        0
    );
    const totalDiscount = formData.lineItems.reduce((acc, curr) => {
        const lineSubTotal = Number(curr.quantity || 0) * Number(curr.unitPrice || 0);
        return acc + lineSubTotal * (Number(curr.discountPercent || 0) / 100);
    }, 0);
    const totalAmount = Math.round(subTotal - totalDiscount);

    return {
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
    };
};
