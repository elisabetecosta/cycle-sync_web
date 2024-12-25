"use client";

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useCycle } from '@/hooks/useCycle';
import { cyclePhases, specialColors } from '@/constants/cyclePhases';

const Home = () => {
  const { periods, markPeriodStart, markPeriodEnd, deletePeriodMark, predictNextPeriod, getCurrentPhase, canMarkStart, canMarkEnd, isStartDate, isEndDate } = useCycle();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const currentPhase = getCurrentPhase();
  
  // Mark Period on calendar
  const getDayColor = (date: Date) => {
    // Check if date is within any logged period
    const isPeriod = periods.some(period =>
      period.startDate <= date && (period.endDate ? date <= period.endDate : false)
    );
    if (isPeriod) return `${cyclePhases[0].color}`;

    // Check if it's a start or end date
    const isStartDate = periods.some(period =>
      period.startDate.toDateString() === date.toDateString()
    );
    const isEndDate = periods.some(period =>
      period.endDate?.toDateString() === date.toDateString()
    );
    if (isStartDate || isEndDate) return `${cyclePhases[0].color}`;

    // Predicted next period
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
                <div className={`w-3 h-3 rounded-full ${specialColors.predicted}`} />
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

export default Home;