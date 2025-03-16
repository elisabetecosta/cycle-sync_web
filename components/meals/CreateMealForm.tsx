"use client"

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
import type { Tag } from "@/types"

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

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient("")
    }
  }

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
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

    const mealData = {
      user_id: user.id,
      title,
      image,
      tags: selectedTags,
      ingredients,
      preparation,
    }

    const { data, error } = await supabase.from("meals").insert([mealData])

    if (error) {
      console.error("Error creating meal:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create meal",
      })
    } else {
      toast({ title: "Success", description: "Meal created successfully!" })
      router.push("/meals")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <Label>Ingredients</Label>
        <div className="flex gap-2">
          <Input
            value={currentIngredient}
            onChange={(e) => setCurrentIngredient(e.target.value)}
            placeholder="Add ingredient..."
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddIngredient())}
          />
          <Button type="button" onClick={handleAddIngredient}>
            Add
          </Button>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {ingredients.map((ingredient, index) => (
            <li key={index} className="text-sm">
              {ingredient}
            </li>
          ))}
        </ul>
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

      <Button type="submit">Create Meal</Button>
    </form>
  )
}