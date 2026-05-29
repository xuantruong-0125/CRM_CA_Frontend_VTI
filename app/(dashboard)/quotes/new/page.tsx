import { Suspense } from 'react';
import QuoteFormPage from "@/modules/quotes/QuoteFormPage";

export default function QuoteNewRoute() {
    return (
        <Suspense fallback={<div>Đang tải form báo giá...</div>}>
            <QuoteFormPage mode="create" />
        </Suspense>
    );
}
