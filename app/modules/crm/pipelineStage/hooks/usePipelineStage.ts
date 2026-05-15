import { useEffect, useState } from "react";
import { PipelineStage, PipelineStagePayload } from "../types/pipelineStage.type";
import { getPipelineStages } from "../useCases/getPipelineStages";
import { getPipelineStageById } from "../useCases/getPipelineStageById";
import { createPipelineStage } from "../useCases/createPipelineStage";
import { updatePipelineStage } from "../useCases/updatePipelineStage";
import { deletePipelineStage } from "../useCases/deletePipelineStage";

export const usePipelineStage = () => {
    const [data, setData] = useState<PipelineStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterPipelineId, setFilterPipelineId] = useState<number | undefined>(undefined);

    const fetchData = async (pipelineId?: number) => {
        try {
            setLoading(true);
            const result = await getPipelineStages(pipelineId);
            setData(Array.isArray(result) ? result : []);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(filterPipelineId);
    }, [filterPipelineId]);

    const getById = async (id: number): Promise<PipelineStage> => {
        return getPipelineStageById(id);
    };

    const create = async (payload: PipelineStagePayload): Promise<void> => {
        await createPipelineStage(payload);
        await fetchData(filterPipelineId);
    };

    const update = async (id: number, payload: PipelineStagePayload): Promise<void> => {
        await updatePipelineStage(id, payload);
        await fetchData(filterPipelineId);
    };

    const remove = async (id: number): Promise<void> => {
        await deletePipelineStage(id);
        await fetchData(filterPipelineId);
    };

    return {
        data,
        loading,
        filterPipelineId,
        setFilterPipelineId,
        getById,
        create,
        update,
        remove,
        refresh: () => fetchData(filterPipelineId),
    };
};
