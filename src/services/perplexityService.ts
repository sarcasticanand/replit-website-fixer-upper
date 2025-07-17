interface UserProfile {
  age: string;
  height: string;
  weight: string;
  activityLevel: string;
  goals: string[];
  dietaryRestrictions: string[];
  fitnessExperience: string;
  preferredWorkoutTime: string;
  healthConditions?: string[];
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const generatePersonalizedPlans = async (
  userProfile: UserProfile,
  apiKey: string
): Promise<{ workoutPlan: string; dietPlan: string }> => {
  if (!apiKey) {
    throw new Error('Perplexity API key is required');
  }

  // Generate workout plan
  const workoutPrompt = `Create a personalized weekly workout plan for:
- Age: ${userProfile.age}
- Height: ${userProfile.height}cm
- Weight: ${userProfile.weight}kg
- Activity Level: ${userProfile.activityLevel}
- Fitness Experience: ${userProfile.fitnessExperience}
- Goals: ${userProfile.goals.join(', ')}
- Preferred Workout Time: ${userProfile.preferredWorkoutTime}
- Health Conditions: ${userProfile.healthConditions?.join(', ') || 'None'}

Please provide:
1. A 7-day workout schedule
2. Specific exercises for each day
3. Sets, reps, and duration
4. Rest days
5. Progression tips

Format as structured weekly plan with clear daily breakdowns.`;

  // Generate diet plan
  const dietPrompt = `Create a personalized weekly meal plan for:
- Age: ${userProfile.age}
- Height: ${userProfile.height}cm
- Weight: ${userProfile.weight}kg
- Activity Level: ${userProfile.activityLevel}
- Goals: ${userProfile.goals.join(', ')}
- Dietary Restrictions: ${userProfile.dietaryRestrictions.join(', ')}
- Health Conditions: ${userProfile.healthConditions?.join(', ') || 'None'}

Please provide:
1. Daily meal plans (breakfast, lunch, dinner, snacks)
2. Calorie targets
3. Macro breakdown
4. Portion sizes
5. Grocery list for the week

Format as structured weekly meal plan with clear daily breakdowns and shopping list.`;

  try {
    // Fetch workout plan
    const workoutResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a certified fitness trainer and nutritionist. Create detailed, safe, and effective plans.'
          },
          {
            role: 'user',
            content: workoutPrompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    // Fetch diet plan
    const dietResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a certified nutritionist and dietitian. Create balanced, healthy, and practical meal plans.'
          },
          {
            role: 'user',
            content: dietPrompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!workoutResponse.ok || !dietResponse.ok) {
      throw new Error('Failed to fetch plans from Perplexity');
    }

    const workoutData: PerplexityResponse = await workoutResponse.json();
    const dietData: PerplexityResponse = await dietResponse.json();

    return {
      workoutPlan: workoutData.choices[0]?.message.content || 'Unable to generate workout plan',
      dietPlan: dietData.choices[0]?.message.content || 'Unable to generate diet plan'
    };
  } catch (error) {
    console.error('Error generating personalized plans:', error);
    throw new Error('Failed to generate personalized plans. Please check your API key and try again.');
  }
};