"use client"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CYCLE_PHASES, PREDICTED_PERIOD } from "@/constants/cyclePhases"
import type { CyclePhase, Period } from "@/types/index"
import { isRecentPeriod } from "@/utils/cycleCalculations"
import { addDays, format, isAfter, isBefore, isSameDay, isWithinInterval, subDays } from "date-fns"
import { useEffect } from "react"
import { CycleCalendarLegend } from "./CycleCalendarLegend"

interface CycleCalendarProps {
  periods: Period[]
  tempPeriod: Period | null
  cyclePhases: CyclePhase[]
  predictedPeriods: Period[]
  markingPeriod: "start" | "end" | null
  onDateSelect: (date: Date) => void
  onMarkPeriod: (date: Date) => void
  selectedDate: Date | null
  removePeriod: (date: Date) => void
  errorMessage: string | null
  setErrorMessage?: (message: string | null) => void
  getPhaseForDate: (date: Date) => string
  className?: string
  updateCycleData: (periods: Period[]) => void
  showOldPeriodPrompt?: boolean
  handleOldPeriodPromptResponse?: (keepPeriod: boolean) => void
  oldPeriodToCheck?: Period | null
  isResolvingOldPeriod?: boolean
}

export function CycleCalendar({
  periods,
  tempPeriod,
  cyclePhases,
  predictedPeriods,
  markingPeriod,
  onDateSelect,
  onMarkPeriod,
  selectedDate,
  errorMessage,
  setErrorMessage,
  className,
  updateCycleData,
  showOldPeriodPrompt = false,
  handleOldPeriodPromptResponse,
  oldPeriodToCheck,
  isResolvingOldPeriod = false,
}: CycleCalendarProps) {
  const getDateColor = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if this is the selected date - this takes priority over all other styles
    if (selectedDate && isSameDay(date, selectedDate)) {
      return `bg-black text-white font-semibold`
    }

    // First, check for completed periods (with start and end dates)
    for (const period of periods) {
      if (period.start && period.end && isWithinInterval(date, { start: period.start, end: period.end })) {
        return `${CYCLE_PHASES[0].color} text-white font-semibold`
      }
    }

    // Next, check for ongoing periods (with start but no end date)
    for (const period of periods) {
      if (period.start && !period.end) {
        // For recent periods (within 3 days), show all days up to today
        if (isRecentPeriod(period)) {
          if (!isAfter(date, today) && isWithinInterval(date, { start: period.start, end: today })) {
            return `${CYCLE_PHASES[0].color} text-white font-semibold`
          }

          // For future days within the predicted period duration
          if (isAfter(date, today)) {
            const averagePeriodLength = 5 // Default value
            const predictedEnd = addDays(period.start, averagePeriodLength - 1)

            if (isWithinInterval(date, { start: addDays(today, 1), end: predictedEnd })) {
              return PREDICTED_PERIOD.color
            }
          }
        } else {
          // For older periods, ONLY mark the start date with period color
          if (isSameDay(date, period.start)) {
            return `${CYCLE_PHASES[0].color} text-white font-semibold`
          }

          // For older periods, still show predicted period color for future days
          const averagePeriodLength = 5 // Default value
          const predictedEnd = addDays(period.start, averagePeriodLength - 1)

          if (isWithinInterval(date, { start: addDays(period.start, 1), end: predictedEnd })) {
            return PREDICTED_PERIOD.color
          }
        }
      }
    }

    // Check for predicted periods
    for (const period of predictedPeriods) {
      if (period.start && period.end && isWithinInterval(date, { start: period.start, end: period.end })) {
        return PREDICTED_PERIOD.color
      }
    }

    // Finally, check for cycle phases
    for (const phase of cyclePhases) {
      if (phase.start && phase.end && isWithinInterval(date, { start: phase.start, end: phase.end })) {
        switch (phase.name) {
          case "Follicular":
            return CYCLE_PHASES[1].color
          case "Ovulation":
            return CYCLE_PHASES[2].color
          case "Luteal":
            return CYCLE_PHASES[3].color
          default:
            return ""
        }
      }
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

    // Check if there's an ongoing period
    const ongoingPeriod = periods.find((p) => p.end === null)

    if (ongoingPeriod) {
      // If the selected date is the start of the ongoing period
      if (isSameDay(selectedDate, ongoingPeriod.start)) {
        return "Remove Period"
      }

      // If the selected date is before the start, don't allow marking it as end
      if (isBefore(selectedDate, ongoingPeriod.start)) {
        return "Cannot mark end before start"
      }

      // If we're in the process of marking a period end
      if (markingPeriod === "end") {
        return "Mark Period End"
      }

      // If the selected date is after the start and before or equal to today
      if (isAfter(selectedDate, ongoingPeriod.start) && !isAfter(selectedDate, today)) {
        return "Mark Period End"
      }
    }

    const existingPeriod = periods.find(
      (period) =>
        period.end &&
        isWithinInterval(selectedDate, {
          start: period.start,
          end: period.end,
        }),
    )

    if (existingPeriod) {
      if (isSameDay(selectedDate, existingPeriod.start)) {
        return "Remove Period"
      } else if (existingPeriod.end && isSameDay(selectedDate, existingPeriod.end)) {
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

    return "Mark Period Start"
  }

  const isButtonDisabled = () => {
    if (!selectedDate) return true

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Disable for future dates
    if (isAfter(selectedDate, today)) return true

    // Check if trying to mark end before start
    const ongoingPeriod = periods.find((p) => p.end === null)
    if (ongoingPeriod && isBefore(selectedDate, ongoingPeriod.start)) {
      return true
    }

    // Disable if there's an old period prompt showing
    if (showOldPeriodPrompt) {
      return true
    }

    return false
  }

  useEffect(() => {
    if (periods && updateCycleData) {
      updateCycleData(periods)
    }
  }, [periods, updateCycleData])

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
                  (period.end
                    ? isWithinInterval(date, { start: period.start, end: period.end })
                    : isSameDay(date, period.start)),
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

        {isResolvingOldPeriod && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertTitle className="text-amber-800">Please select an end date for your period</AlertTitle>
          </Alert>
        )}

        <Button onClick={handleButtonClick} className="mt-4 bg-red-500 hover:bg-red-600" disabled={isButtonDisabled()}>
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

        {/* Dialog for old period prompt */}
        <Dialog open={showOldPeriodPrompt} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Incomplete Period</DialogTitle>
              <DialogDescription>
                {oldPeriodToCheck && (
                  <div className="py-2">
                    You have a period that started on {format(oldPeriodToCheck.start, "MMMM d, yyyy")}
                    (over 14 days ago) without an end date.
                    <p className="mt-2 font-semibold">
                      You need to either mark an end date or remove this period before continuing.
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={() => handleOldPeriodPromptResponse?.(false)}>
                Remove this period
              </Button>
              <Button onClick={() => handleOldPeriodPromptResponse?.(true)}>Mark an end date</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}