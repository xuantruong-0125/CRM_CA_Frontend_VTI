import { pipelineApi } from "../api/pipeline.api";

export const deletePipeline = async (id: number): Promise<void> => {
    return pipelineApi.delete(id);
};
