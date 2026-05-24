import { quoteApi } from "../api/quote.api";
import { Quote } from "../types/quote.type";

export const getQuoteById = async (id: number): Promise<Quote> => {
    return quoteApi.getById(id);
};
