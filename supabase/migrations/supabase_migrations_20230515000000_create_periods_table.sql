-- Create the periods table
CREATE TABLE public.periods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own periods."
  ON periods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own periods."
  ON periods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own periods."
  ON periods FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own periods."
  ON periods FOR SELECT
  USING (auth.uid() = user_id);

-- Create an index on user_id and start_date for faster queries
CREATE INDEX periods_user_id_start_date_idx ON public.periods (user_id, start_date);

