export interface PipelineStage {
    id: number;
    stageName: string;
    probability: number;
    maxDaysAllowed: number;
    sortOrder: number;
    pipelineId: number;
    pipelineName?: string;
}

export interface PipelineStagePayload {
    stageName: string;
    probability: number | '';
    maxDaysAllowed: number | '';
    sortOrder: number | '';
    pipelineId: number | '';
}
