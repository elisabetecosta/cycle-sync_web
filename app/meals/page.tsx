"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { AVAILABLE_TAGS } from "@/constants/meals"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

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

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Filter meals based on search query and selected tags
  const filterMeals = (meals: Meal[] | undefined) => {
    if (!meals) return []

    return meals.filter((meal) => {
      // Filter by search query
      const matchesSearch = searchQuery === "" || meal.title.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by tags
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => meal.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }

  // Apply filters to meals
  const filteredMyMeals = useMemo(() => filterMeals(myMeals), [myMeals, searchQuery, selectedTags])
  const filteredAllMeals = useMemo(() => filterMeals(allMeals), [allMeals, searchQuery, selectedTags])

  if (myMealsLoading || allMealsLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meals</h1>
        <Button asChild>
          <Link href="/meals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Meal
          </Link>
        </Button>
      </div>

      {/* Search and Filter UI */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-gray-100" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {selectedTags.length > 0 && (
              <span className="ml-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {selectedTags.length}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Filter by tags:</h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button variant="link" onClick={() => setSelectedTags([])} className="mt-2 p-0 h-auto text-sm">
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">My Meals</h2>
      {myMeals?.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg mb-8">
          <p className="text-gray-500">You haven't created any meals yet.</p>
          <Button asChild className="mt-4">
            <Link href="/meals/new">Create Your First Meal</Link>
          </Button>
        </div>
      ) : filteredMyMeals.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg mb-8">
          <p className="text-gray-500">No meals match your search criteria.</p>
          {(searchQuery || selectedTags.length > 0) && (
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("")
                setSelectedTags([])
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredMyMeals.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={meal.image || "https://theme-assets.getbento.com/sensei/b1ceca2.sensei/assets/images/catering-item-placeholder-704x520.png?height=200&width=400"}
                    alt={meal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pt-4">
                  <CardTitle className="mb-4">{meal.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {meal.tags.map((tag) => (
                      <Badge key={tag} className="bg-black text-white rounded-full px-3 py-1 mb-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">All Meals</h2>
      {allMeals?.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No meals available in the system.</p>
        </div>
      ) : filteredAllMeals.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No meals match your search criteria.</p>
          {(searchQuery || selectedTags.length > 0) && (
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("")
                setSelectedTags([])
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAllMeals.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={meal.image || "https://theme-assets.getbento.com/sensei/b1ceca2.sensei/assets/images/catering-item-placeholder-704x520.png?height=200&width=400"}
                    alt={meal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pt-4">
                  <CardTitle className="mb-4">{meal.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {meal.tags.map((tag) => (
                      <Badge key={tag} className="bg-black text-white rounded-full px-3 py-1 mb-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}