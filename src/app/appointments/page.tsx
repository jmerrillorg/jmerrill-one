// app/appointments/page.tsx
import { Suspense } from 'react';
import SchedulePageInner from './SchedulePageInner';

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-gray-500">Loading scheduler…</div>}>
      <SchedulePageInner />
    </Suspense>
  );
}