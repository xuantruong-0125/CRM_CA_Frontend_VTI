export interface PipelineStage {
    id: number;
    stageName: string;
    pipelineId: number;
    pipelineName?: string;
    probability: number | null;
    maxDaysAllowed: number | null;
    sortOrder: number | null;
}

export interface PipelineStagePayload {
    stageName: string;
    pipelineId: number | null;
    probability: number | null;
    maxDaysAllowed: number | null;
    sortOrder: number | null;
}
