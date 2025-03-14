"use client"

import { useState, useEffect, useCallback } from "react"
import type { Period, CyclePhase } from "@/types"
import {
  calculateCyclePhases,
  predictNextPeriod,
  adjustPredictedPeriod,
  getPhaseForDate,
} from "@/utils/cycleCalculations"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import {
  compareDesc,
  isSameDay,
  addDays,
  subDays,
  isWithinInterval,
  isAfter,
  isBefore,
  differenceInDays,
} from "date-fns"

export function useCycleTracker() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [cyclePhases, setCyclePhases] = useState<CyclePhase[]>([])
  const [markingPeriod, setMarkingPeriod] = useState<"start" | "end" | null>(null)
  const [tempPeriod, setTempPeriod] = useState<Period | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [predictedPeriod, setPredictedPeriod] = useState<Period | null>(null)
  const [showOldPeriodPrompt, setShowOldPeriodPrompt] = useState<boolean>(false)
  const [oldPeriodToCheck, setOldPeriodToCheck] = useState<Period | null>(null)
  const [isResolvingOldPeriod, setIsResolvingOldPeriod] = useState<boolean>(false)
  const [recentlyCreatedPeriodId, setRecentlyCreatedPeriodId] = useState<string | null>(null)
  const { user } = useAuth()

  // Check for old periods (14+ days) without end dates
  const checkForOldPeriods = useCallback(() => {
    // Skip check if we're already resolving an old period
    if (isResolvingOldPeriod) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oldPeriod = periods.find((period) => {
      // Skip recently created periods
      if (period.id === recentlyCreatedPeriodId) return false

      if (period.end === null) {
        const daysSinceStart = differenceInDays(today, period.start)
        return daysSinceStart >= 14
      }
      return false
    })

    if (oldPeriod) {
      setOldPeriodToCheck(oldPeriod)
      setShowOldPeriodPrompt(true)
      return true
    }

    return false
  }, [periods, isResolvingOldPeriod, recentlyCreatedPeriodId])

  useEffect(() => {
    if (user) {
      fetchPeriods()
    }
  }, [user])

  // Check for old periods when the component mounts or when periods change
  // but not immediately after creating a new period
  useEffect(() => {
    if (periods.length > 0) {
      checkForOldPeriods()
    }
  }, [periods, checkForOldPeriods])

  const fetchPeriods = async () => {
    if (!user) return []

    const { data, error } = await supabase.from("periods").select("*").eq("user_id", user.id)

    if (error) {
      console.error("Error fetching periods:", error)
      return []
    }

    const fetchedPeriods = data.map((period) => ({
      id: period.id,
      start: new Date(period.start_date),
      end: period.end_date ? new Date(period.end_date) : null,
    }))

    setPeriods(fetchedPeriods)
    return fetchedPeriods
  }

  const updateCycleData = useCallback((updatedPeriods: Period[]) => {
    const sortedPeriods = [...updatedPeriods].sort((a, b) => compareDesc(a.start, b.start))
    const ongoingPeriod = sortedPeriods.find((p) => p.end === null)

    let newPredictedPeriod = predictNextPeriod(sortedPeriods)

    if (ongoingPeriod) {
      // If there's an ongoing period, adjust the predicted period
      if (newPredictedPeriod && isBefore(ongoingPeriod.start, newPredictedPeriod.start)) {
        newPredictedPeriod = adjustPredictedPeriod(newPredictedPeriod, ongoingPeriod.start)
      }
    }

    const newCyclePhases = calculateCyclePhases(sortedPeriods, newPredictedPeriod)

    setCyclePhases(newCyclePhases)
    setPredictedPeriod(newPredictedPeriod)
  }, [])

  const savePeriod = async (period: Period) => {
    if (!user) return

    let startDate = period.start
    let endDate = period.end

    // Swap dates if end is before start
    if (endDate && endDate < startDate) {
      ;[startDate, endDate] = [endDate, startDate]
    }

    const periodData = {
      start_date: startDate.toISOString(),
      end_date: endDate ? endDate.toISOString() : null,
    }

    if (period.id) {
      // Update existing period
      const { error } = await supabase.from("periods").update(periodData).eq("id", period.id)

      if (error) {
        console.error("Error updating period:", error)
        setErrorMessage("Error updating period. Please try again.")
      }
    } else {
      // Insert new period
      const { data, error } = await supabase
        .from("periods")
        .insert({
          user_id: user.id,
          ...periodData,
        })
        .select()

      if (error) {
        console.error("Error saving period:", error)
        setErrorMessage("Error saving period. Please try again.")
      } else if (data && data.length > 0) {
        // If this is a new period with no end date, mark it as recently created
        if (!endDate) {
          setRecentlyCreatedPeriodId(data[0].id)
        }
      }
    }

    const updatedPeriods = await fetchPeriods()
    updateCycleData(updatedPeriods)

    // If we just added an end date to a period, we're no longer resolving an old period
    if (period.end) {
      setIsResolvingOldPeriod(false)
      setRecentlyCreatedPeriodId(null)
    }
  }

  const handleMarkPeriod = async (selectedDate: Date) => {
    setErrorMessage(null)

    // First check if there are any old periods that need to be addressed
    // Skip this check if we're already resolving an old period
    if (!isResolvingOldPeriod && checkForOldPeriods()) {
      setErrorMessage("Please resolve the old period before marking a new one")
      return
    }

    const normalizedDate = new Date(selectedDate)
    normalizedDate.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isAfter(normalizedDate, today)) {
      setErrorMessage("Cannot mark future dates as part of a period")
      return
    }

    // Check if the selected date is adjacent to an existing period
    const adjacentPeriod = periods.find(
      (period) =>
        isSameDay(normalizedDate, subDays(period.start, 1)) ||
        (period.end && isSameDay(normalizedDate, addDays(period.end, 1))),
    )

    if (adjacentPeriod) {
      // Extend the adjacent period
      const updatedPeriod = {
        ...adjacentPeriod,
        start: isSameDay(normalizedDate, subDays(adjacentPeriod.start, 1)) ? normalizedDate : adjacentPeriod.start,
        end:
          adjacentPeriod.end && isSameDay(normalizedDate, addDays(adjacentPeriod.end, 1))
            ? normalizedDate
            : adjacentPeriod.end,
      }
      await savePeriod(updatedPeriod)
      setMarkingPeriod(null)
      setTempPeriod(null)
    } else {
      // Check if the selected date is within an existing period
      const existingPeriod = periods.find((period) =>
        isWithinInterval(normalizedDate, {
          start: period.start,
          end: period.end || normalizedDate,
        }),
      )

      if (existingPeriod) {
        // If the selected date is the start or end of the period, remove the period
        if (
          isSameDay(normalizedDate, existingPeriod.start) ||
          (existingPeriod.end && isSameDay(normalizedDate, existingPeriod.end))
        ) {
          await removePeriod(normalizedDate)
          return
        }

        // If the selected date is before the start, don't allow it
        if (isBefore(normalizedDate, existingPeriod.start)) {
          setErrorMessage("Period end date cannot be before the start date")
          return
        }

        // Otherwise, update the end date of the existing period
        const updatedPeriod = {
          ...existingPeriod,
          end: normalizedDate,
        }
        await savePeriod(updatedPeriod)
        setMarkingPeriod(null)
        setTempPeriod(null)
      } else if (markingPeriod === null) {
        // Check if there's an ongoing period without an end date
        const ongoingPeriod = periods.find((p) => p.end === null)
        if (ongoingPeriod && !isResolvingOldPeriod) {
          // If there's an ongoing period, don't allow starting a new one
          // unless we're resolving an old period
          setErrorMessage("Please end the current period before starting a new one")
          return
        }

        // Start a new period
        const newTempPeriod = { start: normalizedDate, end: null }
        setTempPeriod(newTempPeriod)
        setMarkingPeriod("end")

        // Save the new period with only the start date
        await savePeriod(newTempPeriod)

        // Update cycle data immediately
        const updatedPeriods = [...periods, newTempPeriod]
        updateCycleData(updatedPeriods)
      } else if (markingPeriod === "end" && tempPeriod) {
        // Don't allow end date before start date
        if (isBefore(normalizedDate, tempPeriod.start)) {
          setErrorMessage("Period end date cannot be before the start date")
          return
        }

        // Mark the end of the period
        const newPeriod = {
          ...tempPeriod,
          end: normalizedDate,
        }
        await savePeriod(newPeriod)
        setTempPeriod(null)
        setMarkingPeriod(null)
        setRecentlyCreatedPeriodId(null) // Clear the recently created period ID
      }
    }

    const updatedPeriods = await fetchPeriods()
    updateCycleData(updatedPeriods)
  }

  const removePeriod = async (date: Date) => {
    if (!user) return

    const periodToRemove = periods.find(
      (period) => isSameDay(period.start, date) || (period.end && isSameDay(period.end, date)),
    )

    if (!periodToRemove) {
      console.error("No period found to remove")
      return
    }

    const { error } = await supabase.from("periods").delete().eq("id", periodToRemove.id)

    if (error) {
      console.error("Error removing period:", error)
      setErrorMessage("Error removing period. Please try again.")
    } else {
      const updatedPeriods = await fetchPeriods()
      updateCycleData(updatedPeriods)

      // If we just removed a period, we're no longer resolving an old period
      setIsResolvingOldPeriod(false)

      // If we removed the recently created period, clear the ID
      if (periodToRemove.id === recentlyCreatedPeriodId) {
        setRecentlyCreatedPeriodId(null)
      }
    }

    setMarkingPeriod(null)
    setTempPeriod(null)
  }

  const handleOldPeriodPromptResponse = async (keepPeriod: boolean) => {
    if (oldPeriodToCheck) {
      if (keepPeriod) {
        // User wants to keep the period, they should mark the end
        setTempPeriod(oldPeriodToCheck)
        setMarkingPeriod("end")
        // Set flag to indicate we're in the process of resolving an old period
        setIsResolvingOldPeriod(true)
      } else {
        // User doesn't want to keep the period, remove it
        await removePeriod(oldPeriodToCheck.start)
      }
    }

    setShowOldPeriodPrompt(false)
    setOldPeriodToCheck(null)
  }

  const getPhaseForDateWrapper = useCallback(
    (date: Date) => {
      // Make sure we're calling the imported function with all required parameters
      return getPhaseForDate(date, cyclePhases, periods, predictedPeriod)
    },
    [cyclePhases, periods, predictedPeriod],
  )

  useEffect(() => {
    updateCycleData(periods)
  }, [periods, updateCycleData])

  return {
    periods,
    markingPeriod,
    tempPeriod,
    errorMessage,
    setErrorMessage,
    cyclePhases,
    predictedPeriod,
    handleMarkPeriod,
    removePeriod,
    getPhaseForDate: getPhaseForDateWrapper,
    updateCycleData,
    showOldPeriodPrompt,
    handleOldPeriodPromptResponse,
    oldPeriodToCheck,
    checkForOldPeriods,
    isResolvingOldPeriod,
  }
}