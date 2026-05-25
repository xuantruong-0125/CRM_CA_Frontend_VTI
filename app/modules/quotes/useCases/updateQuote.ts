import { quoteApi } from "../api/quote.api";
import { Quote, QuotePayload } from "../types/quote.type";

export const updateQuote = async (id: number, payload: QuotePayload): Promise<Quote> => {
    return quoteApi.update(id, payload);
};
