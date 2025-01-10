import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addDays, isSameDay, isWithinInterval } from 'date-fns';
import { Period, CyclePhase } from '@/types';
import { CycleCalendarLegend } from '@/components/CycleCalendarLegend';
import { CYCLE_PHASES, PREDICTED_PERIOD } from '@/constants/cyclePhases';

interface CycleCalendarProps {
  periods: Period[];
  tempPeriod: Period | null;
  cyclePhases: CyclePhase[];
  nextPeriod: Period | null;
  markingPeriod: 'start' | 'end' | null;
  onDateSelect: (date: Date) => void;
  onMarkPeriod: () => void;
  selectedDate: Date;
  removePeriod: (date: Date) => void;
}

export function CycleCalendar({
  periods,
  tempPeriod,
  cyclePhases,
  nextPeriod,
  markingPeriod,
  onDateSelect,
  onMarkPeriod,
  selectedDate,
  removePeriod,
}: CycleCalendarProps) {
  
  const getDateColor = (date: Date) => {
    // Normalize the input date to midnight (00:00:00)
    // This ensures consistent date comparisons regardless of the time component
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
  
    // Check existing periods
    for (const period of periods) {
      // Normalize the start date of each period
      // This is necessary because dates from different sources (API, user input, etc.)
      // might have different time components
      const normalizedStart = new Date(period.start);
      normalizedStart.setHours(0, 0, 0, 0);
      
      // If there's an end date, normalize it too
      // Note: end date can be null for in-progress period marking
      const normalizedEnd = period.end ? new Date(period.end) : null;
      if (normalizedEnd) {
        normalizedEnd.setHours(0, 0, 0, 0);
      }
  
      // Check if the date matches either:
      // 1. Exactly matches the start date (using date-fns isSameDay)
      // 2. Falls within the period interval (if there's an end date)
      if (
        isSameDay(normalizedDate, normalizedStart) || 
        (normalizedEnd && isWithinInterval(normalizedDate, { 
          start: normalizedStart, 
          end: normalizedEnd 
        }))
      ) {
        return `${CYCLE_PHASES[0].color} text-white font-semibold`;
      }
    }
  
    // Check temporary period marking (normalize comparison)
    if (tempPeriod && tempPeriod.start && isSameDay(normalizedDate, tempPeriod.start)) {
      return `${CYCLE_PHASES[0].color} text-white font-semibold`;
    }
  
    // Check cycle phases
    for (const phase of cyclePhases) {
      if (isWithinInterval(normalizedDate, { start: phase.start, end: phase.end })) {
        const cyclePhase = CYCLE_PHASES.find(p => p.name === phase.name);
        return cyclePhase ? cyclePhase.color : '';
      }
    }
  
    // Check predicted next period
    if (nextPeriod && isWithinInterval(normalizedDate, { start: nextPeriod.start, end: nextPeriod.end })) {
      return PREDICTED_PERIOD.color;
    }
  
    return '';
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center pt-3">
        <CalendarUI
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="rounded-full"
          modifiers={{
            marked: (date) => periods.some(period =>
              period.start && period.end && isWithinInterval(date, { start: period.start, end: addDays(period.end, 1) })
            )
          }}
          modifiersClassNames={{
            marked: CYCLE_PHASES[0].color
          }}
          components={{
            DayContent: ({ date }) => (
              <div className={`w-full h-full flex items-center justify-center rounded-full ${getDateColor(date)}`}>
                {date.getDate()}
              </div>
            )
          }}
        />
        {/* Calendar Legend */}
        <div className="w-fit flex justify-center items-center border-t border-b p-4 my-4">
          <CycleCalendarLegend />
        </div>
        <Button
          onClick={() => {
            const isDateMarked = periods.some(period =>
              period.start <= selectedDate && (!period.end || period.end >= selectedDate)
            );

            if (isDateMarked) {
              removePeriod(selectedDate);
            } else {
              onMarkPeriod();
            }
          }}
          className="mt-4bg-red-500 hover:bg-red-600"
        >
          {(() => {
            if (periods.some(period =>
              period.start <= selectedDate && (!period.end || period.end >= selectedDate)
            )) {
              return 'Remove Period';
            }
            if (markingPeriod === 'end') {
              return 'Mark Period End';
            }
            return 'Mark Period Start';
          })()}
        </Button>
      </CardContent>
    </Card>
  );
}