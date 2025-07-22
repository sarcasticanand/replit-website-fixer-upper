import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { userProfile, preferences } = await req.json();

    // Step 1: Try to find base templates from database
    const { data: workoutTemplate } = await supabaseClient
      .from('workout_templates')
      .select('*')
      .eq('activity_level', userProfile.activityLevel)
      .eq('goal', userProfile.primaryGoal)
      .eq('experience', userProfile.fitnessExperience)
      .limit(1)
      .single();

    const calorieRange = calculateCalorieRange(userProfile);
    const { data: dietTemplate } = await supabaseClient
      .from('diet_templates')
      .select('*')
      .eq('calorie_range', calorieRange)
      .contains('dietary_restrictions', JSON.stringify(userProfile.dietaryRestrictions || []))
      .limit(1)
      .single();

    // Step 2: Get grocery items for Indian context
    const { data: groceryItems } = await supabaseClient
      .from('grocery_items')
      .select('*')
      .limit(100);

    // Step 3: Generate AI-enhanced plan using Gemini
    const aiPlan = await generateWithGemini(userProfile, preferences, workoutTemplate, dietTemplate, groceryItems);

    // Step 4: Save the generated plan
    const { data: savedPlan, error: saveError } = await supabaseClient
      .from('generated_plans')
      .insert({
        user_id: user.id,
        workout_plan: aiPlan.workoutPlan,
        diet_plan: aiPlan.dietPlan,
        grocery_list: aiPlan.groceryList,
        nutritional_breakdown: aiPlan.nutritionalBreakdown,
        plan_type: workoutTemplate || dietTemplate ? 'hybrid' : 'ai_generated',
        user_preferences: { userProfile, preferences }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving plan:', saveError);
      throw saveError;
    }

    return new Response(JSON.stringify({
      success: true,
      plan: aiPlan,
      planId: savedPlan.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-indian-health-plan:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateCalorieRange(profile: any): string {
  // Basic BMR calculation using Mifflin-St Jeor Equation
  const { age, weight, height, gender, activityLevel, primaryGoal } = profile;
  
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'very_active': 1.725,
    'extremely_active': 1.9
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

  // Adjust for goals
  let targetCalories = tdee;
  if (primaryGoal === 'weight_loss') {
    targetCalories = tdee - 500; // 500 calorie deficit
  } else if (primaryGoal === 'weight_gain') {
    targetCalories = tdee + 500; // 500 calorie surplus
  }

  // Categorize into ranges
  if (targetCalories < 1500) return '1200-1500';
  if (targetCalories < 1800) return '1500-1800';
  if (targetCalories < 2200) return '1800-2200';
  if (targetCalories < 2500) return '2200-2500';
  return '2500+';
}

async function generateWithGemini(userProfile: any, preferences: any, workoutTemplate: any, dietTemplate: any, groceryItems: any[]) {
  const prompt = `Generate a comprehensive Indian health and fitness plan in JSON format:

USER PROFILE:
- Age: ${userProfile.age}, Height: ${userProfile.height}cm, Weight: ${userProfile.weight}kg, Gender: ${userProfile.gender}
- Activity Level: ${userProfile.activityLevel}
- Primary Goal: ${userProfile.primaryGoal}
- Fitness Experience: ${userProfile.fitnessExperience}
- Dietary Restrictions: ${JSON.stringify(userProfile.dietaryRestrictions || [])}
- Preferred Workout Time: ${userProfile.preferredWorkoutTime}
- Location: ${preferences?.location || 'India'}

AVAILABLE GROCERY ITEMS: ${JSON.stringify(groceryItems?.slice(0, 50) || [])}

BASE TEMPLATES:
Workout Template: ${workoutTemplate ? JSON.stringify(workoutTemplate) : 'None - create from scratch'}
Diet Template: ${dietTemplate ? JSON.stringify(dietTemplate) : 'None - create from scratch'}

REQUIREMENTS:
1. Create a 4-week progressive plan
2. Focus on Indian foods, spices, and cooking methods
3. Calculate exact portions and calories for each meal
4. Generate detailed shopping list with quantities for 1 week
5. Include 3 meal alternatives per day
6. Consider seasonal availability and regional preferences
7. Include meal prep instructions and cooking tips
8. Add traditional Indian exercises like Surya Namaskara if appropriate

RESPONSE FORMAT (JSON):
{
  "workoutPlan": {
    "overview": "Plan description",
    "duration": "4 weeks",
    "schedule": {
      "week1": [
        {
          "day": "Monday",
          "exercises": [{"name": "Exercise", "sets": 3, "reps": "10-12", "rest": "60s", "instructions": "Detailed form"}],
          "warmup": "5-10 min description",
          "cooldown": "5-10 min description",
          "duration": "45-60 minutes"
        }
      ]
    },
    "progressionNotes": "How to increase intensity each week",
    "indianExercises": ["Surya Namaskara", "Traditional squats", "etc"]
  },
  "dietPlan": {
    "overview": "Plan description",
    "dailyCalories": 2000,
    "macros": {"protein": "25%", "carbs": "50%", "fats": "25%"},
    "weeklyMenu": {
      "week1": {
        "monday": {
          "breakfast": {"name": "Dish name", "ingredients": [], "calories": 400, "protein": "20g", "recipe": "Step by step"},
          "lunch": {"name": "Dish name", "ingredients": [], "calories": 600, "protein": "30g", "recipe": "Step by step"},
          "dinner": {"name": "Dish name", "ingredients": [], "calories": 500, "protein": "25g", "recipe": "Step by step"},
          "snacks": [{"name": "Snack", "calories": 200, "ingredients": []}]
        }
      }
    },
    "alternatives": {
      "breakfast": [3 alternatives],
      "lunch": [3 alternatives],
      "dinner": [3 alternatives]
    },
    "mealPrepTips": ["Tip 1", "Tip 2", "Tip 3"]
  },
  "groceryList": {
    "grains": [{"item": "Basmati Rice", "quantity": "2 kg", "price": "₹200"}],
    "pulses": [{"item": "Moong Dal", "quantity": "1 kg", "price": "₹150"}],
    "vegetables": [{"item": "Spinach", "quantity": "500g", "price": "₹30"}],
    "fruits": [{"item": "Banana", "quantity": "2 dozen", "price": "₹80"}],
    "dairy": [{"item": "Low-fat Milk", "quantity": "2L", "price": "₹100"}],
    "spices": [{"item": "Turmeric", "quantity": "100g", "price": "₹25"}],
    "totalWeeklyCost": "₹2500"
  },
  "nutritionalBreakdown": {
    "dailyAverages": {"calories": 2000, "protein": "120g", "carbs": "250g", "fats": "67g", "fiber": "35g"},
    "keyNutrients": {"iron": "18mg", "calcium": "1000mg", "vitaminC": "90mg"},
    "hydrationGoal": "3-4 liters per day"
  },
  "additionalTips": {
    "culturalConsiderations": ["Respect fasting periods", "Festival food modifications"],
    "seasonalAdjustments": ["Summer cooling foods", "Winter warming spices"],
    "budgetTips": ["Buy in bulk", "Seasonal vegetables"],
    "timeManagement": ["Meal prep Sunday", "Quick breakfast options"]
  }
}

Make it authentic, practical, and culturally appropriate for Indian users.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.candidates[0].content.parts[0].text;
  
  // Clean and parse JSON response
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from Gemini');
  }
  
  return JSON.parse(jsonMatch[0]);
}