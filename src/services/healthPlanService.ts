import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extremely_active';
  primaryGoal: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'fitness' | 'wellness';
  fitnessExperience: 'beginner' | 'intermediate' | 'advanced';
  dietaryRestrictions: string[];
  preferredWorkoutTime: string;
  healthConditions?: string[];
}

export interface HealthPlan {
  workoutPlan: any;
  dietPlan: any;
  groceryList: any;
  nutritionalBreakdown: any;
  additionalTips?: any;
}

export interface GeneratedPlan {
  id: string;
  workout_plan: any;
  diet_plan: any;
  grocery_list: any;
  nutritional_breakdown: any;
  plan_type: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_preferences: any;
}

export async function generatePersonalizedPlan(
  userProfile: UserProfile,
  preferences: any = {}
): Promise<{ plan: HealthPlan; planId: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-indian-health-plan', {
      body: {
        userProfile,
        preferences
      }
    });

    if (error) {
      console.error('Error calling edge function:', error);
      throw new Error(error.message || 'Failed to generate plan');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate plan');
    }

    return {
      plan: data.plan,
      planId: data.planId
    };
  } catch (error) {
    console.error('Error generating personalized plan:', error);
    throw error;
  }
}

export async function getUserPlans(): Promise<GeneratedPlan[]> {
  try {
    const { data, error } = await supabase
      .from('generated_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user plans:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user plans:', error);
    throw error;
  }
}

export async function savePlanFeedback(
  planId: string,
  rating: number,
  feedbackText?: string,
  completionPercentage?: number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('plan_feedback')
      .insert({
        plan_id: planId,
        user_id: user.id,
        rating,
        feedback_text: feedbackText,
        completion_percentage: completionPercentage
      });

    if (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
}

export async function getGroceryItems(category?: string) {
  try {
    let query = supabase.from('grocery_items').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching grocery items:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching grocery items:', error);
    throw error;
  }
}