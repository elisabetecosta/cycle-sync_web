"use client";

import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { cyclePhases, specialColors } from '@/constants/cyclePhases';
import { CyclePeriod } from '@/types/cycle';

interface CycleCalendarProps {
  periods: CyclePeriod[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  predictNextPeriod: () => Date | null;
}

export const CycleCalendar = ({
  periods,
  selectedDate,
  setSelectedDate,
  predictNextPeriod,
}: CycleCalendarProps) => {

  const getDayColor = (date: Date) => {
    const isPeriod = periods.some(period =>
      period.startDate <= date && (period.endDate ? date <= period.endDate : false)
    );
    if (isPeriod) return `${cyclePhases[0].color}`;

    const isStartDate = periods.some(period =>
      period.startDate.toDateString() === date.toDateString()
    );
    const isEndDate = periods.some(period =>
      period.endDate?.toDateString() === date.toDateString()
    );
    if (isStartDate || isEndDate) return `${cyclePhases[0].color}`;

    const nextPeriod = predictNextPeriod();
    if (nextPeriod) {
      const predictedEnd = new Date(nextPeriod);
      predictedEnd.setDate(predictedEnd.getDate() + 5);
      if (date >= nextPeriod && date <= predictedEnd) {
        return `${specialColors.predicted}`;
      }
    }

    return '';
  };

  return (
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

        <div className="flex flex-wrap gap-4 justify-center w-full">
          {cyclePhases.map((phase) => (
            <div key={phase.name} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${phase.color}`} />
              <span className="text-sm">{phase.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${specialColors.predicted}`} />
            <span className="text-sm">Predicted Period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};