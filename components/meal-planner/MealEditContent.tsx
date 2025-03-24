"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Apple, X, Search, Filter } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import type { CustomMealForm, Meal, NutritionalInfo } from "@/types"
import { AVAILABLE_TAGS } from "@/constants/meals"
import { useState, useMemo } from "react"

interface MealEditContentProps {
  onAddCustomMeal: () => void
  onSelectMeal: (meal: Meal) => void
  customMealForm: CustomMealForm
  handleCustomMealFormChange: (field: keyof CustomMealForm, value: string | string[]) => void
  toggleTag: (tag: string) => void
  meals: Meal[]
  loading: boolean
}

export function MealEditContent({
  onAddCustomMeal,
  onSelectMeal,
  customMealForm,
  handleCustomMealFormChange,
  toggleTag,
  meals,
  loading,
}: MealEditContentProps) {
  const { user } = useAuth()
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch user's meals
  const { data: myMeals, isLoading: myMealsLoading } = useQuery({
    queryKey: ["myMeals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("meals").select("*").eq("user_id", user!.id)
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  // Fetch all meals
  const { data: allMeals, isLoading: allMealsLoading } = useQuery({
    queryKey: ["allMeals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("meals").select("*")
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  // Filter out user's meals from all meals to avoid duplication
  const otherMeals = allMeals?.filter((meal) => meal.user_id !== user?.id) || []

  // Toggle filter tag selection
  const toggleFilterTag = (tag: string) => {
    setSelectedFilterTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Filter meals based on search query and selected tags
  const filterMeals = (meals: Meal[] | undefined) => {
    if (!meals) return []

    return meals.filter((meal) => {
      // Filter by search query
      const matchesSearch = searchQuery === "" || meal.title.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by tags
      const matchesTags = selectedFilterTags.length === 0 || selectedFilterTags.every((tag) => meal.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }

  // Apply filters to meals
  const filteredMyMeals = useMemo(() => filterMeals(myMeals), [myMeals, searchQuery, selectedFilterTags])
  const filteredOtherMeals = useMemo(() => filterMeals(otherMeals), [otherMeals, searchQuery, selectedFilterTags])

  // Handle nutritional info changes
  const handleNutritionalInfoChange = (field: keyof NutritionalInfo, value: string) => {
    const nutritionalInfo = customMealForm.nutritional_info || {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      servingSize: "1 serving",
      totalServings: "1",
    }

    if (field === "servingSize" || field === "totalServings") {
      const updatedInfo = {
        ...nutritionalInfo,
        [field]: value,
      }
      handleCustomMealFormChange("nutritional_info", updatedInfo)
    } else {
      const numValue = Number.parseFloat(value) || 0
      const updatedInfo = {
        ...nutritionalInfo,
        [field]: numValue,
      }
      handleCustomMealFormChange("nutritional_info", updatedInfo)
    }
  }

  // Handle adding an ingredient
  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      const currentIngredients = customMealForm.ingredients || ""
      const updatedIngredients = currentIngredients
        ? `${currentIngredients}\n${currentIngredient.trim()}`
        : currentIngredient.trim()

      handleCustomMealFormChange("ingredients", updatedIngredients)
      setCurrentIngredient("")
    }
  }

  // Parse ingredients into an array for display
  const ingredientsArray = customMealForm.ingredients
    ? customMealForm.ingredients.split("\n").filter((i) => i.trim() !== "")
    : []

  // Handle removing an ingredient
  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = ingredientsArray.filter((_, i) => i !== index).join("\n")

    handleCustomMealFormChange("ingredients", updatedIngredients)
  }

  if (loading || myMealsLoading || allMealsLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
      </div>
    )
  }

  return (
    <Tabs defaultValue="custom" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="custom">Custom Meal</TabsTrigger>
        <TabsTrigger value="meal">From Existing Meals</TabsTrigger>
      </TabsList>
      <TabsContent value="custom" className="space-y-4 pt-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Name</Label>
            <Input
              id="title"
              placeholder="Name of the meal"
              value={customMealForm.title}
              onChange={(e) => handleCustomMealFormChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              type="url"
              placeholder="https://..."
              value={customMealForm.image}
              onChange={(e) => handleCustomMealFormChange("image", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={customMealForm.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ingredients</Label>
            <div className="flex gap-2">
              <Input
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                placeholder="Add ingredient..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddIngredient()
                  }
                }}
              />
              <Button type="button" onClick={handleAddIngredient}>
                Add
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {ingredientsArray.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm">{ingredient}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIngredient(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparation">Preparation</Label>
            <Textarea
              id="preparation"
              placeholder="Enter each preparation step on a new line. Press Enter after each step. For example:
Mix the eggs with sugar.
Add flour and baking powder.
Bake for 30 minutes at 180°C."
              value={customMealForm.preparation}
              onChange={(e) => handleCustomMealFormChange("preparation", e.target.value)}
              required
              className="min-h-[150px]"
            />
          </div>
        </div>

        {/* Portion Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <Scale className="mr-3 h-5 w-5 text-gray-700" />
            <h2 className="text-xl font-bold">Portion Information</h2>
          </div>
          <div className="border-t border-gray-200 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalServings" className="text-sm">
                Total Servings (e.g., "10 cookies", "8 slices")
              </Label>
              <Input
                id="totalServings"
                value={customMealForm.nutritional_info?.totalServings || "1"}
                onChange={(e) => handleNutritionalInfoChange("totalServings", e.target.value)}
                placeholder="e.g., 4, 6 cookies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servingSize" className="text-sm">
                Serving Size (e.g., "1 cookie", "1 slice")
              </Label>
              <Input
                id="servingSize"
                value={customMealForm.nutritional_info?.servingSize || "1 serving"}
                onChange={(e) => handleNutritionalInfoChange("servingSize", e.target.value)}
                placeholder="e.g., 1 slice, 100g"
              />
            </div>
          </div>
        </div>

        {/* Nutritional Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <Apple className="mr-3 h-5 w-5 text-gray-700" />
            <h2 className="text-xl font-bold">Nutritional Information</h2>
          </div>
          <div className="border-t border-gray-200 mb-3"></div>
          <p className="text-sm text-gray-500 mb-2">All nutritional values are per serving</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm">
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={customMealForm.nutritional_info?.calories || 0}
                onChange={(e) => handleNutritionalInfoChange("calories", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-sm">
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                value={customMealForm.nutritional_info?.carbs || 0}
                onChange={(e) => handleNutritionalInfoChange("carbs", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                min="0"
                value={customMealForm.nutritional_info?.protein || 0}
                onChange={(e) => handleNutritionalInfoChange("protein", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-sm">
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                min="0"
                value={customMealForm.nutritional_info?.fat || 0}
                onChange={(e) => handleNutritionalInfoChange("fat", e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={onAddCustomMeal}
          disabled={
            !customMealForm.title.trim() || !customMealForm.ingredients.trim() || !customMealForm.preparation.trim()
          }
          className="w-full"
        >
          Add Custom Meal
        </Button>
      </TabsContent>
      <TabsContent value="meal">
        <div className="space-y-4">
          {/* Search and Filter UI */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-gray-100" : ""}
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {selectedFilterTags.length > 0 && (
                  <span className="ml-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {selectedFilterTags.length}
                  </span>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="p-3 border rounded-md bg-gray-50">
                <h3 className="font-medium mb-2 text-sm">Filter by tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedFilterTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleFilterTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {selectedFilterTags.length > 0 && (
                  <Button variant="link" onClick={() => setSelectedFilterTags([])} className="mt-2 p-0 h-auto text-xs">
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* My Meals Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">My Meals</h3>
            {myMeals?.length === 0 ? (
              <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">You haven't created any meals yet.</p>
            ) : filteredMyMeals.length === 0 ? (
              <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                No meals match your search criteria.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredMyMeals.map((meal) => (
                  <Card
                    key={meal.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onSelectMeal(meal)}
                  >
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{meal.title}</CardTitle>
                        <div className="flex flex-wrap gap-1">
                          {meal.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {meal.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{meal.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-sm text-gray-500">Other Meals</span>
            </div>
          </div>

          {/* All Meals Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Community Meals</h3>
            {otherMeals.length === 0 ? (
              <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No other meals available.</p>
            ) : filteredOtherMeals.length === 0 ? (
              <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                No meals match your search criteria.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredOtherMeals.map((meal) => (
                  <Card
                    key={meal.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onSelectMeal(meal)}
                  >
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{meal.title}</CardTitle>
                        <div className="flex flex-wrap gap-1">
                          {meal.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {meal.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{meal.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}