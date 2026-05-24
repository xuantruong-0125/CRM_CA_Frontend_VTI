import { opportunityApi } from "../api/opportunity.api";

export const deleteOpportunity = async (id: number): Promise<void> => {
    return opportunityApi.delete(id);
};
