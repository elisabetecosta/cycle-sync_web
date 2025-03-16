"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface Meal {
  id: string
  title: string
  image: string | null
  tags: string[]
  ingredients: string[]
  preparation: string
  user_id: string
}

const fetchMyMeals = async (userId: string): Promise<Meal[]> => {
  const { data, error } = await supabase.from("meals").select("*").eq("user_id", userId)

  if (error) {
    throw new Error("Failed to fetch meals")
  }

  return data || []
}

const fetchAllMeals = async (): Promise<Meal[]> => {
  const { data, error } = await supabase.from("meals").select("*")

  if (error) {
    throw new Error("Failed to fetch meals")
  }

  return data || []
}

export default function Meals() {
  const { user } = useAuth()
  const { data: myMeals, isLoading: myMealsLoading } = useQuery({
    queryKey: ["myMeals", user?.id],
    queryFn: () => fetchMyMeals(user!.id),
    enabled: !!user,
  })

  const { data: allMeals, isLoading: allMealsLoading } = useQuery({
    queryKey: ["allMeals"],
    queryFn: fetchAllMeals,
    enabled: !!user,
  })

  if (myMealsLoading || allMealsLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meals</h1>
        <Button asChild>
          <Link href="/meals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Meal
          </Link>
        </Button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">My Meals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {myMeals?.map((meal) => (
          <Link key={meal.id} href={`/meals/${meal.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              {meal.image && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img src={meal.image || "/placeholder.svg"} alt={meal.title} className="w-full h-full object-cover" />
                </div>
              )}
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
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-4">All Meals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMeals?.map((meal) => (
          <Link key={meal.id} href={`/meals/${meal.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              {meal.image && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img src={meal.image || "/placeholder.svg"} alt={meal.title} className="w-full h-full object-cover" />
                </div>
              )}
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
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}