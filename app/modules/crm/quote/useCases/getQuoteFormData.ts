import { quoteApi } from "../api/quote.api";
import { QuoteFormDataCustomer, QuoteFormDataProduct, QuoteFormDataTemplate } from "../types/quote.type";

export const getQuoteFormData = async (): Promise<{
    products: QuoteFormDataProduct[];
    templates: QuoteFormDataTemplate[];
}> => {
    const [products, templates] = await Promise.all([
        quoteApi.getFormProducts().catch(() => []),
        quoteApi.getFormTemplates().catch(() => []),
    ]);
    return { products, templates };
};
