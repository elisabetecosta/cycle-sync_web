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
import type { Meal, Tag } from "@/types"

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

  const { toast } = useToast()

  const queryClient = useQueryClient()

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

      <Button type="submit">Update Meal</Button>
    </form>
  )
}