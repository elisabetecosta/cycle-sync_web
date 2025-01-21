"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateRecipeForm } from "@/components/recipes/CreateRecipeForm"

export default function NewRecipe() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateRecipeForm />
        </CardContent>
      </Card>
    </div>
  )
}

