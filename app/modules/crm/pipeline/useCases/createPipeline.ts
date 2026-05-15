import { pipelineApi } from "../api/pipeline.api";
import { Pipeline, PipelinePayload } from "../types/pipeline.type";

export const createPipeline = async (payload: PipelinePayload): Promise<Pipeline> => {
    return pipelineApi.create(payload);
};
