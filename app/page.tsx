import { CalendarIcon } from 'lucide-react';
import { CycleCalendar } from '@/components/CycleCalendar';
import { PageHeader } from '@/components/PageHeader';

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container">
        <PageHeader Icon={CalendarIcon} title="Cycle Calendar" />
        <CycleCalendar />
      </div>
    </main>
  );
}
