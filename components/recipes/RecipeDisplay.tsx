import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import type { Recipe } from "@/types"

interface RecipeDisplayProps {
  recipe: Recipe
  onEdit: () => void
  onDelete: () => void
}

export function RecipeDisplay({ recipe, onEdit, onDelete }: RecipeDisplayProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      </div>

      {recipe.image && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="object-cover w-full h-full" />
        </div>
      )}

      <div className="flex space-x-2">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Recipe
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete Recipe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{recipe.title}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
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
          <div className="whitespace-pre-line text-sm">{recipe.preparation}</div>
        </CardContent>
      </Card>
    </div>
  )
}

