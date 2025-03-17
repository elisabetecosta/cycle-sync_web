"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateMealForm } from "@/components/meals/CreateMealForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewMeal() {
  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/meals" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Meals
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Meal</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateMealForm />
        </CardContent>
      </Card>
    </div>
  )
}