"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import type { Meal } from "@/types"

interface MealDisplayProps {
  meal: Meal
  onEdit: () => void
  onDelete: () => void
}

export function MealDisplay({ meal, onEdit, onDelete }: MealDisplayProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">{meal.title}</h1>
      </div>

      {meal.image && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img src={meal.image || "/placeholder.svg"} alt={meal.title} className="object-cover w-full h-full" />
        </div>
      )}

      <div className="flex space-x-2">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Meal
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete Meal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{meal.title}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {meal.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            {meal.ingredients.map((ingredient, index) => (
              <li key={index} className="text-sm">
                {ingredient}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preparation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line text-sm">{meal.preparation}</div>
        </CardContent>
      </Card>
    </div>
  )
}