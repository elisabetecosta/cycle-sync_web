"use client"

import { EditMealForm } from "@/components/meals/EditMealForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

// Function to fetch meal data
const fetchMeal = async (id: string) => {
  const { data, error } = await supabase.from("meals").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export default function EditMealPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Fetch the meal data
  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => fetchMeal(id),
    enabled: !!id,
  })

  // Handle successful edit
  const handleEditSuccess = () => {
    router.push(`/meals/${id}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Meal not found</h2>
          <p className="mt-2">The meal you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-4">
            <Link href="/meals">Back to Meals</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/meals/${id}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Meal
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Meal: {meal.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EditMealForm meal={meal} onSuccess={handleEditSuccess} />
        </CardContent>
      </Card>
    </div>
  )
}