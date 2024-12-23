"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface CyclePeriod {
  startDate: Date;
  endDate: Date | null;
}

interface CyclePhase {
  name: string;
  color: string;
  description: string;
}

const CycleTracker = () => {
  const [periods, setPeriods] = useState<CyclePeriod[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const savedPeriods = localStorage.getItem('periods');
    if (savedPeriods) {
      setPeriods(JSON.parse(savedPeriods).map((period: any) => ({
        startDate: new Date(period.startDate),
        endDate: period.endDate ? new Date(period.endDate) : null
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('periods', JSON.stringify(periods));
  }, [periods]);

  const cyclePhases: CyclePhase[] = [
    {
      name: 'Menstruation',
      color: 'bg-red-500',
      description: 'Period phase (typically days 1-5)'
    },
    {
      name: 'Follicular',
      color: 'bg-green-500',
      description: 'Pre-ovulation phase (typically days 6-14)'
    },
    {
      name: 'Ovulation',
      color: 'bg-blue-500',
      description: 'Fertile window (typically days 14-17)'
    },
    {
      name: 'Luteal',
      color: 'bg-purple-500',
      description: 'Post-ovulation phase (typically days 18-28)'
    }
  ];

  const markPeriodStart = (date: Date) => {
    setPeriods([...periods, { startDate: date, endDate: null }]);
  };

  const markPeriodEnd = (date: Date) => {
    const updatedPeriods = [...periods];
    const currentPeriod = updatedPeriods.find(
      p => p.startDate <= date && (!p.endDate || p.endDate >= date)
    );

    if (currentPeriod && date >= currentPeriod.startDate) {
      currentPeriod.endDate = date;
      setPeriods(updatedPeriods);
    }
  };

  const deletePeriodMark = (date: Date) => {
    const updatedPeriods = periods.filter(period => {
      const isStart = period.startDate.toDateString() === date.toDateString();
      const isEnd = period.endDate?.toDateString() === date.toDateString();

      if (isStart) {
        return false; // Remove the entire period if it's the start date
      } else if (isEnd) {
        period.endDate = null; // Remove just the end date
        return true;
      }
      return true;
    });
    setPeriods(updatedPeriods);
  };

  const calculateAverageCycleLength = () => {
    if (periods.length < 2) return null;

    let totalDays = 0;
    for (let i = 1; i < periods.length; i++) {
      const daysDiff = Math.floor(
        (periods[i].startDate.getTime() - periods[i - 1].startDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );
      totalDays += daysDiff;
    }
    return Math.round(totalDays / (periods.length - 1));
  };

  const predictNextPeriod = () => {
    if (periods.length === 0) return null;

    const avgCycleLength = calculateAverageCycleLength() || 28;
    const lastPeriod = periods[periods.length - 1];
    const nextDate = new Date(lastPeriod.startDate);
    nextDate.setDate(nextDate.getDate() + avgCycleLength);
    return nextDate;
  };

  const getCurrentPhase = () => {
    if (periods.length === 0) return null;

    const today = new Date();
    const lastPeriod = periods[periods.length - 1];
    const avgCycleLength = calculateAverageCycleLength() || 28;

    // Check if currently on period
    if (lastPeriod.endDate && today >= lastPeriod.startDate && today <= lastPeriod.endDate) {
      return cyclePhases[0]; // Menstruation phase
    }

    const daysSinceStart = Math.floor(
      (today.getTime() - lastPeriod.startDate.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    if (daysSinceStart <= 5) return cyclePhases[0]; // Menstruation
    if (daysSinceStart <= 14) return cyclePhases[1]; // Follicular
    if (daysSinceStart <= 17) return cyclePhases[2]; // Ovulation
    if (daysSinceStart <= avgCycleLength) return cyclePhases[3]; // Luteal

    return null;
  };

  const getDayColor = (date: Date) => {
    // Check if date is within any logged period
    const isPeriod = periods.some(period =>
      period.startDate <= date && (period.endDate ? date <= period.endDate : false)
    );
    if (isPeriod) return 'bg-red-500 text-white';

    // Check if it's a start or end date
    const isStartDate = periods.some(period =>
      period.startDate.toDateString() === date.toDateString()
    );
    const isEndDate = periods.some(period =>
      period.endDate?.toDateString() === date.toDateString()
    );
    if (isStartDate || isEndDate) return 'bg-red-500 text-white';

    // Predicted next period
    const nextPeriod = predictNextPeriod();
    if (nextPeriod) {
      const predictedEnd = new Date(nextPeriod);
      predictedEnd.setDate(predictedEnd.getDate() + 5);
      if (date >= nextPeriod && date <= predictedEnd) {
        return 'bg-red-100';
      }
    }

    return '';
  };

  const isStartDate = (date: Date) => {
    return periods.some(period =>
      period.startDate.toDateString() === date.toDateString()
    );
  };

  const isEndDate = (date: Date) => {
    return periods.some(period =>
      period.endDate?.toDateString() === date.toDateString()
    );
  };

  const canMarkStart = (date: Date) => {
    return !periods.some(period =>
      (period.startDate <= date && (period.endDate ? date <= period.endDate : true))
    );
  };

  const canMarkEnd = (date: Date) => {
    return periods.some(period =>
      period.startDate <= date && !period.endDate
    );
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4">
        {/* Cycle Calendar */}
        <Card>
          <CardHeader className="items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Cycle Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="flex justify-center w-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }) => (
                    <div className={`w-full h-full flex items-center justify-center rounded-full cursor-pointer ${getDayColor(date)}`}>
                      {date.getDate()}
                    </div>
                  ),
                }}
              />
            </div>

            <Separator className="w-full" />

            {/* Cycle Phases */}
            <div className="flex flex-wrap gap-4 justify-center w-full">
              {cyclePhases.map((phase) => (
                <div key={phase.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                  <span className="text-sm">{phase.name}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-200" />
                <span className="text-sm">Predicted Period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Info */}
        <Card>
          <CardHeader className="items-center">
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5" />
              Cycle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* BUG: Button disappears sometimes, make sure button always stays and only even tries to change if a different day is selected, selecting the same day should not make the button disappear */}
            {selectedDate && (
                <div className="flex flex-col gap-2">
                  {canMarkStart(selectedDate) && (
                    <Button
                      size="sm"
                      onClick={() => markPeriodStart(selectedDate)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Mark Period Start
                    </Button>
                  )}
                  {canMarkEnd(selectedDate) && (
                    <Button
                      size="sm"
                      onClick={() => markPeriodEnd(selectedDate)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Mark Period End
                    </Button>
                  )}
                  {(isStartDate(selectedDate) || isEndDate(selectedDate)) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePeriodMark(selectedDate)}
                    >
                      Delete Mark
                    </Button>
                  )}
                </div>
            )}

            <div>
              <h3 className="text-sm font-medium mb-2">Current Phase</h3>
              {currentPhase ? (
                <Badge className={`${currentPhase.color} text-white`}>
                  {currentPhase.name}
                </Badge>
              ) : (
                <span className="text-gray-500">No active phase</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CycleTracker;