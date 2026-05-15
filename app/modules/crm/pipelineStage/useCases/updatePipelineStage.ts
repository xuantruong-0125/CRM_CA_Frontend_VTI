import { pipelineStageApi } from "../api/pipelineStage.api";
import { PipelineStage, PipelineStagePayload } from "../types/pipelineStage.type";

export const updatePipelineStage = async (id: number, payload: PipelineStagePayload): Promise<PipelineStage> => {
    return pipelineStageApi.update(id, payload);
};
