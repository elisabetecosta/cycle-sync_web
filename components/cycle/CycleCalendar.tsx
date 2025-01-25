import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { addDays, isSameDay, isWithinInterval, isAfter, subDays } from "date-fns"
import type { Period, CyclePhase } from "@/types"
import { CycleCalendarLegend } from "./CycleCalendarLegend"
import { CYCLE_PHASES, PREDICTED_PERIOD } from "@/constants/cyclePhases"
import { Alert } from "@/components/ui/alert"

interface CycleCalendarProps {
  periods: Period[]
  tempPeriod: Period | null
  cyclePhases: CyclePhase[]
  nextPeriod: Period | null
  markingPeriod: "start" | "end" | null
  onDateSelect: (date: Date) => void
  onMarkPeriod: (date: Date) => void
  selectedDate: Date | null
  removePeriod: (date: Date) => void
  errorMessage: string | null
  setErrorMessage?: (message: string | null) => void
  className?: string
}

export function CycleCalendar({
  periods,
  tempPeriod,
  cyclePhases,
  nextPeriod,
  markingPeriod,
  onDateSelect,
  onMarkPeriod,
  selectedDate,
  errorMessage,
  setErrorMessage,
  className,
}: CycleCalendarProps) {
  const getDateColor = (date: Date) => {
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)

    // Check for actual periods first
    for (const period of periods) {
      const normalizedStart = new Date(period.start)
      normalizedStart.setHours(0, 0, 0, 0)

      const normalizedEnd = period.end ? new Date(period.end) : null
      if (normalizedEnd) {
        normalizedEnd.setHours(0, 0, 0, 0)
      }

      if (
        isSameDay(normalizedDate, normalizedStart) ||
        (normalizedEnd &&
          isWithinInterval(normalizedDate, {
            start: normalizedStart,
            end: normalizedEnd,
          }))
      ) {
        return `${CYCLE_PHASES[0].color} text-white font-semibold`
      }
    }

    if (tempPeriod && tempPeriod.start && isSameDay(normalizedDate, tempPeriod.start)) {
      return `${CYCLE_PHASES[0].color} text-white font-semibold`
    }

    // Then check for cycle phases
    for (const phase of cyclePhases) {
      if (isWithinInterval(normalizedDate, { start: phase.start, end: phase.end })) {
        const cyclePhase = CYCLE_PHASES.find((p) => p.name === phase.name)
        return cyclePhase ? cyclePhase.color : ""
      }
    }

    // Finally, check for predicted period
    if (nextPeriod && isWithinInterval(normalizedDate, { start: nextPeriod.start, end: nextPeriod.end })) {
      return PREDICTED_PERIOD.color
    }

    return ""
  }

  const handleButtonClick = () => {
    if (!selectedDate) return
    onMarkPeriod(selectedDate)
    if (typeof setErrorMessage === "function") {
      setErrorMessage(null)
    }
  }

  const getButtonText = () => {
    if (!selectedDate) return "Select a date"

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isAfter(selectedDate, today)) {
      return "Cannot mark future dates"
    }

    const existingPeriod = periods.find((period) =>
      isWithinInterval(selectedDate, {
        start: period.start,
        end: period.end || selectedDate,
      }),
    )

    if (existingPeriod) {
      if (isSameDay(selectedDate, existingPeriod.start) || isSameDay(selectedDate, existingPeriod.end)) {
        return "Remove Period"
      } else {
        return "Update Period End"
      }
    }

    // Check if the selected date is adjacent to an existing period
    const adjacentPeriod = periods.find(
      (period) =>
        isSameDay(selectedDate, subDays(period.start, 1)) ||
        (period.end && isSameDay(selectedDate, addDays(period.end, 1))),
    )

    if (adjacentPeriod) {
      return "Extend Period"
    }

    if (markingPeriod === "end") {
      return "Mark Period End"
    }

    return "Mark Period Start"
  }

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center pt-3">
        <CalendarUI
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="rounded-full"
          modifiers={{
            marked: (date) =>
              periods.some(
                (period) =>
                  period.start &&
                  period.end &&
                  isWithinInterval(date, { start: period.start, end: addDays(period.end, 1) }),
              ),
          }}
          modifiersClassNames={{
            marked: CYCLE_PHASES[0].color,
          }}
          components={{
            DayContent: ({ date }) => (
              <div className={`w-full h-full flex items-center justify-center rounded-full ${getDateColor(date)}`}>
                {date.getDate()}
              </div>
            ),
          }}
        />
        {/* Calendar Legend */}
        <div className="w-fit flex justify-center items-center border-t border-b p-4 my-4">
          <CycleCalendarLegend />
        </div>
        <Button
          onClick={handleButtonClick}
          className="mt-4 bg-red-500 hover:bg-red-600"
          disabled={!selectedDate || isAfter(selectedDate, new Date())}
        >
          {getButtonText()}
        </Button>
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            {errorMessage}
          </Alert>
        )}
        {tempPeriod && !errorMessage && (
          <Alert className="mt-4">
            Period start marked on {tempPeriod.start.toDateString()}. Please select an end date to save the period.
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}