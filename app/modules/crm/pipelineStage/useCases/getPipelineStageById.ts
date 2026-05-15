import { pipelineStageApi } from "../api/pipelineStage.api";
import { PipelineStage } from "../types/pipelineStage.type";

export const getPipelineStageById = async (id: number): Promise<PipelineStage> => {
    return pipelineStageApi.getById(id);
};
