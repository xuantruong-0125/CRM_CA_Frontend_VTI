import { opportunityApi } from "../api/opportunity.api";
import { Opportunity } from "../types/opportunity.type";

export const getOpportunityById = async (id: number): Promise<Opportunity> => {
    return opportunityApi.getById(id);
};
