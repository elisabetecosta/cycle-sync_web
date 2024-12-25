"use client";

import React, { useState } from 'react';
import { useCycle } from '@/hooks/useCycle';
import { CycleCalendar } from '@/components/cycle/CycleCalendar';
import { CycleInfo } from '@/components/cycle/CycleInfo';

const Home = () => {
  const {
    periods,
    markPeriodStart,
    markPeriodEnd,
    deletePeriodMark,
    predictNextPeriod,
    getCurrentPhase,
    canMarkStart,
    canMarkEnd,
    isStartDate,
    isEndDate
  } = useCycle();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const currentPhase = getCurrentPhase();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4">
          <CycleCalendar
            periods={periods}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            predictNextPeriod={predictNextPeriod}
          />
        <CycleInfo
          selectedDate={selectedDate}
          currentPhase={currentPhase}
          canMarkStart={canMarkStart}
          canMarkEnd={canMarkEnd}
          isStartDate={isStartDate}
          isEndDate={isEndDate}
          markPeriodStart={markPeriodStart}
          markPeriodEnd={markPeriodEnd}
          deletePeriodMark={deletePeriodMark}
        />
      </div>
    </div>
  );
};

export default Home;