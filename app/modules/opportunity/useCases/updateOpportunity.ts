import { opportunityApi } from "../api/opportunity.api";
import { Opportunity, OpportunityPayload } from "../types/opportunity.type";

export const updateOpportunity = async (id: number, payload: OpportunityPayload): Promise<Opportunity> => {
    return opportunityApi.update(id, payload);
};
