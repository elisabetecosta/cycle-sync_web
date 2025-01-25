import { useState, useMemo, useEffect } from "react"
import type { Period } from "@/types"
import { calculateCyclePhases, predictNextPeriod } from "@/utils/cycleCalculations"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { compareDesc, isSameDay, addDays, subDays, isWithinInterval, isAfter } from "date-fns"

export function useCycleTracker() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [markingPeriod, setMarkingPeriod] = useState<"start" | "end" | null>(null)
  const [tempPeriod, setTempPeriod] = useState<Period | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPeriods()
    }
  }, [user])

  const fetchPeriods = async () => {
    if (!user) return

    const { data, error } = await supabase.from("periods").select("*").eq("user_id", user.id)

    if (error) {
      console.error("Error fetching periods:", error)
      return
    }

    const fetchedPeriods = data.map((period) => ({
      id: period.id,
      start: new Date(period.start_date),
      end: period.end_date ? new Date(period.end_date) : null,
    }))

    setPeriods(fetchedPeriods)
  }

  const savePeriod = async (period: Period) => {
    if (!user) return

    let startDate = period.start
    let endDate = period.end

    // Swap dates if end is before start
    if (endDate && endDate < startDate) {
      ;[startDate, endDate] = [endDate, startDate]
    }

    if (period.id) {
      // Update existing period
      const { error } = await supabase
        .from("periods")
        .update({
          start_date: startDate.toISOString(),
          end_date: endDate ? endDate.toISOString() : null,
        })
        .eq("id", period.id)

      if (error) {
        console.error("Error updating period:", error)
        setErrorMessage("Error updating period. Please try again.")
      }
    } else {
      // Insert new period
      const { error } = await supabase.from("periods").insert({
        user_id: user.id,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
      })

      if (error) {
        console.error("Error saving period:", error)
        setErrorMessage("Error saving period. Please try again.")
      }
    }

    await fetchPeriods()
  }

  const handleMarkPeriod = async (selectedDate: Date) => {
    setErrorMessage(null)
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
      return
    }

    // Check if the selected date is within an existing period
    const existingPeriod = periods.find((period) =>
      isWithinInterval(normalizedDate, {
        start: period.start,
        end: period.end || normalizedDate,
      }),
    )

    if (existingPeriod) {
      // If the selected date is the start or end of the period, remove the period
      if (isSameDay(normalizedDate, existingPeriod.start) || isSameDay(normalizedDate, existingPeriod.end)) {
        await removePeriod(normalizedDate)
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
      // Start a new period
      const newTempPeriod = { start: normalizedDate, end: null }
      setTempPeriod(newTempPeriod)
      setMarkingPeriod("end")

      // If the start date is today, save it immediately
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (isSameDay(normalizedDate, today)) {
        await savePeriod(newTempPeriod)
      }
    } else if (markingPeriod === "end" && tempPeriod) {
      // Mark the end of the period
      const newPeriod = {
        start: tempPeriod.start,
        end: normalizedDate,
      }
      await savePeriod(newPeriod)
      setTempPeriod(null)
      setMarkingPeriod(null)
    }
  }

  const autoExtendOngoingPeriod = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const fourteenDaysFromToday = addDays(today, 14)

    const ongoingPeriod = periods.find((period) => !period.end && isSameDay(period.start, today))

    if (ongoingPeriod) {
      const extendedPeriod = {
        ...ongoingPeriod,
        end: fourteenDaysFromToday,
      }
      await savePeriod(extendedPeriod)
    }
  }

  useEffect(() => {
    if (user) {
      autoExtendOngoingPeriod()
    }
  }, [user, periods]) // Added periods to the dependency array

  const cyclePhases = useMemo(() => {
    const sortedPeriods = [...periods].sort((a, b) => compareDesc(a.start, b.start))
    return calculateCyclePhases(sortedPeriods)
  }, [periods])

  const removePeriod = async (date: Date) => {
    if (!user) return

    const periodToRemove = periods.find((period) => isSameDay(period.start, date) || isSameDay(period.end, date))

    if (!periodToRemove) {
      console.error("No period found to remove")
      return
    }

    const { error } = await supabase.from("periods").delete().eq("id", periodToRemove.id)

    if (error) {
      console.error("Error removing period:", error)
      setErrorMessage("Error removing period. Please try again.")
    } else {
      await fetchPeriods()
    }

    setMarkingPeriod(null)
    setTempPeriod(null)
  }

  return {
    periods,
    markingPeriod,
    tempPeriod,
    errorMessage,
    setErrorMessage,
    cyclePhases,
    nextPeriod: predictNextPeriod([...periods].sort((a, b) => compareDesc(a.start, b.start))),
    handleMarkPeriod,
    removePeriod,
  }
}