"use client"

// External Libraries
import { addDays, startOfWeek } from "date-fns"
import { useCallback, useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Next.js Components
import { useRouter } from "next/navigation"

// Utilities and Hooks
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// Types/Interfaces
import type { CustomMealForm, Meal, MealPlan, MealType, NutritionalInfo } from "@/types"

export const useMealPlanner = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedCell, setSelectedCell] = useState<{ type: MealType; day: string } | null>(null)
  const [customMealForm, setCustomMealForm] = useState<CustomMealForm>({
    title: "",
    tags: [],
    ingredients: "",
    preparation: "",
    image: "",
    nutritional_info: {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      servingSize: "1 serving",
      totalServings: "1",
    },
  })
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view")
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fetch meals for the current user
  const fetchMeals = async (userId: string): Promise<Meal[]> => {
    const { data, error } = await supabase.from("meals").select("*").eq("user_id", userId)
    if (error) throw error
    return data
  }

  // Fetch meal plans for the current week
  const fetchMealPlans = async (userId: string, startDate: Date, endDate: Date): Promise<MealPlan[]> => {
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .gte("day", startDate.toISOString())
      .lte("day", endDate.toISOString())
    if (error) throw error
    return data
  }

  // Query for meals
  const { data: meals = [], refetch: refetchMeals } = useQuery<Meal[]>({
    queryKey: ["meals", user?.id],
    queryFn: () => fetchMeals(user!.id),
    enabled: !!user,
  })

  // Query for meal plans
  const { data: mealPlans = [], isLoading: mealPlansLoading } = useQuery<MealPlan[]>({
    queryKey: ["meal_plans", user?.id, currentWeekStart.toISOString()],
    queryFn: () => fetchMealPlans(user!.id, currentWeekStart, addDays(currentWeekStart, 6)),
    enabled: !!user,
    select: (data) => data.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()),
  })

  // Mutation for adding a new meal plan
  const addMealPlanMutation = useMutation({
    mutationFn: async (newMealPlan: Omit<MealPlan, "id">) => {
      const { data, error } = await supabase.from("meal_plans").insert([newMealPlan]).select().single()
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to add meal plan" })
        throw error
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meal_plans", user?.id, currentWeekStart.toISOString()])
      setSelectedCell(null)
      setDialogMode("view")
      toast({ title: "Success", description: "Meal plan added successfully" })
    },
  })

  // Mutation for updating an existing meal plan
  const updateMealPlanMutation = useMutation({
    mutationFn: async (updatedMealPlan: MealPlan) => {
      const { data, error } = await supabase
        .from("meal_plans")
        .update(updatedMealPlan)
        .eq("id", updatedMealPlan.id)
        .select()
        .single()
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update meal plan" })
        throw error
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meal_plans", user?.id, currentWeekStart.toISOString()])
      setSelectedCell(null)
      setDialogMode("view")
      toast({ title: "Success", description: "Meal plan updated successfully" })
    },
  })

  // Mutation for removing a meal plan
  const removeMealPlanMutation = useMutation({
    mutationFn: async (mealPlanId: string) => {
      const { error } = await supabase.from("meal_plans").delete().eq("id", mealPlanId)
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to remove meal plan" })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meal_plans", user?.id, currentWeekStart.toISOString()])
      setSelectedCell(null)
      setDialogMode("view")
      setIsDialogOpen(false)
      toast({ title: "Success", description: "Meal plan removed successfully" })
    },
  })

  // Get meal plan for a specific cell in the meal planner
  const getMealPlanForCell = useCallback((mealPlans: MealPlan[], type: MealType, day: string) => {
    return mealPlans.find((mealPlan) => mealPlan.type === type && mealPlan.day === day)
  }, [])

  // Update the selected meal plan when the selected cell changes
  const updateSelectedMealPlan = useCallback(() => {
    if (selectedCell) {
      const mealPlan = getMealPlanForCell(mealPlans, selectedCell.type, selectedCell.day)
      setSelectedMealPlan(mealPlan || null)
      setDialogMode(mealPlan ? "view" : "edit")
    } else {
      setSelectedMealPlan(null)
      setDialogMode("view")
    }
  }, [selectedCell, mealPlans, getMealPlanForCell])

  useEffect(() => {
    updateSelectedMealPlan()
  }, [updateSelectedMealPlan])

  // Handle adding a custom meal
  const handleAddCustomMeal = useCallback(async () => {
    if (
      selectedCell &&
      customMealForm.title.trim() &&
      customMealForm.ingredients.trim() &&
      customMealForm.preparation.trim() &&
      user
    ) {
      try {
        // Convert ingredients from string to array
        const ingredientsArray = customMealForm.ingredients
          .split("\n")
          .map((ingredient) => ingredient.trim())
          .filter((ingredient) => ingredient !== "")

        const newMeal: Omit<Meal, "id"> = {
          title: customMealForm.title.trim(),
          tags: customMealForm.tags,
          ingredients: ingredientsArray,
          preparation: customMealForm.preparation.trim(),
          image: customMealForm.image,
          user_id: user.id,
          nutritional_info: customMealForm.nutritional_info,
        }

        const { data: mealData, error: mealError } = await supabase.from("meals").insert([newMeal]).select()
        if (mealError) {
          toast({ variant: "destructive", title: "Error", description: "Failed to create meal" })
          throw mealError
        }
        if (!mealData || mealData.length === 0) throw new Error("No meal data returned")

        const newMealId = mealData[0].id

        const newMealPlan: Omit<MealPlan, "id"> = {
          content: customMealForm.title.trim(),
          type: selectedCell.type,
          day: selectedCell.day,
          meal_id: newMealId,
          user_id: user.id,
        }

        await addMealPlanMutation.mutateAsync(newMealPlan)

        setCustomMealForm({
          title: "",
          tags: [],
          ingredients: "",
          preparation: "",
          image: "",
          nutritional_info: {
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0,
            servingSize: "1 serving",
            totalServings: "1",
          },
        })
        setIsDialogOpen(false)
      } catch (error) {
        console.error("Error in handleAddCustomMeal:", error)
      }
    }
  }, [selectedCell, customMealForm, user, addMealPlanMutation, setIsDialogOpen, toast])

  // Handle selecting an existing meal for a meal plan
  const handleSelectMeal = useCallback(
    async (meal: Meal) => {
      if (selectedCell && user) {
        const existingMealPlan = getMealPlanForCell(mealPlans, selectedCell.type, selectedCell.day)

        const newMealPlan: Omit<MealPlan, "id"> = {
          content: meal.title,
          type: selectedCell.type,
          day: selectedCell.day,
          meal_id: meal.id,
          user_id: user.id,
        }

        if (existingMealPlan) {
          await updateMealPlanMutation.mutateAsync({ ...newMealPlan, id: existingMealPlan.id })
        } else {
          await addMealPlanMutation.mutateAsync(newMealPlan)
        }
        setIsDialogOpen(false)
      }
    },
    [selectedCell, user, mealPlans, getMealPlanForCell, updateMealPlanMutation, addMealPlanMutation, setIsDialogOpen],
  )

  // Handle removing a meal plan
  const handleRemoveMealPlan = useCallback(
    async (mealPlanId: string) => {
      await removeMealPlanMutation.mutateAsync(mealPlanId)
    },
    [removeMealPlanMutation],
  )

  // Handle changes to the custom meal form
  const handleCustomMealFormChange = (field: keyof CustomMealForm, value: string | string[] | NutritionalInfo) => {
    setCustomMealForm((prev) => ({ ...prev, [field]: value }))
  }

  // Toggle a tag in the custom meal form
  const toggleTag = (tag: string) => {
    setCustomMealForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  // Navigate to the meal details page
  const handleGoToMeal = (mealId: string) => {
    router.push(`/meals/${mealId}`)
  }

  // Switch to edit mode for changing a meal plan
  const handleChangeMealPlan = () => {
    setDialogMode("edit")
  }

  return {
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
  }
}