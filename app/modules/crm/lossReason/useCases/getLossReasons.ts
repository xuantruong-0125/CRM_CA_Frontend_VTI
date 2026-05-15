import { lossReasonApi } from "../api/lossReason.api";
import { LossReason } from "../types/lossReason.type";

export const getLossReasons = async (): Promise<LossReason[]> => {
    return lossReasonApi.getAll();
};
