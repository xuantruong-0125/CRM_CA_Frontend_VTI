import { quoteApi } from "../api/quote.api";

export const deleteQuote = async (id: number): Promise<void> => {
    return quoteApi.delete(id);
};
