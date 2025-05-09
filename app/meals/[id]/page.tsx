"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { MealDisplay } from "@/components/meals/MealDisplay"

const fetchMeal = async (id: string) => {
  const { data, error } = await supabase.from("meals").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export default function MealDetails() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const { toast } = useToast()

  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => fetchMeal(id),
    enabled: !!id,
  })

  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase.from("meals").delete().eq("id", mealId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meals"])
      toast({ title: "Success", description: "Meal deleted successfully" })
      router.push("/meals")
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: `Error deleting meal: ${error.message}` })
    },
  })

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      deleteMealMutation.mutate(id)
    }
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
          <Link href="/meals" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Meals
          </Link>
        </Button>
      </div>

      <MealDisplay meal={meal} onEdit={() => router.push(`/meals/${id}/edit`)} onDelete={handleDelete} />
    </div>
  )
}