import { lossReasonApi } from "../api/lossReason.api";
import { LossReason } from "../types/lossReason.type";

export const getLossReasonById = async (id: number): Promise<LossReason> => {
    return lossReasonApi.getById(id);
};
