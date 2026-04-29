import LeadDetailPage from "@/modules/lead/components/LeadDetailPage";

type LeadDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailRoute({ params }: LeadDetailRouteProps) {
  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id, 10);

  if (Number.isNaN(id)) {
    return <p className="p-6 text-sm text-red-600">Lead id khong hop le.</p>;
  }

  return <LeadDetailPage id={id} />;
}
