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

    for (const period of periods) {
      if (period.start && period.end && isWithinInterval(date, { start: period.start, end: period.end })) {
        return CYCLE_PHASES[0].color; // Menstrual phase color
      }
    }

    if (tempPeriod && tempPeriod.start && isSameDay(date, tempPeriod.start)) {
      return CYCLE_PHASES[0].color; // Menstrual phase color
    }

    for (const phase of cyclePhases) {
      if (isWithinInterval(date, { start: phase.start, end: phase.end })) {
        const cyclePhase = CYCLE_PHASES.find(p => p.name === phase.name);
        return cyclePhase ? cyclePhase.color : '';
      }
    }

    if (nextPeriod && isWithinInterval(date, { start: nextPeriod.start, end: nextPeriod.end })) {
      return PREDICTED_PERIOD.color;
    }

    return '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
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
        <div className="w-full flex justify-center items-center border-t border-b py-2 my-4">
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
          className="mt-4 bg-red-500 hover:bg-red-600"
        >
          {(() => {
            if (periods.some(period =>
              period.start <= selectedDate && (!period.end || period.end >= selectedDate)
            )) {
              return 'Remove Mark';
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