export type HealthStatus = "ON_TRACK" | "AT_RISK" | "OFF_TRACK";

export interface Opportunity {
    id: number;
    name: string;
    customerId: number | null;
    customerName?: string;
    assignedUserId: number | null;
    assignedUserName?: string;
    pipelineId: number | null;
    pipelineName?: string;
    stageId: number | null;
    stageName?: string;
    lossReasonId: number | null;
    lossReasonName?: string;
    totalAmount: number | null;
    depositAmount: number | null;
    remainingAmount: number | null;
    currencyCode: string;
    exchangeRate: number;
    healthStatus: HealthStatus;
    expectedCloseDate: string | null;
}

export interface OpportunityPayload {
    name: string;
    customerId: number | null;
    assignedUserId: number | null;
    pipelineId: number | null;
    stageId: number | null;
    lossReasonId: number | null;
    totalAmount: number | null;
    depositAmount: number | null;
    currencyCode: string;
    exchangeRate: number | null;
    healthStatus: HealthStatus;
    expectedCloseDate: string | null;
}

export interface OpportunityFilter {
    keyword?: string;
    pipelineId?: number | string;
    stageId?: number | string;
    healthStatus?: HealthStatus | "";
    dateFrom?: string;
    dateTo?: string;
    sortField?: string;
    sortDir?: "asc" | "desc";
    page?: number;
    size?: number;
}

export interface OpportunityPageResponse {
    data: Opportunity[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    pageSize: number;
}

export interface OpportunityFormState {
    id: number | null;
    name: string;
    customerId: string;
    assignedUserId: string;
    pipelineId: string;
    stageId: string;
    lossReasonId: string;
    totalAmount: string;
    depositAmount: string;
    currencyCode: string;
    exchangeRate: number;
    healthStatus: HealthStatus;
    expectedCloseDate: string;
}
