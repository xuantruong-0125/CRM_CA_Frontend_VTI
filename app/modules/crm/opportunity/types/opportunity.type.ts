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
    totalAmount: number | null;
    depositAmount: number | null;
    remainingAmount?: number | null;
    currencyCode: string;
    exchangeRate: number;
    healthStatus: HealthStatus;
    expectedCloseDate: string;
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
    exchangeRate: number;
    healthStatus: HealthStatus;
    expectedCloseDate: string;
}

export interface OpportunityFilter {
    keyword?: string;
    customerId?: number;
    assignedUserId?: number;
    pipelineId?: number;
    stageId?: number;
    healthStatus?: HealthStatus;
    dateFrom?: string;
    dateTo?: string;
    sortField?: string;
    sortDir?: string;
    page?: number;
    size?: number;
}

export interface OpportunityPageResponse {
    data: Opportunity[];
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
