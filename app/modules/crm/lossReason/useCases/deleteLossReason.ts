import { lossReasonApi } from "../api/lossReason.api";

export const deleteLossReason = async (id: number): Promise<void> => {
    return lossReasonApi.delete(id);
};
