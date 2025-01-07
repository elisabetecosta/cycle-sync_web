"use client"

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { CycleCalendar } from '@/components/CycleCalendar';
import { CycleInfo } from '@/components/CycleInfo';

import { useCycleTracker } from '@/hooks/useCycleTracker';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const {
    periods,
    markingPeriod,
    tempPeriod,
    cyclePhases,
    nextPeriod,
    handleMarkPeriod,
    removePeriod,
  } = useCycleTracker();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const onMarkPeriod = () => {
    handleMarkPeriod(selectedDate);
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-background py-8">
      <div className="w-full">
        <PageHeader Icon={CalendarIcon} title="Cycle Calendar" />
      </div>
      <div className="w-full max-w-3xl flex flex-col items-center gap-4">
        <div className="w-full">
          <CycleCalendar
            periods={periods}
            tempPeriod={tempPeriod}
            cyclePhases={cyclePhases}
            nextPeriod={nextPeriod}
            markingPeriod={markingPeriod}
            onDateSelect={handleDateSelect}
            onMarkPeriod={onMarkPeriod}
            selectedDate={selectedDate}
            removePeriod={removePeriod}
          />
        </div>
        <div className="w-full">
          <CycleInfo
            cyclePhases={cyclePhases}
            nextPeriod={nextPeriod}
            selectedDate={selectedDate}
            periods={periods}
          />
        </div>
      </div>
    </main>
  );
}