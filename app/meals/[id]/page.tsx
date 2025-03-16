"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { EditMealForm } from "@/components/meals/EditMealForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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

  if (isLoading) return <div>Loading...</div>
  if (!meal) return <div>Meal not found</div>

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/meals" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Meals
          </Link>
        </Button>
      </div>

      <MealDisplay meal={meal} onEdit={() => setIsEditDialogOpen(true)} onDelete={handleDelete} />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
          </DialogHeader>
          <EditMealForm
            meal={meal}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              queryClient.invalidateQueries(["meal", id])
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}