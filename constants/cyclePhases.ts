import { CyclePhase } from "@/types/cycle";

export const cyclePhases: CyclePhase[] = [
  {
    name: "Menstruation",
    color: "bg-red-500 text-white",
    description: "Period phase (typically days 1-5)",
  },
  {
    name: "Follicular",
    color: "bg-green-500 text-white",
    description: "Pre-ovulation phase (typically days 6-14)",
  },
  {
    name: "Ovulation",
    color: "bg-blue-500 text-white",
    description: "Fertile window (typically days 14-17)",
  },
  {
    name: "Luteal",
    color: "bg-purple-500 text-white",
    description: "Post-ovulation phase (typically days 18-28)",
  },
];

export const specialColors = {
  today: "bg-blue-500 text-white",
  predicted: "bg-red-200",
} as const;