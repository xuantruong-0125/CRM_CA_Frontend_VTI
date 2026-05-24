import { useEffect, useState } from "react";
import { Opportunity, OpportunityFilter, OpportunityPageResponse } from "../types/opportunity.type";
import { getOpportunities } from "../useCases/getOpportunities";
import { deleteOpportunity } from "../useCases/deleteOpportunity";

export const useOpportunity = () => {
    const [data, setData] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [filters, setFilters] = useState<OpportunityFilter>({});
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalElements: 0,
        currentPage: 1,
    });

    const fetchData = async (f = filters, page = currentPage, size = itemsPerPage) => {
        try {
            setLoading(true);
            const res: OpportunityPageResponse = await getOpportunities({ ...f, page, size });
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
    }, [currentPage]);

    const applyFilter = (newFilters: OpportunityFilter) => {
        setCurrentPage(1);
        setFilters(newFilters);
        fetchData(newFilters, 1, itemsPerPage);
    };

    const resetFilter = () => {
        const reset: OpportunityFilter = {};
        setCurrentPage(1);
        setFilters(reset);
        fetchData(reset, 1, itemsPerPage);
    };

    const remove = async (id: number): Promise<void> => {
        await deleteOpportunity(id);
        await fetchData(filters, currentPage, itemsPerPage);
    };

    return {
        data,
        loading,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        pagination,
        filters,
        applyFilter,
        resetFilter,
        remove,
        refresh: () => fetchData(filters, currentPage, itemsPerPage),
    };
};
