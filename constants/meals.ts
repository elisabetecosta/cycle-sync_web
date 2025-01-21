import type { MealType, Tag } from "@/types"

export const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: "breakfast", label: "Breakfast" },
  { type: "morningSnack", label: "Morning Snack" },
  { type: "lunch", label: "Lunch" },
  { type: "afternoonSnack", label: "Afternoon Snack" },
  { type: "dinner", label: "Dinner" },
  { type: "lateNightSnack", label: "Late Night Snack" },
]

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export const AVAILABLE_TAGS: Tag[] = ["vegan", "vegetarian", "carnivore", "gluten-free", "dairy-free", "keto", "paleo"]