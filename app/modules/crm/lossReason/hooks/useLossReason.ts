import { useEffect, useState } from "react";
import { LossReason, LossReasonPayload } from "../types/lossReason.type";
import { getLossReasons } from "../useCases/getLossReasons";
import { getLossReasonById } from "../useCases/getLossReasonById";
import { createLossReason } from "../useCases/createLossReason";
import { updateLossReason } from "../useCases/updateLossReason";
import { deleteLossReason } from "../useCases/deleteLossReason";

export const useLossReason = () => {
    const [data, setData] = useState<LossReason[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getLossReasons();
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

    const getById = async (id: number): Promise<LossReason> => {
        return getLossReasonById(id);
    };

    const create = async (payload: LossReasonPayload): Promise<void> => {
        await createLossReason(payload);
        await fetchData();
    };

    const update = async (id: number, payload: LossReasonPayload): Promise<void> => {
        await updateLossReason(id, payload);
        await fetchData();
    };

    const remove = async (id: number): Promise<void> => {
        await deleteLossReason(id);
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
