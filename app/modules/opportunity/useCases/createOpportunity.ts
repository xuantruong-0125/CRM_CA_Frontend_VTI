import { opportunityApi } from "../api/opportunity.api";
import { Opportunity, OpportunityPayload } from "../types/opportunity.type";

export const createOpportunity = async (payload: OpportunityPayload): Promise<Opportunity> => {
    return opportunityApi.create(payload);
};
