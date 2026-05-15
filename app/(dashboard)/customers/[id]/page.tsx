import CustomerDetailPage from "@/modules/customer/components/CustomerDetailPage";

type CustomerDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailRoute({ params }: CustomerDetailRouteProps) {
  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id, 10);

  if (Number.isNaN(id)) {
    return <p className="p-6 text-sm text-red-600">Customer id không hợp lệ.</p>;
  }

  return <CustomerDetailPage id={id} />;
}
