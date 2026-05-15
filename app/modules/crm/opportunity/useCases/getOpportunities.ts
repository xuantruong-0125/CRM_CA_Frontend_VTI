import { opportunityApi } from "../api/opportunity.api";
import { OpportunityFilter, OpportunityPageResponse } from "../types/opportunity.type";

export const getOpportunities = async (filters: OpportunityFilter): Promise<OpportunityPageResponse> => {
    return opportunityApi.getAll(filters);
};
