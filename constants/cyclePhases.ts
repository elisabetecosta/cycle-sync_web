import { CyclePhase } from '@/types';

export interface ExtendedCyclePhase extends CyclePhase {
  description: string;
  symptoms: string[];
  color: string;
}

export const CYCLE_PHASES: ExtendedCyclePhase[] = [
  {
    name: 'Menstruation',
    description: 'The phase when the uterine lining is shed.',
    symptoms: ['Cramping', 'Fatigue', 'Lower back pain'],
    color: 'bg-red-500',
    start: new Date(), // These dates will be calculated dynamically
    end: new Date(),
  },
  {
    name: 'Follicular',
    description: 'The phase when follicles in the ovary mature.',
    symptoms: ['Increased energy', 'Improved mood', 'Higher cognitive abilities'],
    color: 'bg-blue-300',
    start: new Date(),
    end: new Date(),
  },
  {
    name: 'Ovulation',
    description: 'The phase when an egg is released from the ovary.',
    symptoms: ['Mild pelvic pain', 'Increased libido', 'Breast tenderness'],
    color: 'bg-lime-300',
    start: new Date(),
    end: new Date(),
  },
  {
    name: 'Luteal',
    description: 'The phase after ovulation and before the next menstrual period.',
    symptoms: ['Bloating', 'Mood swings', 'Fatigue'],
    color: 'bg-purple-300',
    start: new Date(),
    end: new Date(),
  },
];

export const PREDICTED_PERIOD = {
  name: 'Predicted Period',
  color: 'bg-red-300',
};