import type { CyclePhase, PredictedPeriod } from "../types"

export const CYCLE_PHASES: CyclePhase[] = [
  {
    name: "Menstruation",
    description: "The phase when the uterine lining is shed and hormone levels (estrogen and progesterone) are at their lowest.",
    symptoms: [
      { name: "Cramping", imagePath: "/images/symptoms/cramps.webp" },
      { name: "Fatigue", imagePath: "/images/symptoms/fatigue.webp" },
      { name: "Lower back pain", imagePath: "/images/symptoms/back-pain.webp" },
    ],
    color: "bg-red-500",
    start: new Date(), // These dates will be calculated dynamically
    end: new Date(),
    tips: {
      diet: [
        "Focus on iron-rich animal foods like beef, liver, or venison to replenish lost nutrients.",
        "Bone broth can help with hydration and provide essential minerals, such as magnesium, which may reduce cramps.",
        "Include fatty cuts of meat to support energy levels if appetite decreases.",
        "Consume anti-inflammatory foods like berries and leafy greens.",
      ],
      exercise: [
        "Stick to light activities such as walking or gentle stretching.",
        "Avoid high-intensity workouts, as your energy might be lower.",
        "Listen to your body and rest if needed.",
      ],
      "mental health": [
        "Practice self-care and relaxation techniques like reading or journaling.",
        "Use heat therapy for comfort.",
        "Reach out to supportive friends or family.",
      ],
      "weight loss": [
        "Your body releases retained water as hormone levels drop. You might notice a slight decrease in weight.",
        "Focus on maintaining a balanced diet rather than weight loss.",
        "Avoid restrictive dieting during this phase.",
        "Pay attention to your body's needs and cravings.",
      ],
      fasting: [
        "Fasting can be kept moderate (12–14 hours) to support recovery.",
        "Ensure adequate nutrition when not fasting.",
      ],
    },
  },
  {
    name: "Follicular",
    description: "The phase when follicles in the ovary mature and rising estrogen promotes the growth of the uterine lining.",
    symptoms: [
      { name: "Increased energy", imagePath: "/images/symptoms/high-energy.webp" },
      { name: "Improved mood", imagePath: "/images/symptoms/improved-mood.webp" },
      { name: "Higher cognitive abilities", imagePath: "/images/symptoms/creativity.webp" },
    ],
    color: "bg-blue-300",
    start: new Date(),
    end: new Date(),
    tips: {
      diet: [
        "Incorporate nutrient-dense foods for optimal hormone production.",
        "Add collagen or bone broth to support skin and joint health, especially if you’re engaging in high-intensity workouts.",
      ],
      exercise: [
        "Take advantage of increased energy by engaging in high-intensity workouts.",
        "This is the best phase for building muscle and endurance.",
      ],
      "mental health": [
        "Channel your improved mood into creative projects or social activities.",
        "Your focus and motivation are likely at their peak so use this phase for planning and productivity.",
        "Spend time in nature.",
      ],
      "weight loss": [
        "This is a good phase for weight loss efforts due to increased metabolism.",
        "Use this phase to establish consistency in both diet and exercise, as cravings are typically lower.",
      ],
      fasting: [
        "This is an optimal time to extend fasting windows and focus on fat loss, as hormonal shifts make fasting and calorie control easier.",
        "Stay hydrated throughout your fast.",
      ],
    },
  },
  {
    name: "Ovulation",
    description: "The phase when an egg is released from the ovary. Estrogen peaks, and progesterone begins to rise.",
    symptoms: [
      { name: "Mild pelvic pain", imagePath: "/images/symptoms/cramps.webp" },
      { name: "Increased libido", imagePath: "/images/symptoms/increased-libido.webp" },
      { name: "Breast tenderness", imagePath: "/images/symptoms/breast-tenderness.webp" },
    ],
    color: "bg-lime-300",
    start: new Date(),
    end: new Date(),
    tips: {
      diet: [
        "Consume foods rich in zinc and magnesium to support hormone production.",
        "Include foods rich in Vitamin B6.",
        "Maintain a balanced and nutritious diet.",
        "Hydration is key.",
      ],
      exercise: [
        "Engage in moderate-intensity exercises to maintain energy balance.",
        "Incorporate cardio and strength training.",
        "Prioritize rest and recovery.",
      ],
      "mental health": [
        "Use this high-energy time for social connections and communication.",
        "Practice stress-management techniques.",
        "Engage in activities that bring you joy.",
      ],
      "weight loss": [
        "Continue with balanced meals and regular exercise for steady progress.",
        "Focus on sustainable lifestyle changes.",
        "Avoid crash dieting.",
      ],
      fasting: [
        "Short fasts may be beneficial, but if you feel strong and energetic continue with longer fasting windows.",
        "Avoid fasting if you feel stressed.",
        "Prioritize nutrient-dense foods when breaking your fast.",
      ],
    },
  },
  {
    name: "Luteal",
    description: "The phase after ovulation and before the next menstrual period.",
    symptoms: [
      { name: "Bloating", imagePath: "/images/symptoms/bloating.webp" },
      { name: "Mood swings", imagePath: "/images/symptoms/mood-swings.webp" },
      { name: "Fatigue", imagePath: "/images/symptoms/fatigue.webp" },
    ],
    color: "bg-purple-300",
    start: new Date(),
    end: new Date(),
    tips: {
      diet: [
        "Include complex carbohydrates and foods rich in B vitamins to combat PMS symptoms.",
        "Limit processed foods, sugar, and caffeine.",
        "Increase your intake of calcium and magnesium.",
      ],
      exercise: [
        "Focus on low-impact exercises like swimming or pilates to manage discomfort.",
        "Prioritize rest and relaxation.",
        "Listen to your body and adjust your workout intensity as needed.",
      ],
      "mental health": [
        "Practice mindfulness and stress-reduction techniques to manage mood changes.",
        "Engage in relaxing activities like reading or taking a bath.",
        "Seek support from friends, family, or a therapist.",
      ],
      "weight loss": [
        "Temporary weight gain is common during this phase due to water retention and increased appetite. This is normal and typically resolves after menstruation.",
        "Focus on maintaining rather than losing.",
        "Avoid restrictive dieting.",
        "Prioritize nutrient-dense and high fat foods to help with cravings.",
      ],
      fasting: [
        "Shorter fasting windows may be more comfortable during this phase.",
        "Pay attention to your body's signals.",
        "Ensure adequate hydration.",
      ],
    },
  },
]

export const PREDICTED_PERIOD: PredictedPeriod = {
  name: "Predicted Period",
  color: "bg-red-300",
}