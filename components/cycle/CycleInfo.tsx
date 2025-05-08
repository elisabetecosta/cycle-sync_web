"use client"

import { InfoIcon, Utensils, Dumbbell, Brain, Weight, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import type { CyclePhase, Period, PredictedPeriod } from "../../types"
import { CYCLE_PHASES, PREDICTED_PERIOD } from "../../constants/cyclePhases"
import { isWithinInterval, isSameDay } from "date-fns"
import { shouldAutoMarkPeriod, getEffectiveEndDate } from "@/utils/cycleCalculations"
import { SymptomImage } from "./SymptomImage"

interface CycleInfoProps {
  cyclePhases: CyclePhase[]
  predictedPeriods: Period[]
  selectedDate: Date
  periods: Period[]
  className?: string
}

export function CycleInfo({ cyclePhases, predictedPeriods, selectedDate, periods, className }: CycleInfoProps) {
  const getActivePhase = (): CyclePhase | PredictedPeriod | null => {
    // Check if the selected date is within a marked period (menstruation)
    const activePeriod = periods.find((period) => {
      if (period.start && period.end) {
        // For completed periods
        return isWithinInterval(selectedDate, { start: period.start, end: period.end })
      } else if (period.start) {
        // For ongoing periods
        if (shouldAutoMarkPeriod(period)) {
          // For recent periods (within 3 days), mark all days up to today or max 14 days
          const effectiveEnd = getEffectiveEndDate(period)
          return isWithinInterval(selectedDate, { start: period.start, end: effectiveEnd })
        } else {
          // For older periods, only mark the start date
          return isSameDay(selectedDate, period.start)
        }
      }
      return false
    })

    if (activePeriod) {
      return CYCLE_PHASES.find((p) => p.name === "Menstruation") || null
    }

    // Check other phases
    for (const phase of cyclePhases) {
      if (isWithinInterval(selectedDate, { start: phase.start, end: phase.end })) {
        return CYCLE_PHASES.find((p) => p.name === phase.name) || null
      }
    }

    // Check for predicted periods
    for (const predictedPeriod of predictedPeriods) {
      if (
        predictedPeriod.start &&
        predictedPeriod.end &&
        isWithinInterval(selectedDate, { start: predictedPeriod.start, end: predictedPeriod.end })
      ) {
        return PREDICTED_PERIOD
      }
    }

    return null
  }

  const activePhase = getActivePhase()

  // Function to format tip category names
  const formatTipCategory = (category: string): string => {
    return category
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getIconForTip = (tipType: string) => {
    switch (tipType) {
      case "diet":
        return <Utensils className="flex-shrink-0" size={30} />
      case "exercise":
        return <Dumbbell className="flex-shrink-0" size={30} />
      case "mental health":
        return <Brain className="flex-shrink-0" size={30} />
      case "weight loss":
        return <Weight className="flex-shrink-0" size={30} />
      case "fasting":
        return <Clock className="flex-shrink-0" size={30} />
      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="text-3xl">Cycle Information</CardTitle>
          <InfoIcon className="mr-2" size={30} />
        </div>
      </CardHeader>
      <CardContent>
        {activePhase ? (
          <div className="space-y-4">
            <Badge className={`${activePhase.color} text-white text-lg px-4 py-2`}>{activePhase.name}</Badge>
            <p className="text-lg">{activePhase.description}</p>

            {activePhase.symptoms && (
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-6">Common Symptoms:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {activePhase.symptoms.map((symptom, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <SymptomImage
                        symptom={symptom}
                        className="w-24 h-24 transform transition-transform hover:scale-105 duration-300"
                      />
                      <span className="mt-3 text-sm font-medium">{symptom.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePhase.tips && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Tips for This Phase:</h3>
                <div className="space-y-4">
                  {Object.entries(activePhase.tips).map(([key, tips]) => (
                    <div key={key} className="flex bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-center w-10 mr-3">{getIconForTip(key)}</div>
                      <div className="flex-1">
                        <h4 className="font-medium capitalize">{formatTipCategory(key)}:</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {tips.map((tip, index) => (
                            <li key={index} className="pl-1 text-sm">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Select a date to see the cycle phase information.</p>
        )}
      </CardContent>
    </Card>
  )
}