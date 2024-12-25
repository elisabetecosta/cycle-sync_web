import { useState, useEffect } from 'react';
import { CyclePeriod, CyclePhase } from '@/types/cycle';
import { cyclePhases } from '@/constants/cyclePhases';

export const useCycle = () => {
  const [periods, setPeriods] = useState<CyclePeriod[]>([]);

  useEffect(() => {
    const savedPeriods = localStorage.getItem('periods');
    if (savedPeriods) {
      setPeriods(JSON.parse(savedPeriods).map((period: any) => ({
        startDate: new Date(period.startDate),
        endDate: period.endDate ? new Date(period.endDate) : null
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('periods', JSON.stringify(periods));
  }, [periods]);

  const markPeriodStart = (date: Date) => {
    setPeriods([...periods, { startDate: date, endDate: null }]);
  };

  const markPeriodEnd = (date: Date) => {
    const updatedPeriods = [...periods];
    const currentPeriod = updatedPeriods.find(
      p => p.startDate <= date && (!p.endDate || p.endDate >= date)
    );

    if (currentPeriod && date >= currentPeriod.startDate) {
      currentPeriod.endDate = date;
      setPeriods(updatedPeriods);
    }
  };

  const deletePeriodMark = (date: Date) => {
    const updatedPeriods = periods.filter(period => {
      const isStart = period.startDate.toDateString() === date.toDateString();
      const isEnd = period.endDate?.toDateString() === date.toDateString();

      if (isStart) {
        return false; // Remove the entire period if it's the start date
      } else if (isEnd) {
        period.endDate = null; // Remove just the end date
        return true;
      }
      return true;
    });
    setPeriods(updatedPeriods);
  };

  const calculateAverageCycleLength = () => {
    if (periods.length < 2) return null;

    let totalDays = 0;
    for (let i = 1; i < periods.length; i++) {
      const daysDiff = Math.floor(
        (periods[i].startDate.getTime() - periods[i - 1].startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalDays += daysDiff;
    }
    return Math.round(totalDays / (periods.length - 1));
  };

  const predictNextPeriod = () => {
    if (periods.length === 0) return null;

    const avgCycleLength = calculateAverageCycleLength() || 28;
    const lastPeriod = periods[periods.length - 1];
    const nextDate = new Date(lastPeriod.startDate);
    nextDate.setDate(nextDate.getDate() + avgCycleLength);
    return nextDate;
  };

  const getCurrentPhase = (): CyclePhase | null => {
    if (periods.length === 0) return null;

    const today = new Date();
    const lastPeriod = periods[periods.length - 1];
    const avgCycleLength = calculateAverageCycleLength() || 28;

    if (lastPeriod.endDate && today >= lastPeriod.startDate && today <= lastPeriod.endDate) {
      return cyclePhases[0]; // Menstruation phase
    }

    const daysSinceStart = Math.floor(
      (today.getTime() - lastPeriod.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceStart <= 5) return cyclePhases[0]; // Menstruation
    if (daysSinceStart <= 14) return cyclePhases[1]; // Follicular
    if (daysSinceStart <= 17) return cyclePhases[2]; // Ovulation
    if (daysSinceStart <= avgCycleLength) return cyclePhases[3]; // Luteal

    return null;
  };

  const isStartDate = (date: Date) => {
    return periods.some(period =>
      period.startDate.toDateString() === date.toDateString()
    );
  };

  const isEndDate = (date: Date) => {
    return periods.some(period =>
      period.endDate?.toDateString() === date.toDateString()
    );
  };

  const canMarkStart = (date: Date) => {
    return !periods.some(period =>
      (period.startDate <= date && (period.endDate ? date <= period.endDate : true))
    );
  };

  const canMarkEnd = (date: Date) => {
    return periods.some(period =>
      period.startDate <= date && !period.endDate
    );
  };

  return {
    periods,
    setPeriods,
    markPeriodStart,
    markPeriodEnd,
    deletePeriodMark,
    calculateAverageCycleLength,
    predictNextPeriod,
    getCurrentPhase,
    isStartDate,
    isEndDate,
    canMarkStart,
    canMarkEnd
  };
};