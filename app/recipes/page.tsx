"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface Recipe {
  id: string
  title: string
  image: string | null
  tags: string[]
  ingredients: string[]
  preparation: string
}

const fetchRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await supabase.from("recipes").select("*")

  if (error) {
    throw new Error("Failed to fetch recipes")
  }

  return data || []
}

export default function Recipes() {
  const { user } = useAuth()
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes", user?.id],
    queryFn: fetchRecipes,
    enabled: !!user,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Recipes</h1>
        <Button asChild>
          <Link href="/recipes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Recipe
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes?.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              {recipe.image && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

