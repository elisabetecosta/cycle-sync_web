"use client"

import { CycleCalendar } from "@/components/cycle/CycleCalendar"
import { CycleInfo } from "@/components/cycle/CycleInfo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/PageHeader"
import { useAuth } from "@/contexts/AuthContext"
import { useCycleTracker } from "@/hooks/useCycleTracker"
import { CalendarIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const {
    periods,
    markingPeriod,
    tempPeriod,
    cyclePhases,
    predictedPeriods,
    handleMarkPeriod,
    removePeriod,
    getPhaseForDate,
    updateCycleData,
    errorMessage,
    setErrorMessage,
    showOldPeriodPrompt,
    handleOldPeriodPromptResponse,
    oldPeriodToCheck,
    checkForOldPeriods,
    isResolvingOldPeriod,
  } = useCycleTracker()

  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const initialCheckDone = useRef(false)

  useEffect(() => {
    // This effect will run after the component mounts and the user state is determined
    setIsLoading(false)
  }, [user])

  // Check for old periods only when the component mounts
  useEffect(() => {
    if (periods.length > 0 && !isResolvingOldPeriod && !initialCheckDone.current) {
      checkForOldPeriods()
      initialCheckDone.current = true
    }
  }, [periods, checkForOldPeriods, isResolvingOldPeriod])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const onMarkPeriod = (date: Date | null) => {
    if (date) handleMarkPeriod(date)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background py-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">Welcome to Cycle Sync</h1>
          <p className="mb-4">Please log in or register to use the app.</p>
          <div className="space-x-4">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!user.email_confirmed_at) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background py-8">
        <div className="w-full max-w-md">
          <Alert>
            <AlertDescription>
              Please confirm your email address. Check your inbox for a confirmation email.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-background py-8 px-4 pb-20">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <PageHeader Icon={CalendarIcon} title="Cycle Calendar" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <CycleCalendar
            className="w-full"
            periods={periods}
            tempPeriod={tempPeriod}
            cyclePhases={cyclePhases}
            predictedPeriods={predictedPeriods}
            onDateSelect={handleDateSelect}
            onMarkPeriod={onMarkPeriod}
            selectedDate={selectedDate}
            removePeriod={removePeriod}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            getPhaseForDate={getPhaseForDate}
            updateCycleData={updateCycleData}
            markingPeriod={markingPeriod}
            showOldPeriodPrompt={showOldPeriodPrompt}
            handleOldPeriodPromptResponse={handleOldPeriodPromptResponse}
            oldPeriodToCheck={oldPeriodToCheck}
            isResolvingOldPeriod={isResolvingOldPeriod}
          />
          <CycleInfo
            className="w-full"
            cyclePhases={cyclePhases}
            predictedPeriods={predictedPeriods}
            selectedDate={selectedDate || new Date()}
            periods={periods}
          />
        </div>
      </div>
    </main>
  )
}