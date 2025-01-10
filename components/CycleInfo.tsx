import { InfoIcon, Utensils, Dumbbell, Brain, Weight, Clock, Frown, Battery, ThermometerIcon } from 'lucide-react';
import { isWithinInterval } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { CyclePhase, Period, PredictedPeriod } from '@/types';
import { CYCLE_PHASES, PREDICTED_PERIOD } from '@/constants/cyclePhases';

interface CycleInfoProps {
  cyclePhases: CyclePhase[];
  nextPeriod: Period | null;
  selectedDate: Date;
  periods: Period[];
  className?: string;
}

export function CycleInfo({ cyclePhases, nextPeriod, selectedDate, periods, className }: CycleInfoProps) {

  const getActivePhase = (): CyclePhase | PredictedPeriod | null => {
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

  const getIconForTip = (tipType: string) => {

    switch (tipType) {
      case 'diet':
        return <Utensils className="flex-shrink-0" size={30} />;
      case 'exercise':
        return <Dumbbell className="flex-shrink-0" size={30} />;
      case 'mentalHealth':
        return <Brain className="flex-shrink-0" size={30} />;
      case 'weightLoss':
        return <Weight className="flex-shrink-0" size={30} />;
      case 'fasting':
        return <Clock className="flex-shrink-0" size={30} />;
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="text-3xl">Cycle Information</CardTitle>
          <InfoIcon className="mr-2" size={30} />
        </div>
      </CardHeader>
      <CardContent>
        {activePhase ? (
          <div className="space-y-4">
            <Badge className={`${activePhase.color} text-white text-lg px-4 py-2`}>{activePhase.name}</Badge>
            <p className="text-lg">{activePhase.description}</p>

            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4">Common Symptoms:</h3>
              <div className="grid grid-cols-3 gap-4">
                {activePhase.symptoms.map((symptom, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    {(() => {
                      switch (symptom.toLowerCase()) {
                        case 'cramping':
                          return <Frown size={24} />;
                        case 'fatigue':
                          return <Battery size={24} />;
                        case 'lower back pain':
                          return <ThermometerIcon size={24} />;
                        default:
                          return <InfoIcon size={24} />;
                      }
                    })()}
                    <span className="mt-2 text-sm">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Tips for This Phase:</h3>
              <div className="space-y-4">
                {Object.entries(activePhase.tips).map(([key, tips]) => (
                  <div key={key} className="flex bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-center w-10 mr-3">
                      {getIconForTip(key)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">{key}:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        {tips.map((tip, index) => (
                          <li key={index} className="pl-1 text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p>When you are done marking your first period, select a date to see the cycle phase information.</p>
        )}
      </CardContent>
    </Card>
  );
}