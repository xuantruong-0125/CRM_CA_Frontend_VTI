import { pipelineStageApi } from "../api/pipelineStage.api";
import { PipelineStage } from "../types/pipelineStage.type";

export const getPipelineStages = async (pipelineId?: number): Promise<PipelineStage[]> => {
    return pipelineStageApi.getAll(pipelineId);
};
