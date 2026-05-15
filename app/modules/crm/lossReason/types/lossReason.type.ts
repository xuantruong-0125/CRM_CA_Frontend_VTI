export interface LossReason {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
}

export interface LossReasonPayload {
    name: string;
    description: string;
    isActive: boolean;
}
