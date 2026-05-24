import { quoteApi } from "../api/quote.api";
import { Quote, QuotePayload } from "../types/quote.type";

export const createQuote = async (payload: QuotePayload): Promise<Quote> => {
    return quoteApi.create(payload);
};
