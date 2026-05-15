import { useEffect, useState } from "react";
import { Pipeline, PipelinePayload } from "../types/pipeline.type";
import { getPipelines } from "../useCases/getPipelines";
import { getPipelineById } from "../useCases/getPipelineById";
import { createPipeline } from "../useCases/createPipeline";
import { updatePipeline } from "../useCases/updatePipeline";
import { deletePipeline } from "../useCases/deletePipeline";

export const usePipeline = () => {
    const [data, setData] = useState<Pipeline[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getPipelines();
            setData(Array.isArray(result) ? result : []);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getById = async (id: number): Promise<Pipeline> => {
        return getPipelineById(id);
    };

    const create = async (payload: PipelinePayload): Promise<void> => {
        await createPipeline(payload);
        await fetchData();
    };

    const update = async (id: number, payload: PipelinePayload): Promise<void> => {
        await updatePipeline(id, payload);
        await fetchData();
    };

    const remove = async (id: number): Promise<void> => {
        await deletePipeline(id);
        await fetchData();
    };

    return {
        data,
        loading,
        getById,
        create,
        update,
        remove,
        refresh: fetchData,
    };
};
