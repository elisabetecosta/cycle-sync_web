import { useState } from 'react';
import { Period, CyclePhase } from '@/types';
import { calculateCyclePhases, predictNextPeriod } from '@/utils/cycleCalculations';

export function useCycleTracker() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [markingPeriod, setMarkingPeriod] = useState<'start' | 'end' | null>(null);
  const [tempPeriod, setTempPeriod] = useState<Period | null>(null);

  const cyclePhases = calculateCyclePhases(periods);
  const nextPeriod = predictNextPeriod(periods);

  const handleMarkPeriod = (selectedDate: Date) => {
    if (markingPeriod === null) {
      setTempPeriod({ start: selectedDate, end: null });
      setMarkingPeriod('end');
    } else if (markingPeriod === 'end' && tempPeriod) {
      const newPeriod = { ...tempPeriod, end: selectedDate };
      setPeriods([...periods, newPeriod]);
      setTempPeriod(null);
      setMarkingPeriod(null);
    }
  };

  const removePeriod = (date: Date) => {
    setPeriods(periods.filter(period => 
      !(period.start <= date && (!period.end || period.end >= date))
    ));
    setMarkingPeriod(null);
    setTempPeriod(null);
  };

  return {
    periods,
    markingPeriod,
    tempPeriod,
    cyclePhases,
    nextPeriod,
    handleMarkPeriod,
    removePeriod,
  };
}