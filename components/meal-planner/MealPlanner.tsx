"use client"

// External Libraries
import { format, addDays } from "date-fns"
import { Plus } from "lucide-react"
import React, { useCallback, useMemo } from "react"

// Custom Components
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { MealEditContent } from "./MealEditContent"
import { MealSummary } from "./MealSummary"

// Utilities and Hooks
import { useCycleTracker } from "@/hooks/useCycleTracker"
import { useMealPlanner } from "@/hooks/useMealPlanner"

// Types/Interfaces
// (none in this file)

// Assets and Constants
import { CYCLE_PHASES } from "@/constants/cyclePhases"
import { DAYS_OF_WEEK, MEAL_TYPES } from "@/constants/meals"

// Memoized Dialog component to prevent unnecessary re-renders
const MemoizedDialog = React.memo(
  ({
    isOpen,
    onOpenChange,
    children,
  }: {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
  }) => (
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
    setDialogMode,
    selectedMealPlan,
    meals,
    mealPlans,
    mealPlansLoading,
    handleAddCustomMeal,
    handleSelectMeal,
    handleRemoveMealPlan,
    handleCustomMealFormChange,
    toggleTag,
    getMealPlanForCell,
    handleGoToMeal,
    isDialogOpen,
    setIsDialogOpen,
    handleChangeMealPlan,
  } = useMealPlanner()

  // Function to determine the color of a cell based on the cycle phase
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

  // Calculate the dates for the current week
  const weekDates = useMemo(() => {
    return DAYS_OF_WEEK.map((_, index) => addDays(currentWeekStart, index))
  }, [currentWeekStart])

  return (
    <div className="container mx-auto p-4 max-w-[95vw] xl:max-w-[1200px]">
      {/* Week navigation buttons */}
      <div className="flex justify-between mb-4">
        <Button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>Previous Week</Button>
        <Button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>Next Week</Button>
      </div>
      {/* Meal planner grid */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="grid grid-cols-8 gap-2 p-4 overflow-x-auto">
          {/* Empty cell for top-left corner */}
          <div className="font-medium text-muted-foreground relative"></div>
          {/* Day headers */}
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className={`text-center font-medium ${getPhaseColor(weekDates[index])} rounded-md p-2`}>
              <div className="text-xs sm:text-sm truncate">{day}</div>
              <div className="text-xs text-muted-foreground">{format(weekDates[index], "MMM d")}</div>
            </div>
          ))}
          {/* Meal type rows */}
          {MEAL_TYPES.map(({ type, label }) => (
            <React.Fragment key={type}>
              {/* Meal type label */}
              <div className="font-medium text-muted-foreground self-center text-xs sm:text-sm break-words hyphens-auto">
                {label}
              </div>
              {/* Meal cells for each day */}
              {DAYS_OF_WEEK.map((day, index) => {
                const date = format(weekDates[index], "yyyy-MM-dd")
                const mealPlan = getMealPlanForCell(mealPlans, type, date)
                return (
                  <div
                    key={`${type}-${date}`}
                    className={`aspect-[4/3] border rounded-md p-2 flex items-center justify-center relative group ${getPhaseColor(
                      weekDates[index],
                    )}`}
                  >
                    {/* Meal dialog */}
                    <MemoizedDialog
                      isOpen={isDialogOpen && selectedCell?.type === type && selectedCell?.day === date}
                      onOpenChange={(open) => {
                        if (!open) {
                          setIsDialogOpen(false)
                          setSelectedCell(null)
                        }
                      }}
                    >
                      {/* Dialog trigger button */}
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
                            {mealPlan ? mealPlan.content : <Plus className="h-4 w-4" />}
                          </span>
                        </Button>
                      </DialogTrigger>
                      {/* Dialog content */}
                      <DialogContent
                        className="max-h-[90vh] overflow-y-auto"
                        aria-describedby="meal-dialog-description"
                      >
                        <DialogHeader>
                          <DialogTitle>
                            {selectedMealPlan
                              ? dialogMode === "view"
                                ? "Meal Details"
                                : "Change Meal"
                              : `Add meal for ${format(new Date(date), "EEEE")} - ${label}`}
                          </DialogTitle>
                          <DialogDescription id="meal-dialog-description">
                            {selectedMealPlan
                              ? dialogMode === "view"
                                ? "View or edit the details of this meal."
                                : "Make changes to this meal."
                              : "Add a new meal to your plan."}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedMealPlan && dialogMode === "view" ? (
                          <MealSummary
                            mealPlan={selectedMealPlan}
                            onGoToMeal={() => handleGoToMeal(selectedMealPlan.meal_id!)}
                            onChangeMeal={handleChangeMealPlan}
                            onRemoveMeal={() => handleRemoveMealPlan(selectedMealPlan.id!)}
                            setIsDialogOpen={setIsDialogOpen}
                          />
                        ) : (
                          <MealEditContent
                            onAddCustomMeal={handleAddCustomMeal}
                            onSelectMeal={handleSelectMeal}
                            customMealForm={customMealForm}
                            handleCustomMealFormChange={handleCustomMealFormChange}
                            toggleTag={toggleTag}
                            meals={meals}
                            loading={mealPlansLoading}
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
      {/* Loading overlay */}
      {mealPlansLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}