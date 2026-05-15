import { pipelineStageApi } from "../api/pipelineStage.api";

export const deletePipelineStage = async (id: number): Promise<void> => {
    return pipelineStageApi.delete(id);
};
