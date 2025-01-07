import { addDays, differenceInDays } from 'date-fns';

export interface Period {
  start: Date;
  end: Date | null;
}

export interface CyclePhase {
  name: string;
  start: Date;
  end: Date;
}

export function calculateCyclePhases(periods: Period[]): CyclePhase[] {
  const completePeriods = periods.filter(period => period.start && period.end) as { start: Date; end: Date }[];
  if (completePeriods.length === 0) return [];

  const lastPeriod = completePeriods[completePeriods.length - 1];
  const cycleLength = 28; // Assuming a 28-day cycle

  const menstrualPhase: CyclePhase = {
    name: 'Menstruation',
    start: lastPeriod.start,
    end: lastPeriod.end,
  };

  const follicularPhase: CyclePhase = {
    name: 'Follicular',
    start: addDays(lastPeriod.end, 1),
    end: addDays(lastPeriod.start, 13),
  };

  const ovulatoryPhase: CyclePhase = {
    name: 'Ovulation',
    start: addDays(lastPeriod.start, 14),
    end: addDays(lastPeriod.start, 16),
  };

  const lutealPhase: CyclePhase = {
    name: 'Luteal',
    start: addDays(lastPeriod.start, 17),
    end: addDays(lastPeriod.start, cycleLength - 1),
  };

  return [menstrualPhase, follicularPhase, ovulatoryPhase, lutealPhase];
}

export function predictNextPeriod(periods: Period[]): Period | null {
  const completePeriods = periods.filter(period => period.start && period.end) as { start: Date; end: Date }[];
  if (completePeriods.length < 1) return null;

  const lastPeriod = completePeriods[completePeriods.length - 1];
  const averageCycleLength = 28; // Assuming a 28-day cycle

  const predictedStart = addDays(lastPeriod.start, averageCycleLength);
  const predictedEnd = addDays(predictedStart, differenceInDays(lastPeriod.end, lastPeriod.start));

  return { start: predictedStart, end: predictedEnd };
}