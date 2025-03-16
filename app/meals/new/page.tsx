"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateMealForm } from "@/components/meals/CreateMealForm"

export default function NewMeal() {
  return (
    <div className="container mx-auto p-4">
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