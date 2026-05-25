// app/modules/kpi-config/useCases/kpiConfigUseCase.ts
import { kpiConfigApi } from "../api/kpi-config.api";
import { KpiConfigPayload, KpiConfig } from "../types/kpi-config.type";

export const kpiConfigUseCase = {
  getById: async (id: number): Promise<KpiConfig | undefined> => {
    const response = await kpiConfigApi.findAll("", 0, 1000);
    return response.content.find((c: KpiConfig) => c.id === id);
  },

  save: async (id: number | null, payload: KpiConfigPayload) => {
    if (id) {
      return await kpiConfigApi.update(id, payload);
    } else {
      return await kpiConfigApi.create(payload);
    }
  }
};
