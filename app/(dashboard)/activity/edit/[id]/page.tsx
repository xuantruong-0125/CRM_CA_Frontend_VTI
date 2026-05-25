"use client";
import ActivityForm from '@/modules/activity/components/ActivityForm';
import { useParams } from 'next/navigation';

export default function EditActivityPage() {
  const params = useParams();
  const id = Number(params.id);

  return <ActivityForm id={id} />;
}