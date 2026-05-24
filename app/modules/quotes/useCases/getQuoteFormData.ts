import { quoteApi } from "../api/quote.api";
import {
    QuoteFormDataProduct,
    QuoteFormDataTemplate,
    ProductApiResponse,
} from "../types/quote.type";

const toFormProduct = (p: ProductApiResponse): QuoteFormDataProduct => ({
    id: Number(p.id),
    name: p.name,
    skuCode: p.skuCode,
    price: p.finalPrice ? Number(p.finalPrice) : 0,
});

export const getQuoteFormData = async (): Promise<{
    products: QuoteFormDataProduct[];
    templates: QuoteFormDataTemplate[];
}> => {
    const [rawProducts, templates] = await Promise.all([
        quoteApi.getFormProducts(),
        quoteApi.getFormTemplates().catch(() => []),
    ]);
    return { products: rawProducts.map(toFormProduct), templates };
};
