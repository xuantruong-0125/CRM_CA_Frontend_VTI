import { useEffect, useState } from "react";
import { Quote, QuoteFilter, QuotePageResponse, QuotePayload } from "../types/quote.type";
import { getQuotes } from "../useCases/getQuotes";
import { deleteQuote } from "../useCases/deleteQuote";

export const useQuote = () => {
    const [data, setData] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState<QuoteFilter>({});
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalElements: 0,
        currentPage: 1,
    });

    const fetchData = async (f = filters, page = currentPage, size = itemsPerPage) => {
        try {
            setLoading(true);
            const apiFilters: QuoteFilter = { ...f };
            if (apiFilters.fromDate) apiFilters.fromDate = `${apiFilters.fromDate}T00:00:00`;
            if (apiFilters.toDate) apiFilters.toDate = `${apiFilters.toDate}T23:59:59`;

            const res: QuotePageResponse = await getQuotes({ ...apiFilters, page, size });
            setData(res.data || []);
            setPagination({
                totalPages: res.totalPages || 1,
                totalElements: res.totalElements || 0,
                currentPage: page,
            });
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(filters, currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    const applyFilter = (newFilters: QuoteFilter) => {
        setCurrentPage(1);
        setFilters(newFilters);
        fetchData(newFilters, 1, itemsPerPage);
    };

    const resetFilter = () => {
        const reset: QuoteFilter = { sort: "id,desc" };
        setCurrentPage(1);
        setFilters(reset);
        fetchData(reset, 1, itemsPerPage);
    };

    const remove = async (id: number): Promise<void> => {
        await deleteQuote(id);
        await fetchData(filters, currentPage, itemsPerPage);
    };

    return {
        data,
        loading,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        pagination,
        filters,
        applyFilter,
        resetFilter,
        remove,
        refresh: () => fetchData(filters, currentPage, itemsPerPage),
    };
};
