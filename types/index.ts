export interface Period {
    start: Date
    end: Date | null
    id?: string
    isPredicted?: boolean
}

export interface CycleTips {
    diet: string[]
    exercise: string[]
    mentalHealth: string[]
    weightLoss: string[]
    fasting: string[]
}

export interface CyclePhase {
    name: string
    start: Date
    end: Date
    description: string
    symptoms: string[]
    color: string
    tips: CycleTips
}

export interface PredictedPeriod {
    name: string
    color: string
}

export type MealType = "breakfast" | "morningSnack" | "lunch" | "afternoonSnack" | "dinner" | "lateNightSnack"

export interface MealPlan {
    id?: string
    content: string
    type: MealType
    day: string
    meal_id?: string
    user_id: string
}

export interface Meal {
    id: string
    title: string
    tags: string[]
    ingredients: string[]
    preparation: string
    image?: string
    user_id: string
}

export interface CustomMealForm {
    title: string
    tags: string[]
    ingredients: string
    preparation: string
    image?: string
}

export type Tag = "vegan" | "vegetarian" | "carnivore" | "gluten-free" | "dairy-free" | "keto" | "paleo"  