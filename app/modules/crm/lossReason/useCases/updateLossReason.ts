import { lossReasonApi } from "../api/lossReason.api";
import { LossReason, LossReasonPayload } from "../types/lossReason.type";

export const updateLossReason = async (id: number, payload: LossReasonPayload): Promise<LossReason> => {
    return lossReasonApi.update(id, payload);
};
