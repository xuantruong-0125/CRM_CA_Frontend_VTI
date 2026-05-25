// app/(dashboard)/kpi-configs/[id]/page.tsx

'use client';

import { use } from "react";
import { KpiConfigPage } from "@/modules/kpi-config";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <KpiConfigPage id={id} />;
}
