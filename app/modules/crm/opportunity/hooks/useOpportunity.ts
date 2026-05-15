import { useCallback, useEffect, useState } from "react";
import { Opportunity, OpportunityFilter, OpportunityPageResponse, OpportunityPayload } from "../types/opportunity.type";
import { getOpportunities } from "../useCases/getOpportunities";
import { getOpportunityById } from "../useCases/getOpportunityById";
import { createOpportunity } from "../useCases/createOpportunity";
import { updateOpportunity } from "../useCases/updateOpportunity";
import { deleteOpportunity } from "../useCases/deleteOpportunity";

export const useOpportunity = () => {
    const [data, setData] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<OpportunityFilter>({});
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
    });

    const fetchData = useCallback(async (currentPage = page, currentFilters = filters) => {
        try {
            setLoading(true);
            const res: OpportunityPageResponse = await getOpportunities({
                ...currentFilters,
                page: currentPage,
                size: 20,
            });

            if (res && Array.isArray(res.data)) {
                setData(res.data);
                setPagination({
                    currentPage: res.currentPage,
                    totalPages: res.totalPages,
                    totalElements: res.totalElements,
                    hasNext: res.hasNext,
                    hasPrevious: res.hasPrevious,
                });
            } else {
                setData([]);
            }
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchData(page, filters);
    }, [page, filters]);

    const applyFilter = (newFilters: OpportunityFilter) => {
        setPage(1);
        setFilters(newFilters);
    };

    const clearFilter = () => {
        setPage(1);
        setFilters({});
    };

    const getById = async (id: number): Promise<Opportunity> => {
        return getOpportunityById(id);
    };

    const create = async (payload: OpportunityPayload): Promise<void> => {
        await createOpportunity(payload);
        await fetchData(page, filters);
    };

    const update = async (id: number, payload: OpportunityPayload): Promise<void> => {
        await updateOpportunity(id, payload);
        await fetchData(page, filters);
    };

    const remove = async (id: number): Promise<void> => {
        await deleteOpportunity(id);
        if (data.length === 1 && page > 1) {
            setPage(page - 1);
        } else {
            await fetchData(page, filters);
        }
    };

    return {
        data,
        loading,
        page,
        setPage,
        pagination,
        filters,
        applyFilter,
        clearFilter,
        getById,
        create,
        update,
        remove,
        refresh: () => fetchData(page, filters),
    };
};
