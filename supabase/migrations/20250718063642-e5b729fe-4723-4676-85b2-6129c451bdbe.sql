-- Workout Templates Table
CREATE TABLE public.workout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'extremely_active')),
  goal TEXT NOT NULL CHECK (goal IN ('weight_loss', 'weight_gain', 'muscle_building', 'fitness', 'wellness')),
  experience TEXT NOT NULL CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  workouts_per_week INTEGER NOT NULL DEFAULT 3,
  exercise_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diet Templates Table
CREATE TABLE public.diet_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calorie_range TEXT NOT NULL,
  dietary_restrictions JSONB DEFAULT '[]'::jsonb,
  meal_count INTEGER NOT NULL DEFAULT 3,
  cuisine_type TEXT DEFAULT 'indian',
  meal_plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grocery Items Table
CREATE TABLE public.grocery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('grains', 'pulses', 'vegetables', 'fruits', 'dairy', 'proteins', 'spices', 'oils', 'nuts')),
  nutritional_info JSONB NOT NULL,
  seasonal_availability JSONB DEFAULT '{}'::jsonb,
  regional_names JSONB DEFAULT '{}'::jsonb,
  substitutes JSONB DEFAULT '[]'::jsonb,
  average_price DECIMAL(10,2),
  unit TEXT NOT NULL DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generated Plans Table (enhanced)
CREATE TABLE public.generated_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_plan JSONB,
  diet_plan JSONB,
  grocery_list JSONB,
  nutritional_breakdown JSONB,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('template', 'ai_generated', 'hybrid')),
  user_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Feedback Table
CREATE TABLE public.plan_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.generated_plans(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_templates (public read)
CREATE POLICY "Anyone can view workout templates" 
ON public.workout_templates 
FOR SELECT 
USING (true);

-- RLS Policies for diet_templates (public read)
CREATE POLICY "Anyone can view diet templates" 
ON public.diet_templates 
FOR SELECT 
USING (true);

-- RLS Policies for grocery_items (public read)
CREATE POLICY "Anyone can view grocery items" 
ON public.grocery_items 
FOR SELECT 
USING (true);

-- RLS Policies for generated_plans
CREATE POLICY "Users can view their own generated plans" 
ON public.generated_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated plans" 
ON public.generated_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated plans" 
ON public.generated_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for plan_feedback
CREATE POLICY "Users can view their own feedback" 
ON public.plan_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" 
ON public.plan_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for generated_plans updated_at
CREATE TRIGGER update_generated_plans_updated_at
    BEFORE UPDATE ON public.generated_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_workout_templates_lookup ON public.workout_templates(activity_level, goal, experience);
CREATE INDEX idx_diet_templates_lookup ON public.diet_templates(calorie_range, cuisine_type);
CREATE INDEX idx_grocery_items_category ON public.grocery_items(category);
CREATE INDEX idx_generated_plans_user_id ON public.generated_plans(user_id);
CREATE INDEX idx_plan_feedback_plan_id ON public.plan_feedback(plan_id);