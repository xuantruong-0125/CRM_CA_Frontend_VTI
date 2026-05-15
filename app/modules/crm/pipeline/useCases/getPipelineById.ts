import { pipelineApi } from "../api/pipeline.api";
import { Pipeline } from "../types/pipeline.type";

export const getPipelineById = async (id: number): Promise<Pipeline> => {
    return pipelineApi.getById(id);
};
