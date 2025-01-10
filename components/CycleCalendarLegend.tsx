import { CYCLE_PHASES, PREDICTED_PERIOD } from '@/constants/cyclePhases';

interface LegendItemProps {
  color: string;
  name: string;
}

function LegendItem({ color, name }: LegendItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-4 h-4 rounded-full ${color}`}></div>
      <span className="text-sm">{name}</span>
    </div>
  );
}

export function CycleCalendarLegend() {
  return (
    <div className="flex flex-wrap gap-4">
      {CYCLE_PHASES.map((phase) => (
        <LegendItem key={phase.name} color={phase.color} name={phase.name} />
      ))}
      <LegendItem color={PREDICTED_PERIOD.color} name={PREDICTED_PERIOD.name} />
    </div>
  );
}