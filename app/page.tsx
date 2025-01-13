"use client"

import { useState } from 'react';
import { CalendarIcon, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { CycleCalendar } from '@/components/cycle/CycleCalendar';
import { CycleInfo } from '@/components/cycle/CycleInfo';
import { LoginForm } from '@/components/forms/LoginForm';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { useCycleTracker } from '@/hooks/useCycleTracker';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const {
    periods,
    markingPeriod,
    tempPeriod,
    cyclePhases,
    nextPeriod,
    handleMarkPeriod,
    removePeriod,
  } = useCycleTracker();

  const { user, logout } = useAuth();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const onMarkPeriod = (date: Date | null) => {
    handleMarkPeriod(date);
  };

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background py-8">
        <div className="w-full max-w-md">
          {showRegister ? (
            <>
              <RegisterForm />
              <p className="text-center mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => setShowRegister(false)}
                  className="text-blue-500 hover:underline"
                >
                  Login
                </button>
              </p>
            </>
          ) : (
            <>
              <LoginForm />
              <p className="text-center mt-4">
                Don&#39;t have an account?{' '}
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-blue-500 hover:underline"
                >
                  Register
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    );
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
          <Button onClick={logout} className="mt-4 w-full">Logout</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-background py-8">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <span>Welcome, {user.email}</span>
          <Button onClick={logout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
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
  );
}

export default function HomeWithAuth() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}

