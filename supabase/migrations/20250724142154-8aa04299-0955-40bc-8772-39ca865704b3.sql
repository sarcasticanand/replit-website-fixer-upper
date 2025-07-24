-- Create RLS policies for generated_plans table
CREATE POLICY "Allow authenticated users to insert their own plans" 
ON public.generated_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NOT NULL);

CREATE POLICY "Allow authenticated users to view their own plans" 
ON public.generated_plans 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NOT NULL);

CREATE POLICY "Allow authenticated users to update their own plans" 
ON public.generated_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own plans" 
ON public.generated_plans 
FOR DELETE 
USING (auth.uid() = user_id);