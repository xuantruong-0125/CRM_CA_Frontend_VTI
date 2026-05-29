import { Suspense } from 'react';
import ActivityForm from '@/modules/activity/components/ActivityForm';

export default function CreateActivityPage() {
  return (
    <Suspense fallback={<div>Đang tải form...</div>}>
      <ActivityForm />
    </Suspense>
  );
}