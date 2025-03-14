import { addDays, differenceInDays, isBefore, isWithinInterval, isSameDay, subDays } from "date-fns"

export interface Period {
  start: Date
  end: Date | null
  id?: string
}

export interface CyclePhase {
  name: string
  start: Date
  end: Date
}

export function calculateCyclePhases(periods: Period[], predictedPeriod: Period | null): CyclePhase[] {
  const completePeriods = periods.filter((period) => period.start && period.end) as { start: Date; end: Date }[]
  const ongoingPeriod = periods.find((period) => period.start && !period.end)

  if (completePeriods.length === 0 && !ongoingPeriod) return []

  const mostRecentPeriod = ongoingPeriod || completePeriods[0]
  const averageCycleLength = calculateAverageCycleLength(completePeriods)
  const averagePeriodLength = calculateAveragePeriodLength(completePeriods)

  const menstrualPhase: CyclePhase = {
    name: "Menstruation",
    start: mostRecentPeriod.start,
    end: mostRecentPeriod.end || addDays(mostRecentPeriod.start, averagePeriodLength - 1),
  }

  const follicularStart = addDays(menstrualPhase.end, 1)
  let ovulationStart = addDays(follicularStart, Math.round(averageCycleLength * 0.36) - 1)
  let lutealStart = addDays(ovulationStart, 1)
  let cycleEnd = addDays(mostRecentPeriod.start, averageCycleLength - 1)

  if (predictedPeriod && !ongoingPeriod) {
    cycleEnd = subDays(predictedPeriod.start, 1)
    const daysUntilPredicted = differenceInDays(predictedPeriod.start, follicularStart)

    ovulationStart = addDays(follicularStart, Math.round(daysUntilPredicted * 0.6) - 1)
    lutealStart = addDays(ovulationStart, 1)
  }

  const follicularPhase: CyclePhase = {
    name: "Follicular",
    start: follicularStart,
    end: ovulationStart,
  }

  const ovulatoryPhase: CyclePhase = {
    name: "Ovulation",
    start: ovulationStart,
    end: lutealStart,
  }

  const lutealPhase: CyclePhase = {
    name: "Luteal",
    start: lutealStart,
    end: cycleEnd,
  }

  return [menstrualPhase, follicularPhase, ovulatoryPhase, lutealPhase]
}

export function predictNextPeriod(periods: Period[]): Period | null {
  const completePeriods = periods.filter((period) => period.start && period.end) as { start: Date; end: Date }[]
  const ongoingPeriod = periods.find((period) => period.start && !period.end)

  if (completePeriods.length === 0 && !ongoingPeriod) return null

  const lastPeriod = ongoingPeriod || completePeriods[0]
  const averageCycleLength = calculateAverageCycleLength(completePeriods)
  const averagePeriodLength = calculateAveragePeriodLength(completePeriods)

  if (ongoingPeriod) {
    // If there's an ongoing period, predict based on its start date
    const predictedStart = addDays(ongoingPeriod.start, averageCycleLength)
    const predictedEnd = addDays(predictedStart, averagePeriodLength - 1)
    return { start: predictedStart, end: predictedEnd }
  } else {
    // If there's no ongoing period, predict based on the last complete period
    const predictedStart = addDays(lastPeriod.start, averageCycleLength)
    const predictedEnd = addDays(predictedStart, averagePeriodLength - 1)
    return { start: predictedStart, end: predictedEnd }
  }
}

export function adjustPredictedPeriod(predictedPeriod: Period, newPeriodStart: Date): Period {
  const daysDifference = differenceInDays(newPeriodStart, predictedPeriod.start)
  const adjustedStart = newPeriodStart
  const adjustedEnd = addDays(predictedPeriod.end!, daysDifference)

  return { start: adjustedStart, end: adjustedEnd }
}

function calculateAverageCycleLength(periods: { start: Date; end: Date }[]): number {
  if (periods.length < 2) return 28 // Default to 28 days if not enough data

  let totalLength = 0
  for (let i = 0; i < periods.length - 1; i++) {
    totalLength += differenceInDays(periods[i].start, periods[i + 1].start)
  }

  return Math.round(totalLength / (periods.length - 1))
}

function calculateAveragePeriodLength(periods: { start: Date; end: Date }[]): number {
  if (periods.length === 0) return 5 // Default to 5 days if no data

  const totalLength = periods.reduce((sum, period) => sum + differenceInDays(period.end, period.start) + 1, 0)
  return Math.round(totalLength / periods.length)
}

// Determine if a period should be automatically marked as ongoing
export function shouldAutoMarkPeriod(period: Period): boolean {
  if (period.end) return false // Already has an end date

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysSinceStart = differenceInDays(today, period.start)

  // Auto-mark if started within the last 3 days
  return daysSinceStart <= 3 && daysSinceStart >= 0
}

// Check if a period is older than 14 days and needs attention
export function isPeriodOlderThan14Days(period: Period): boolean {
  if (period.end) return false // Already has an end date

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysSinceStart = differenceInDays(today, period.start)

  return daysSinceStart >= 14
}

// Get the effective end date for an ongoing period (either today or max 14 days)
export function getEffectiveEndDate(period: Period): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxPeriodEnd = addDays(period.start, 14)

  return isBefore(today, maxPeriodEnd) ? today : maxPeriodEnd
}

export function getPhaseForDate(
  date: Date,
  cyclePhases: CyclePhase[],
  periods: Period[],
  predictedPeriod: Period | null,
): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if the date is within a completed period
  for (const period of periods) {
    // For periods with end dates
    if (period.start && period.end && isWithinInterval(date, { start: period.start, end: period.end })) {
      return "Menstruation"
    }

    // For ongoing periods without end dates
    if (period.start && !period.end) {
      // If the period started recently (within 3 days), auto-mark days
      if (shouldAutoMarkPeriod(period)) {
        const effectiveEnd = getEffectiveEndDate(period)

        if (isWithinInterval(date, { start: period.start, end: effectiveEnd })) {
          return "Menstruation"
        }
      } else {
        // For older periods, only mark the start date
        if (isSameDay(date, period.start)) {
          return "Menstruation"
        }
      }
    }
  }

  // Check if the date is within the predicted period
  if (
    predictedPeriod &&
    predictedPeriod.start &&
    predictedPeriod.end &&
    isWithinInterval(date, { start: predictedPeriod.start, end: predictedPeriod.end })
  ) {
    return "Predicted Period"
  }

  // Check if the date is within a cycle phase
  for (const phase of cyclePhases) {
    if (phase.start && phase.end && isWithinInterval(date, { start: phase.start, end: phase.end })) {
      return phase.name
    }
  }

  return "Unknown"
}