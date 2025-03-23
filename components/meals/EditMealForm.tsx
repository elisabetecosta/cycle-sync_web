"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { AVAILABLE_TAGS } from "@/constants/meals"
import { X, Scale, Apple } from "lucide-react"
import type { Meal, NutritionalInfo, Tag } from "@/types"

interface EditMealFormProps {
  meal: Meal
  onSuccess: () => void
}

export function EditMealForm({ meal, onSuccess }: EditMealFormProps) {
  const [title, setTitle] = useState(meal.title)
  const [image, setImage] = useState(meal.image || "")
  const [selectedTags, setSelectedTags] = useState<Tag[]>(meal.tags as Tag[])
  const [ingredients, setIngredients] = useState<string[]>(meal.ingredients)
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [preparation, setPreparation] = useState(meal.preparation)
  const [nutritionalInfo, setNutritionalInfo] = useState<NutritionalInfo>(
    meal.nutritional_info || {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      servingSize: "1 serving",
      totalServings: "1",
    },
  )

  const { toast } = useToast()

  const queryClient = useQueryClient()

  const handleNutritionalInfoChange = (field: keyof NutritionalInfo, value: string) => {
    if (field === "servingSize" || field === "totalServings") {
      setNutritionalInfo((prev) => ({
        ...prev,
        [field]: value,
      }))
    } else {
      const numValue = Number.parseFloat(value) || 0
      setNutritionalInfo((prev) => ({
        ...prev,
        [field]: numValue,
      }))
    }
  }

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient("")
    }
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const editMealMutation = useMutation({
    mutationFn: async (updatedMeal: Partial<Meal>) => {
      const { data, error } = await supabase.from("meals").update(updatedMeal).eq("id", meal.id).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meals"])
      queryClient.invalidateQueries(["meal", meal.id])
      toast({
        title: "Success",
        description: "Meal updated successfully",
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error updating meal: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    },
  })

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedMeal = {
      title,
      image,
      tags: selectedTags,
      ingredients,
      preparation,
      nutritional_info: nutritionalInfo,
    }
    editMealMutation.mutate(updatedMeal)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Name</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name of the meal"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
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
            {ingredients.map((ingredient, index) => (
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
            value={preparation}
            onChange={(e) => setPreparation(e.target.value)}
            placeholder="Enter each preparation step on a new line. Press Enter after each step. For example:
Mix the eggs with sugar.
Add flour and baking powder.
Bake for 30 minutes at 180°C."
            required
            className="min-h-[200px]"
          />
        </div>
      </div>

      {/* Portion Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Scale className="mr-3 h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-bold">Portion Information</h2>
        </div>
        <div className="border-t border-gray-200 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="totalServings" className="text-sm">
              Total Servings (e.g., "10 cookies", "8 slices")
            </Label>
            <Input
              id="totalServings"
              value={nutritionalInfo.totalServings}
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
              value={nutritionalInfo.servingSize}
              onChange={(e) => handleNutritionalInfoChange("servingSize", e.target.value)}
              placeholder="e.g., 1 slice, 100g"
            />
          </div>
        </div>
      </div>

      {/* Nutritional Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Apple className="mr-3 h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-bold">Nutritional Information</h2>
        </div>
        <div className="border-t border-gray-200 mb-6"></div>
        <p className="text-sm text-gray-500 mb-4">All nutritional values are per serving</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calories" className="text-sm">
              Calories
            </Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={nutritionalInfo.calories}
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
              value={nutritionalInfo.carbs}
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
              value={nutritionalInfo.protein}
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
              value={nutritionalInfo.fat}
              onChange={(e) => handleNutritionalInfoChange("fat", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Update Meal
      </Button>
    </form>
  )
}