import { useMemo, useState } from 'react';
import { useMemo, useState } from 'react';
import { Period, CyclePhase } from '@/types';
import { calculateCyclePhases, predictNextPeriod } from '@/utils/cycleCalculations';

export function useCycleTracker() {

  const [periods, setPeriods] = useState<Period[]>([]);
  const [markingPeriod, setMarkingPeriod] = useState<'start' | 'end' | null>(null);
  const [tempPeriod, setTempPeriod] = useState<Period | null>(null);

  const handleMarkPeriod = (selectedDate: Date) => {
    
    // Create a new Date object and set time to midnight (00:00:00)
    // This ensures that date comparisons only consider the date part,
    // not the time part, preventing timezone-related issues
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(0, 0, 0, 0);
    
    if (markingPeriod === null) {
      const newTempPeriod = { start: normalizedDate, end: null };
      setTempPeriod(newTempPeriod);
      const newTempPeriod = { start: normalizedDate, end: null };
      setTempPeriod(newTempPeriod);
      setMarkingPeriod('end');
    } else if (markingPeriod === 'end' && tempPeriod) {
      // Normalize the end date in the same way to maintain consistency
      const normalizedEndDate = new Date(normalizedDate);
      normalizedEndDate.setHours(0, 0, 0, 0);
      
      // Create new Date objects to avoid any reference issues
      // and ensure both dates are normalized
      const newPeriod = { 
        start: new Date(tempPeriod.start),
        end: normalizedEndDate 
      };
      
      setPeriods(prevPeriods => [...prevPeriods, newPeriod]);
      setTempPeriod(null);
      setMarkingPeriod(null);
    }
  };

  const cyclePhases = useMemo(() => {
    return calculateCyclePhases(periods);
  }, [periods]);

  const removePeriod = (date: Date) => {
    setPeriods(periods.filter(period =>
    setPeriods(periods.filter(period =>
      !(period.start <= date && (!period.end || period.end >= date))
    ));
    setMarkingPeriod(null);
    setTempPeriod(null);
  };

  const cyclePhases = useMemo(() => {
    return calculateCyclePhases(periods);
  }, [periods]);

  return {
    periods,
    markingPeriod,
    tempPeriod,
    cyclePhases,
    nextPeriod: predictNextPeriod(periods),
    nextPeriod: predictNextPeriod(periods),
    handleMarkPeriod,
    removePeriod,
  };
}