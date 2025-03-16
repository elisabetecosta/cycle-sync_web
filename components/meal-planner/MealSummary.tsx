import { Button } from "@/components/ui/button"
import { ArrowRight, RefreshCw, Trash } from "lucide-react"
import type { MealPlan } from "@/types"

interface MealSummaryProps {
  mealPlan: MealPlan
  onGoToMeal: () => void
  onChangeMeal: () => void
  onRemoveMeal: () => void
}

export function MealSummary({ mealPlan, onGoToMeal, onChangeMeal, onRemoveMeal, setIsDialogOpen }: MealSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{mealPlan.content}</h3>
      <div className="flex space-x-2">
      {mealPlan.meal_id && (
          <Button onClick={onGoToMeal}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Go to Meal
          </Button>
        )}
        <Button onClick={onChangeMeal}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Change Meal
        </Button>
        <Button variant="destructive" onClick={onRemoveMeal}>
          <Trash className="mr-2 h-4 w-4" />
          Remove Meal
        </Button>
      </div>
    </div>
  )
}