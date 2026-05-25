import { quoteApi } from "../api/quote.api";
import { QuoteFilter, QuotePageResponse } from "../types/quote.type";

export const getQuotes = async (filters: QuoteFilter): Promise<QuotePageResponse> => {
    return quoteApi.getAll(filters);
};
