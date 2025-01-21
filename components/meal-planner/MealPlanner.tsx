"use client"

import React, { useCallback } from "react"
import { format, addDays } from "date-fns"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { useCycleTracker } from "@/hooks/useCycleTracker"
import { CYCLE_PHASES } from "@/constants/cyclePhases"
import { useMealPlanner } from "@/hooks/useMealPlanner"
import { MEAL_TYPES, DAYS_OF_WEEK } from "@/constants/meals"
import { MealSummary } from "./MealSummary"
import { MealEditContent } from "./MealEditContent"

const MemoizedDialog = React.memo(
  ({
    isOpen,
    onOpenChange,
    children,
  }: { isOpen: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  ),
)

export function MealPlanner() {
  const { cyclePhases } = useCycleTracker()
  const {
    currentWeekStart,
    setCurrentWeekStart,
    selectedCell,
    setSelectedCell,
    customMealForm,
    dialogMode,
    selectedMeal,
    recipes,
    meals,
    mealsLoading,
    handleAddCustomMeal,
    handleSelectRecipe,
    handleRemoveMeal,
    handleCustomMealFormChange,
    toggleTag,
    getMealForCell,
    handleGoToRecipe,
    isDialogOpen,
    setIsDialogOpen,
    handleChangeMeal,
  } = useMealPlanner()

  const getPhaseColor = useCallback(
    (date: Date) => {
      for (const phase of cyclePhases) {
        if (date >= phase.start && date <= phase.end) {
          return CYCLE_PHASES.find((p) => p.name === phase.name)?.color || ""
        }
      }
      return ""
    },
    [cyclePhases],
  )

  const weekDates = DAYS_OF_WEEK.map((_, index) => addDays(currentWeekStart, index))

  return (
    <div className="container mx-auto p-4 max-w-[95vw] xl:max-w-[1200px]">
      <div className="flex justify-between mb-4">
        <Button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>Previous Week</Button>
        <Button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>Next Week</Button>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="grid grid-cols-8 gap-2 p-4 overflow-x-auto">
          <div className="font-medium text-muted-foreground relative"></div>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className={`text-center font-medium ${getPhaseColor(weekDates[index])} rounded-md p-2`}>
              <div className="text-xs sm:text-sm truncate">{day}</div>
              <div className="text-xs text-muted-foreground">{format(weekDates[index], "MMM d")}</div>
            </div>
          ))}
          {MEAL_TYPES.map(({ type, label }) => (
            <React.Fragment key={type}>
              <div className="font-medium text-muted-foreground self-center text-xs sm:text-sm break-words hyphens-auto">
                {label}
              </div>
              {DAYS_OF_WEEK.map((day, index) => {
                const date = format(weekDates[index], "yyyy-MM-dd")
                const meal = getMealForCell(meals, type, date)
                return (
                  <div
                    key={`${type}-${date}`}
                    className={`aspect-[4/3] border rounded-md p-2 flex items-center justify-center relative group ${getPhaseColor(weekDates[index])}`}
                  >
                    <MemoizedDialog
                      isOpen={isDialogOpen && selectedCell?.type === type && selectedCell?.day === date}
                      onOpenChange={(open) => {
                        if (!open) {
                          setIsDialogOpen(false)
                          setSelectedCell(null)
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full h-full"
                          onClick={() => {
                            setSelectedCell({ type, day: date })
                            setIsDialogOpen(true)
                          }}
                        >
                          <span className="text-sm text-center break-words overflow-hidden line-clamp-2">
                            {meal ? meal.content : <Plus className="h-4 w-4" />}
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent aria-describedby="meal-dialog-description">
                        <DialogHeader>
                          <DialogTitle>
                            {selectedMeal
                              ? dialogMode === "view"
                                ? "Meal Details"
                                : "Change Meal"
                              : `Add meal for ${format(new Date(date), "EEEE")} - ${label}`}
                          </DialogTitle>
                          <DialogDescription id="meal-dialog-description">
                            {selectedMeal
                              ? dialogMode === "view"
                                ? "View or edit the details of this meal."
                                : "Make changes to this meal."
                              : "Add a new meal to your plan."}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedMeal && dialogMode === "view" ? (
                          <MealSummary
                            meal={selectedMeal}
                            onGoToRecipe={() => handleGoToRecipe(selectedMeal.recipe_id!)}
                            onChangeMeal={handleChangeMeal}
                            onRemoveMeal={() => handleRemoveMeal(selectedMeal.id!)}
                            setIsDialogOpen={setIsDialogOpen}
                          />
                        ) : (
                          <MealEditContent
                            onAddCustomMeal={handleAddCustomMeal}
                            onSelectRecipe={handleSelectRecipe}
                            customMealForm={customMealForm}
                            handleCustomMealFormChange={handleCustomMealFormChange}
                            toggleTag={toggleTag}
                            recipes={recipes}
                            loading={mealsLoading}
                          />
                        )}
                      </DialogContent>
                    </MemoizedDialog>
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {mealsLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}

