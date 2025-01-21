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
import type { Recipe, Tag } from "@/types"

//type Tag = "vegan" | "vegetarian" | "carnivore" | "gluten-free" | "dairy-free" | "keto" | "paleo"

//const AVAILABLE_TAGS: Tag[] = ["vegan", "vegetarian", "carnivore", "gluten-free", "dairy-free", "keto", "paleo"]

interface EditRecipeFormProps {
  recipe: Recipe
  onSuccess: () => void
}

export function EditRecipeForm({ recipe, onSuccess }: EditRecipeFormProps) {
  const [title, setTitle] = useState(recipe.title)
  const [image, setImage] = useState(recipe.image || "")
  const [selectedTags, setSelectedTags] = useState<Tag[]>(recipe.tags as Tag[])
  const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients)
  const [preparation, setPreparation] = useState(recipe.preparation)

  const { toast } = useToast()

  const queryClient = useQueryClient()

  const editRecipeMutation = useMutation({
    mutationFn: async (updatedRecipe: Partial<Recipe>) => {
      const { data, error } = await supabase.from("recipes").update(updatedRecipe).eq("id", recipe.id).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["recipes"])
      queryClient.invalidateQueries(["recipe", recipe.id])
      toast({
        title: "Success",
        description: "Recipe updated successfully",
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error updating recipe: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    },
  })

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedRecipe = {
      title,
      image,
      tags: selectedTags,
      ingredients,
      preparation,
    }
    editRecipeMutation.mutate(updatedRecipe)
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

      <Button type="submit">Update Recipe</Button>
    </form>
  )
}

