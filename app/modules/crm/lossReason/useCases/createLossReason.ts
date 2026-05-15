import { lossReasonApi } from "../api/lossReason.api";
import { LossReason, LossReasonPayload } from "../types/lossReason.type";

export const createLossReason = async (payload: LossReasonPayload): Promise<LossReason> => {
    return lossReasonApi.create(payload);
};
