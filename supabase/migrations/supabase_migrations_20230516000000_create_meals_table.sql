-- Create an enum for meal times
CREATE TYPE meal_time AS ENUM ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'late_night_snack');

-- Create the meals table
CREATE TABLE public.meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day DATE NOT NULL,
  phase TEXT NOT NULL,
  time meal_time NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own meals."
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals."
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals."
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own meals."
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

-- Create an index on user_id and day for faster queries
CREATE INDEX meals_user_id_day_idx ON public.meals (user_id, day);

