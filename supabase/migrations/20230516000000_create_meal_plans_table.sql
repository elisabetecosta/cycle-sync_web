-- Create an enum for meal times
CREATE TYPE meal_time AS ENUM ('breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'lateNightSnack');

-- Create the meal_plans table
CREATE TABLE public.meal_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day DATE NOT NULL,
  type meal_time NOT NULL,
  content TEXT NOT NULL,
  meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own meal plans."
ON meal_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans."
ON meal_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans."
ON meal_plans FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own meal plans."
ON meal_plans FOR SELECT
USING (auth.uid() = user_id);

-- Create an index on user_id and day for faster queries
CREATE INDEX meal_plans_user_id_day_idx ON public.meal_plans (user_id, day);

