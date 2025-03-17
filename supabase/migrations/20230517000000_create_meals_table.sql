-- Create the meals table
CREATE TABLE public.meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  tags TEXT[] NOT NULL,
  ingredients TEXT[] NOT NULL,
  preparation TEXT NOT NULL,
  nutritional_info JSONB,
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

CREATE POLICY "Users can view all meals."
ON meals FOR SELECT
USING (true);

-- Create an index on user_id for faster queries
CREATE INDEX meals_user_id_idx ON public.meals (user_id);

