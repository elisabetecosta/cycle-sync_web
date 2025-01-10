import { CyclePhase, PredictedPeriod } from '@/types';

export const CYCLE_PHASES: CyclePhase[] = [
  {
    name: 'Menstruation',
    description: 'The phase when the uterine lining is shed.',
    symptoms: ['Cramping', 'Fatigue', 'Lower back pain'],
    color: 'bg-red-500',
    start: new Date(), // These dates will be calculated dynamically
    end: new Date(),
    tips: {
      diet: [
        'Focus on iron-rich foods to replenish lost blood.',
        'Stay hydrated with water and herbal teas.',
        'Consume anti-inflammatory foods like berries and leafy greens.'
      ],
      exercise: [
        'Engage in gentle exercises like yoga or walking.',
        'Try light stretching to alleviate cramps.',
        'Listen to your body and rest if needed.'
      ],
      mentalHealth: [
        'Practice self-care and relaxation techniques.',
        'Use heat therapy for comfort.',
        'Reach out to supportive friends or family.'
      ],
      weightLoss: [
        'Focus on maintaining a balanced diet rather than weight loss.',
        'Avoid restrictive dieting during this phase.',
        'Pay attention to your body’s needs and cravings.'
      ],
      fasting: [
        'Avoid fasting during menstruation.',
        'If you must fast, keep it short and listen to your body.',
        'Ensure adequate nutrition when not fasting.'
      ],
    },
  },
  {
    name: 'Follicular',
    description: 'The phase when follicles in the ovary mature.',
    symptoms: ['Increased energy', 'Improved mood', 'Higher cognitive abilities'],
    color: 'bg-blue-300',
    start: new Date(),
    end: new Date(),
    tips: {
      diet: [
        'Incorporate foods rich in antioxidants to support follicle health.',
        'Eat plenty of fruits and vegetables.',
        'Consider foods rich in Vitamin D.'
      ],
      exercise: [
        'Take advantage of increased energy with high-intensity workouts.',
        'Try strength training for muscle building.',
        'Prioritize activities you enjoy.'
      ],
      mentalHealth: [
        'Channel your improved mood into creative projects or social activities.',
        'Practice gratitude and mindfulness.',
        'Spend time in nature.'
      ],
      weightLoss: [
        'This is a good phase for weight loss efforts due to increased metabolism.',
        'Combine exercise with a healthy diet.',
        'Consult a professional for personalized advice.'
      ],
      fasting: [
        'If you practice intermittent fasting, this phase may be more comfortable for longer fasts.',
        'Listen to your body and adjust fasting windows as needed.',
        'Stay hydrated throughout your fast.'
      ],
    },
  },
  {
    name: 'Ovulation',
    description: 'The phase when an egg is released from the ovary.',
    symptoms: ['Mild pelvic pain', 'Increased libido', 'Breast tenderness'],
    color: 'bg-lime-300',
    start: new Date(),
    end: new Date(),
    tips: {
      diet: [
        'Consume foods rich in zinc and magnesium to support hormone production.',
        'Include foods rich in Vitamin B6.',
        'Maintain a balanced and nutritious diet.'
      ],
      exercise: [
        'Engage in moderate-intensity exercises to maintain energy balance.',
        'Incorporate cardio and strength training.',
        'Prioritize rest and recovery.'
      ],
      mentalHealth: [
        'Use this high-energy time for social connections and communication.',
        'Practice stress-management techniques.',
        'Engage in activities that bring you joy.'
      ],
      weightLoss: [
        'Continue with balanced meals and regular exercise for steady progress.',
        'Focus on sustainable lifestyle changes.',
        'Avoid crash dieting.'
      ],
      fasting: [
        'Short fasts may be beneficial, but listen to your body’s needs.',
        'Avoid fasting if you experience discomfort.',
        'Prioritize nutrient-dense foods when breaking your fast.'
      ],
    },
  },
  {
    name: 'Luteal',
    description: 'The phase after ovulation and before the next menstrual period.',
    symptoms: ['Bloating', 'Mood swings', 'Fatigue'],
    color: 'bg-purple-300',
    start: new Date(),
    end: new Date(),
    tips: {
      diet: [
        'Include complex carbohydrates and foods rich in B vitamins to combat PMS symptoms.',
        'Limit processed foods, sugar, and caffeine.',
        'Increase your intake of calcium and magnesium.'
      ],
      exercise: [
        'Focus on low-impact exercises like swimming or pilates to manage discomfort.',
        'Prioritize rest and relaxation.',
        'Listen to your body and adjust your workout intensity as needed.'
      ],
      mentalHealth: [
        'Practice mindfulness and stress-reduction techniques to manage mood changes.',
        'Engage in relaxing activities like reading or taking a bath.',
        'Seek support from friends, family, or a therapist.'
      ],
      weightLoss: [
        'Be mindful of potential cravings and water retention; focus on maintaining rather than losing.',
        'Avoid restrictive dieting.',
        'Prioritize nutrient-dense foods.'
      ],
      fasting: [
        'Shorter fasting windows may be more comfortable during this phase.',
        'Pay attention to your body’s signals.',
        'Ensure adequate hydration.'
      ],
    },
  },
];

export const PREDICTED_PERIOD: PredictedPeriod = {
  name: 'Predicted Period',
  color: 'bg-red-300',
};