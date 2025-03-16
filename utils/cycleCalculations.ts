import { addDays, differenceInDays, isBefore, isWithinInterval, isSameDay, subDays, isAfter } from "date-fns"

export interface Period {
  start: Date
  end: Date | null
  id?: string
  isPredicted?: boolean
}

export interface CyclePhase {
  name: string
  start: Date
  end: Date
}

// Predict multiple periods for the next 6 months
export function predictFuturePeriods(periods: Period[], numberOfPeriods = 6): Period[] {
  const completePeriods = periods.filter((period) => period.start && period.end) as { start: Date; end: Date }[]
  const ongoingPeriod = periods.find((period) => period.start && !period.end)

  if (completePeriods.length === 0 && !ongoingPeriod) return []

  const lastPeriod = ongoingPeriod || completePeriods[0]
  const averageCycleLength = calculateAverageCycleLength(completePeriods)
  const averagePeriodLength = calculateAveragePeriodLength(completePeriods)

  const predictedPeriods: Period[] = []

  // If there's an ongoing period, add a prediction for its end
  if (ongoingPeriod) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Only predict the end if we're still within the expected period duration
    const daysSinceStart = differenceInDays(today, ongoingPeriod.start)

    if (daysSinceStart < averagePeriodLength) {
      const predictedEnd = addDays(ongoingPeriod.start, averagePeriodLength - 1)

      // Only add days that are in the future
      if (isAfter(predictedEnd, today)) {
        predictedPeriods.push({
          start: addDays(today, 1), // Start from tomorrow
          end: predictedEnd,
          isPredicted: true,
          id: "current-period-prediction",
        })
      }
    }
  }

  // Calculate the start date for future predictions
  const baseDate = lastPeriod.start
  const startOffset = 1 // Start with the next cycle

  for (let i = 0; i < numberOfPeriods; i++) {
    const predictedStart = addDays(baseDate, averageCycleLength * (i + startOffset))
    const predictedEnd = addDays(predictedStart, averagePeriodLength - 1)

    predictedPeriods.push({
      start: predictedStart,
      end: predictedEnd,
      isPredicted: true,
    })
  }

  return predictedPeriods
}

// Get the predicted end date for an ongoing period
export function getPredictedEndDate(period: Period, completePeriods: Period[]): Date {
  if (period.end) return period.end

  const averagePeriodLength = calculateAveragePeriodLength(
    completePeriods.filter((p) => p.start && p.end) as { start: Date; end: Date }[],
  )

  return addDays(period.start, averagePeriodLength - 1)
}

// Keep the original function for backward compatibility
export function predictNextPeriod(periods: Period[]): Period | null {
  const predictedPeriods = predictFuturePeriods(periods, 1)
  return predictedPeriods.length > 0 ? predictedPeriods[0] : null
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

// Check if a date is in the future
export function isDateInFuture(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return isAfter(date, today)
}

// Check if a period is recent (started within the last 3 days)
export function isRecentPeriod(period: Period): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysSinceStart = differenceInDays(today, period.start)

  // Consider a period "recent" if it started within the last 3 days
  return daysSinceStart <= 3 && daysSinceStart >= 0
}

export function getPhaseForDate(
  date: Date,
  cyclePhases: CyclePhase[],
  periods: Period[],
  predictedPeriods: Period[],
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
      // Check if it's a recent period (started within the last 3 days)
      if (isRecentPeriod(period)) {
        // For recent periods, show past days as actual period
        if (!isDateInFuture(date) && isWithinInterval(date, { start: period.start, end: today })) {
          return "Menstruation"
        }

        // For future days within the predicted period duration
        if (isDateInFuture(date)) {
          const averagePeriodLength = 5 // Default value
          const predictedEnd = addDays(period.start, averagePeriodLength - 1)

          if (isWithinInterval(date, { start: addDays(today, 1), end: predictedEnd })) {
            return "Predicted Period"
          }
        }
      } else {
        // For older periods, ONLY mark the start date
        if (isSameDay(date, period.start)) {
          return "Menstruation"
        }
        // Do not return anything for other days - they should not be colored
      }
    }
  }

  // Check if the date is within a cycle phase
  for (const phase of cyclePhases) {
    if (phase.start && phase.end && isWithinInterval(date, { start: phase.start, end: phase.end })) {
      return phase.name
    }
  }

  // Check if the date is within any predicted period
  // This is checked AFTER cycle phases to prioritize actual phases over predictions
  for (const period of predictedPeriods) {
    if (period.start && period.end && isWithinInterval(date, { start: period.start, end: period.end })) {
      return "Predicted Period"
    }
  }

  return "Unknown"
}

