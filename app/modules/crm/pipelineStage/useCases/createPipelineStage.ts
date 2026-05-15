import { pipelineStageApi } from "../api/pipelineStage.api";
import { PipelineStage, PipelineStagePayload } from "../types/pipelineStage.type";

export const createPipelineStage = async (payload: PipelineStagePayload): Promise<PipelineStage> => {
    return pipelineStageApi.create(payload);
};
