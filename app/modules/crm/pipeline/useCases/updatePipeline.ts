import { pipelineApi } from "../api/pipeline.api";
import { Pipeline, PipelinePayload } from "../types/pipeline.type";

export const updatePipeline = async (id: number, payload: PipelinePayload): Promise<Pipeline> => {
    return pipelineApi.update(id, payload);
};