// Calculate cycle phases based on the most recent period and predicted periods
export function calculateCyclePhases(periods: Period[], predictedPeriods: Period[]): CyclePhase[] {
  const completePeriods = periods.filter((period) => period.start && period.end) as { start: Date; end: Date }[]
  const ongoingPeriod = periods.find((period) => period.start && !period.end)

  if (completePeriods.length === 0 && !ongoingPeriod) return []

  const mostRecentPeriod = ongoingPeriod || completePeriods[0]
  const averageCycleLength = calculateAverageCycleLength(completePeriods)
  const averagePeriodLength = calculateAveragePeriodLength(completePeriods)

  // Calculate phases for the current cycle
  const phases: CyclePhase[] = []

  // For an ongoing period, we need to determine its predicted end date
  let menstrualEnd: Date

  if (ongoingPeriod) {
    // For ongoing periods, use the predicted end date
    menstrualEnd = getPredictedEndDate(ongoingPeriod, completePeriods)
  } else if (mostRecentPeriod.end) {
    // For completed periods, use the actual end date
    menstrualEnd = mostRecentPeriod.end
  } else {
    // Fallback to average period length
    menstrualEnd = addDays(mostRecentPeriod.start, averagePeriodLength - 1)
  }

  const menstrualPhase: CyclePhase = {
    name: "Menstruation",
    start: mostRecentPeriod.start,
    end: menstrualEnd,
  }
  phases.push(menstrualPhase)

  // Calculate remaining phases for the current cycle
  const follicularStart = addDays(menstrualPhase.end, 1)
  let nextPeriodStart: Date

  // Determine the start of the next period
  if (predictedPeriods.length > 0) {
    // Use the first predicted period that starts after the follicular start
    const nextPredictedPeriod = predictedPeriods.find((p) => p.start && isAfter(p.start, follicularStart))

    if (nextPredictedPeriod) {
      nextPeriodStart = nextPredictedPeriod.start
    } else {
      // If no suitable predicted period is found, use the average cycle length
      nextPeriodStart = addDays(mostRecentPeriod.start, averageCycleLength)
    }
  } else {
    // If no predicted periods, use the average cycle length
    nextPeriodStart = addDays(mostRecentPeriod.start, averageCycleLength)
  }

  const daysUntilNextPeriod = differenceInDays(nextPeriodStart, follicularStart)

  // Ensure we have at least some days for each phase
  if (daysUntilNextPeriod <= 0) {
    // If the next period starts before or on the follicular start,
    // we can't calculate proper phases, so return just the menstrual phase
    return [menstrualPhase]
  }

  // Standard phase distribution in a 28-day cycle:
  // - Follicular: ~7-10 days (25-35%)
  // - Ovulation: 1 day (3-4%)
  // - Luteal: ~12-14 days (43-50%)

  // Calculate phase durations based on the total days until next period
  const follicularDuration = Math.max(1, Math.round(daysUntilNextPeriod * 0.35))
  const ovulationDuration = 1 // Always 1 day for ovulation
  const lutealDuration = daysUntilNextPeriod - follicularDuration - ovulationDuration

  // Ensure luteal phase is at least 1 day
  if (lutealDuration < 1) {
    // If we don't have enough days, adjust follicular phase
    const adjustedFollicularDuration = Math.max(1, daysUntilNextPeriod - 2)
    const follicularEnd = addDays(follicularStart, adjustedFollicularDuration - 1)

    const follicularPhase: CyclePhase = {
      name: "Follicular",
      start: follicularStart,
      end: follicularEnd,
    }
    phases.push(follicularPhase)

    // Add a 1-day ovulation phase
    const ovulationPhase: CyclePhase = {
      name: "Ovulation",
      start: addDays(follicularEnd, 1),
      end: addDays(follicularEnd, 1),
    }
    phases.push(ovulationPhase)

    // If there's still a day left, add a 1-day luteal phase
    if (daysUntilNextPeriod > adjustedFollicularDuration + 1) {
      const lutealPhase: CyclePhase = {
        name: "Luteal",
        start: addDays(follicularEnd, 2),
        end: subDays(nextPeriodStart, 1),
      }
      phases.push(lutealPhase)
    }
  } else {
    // Normal case with enough days for all phases
    const follicularEnd = addDays(follicularStart, follicularDuration - 1)

    const follicularPhase: CyclePhase = {
      name: "Follicular",
      start: follicularStart,
      end: follicularEnd,
    }
    phases.push(follicularPhase)

    // Add a 1-day ovulation phase
    const ovulationDay = addDays(follicularEnd, 1)
    const ovulationPhase: CyclePhase = {
      name: "Ovulation",
      start: ovulationDay,
      end: ovulationDay,
    }
    phases.push(ovulationPhase)

    // Add the luteal phase
    const lutealStart = addDays(ovulationDay, 1)
    const lutealPhase: CyclePhase = {
      name: "Luteal",
      start: lutealStart,
      end: subDays(nextPeriodStart, 1),
    }

    // Only add the luteal phase if it has a valid duration
    if (!isBefore(lutealPhase.end, lutealPhase.start)) {
      phases.push(lutealPhase)
    }
  }

  return phases
}