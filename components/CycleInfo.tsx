import { InfoIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CyclePhase, Period } from '@/types';
import { CYCLE_PHASES, ExtendedCyclePhase, PREDICTED_PERIOD } from '@/constants/cyclePhases';
import { isWithinInterval, isSameDay } from 'date-fns';

interface CycleInfoProps {
  cyclePhases: CyclePhase[];
  nextPeriod: Period | null;
  selectedDate: Date;
  periods: Period[];
}

export function CycleInfo({ cyclePhases, nextPeriod, selectedDate, periods }: CycleInfoProps) {
  const getActivePhase = (): ExtendedCyclePhase | typeof PREDICTED_PERIOD | null => {
    // Check if the selected date is within a marked period (menstruation)
    const activePeriod = periods.find(period =>
      period.start && period.end &&
      isWithinInterval(selectedDate, { start: period.start, end: period.end })
    );

    if (activePeriod) {
      return CYCLE_PHASES.find(p => p.name === 'Menstruation') || null;
    }

    // Check other phases
    for (const phase of cyclePhases) {
      if (isWithinInterval(selectedDate, { start: phase.start, end: phase.end })) {
        return CYCLE_PHASES.find(p => p.name === phase.name) || null;
      }
    }

    if (nextPeriod && isWithinInterval(selectedDate, { start: nextPeriod.start, end: nextPeriod.end })) {
      return PREDICTED_PERIOD;
    }

    return null;
  };

  const activePhase = getActivePhase();

  return (
    <Card>
      <CardHeader>
      <div className="flex justify-between">
          <CardTitle className="text-3xl">Cycle Information</CardTitle>
          <InfoIcon className="mr-2" size={30} />
        </div>
      </CardHeader>
      <CardContent>
        {activePhase ? (
          <div>
            <Badge className={`${activePhase.color} text-white text-lg mb-2`}>{activePhase.name}</Badge>
            {activePhase !== PREDICTED_PERIOD && (
              <>
                <p className="mb-2">{activePhase.description}</p>
                <h3 className="font-semibold mb-1">Duration:</h3>
                <p className="mb-2">
                  {cyclePhases.find(phase => phase.name === activePhase.name)?.start.toDateString()} -
                  {cyclePhases.find(phase => phase.name === activePhase.name)?.end.toDateString()}
                </p>
                <h3 className="font-semibold mb-1">Common Symptoms:</h3>
                <ul className="list-disc list-inside">
                  {activePhase.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </>
            )}
            {activePhase === PREDICTED_PERIOD && (
              <p>This is your predicted next period. It's a good idea to prepare for your menstrual phase.</p>
            )}
          </div>
        ) : (
          <p>Select a date to see the cycle phase information.</p>
        )}
      </CardContent>
    </Card>
  );
}