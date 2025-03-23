"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { AVAILABLE_TAGS } from "@/constants/meals"
import { X, Scale, Apple } from "lucide-react"
import type { NutritionalInfo, Tag } from "@/types"

export function CreateMealForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [image, setImage] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [preparation, setPreparation] = useState("")
  const [nutritionalInfo, setNutritionalInfo] = useState<NutritionalInfo>({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    servingSize: "1 serving",
    totalServings: "1",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient("")
    }
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a meal",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const mealData = {
        user_id: user.id,
        title,
        image,
        tags: selectedTags,
        ingredients,
        preparation,
        nutritional_info: nutritionalInfo,
      }

      const { data, error } = await supabase.from("meals").insert([mealData]).select()

      if (error) {
        console.error("Error creating meal:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create meal: " + error.message,
        })
        return
      }

      toast({ title: "Success", description: "Meal created successfully!" })
      router.push("/meals")
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Meal"}
      </Button>
    </form>
  )
}