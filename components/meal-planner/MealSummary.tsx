import { Button } from "@/components/ui/button"
import { ArrowRight, RefreshCw, Trash } from "lucide-react"
import type { Meal } from "@/types"

interface MealSummaryProps {
  meal: Meal
  onGoToRecipe: () => void
  onChangeMeal: () => void
  onRemoveMeal: () => void
}

export function MealSummary({ meal, onGoToRecipe, onChangeMeal, onRemoveMeal }: MealSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{meal.content}</h3>
      <div className="flex space-x-2">
        {meal.recipe_id && (
          <Button onClick={onGoToRecipe}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Go to Recipe
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