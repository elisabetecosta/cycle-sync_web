'use client'

import { UtensilsCrossed } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { MealPlanner } from '@/components/meal-planner/MealPlanner';

export default function MealPlannerPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background py-8 px-4 pb-20">
      <div className="w-full max-w-4xl">
        <PageHeader Icon={UtensilsCrossed} title="Meal Planner" />
        <MealPlanner />
      </div>
    </main>
  );
}