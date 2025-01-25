"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { CycleCalendar } from '@/components/cycle/CycleCalendar';
import { CycleInfo } from '@/components/cycle/CycleInfo';
import { useCycleTracker } from '@/hooks/useCycleTracker';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { periods, markingPeriod, tempPeriod, cyclePhases, nextPeriod, handleMarkPeriod, removePeriod } =
    useCycleTracker()

  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // This effect will run after the component mounts and the user state is determined
    setIsLoading(false)
  }, [user])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const onMarkPeriod = (date: Date | null) => {
    handleMarkPeriod(date)
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
            nextPeriod={nextPeriod}
            markingPeriod={markingPeriod}
            onDateSelect={handleDateSelect}
            onMarkPeriod={onMarkPeriod}
            selectedDate={selectedDate}
            removePeriod={removePeriod}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />
          <CycleInfo
            className="w-full"
            cyclePhases={cyclePhases}
            nextPeriod={nextPeriod}
            selectedDate={selectedDate || new Date()}
            periods={periods}
          />
        </div>
      </div>
    </main>
  )
}