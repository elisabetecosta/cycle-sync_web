import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import type { CustomMealForm, Recipe } from "@/types"
import { AVAILABLE_TAGS } from "@/constants/meals"

interface MealEditContentProps {
  onAddCustomMeal: () => void
  onSelectRecipe: (recipe: Recipe) => void
  customMealForm: CustomMealForm
  handleCustomMealFormChange: (field: keyof CustomMealForm, value: string | string[]) => void
  toggleTag: (tag: string) => void
  recipes: Recipe[]
  loading: boolean
}

export function MealEditContent({
  onAddCustomMeal,
  onSelectRecipe,
  customMealForm,
  handleCustomMealFormChange,
  toggleTag,
  recipes,
  loading,
}: MealEditContentProps) {
  if (loading) {
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
        <TabsTrigger value="recipe">From Recipes</TabsTrigger>
      </TabsList>
      <TabsContent value="custom" className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Enter meal title"
            value={customMealForm.title}
            onChange={(e) => handleCustomMealFormChange("title", e.target.value)}
            required
          />
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
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <Input
              placeholder="Enter image URL (optional)"
              value={customMealForm.image}
              onChange={(e) => handleCustomMealFormChange("image", e.target.value)}
            />
          </div>
          <Textarea
            placeholder="Enter ingredients (one per line)"
            value={customMealForm.ingredients}
            onChange={(e) => handleCustomMealFormChange("ingredients", e.target.value)}
            required
          />
          <Textarea
            placeholder="Enter preparation instructions"
            value={customMealForm.preparation}
            onChange={(e) => handleCustomMealFormChange("preparation", e.target.value)}
            required
          />
        </div>
        <Button
          onClick={onAddCustomMeal}
          disabled={
            !customMealForm.title.trim() || !customMealForm.ingredients.trim() || !customMealForm.preparation.trim()
          }
        >
          Add Custom Meal
        </Button>
      </TabsContent>
      <TabsContent value="recipe">
        <div className="space-y-4">
          {recipes?.map((recipe) => (
            <Card key={recipe.id} className="cursor-pointer hover:bg-accent" onClick={() => onSelectRecipe(recipe)}>
              <CardHeader>
                <CardTitle className="text-sm">{recipe.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}