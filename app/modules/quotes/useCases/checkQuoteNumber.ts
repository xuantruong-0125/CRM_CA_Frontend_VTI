import { quoteApi } from "../api/quote.api";

export const checkQuoteNumber = async (number: string, excludeId?: number): Promise<boolean> => {
    const result = await quoteApi.checkQuoteNumber(number, excludeId);
    return result.exists;
};
