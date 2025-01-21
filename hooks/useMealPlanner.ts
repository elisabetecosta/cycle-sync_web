import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { startOfWeek, addDays } from "date-fns"
import type { Meal, Recipe, MealType, CustomMealForm } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { MEAL_TYPES, DAYS_OF_WEEK } from "@/constants/meals"

export const useMealPlanner = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()))
  const [selectedCell, setSelectedCell] = useState<{ type: MealType; day: string } | null>(null)
  const [customMealForm, setCustomMealForm] = useState<CustomMealForm>({
    title: "",
    tags: [],
    ingredients: "",
    preparation: "",
    image: "",
  })
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view")
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchRecipes = async (userId: string): Promise<Recipe[]> => {
    const { data, error } = await supabase.from("recipes").select("*").eq("user_id", userId)
    if (error) throw error
    return data
  }

  const fetchMeals = async (userId: string, startDate: Date, endDate: Date): Promise<Meal[]> => {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .gte("day", startDate.toISOString())
      .lte("day", endDate.toISOString())
    if (error) throw error
    return data
  }

  const { data: recipes = [], refetch: refetchRecipes } = useQuery<Recipe[]>({
    queryKey: ["recipes", user?.id],
    queryFn: () => fetchRecipes(user!.id),
    enabled: !!user,
  })

  const { data: meals = [], isLoading: mealsLoading } = useQuery<Meal[]>({
    queryKey: ["meals", user?.id, currentWeekStart.toISOString()],
    queryFn: () => fetchMeals(user!.id, currentWeekStart, addDays(currentWeekStart, 6)),
    enabled: !!user,
    select: (data) => data.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()),
  })

  const addMealMutation = useMutation({
    mutationFn: async (newMeal: Omit<Meal, "id">) => {
      const { data, error } = await supabase.from("meals").insert([newMeal]).select().single()
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to add meal" })
        throw error
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meals", user?.id, currentWeekStart.toISOString()])
      setSelectedCell(null)
      setDialogMode("view")
      toast({ title: "Success", description: "Meal added successfully" })
    },
  })

  const updateMealMutation = useMutation({
    mutationFn: async (updatedMeal: Meal) => {
      const { data, error } = await supabase
        .from("meals")
        .update(updatedMeal)
        .eq("id", updatedMeal.id)
        .select()
        .single()
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update meal" })
        throw error
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meals", user?.id, currentWeekStart.toISOString()])
      setSelectedCell(null)
      setDialogMode("view")
      toast({ title: "Success", description: "Meal updated successfully" })
    },
  })

  const removeMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase.from("meals").delete().eq("id", mealId)
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to remove meal" })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meals", user?.id, currentWeekStart.toISOString()])
      setSelectedCell(null)
      setDialogMode("view")
      setIsDialogOpen(false)
      toast({ title: "Success", description: "Meal removed successfully" })
    },
  })

  const getMealForCell = useCallback((meals: Meal[], type: MealType, day: string) => {
    return meals.find((meal) => meal.type === type && meal.day === day)
  }, [])

  const updateSelectedMeal = useCallback(() => {
    if (selectedCell) {
      const meal = getMealForCell(meals, selectedCell.type, selectedCell.day)
      setSelectedMeal(meal || null)
      setDialogMode(meal ? "view" : "edit")
    } else {
      setSelectedMeal(null)
      setDialogMode("view")
    }
  }, [selectedCell, meals, getMealForCell])

  useEffect(() => {
    updateSelectedMeal()
  }, [updateSelectedMeal])

  const handleAddCustomMeal = useCallback(async () => {
    if (
      selectedCell &&
      customMealForm.title.trim() &&
      customMealForm.ingredients.trim() &&
      customMealForm.preparation.trim() &&
      user
    ) {
      try {
        const newRecipe: Omit<Recipe, "id"> = {
          title: customMealForm.title.trim(),
          tags: customMealForm.tags,
          ingredients: customMealForm.ingredients.split("\n").map((ingredient) => ingredient.trim()),
          preparation: customMealForm.preparation.trim(),
          image: customMealForm.image,
          user_id: user.id,
        }

        const { data: recipeData, error: recipeError } = await supabase.from("recipes").insert([newRecipe]).select()
        if (recipeError) {
          toast({ variant: "destructive", title: "Error", description: "Failed to create recipe" })
          throw recipeError
        }
        if (!recipeData || recipeData.length === 0) throw new Error("No recipe data returned")

        const newRecipeId = recipeData[0].id

        const newMeal: Omit<Meal, "id"> = {
          content: customMealForm.title.trim(),
          type: selectedCell.type,
          day: selectedCell.day,
          recipe_id: newRecipeId,
          user_id: user.id,
        }

        await addMealMutation.mutateAsync(newMeal)

        setCustomMealForm({
          title: "",
          tags: [],
          ingredients: "",
          preparation: "",
          image: "",
        })
        setIsDialogOpen(false)
      } catch (error) {
        console.error("Error in handleAddCustomMeal:", error)
      }
    }
  }, [selectedCell, customMealForm, user, addMealMutation, setIsDialogOpen, toast])

  const handleSelectRecipe = useCallback(
    async (recipe: Recipe) => {
      if (selectedCell && user) {
        const existingMeal = getMealForCell(meals, selectedCell.type, selectedCell.day)

        const newMeal: Omit<Meal, "id"> = {
          content: recipe.title,
          type: selectedCell.type,
          day: selectedCell.day,
          recipe_id: recipe.id,
          user_id: user.id,
        }

        if (existingMeal) {
          await updateMealMutation.mutateAsync({ ...newMeal, id: existingMeal.id })
        } else {
          await addMealMutation.mutateAsync(newMeal)
        }
        setIsDialogOpen(false)
      }
    },
    [selectedCell, user, meals, getMealForCell, updateMealMutation, addMealMutation, setIsDialogOpen],
  )

  const handleRemoveMeal = useCallback(
    async (mealId: string) => {
      await removeMealMutation.mutateAsync(mealId)
    },
    [removeMealMutation],
  )

  const handleCustomMealFormChange = (field: keyof CustomMealForm, value: string | string[]) => {
    setCustomMealForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleTag = (tag: string) => {
    setCustomMealForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleGoToRecipe = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`)
  }

  const handleChangeMeal = () => {
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
  }
}

