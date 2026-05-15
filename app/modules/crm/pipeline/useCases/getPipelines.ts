import { pipelineApi } from "../api/pipeline.api";
import { Pipeline } from "../types/pipeline.type";

export const getPipelines = async (): Promise<Pipeline[]> => {
    return pipelineApi.getAll();
};
