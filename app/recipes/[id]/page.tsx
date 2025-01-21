"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { EditRecipeForm } from "@/components/recipes/EditRecipeForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { RecipeDisplay } from "@/components/recipes/RecipeDisplay"

const fetchRecipe = async (id: string) => {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export default function RecipeDetails() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => fetchRecipe(id),
    enabled: !!id,
  })

  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", recipeId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["recipes"])
      toast({ title: "Success", description: "Recipe deleted successfully" })
      router.push("/recipes")
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: `Error deleting recipe: ${error.message}` })
    },
  })

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipeMutation.mutate(id)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!recipe) return <div>Recipe not found</div>

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/recipes" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>
      </div>

      <RecipeDisplay recipe={recipe} onEdit={() => setIsEditDialogOpen(true)} onDelete={handleDelete} />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>
          <EditRecipeForm
            recipe={recipe}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              queryClient.invalidateQueries(["recipe", id])
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

