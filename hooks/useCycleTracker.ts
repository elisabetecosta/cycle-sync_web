import { useState, useMemo, useEffect } from 'react';
import { Period } from '@/types';
import { calculateCyclePhases, predictNextPeriod } from '@/utils/cycleCalculations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { compareDesc, isSameDay, addDays } from 'date-fns';

export function useCycleTracker() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [markingPeriod, setMarkingPeriod] = useState<'start' | 'end' | null>(null);
  const [tempPeriod, setTempPeriod] = useState<Period | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPeriods();
    }
  }, [user]);

  const fetchPeriods = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching periods:', error);
    } else {
      setPeriods(data.map(period => ({
        start: new Date(period.start_date),
        end: period.end_date ? new Date(period.end_date) : null
      })));
    }
  };

  const savePeriod = async (period: Period) => {
    if (!user) return;

    const { error } = await supabase
      .from('periods')
      .insert({
        user_id: user.id,
        start_date: period.start.toISOString(),
        end_date: period.end ? period.end.toISOString() : null
      });

    if (error) {
      console.error('Error saving period:', error);
    } else {
      await fetchPeriods();
    }
  };

  const handleMarkPeriod = async (selectedDate: Date) => {
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(0, 0, 0, 0);

    // Check if the selected date is the day after an existing period's end date
    const existingPeriod = periods.find(period => 
      period.end && isSameDay(addDays(period.end, 1), normalizedDate)
    );

    if (existingPeriod) {
      // Extend the existing period
      const { error } = await supabase
        .from('periods')
        .update({ end_date: normalizedDate.toISOString() })
        .eq('user_id', user.id)
        .eq('start_date', existingPeriod.start.toISOString());

      if (error) {
        console.error('Error extending period:', error);
      } else {
        await fetchPeriods();
      }
      setMarkingPeriod(null);
      setTempPeriod(null);
    } else if (markingPeriod === null) {
      // Start a new period
      const newTempPeriod = { start: normalizedDate, end: null };
      setTempPeriod(newTempPeriod);
      setMarkingPeriod('end');
    } else if (markingPeriod === 'end' && tempPeriod) {
      // Finish marking a new period
      const normalizedEndDate = new Date(normalizedDate);
      normalizedEndDate.setHours(0, 0, 0, 0);

      const newPeriod = {
        start: new Date(tempPeriod.start),
        end: normalizedEndDate
      };

      await savePeriod(newPeriod);
      setTempPeriod(null);
      setMarkingPeriod(null);
    }
  };

  const cyclePhases = useMemo(() => {
    const sortedPeriods = [...periods].sort((a, b) => compareDesc(a.start, b.start));
    return calculateCyclePhases(sortedPeriods);
  }, [periods]);

  const removePeriod = async (date: Date) => {
    if (!user) return;

    const periodToUpdate = periods.find(period => 
      (period.start <= date && (!period.end || period.end >= date))
    );

    if (!periodToUpdate) {
      console.error('No period found to remove');
      return;
    }

    if (isSameDay(periodToUpdate.start, date)) {
      // Remove the entire period
      const { error } = await supabase
        .from('periods')
        .delete()
        .eq('user_id', user.id)
        .eq('start_date', periodToUpdate.start.toISOString());

      if (error) {
        console.error('Error removing period:', error);
      }
    } else {
      // Update the period end date to the day before the selected date
      const newEndDate = addDays(date, -1);
      const { error } = await supabase
        .from('periods')
        .update({ end_date: newEndDate.toISOString() })
        .eq('user_id', user.id)
        .eq('start_date', periodToUpdate.start.toISOString());

      if (error) {
        console.error('Error updating period:', error);
      }
    }

    await fetchPeriods();
    setMarkingPeriod(null);
    setTempPeriod(null);
  };

  return {
    periods,
    markingPeriod,
    tempPeriod,
    cyclePhases,
    nextPeriod: predictNextPeriod([...periods].sort((a, b) => compareDesc(a.start, b.start))),
    handleMarkPeriod,
    removePeriod,
  };
}