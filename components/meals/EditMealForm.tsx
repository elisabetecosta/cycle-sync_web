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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
        <Label htmlFor="ingredients">Ingredients</Label>
        <Textarea
          id="ingredients"
          value={ingredients.join("\n")}
          onChange={(e) => setIngredients(e.target.value.split("\n"))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preparation">Preparation</Label>
        <Textarea
          id="preparation"
          value={preparation}
          onChange={(e) => setPreparation(e.target.value)}
          required
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-semibold">Nutritional Information</Label>
        <p className="text-sm text-gray-500 -mt-2">All nutritional values are per serving</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="totalServings" className="text-sm">
              Total Servings (e.g., "4", "6 cookies")
            </Label>
            <Input
              id="totalServings"
              value={nutritionalInfo.totalServings}
              onChange={(e) => handleNutritionalInfoChange("totalServings", e.target.value)}
              placeholder="e.g., 4, 6 cookies"
            />
          </div>
          <div>
            <Label htmlFor="servingSize" className="text-sm">
              Serving Size (e.g., "1 slice", "100g")
            </Label>
            <Input
              id="servingSize"
              value={nutritionalInfo.servingSize}
              onChange={(e) => handleNutritionalInfoChange("servingSize", e.target.value)}
              placeholder="e.g., 1 slice, 100g"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="calories" className="text-sm">
              Calories (per serving)
            </Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={nutritionalInfo.calories}
              onChange={(e) => handleNutritionalInfoChange("calories", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="carbs" className="text-sm">
              Carbs (g per serving)
            </Label>
            <Input
              id="carbs"
              type="number"
              min="0"
              value={nutritionalInfo.carbs}
              onChange={(e) => handleNutritionalInfoChange("carbs", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="protein" className="text-sm">
              Protein (g per serving)
            </Label>
            <Input
              id="protein"
              type="number"
              min="0"
              value={nutritionalInfo.protein}
              onChange={(e) => handleNutritionalInfoChange("protein", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fat" className="text-sm">
              Fat (g per serving)
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

      <Button type="submit">Update Meal</Button>
    </form>
  )
}