-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  age INTEGER,
  height INTEGER,
  weight INTEGER,
  activity_level TEXT,
  fitness_experience TEXT,
  preferred_workout_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table (many-to-many relationship)
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dietary restrictions table (many-to-many relationship)
CREATE TABLE public.user_dietary_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  restriction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health conditions table (many-to-many relationship)
CREATE TABLE public.user_health_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  condition TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plans table to store generated workout and diet plans
CREATE TABLE public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_plan TEXT,
  diet_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dietary_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for goals
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for dietary restrictions
CREATE POLICY "Users can view their own dietary restrictions" 
ON public.user_dietary_restrictions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dietary restrictions" 
ON public.user_dietary_restrictions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dietary restrictions" 
ON public.user_dietary_restrictions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for health conditions
CREATE POLICY "Users can view their own health conditions" 
ON public.user_health_conditions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health conditions" 
ON public.user_health_conditions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health conditions" 
ON public.user_health_conditions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for plans
CREATE POLICY "Users can view their own plans" 
ON public.user_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" 
ON public.user_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
ON public.user_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_plans_updated_at
    BEFORE UPDATE ON public.user_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();