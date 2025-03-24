"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Utensils, ChefHat, Scale, Apple } from "lucide-react"
import type { Meal } from "@/types"
import Link from "next/link"

interface MealDisplayProps {
  meal: Meal
  onEdit: () => void
  onDelete: () => void
}

export function MealDisplay({ meal, onEdit, onDelete }: MealDisplayProps) {
  // Use nutritional info from the meal or provide defaults
  const nutritionalInfo = meal.nutritional_info || {
    calories: 250,
    carbs: 2,
    protein: 12,
    fat: 8,
    servingSize: "1 serving",
    totalServings: "1",
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with title and action buttons */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">{meal.title}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-1 bg-black text-white hover:bg-gray-800 hover:text-white hover:no-underline border-black"
          >
            <Link href={`/meals/${meal.id}/edit`}>
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} className="flex items-center gap-1">
            <Trash className="h-4 w-4" />
            Remover
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {meal.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="bg-black text-white rounded-full px-3 py-1">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Main image */}
      <div className="w-full overflow-hidden rounded-lg mb-10 h-[400px]">
        <img
          src={meal.image || "/images/meal-placeholder.png?height=400&width=800"}
          alt={meal.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Portion Information */}
      <div className="bg-white rounded-lg shadow-lg mb-8 border border-gray-100">
        <div className="px-8 py-6 flex items-center">
          <Scale className="mr-3 h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-bold">Portion Information</h2>
        </div>
        <div className="px-8">
          <div className="border-t-2 border-gray-200"></div>
        </div>
        <div className="px-8 py-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-md">
              <p className="text-sm text-gray-600 text-center">Total Servings</p>
              <p className="text-xl font-bold text-center mt-2">{nutritionalInfo.totalServings}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-md">
              <p className="text-sm text-gray-600 text-center">Serving Size</p>
              <p className="text-xl font-bold text-center mt-2">{nutritionalInfo.servingSize}</p>
            </div>
          </div>
        </div>
        <div className="px-8 pb-4">
          <div className="border-t-2 border-gray-200"></div>
        </div>
      </div>

      {/* Nutritional Information */}
      <div className="bg-white rounded-lg shadow-lg mb-8 border border-gray-100">
        <div className="px-8 py-6 flex items-center">
          <Apple className="mr-3 h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-bold">Nutritional Information</h2>
        </div>
        <div className="px-8">
          <div className="border-t-2 border-gray-200"></div>
        </div>
        <div className="px-8 py-4">
          <p className="text-sm text-gray-600">Per serving ({nutritionalInfo.servingSize})</p>
        </div>
        <div className="px-8 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-6 rounded-md">
              <p className="text-2xl font-bold text-center">{nutritionalInfo.calories}</p>
              <p className="text-sm text-gray-600 text-center">Calories</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-md">
              <p className="text-2xl font-bold text-center">{nutritionalInfo.carbs}g</p>
              <p className="text-sm text-gray-600 text-center">Carbohydrates</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-md">
              <p className="text-2xl font-bold text-center">{nutritionalInfo.protein}g</p>
              <p className="text-sm text-gray-600 text-center">Protein</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-md">
              <p className="text-2xl font-bold text-center">{nutritionalInfo.fat}g</p>
              <p className="text-sm text-gray-600 text-center">Fat</p>
            </div>
          </div>
        </div>
        <div className="px-8 pb-4">
          <div className="border-t-2 border-gray-200"></div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-lg shadow-lg mb-8 border border-gray-100">
        <div className="px-8 py-6 flex items-center">
          <Utensils className="mr-3 h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-bold">Ingredients</h2>
        </div>
        <div className="px-8">
          <div className="border-t-2 border-gray-200"></div>
        </div>
        <div className="px-8 py-8">
          <ul className="space-y-2">
            {meal.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700 flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-black mt-2 mr-2 flex-shrink-0"></span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-8 pb-4">
          <div className="border-t-2 border-gray-200"></div>
        </div>
      </div>

      {/* Preparation */}
      <div className="bg-white rounded-lg shadow-lg mb-8 border border-gray-100">
        <div className="px-8 py-6 flex items-center">
          <ChefHat className="mr-3 h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-bold">Preparation</h2>
        </div>
        <div className="px-8">
          <div className="border-t-2 border-gray-200"></div>
        </div>
        <div className="px-8 py-8">
          <ol className="space-y-6">
            {meal.preparation
              .split("\n")
              .filter((step) => step.trim() !== "")
              .map((step, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center bg-black text-white rounded-full w-8 h-8 mr-4 font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-1">{step}</span>
                </li>
              ))}
          </ol>
        </div>
        <div className="px-8 pb-4">
          <div className="border-t-2 border-gray-200"></div>
        </div>
      </div>
    </div>
  )
}