export type QuoteStatusId = 1 | 2 | 3 | 4;

export interface QuoteLineItem {
    productId: number;
    quantity: number;
    unitPrice: number;
    discountValue: number;
    productName?: string;
}

export interface QuoteLineItemForm {
    productId: number | "";
    quantity: number | "";
    unitPrice: number | "";
    discountPercent: number | "";
}

export interface Quote {
    id: number;
    quoteNumber: string;
    customerId: number | null;
    customerName?: string;
    statusId: QuoteStatusId;
    currencyCode: string;
    exchangeRate: number;
    validUntil: string | null;
    templateId: number | null;
    templateName?: string;
    totalAmount: number;
    lineItems: QuoteLineItem[];
    createdAt?: string;
}

export interface QuotePayload {
    quoteNumber: string;
    customerId: number | null;
    statusId: number;
    currencyCode: string;
    exchangeRate: number;
    validUntil: string | null;
    templateId: number | null;
    totalAmount: number;
    lineItems: QuoteLineItem[];
}

export interface QuoteFilter {
    keyword?: string;
    customerId?: number;
    statusId?: number;
    quoteNumber?: string;
    fromDate?: string;
    toDate?: string;
    sort?: string;
    page?: number;
    size?: number;
}

export interface QuotePageResponse {
    data: Quote[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    pageSize: number;
}

export interface QuoteFormDataCustomer {
    id: number;
    name: string;
    customerCode?: string;
}

export interface QuoteFormDataProduct {
    id: number;
    name: string;
    price: number;
    skuCode?: string;
}

export interface QuoteFormDataTemplate {
    id: number;
    name: string;
}
