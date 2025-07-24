import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { generatePersonalizedPlan, type UserProfile } from "@/services/healthPlanService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { profile, goals, dietaryRestrictions, healthConditions, refetch } = useUserProfile();

  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "male",
    activityLevel: "",
    goals: [],
    dietaryRestrictions: [],
    fitnessExperience: "",
    preferredWorkoutTime: "",
    healthConditions: []
  });

  // Check if user is authenticated and has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user already has a profile and plans
      if (profile && goals.length > 0) {
        toast({
          title: "Profile already complete",
          description: "Redirecting to your dashboard...",
        });
        navigate('/dashboard');
        return;
      }

      setChecking(false);
    };

    checkOnboardingStatus();
  }, [authLoading, user, profile, goals, navigate, toast]);

  // Pre-fill form with existing data if available
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        age: profile.age?.toString() || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        activityLevel: profile.activity_level || "",
        fitnessExperience: profile.fitness_experience || "",
        preferredWorkoutTime: profile.preferred_workout_time || "",
        goals: goals.map(g => g.goal) || [],
        dietaryRestrictions: dietaryRestrictions.map(d => d.restriction) || [],
        healthConditions: healthConditions.map(h => h.condition) || []
      }));
    }
  }, [profile, goals, dietaryRestrictions, healthConditions]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in first to generate your plan.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Save profile data to Supabase
      await saveProfileToSupabase();

      // Convert form data to UserProfile format
      const userProfile: UserProfile = {
        age: parseInt(formData.age) || 25,
        height: parseInt(formData.height) || 170,
        weight: parseInt(formData.weight) || 70,
        gender: formData.gender as 'male' | 'female' || 'male',
        activityLevel: formData.activityLevel as any || 'moderate',
        primaryGoal: formData.goals?.[0]?.replace(' ', '_').toLowerCase() as any || 'fitness',
        fitnessExperience: formData.fitnessExperience as any || 'beginner',
        dietaryRestrictions: formData.dietaryRestrictions || [],
        preferredWorkoutTime: formData.preferredWorkoutTime || 'morning',
        healthConditions: formData.healthConditions || []
      };

      console.log('Generating plan for user:', user.id, 'with profile:', userProfile);

      // Generate plans using Gemini API
      const { plan, planId } = await generatePersonalizedPlan(userProfile);
      
      // Store data in localStorage for compatibility
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      localStorage.setItem('currentPlan', JSON.stringify(plan));
      localStorage.setItem('currentPlanId', planId);
      localStorage.setItem('onboardingComplete', 'true');

      toast({
        title: "Welcome to HealthSync!",
        description: "Your personalized Indian health plan has been generated successfully.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error generating plans:', error);
      toast({
        title: "Error",
        description: "Failed to generate your personalized plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfileToSupabase = async () => {
    if (!user) return;

    try {
      // Save or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          age: parseInt(formData.age) || null,
          height: parseInt(formData.height) || null,
          weight: parseInt(formData.weight) || null,
          activity_level: formData.activityLevel || null,
          fitness_experience: formData.fitnessExperience || null,
          preferred_workout_time: formData.preferredWorkoutTime || null,
        });

      if (profileError) throw profileError;

      // Clear existing goals, dietary restrictions, and health conditions
      await supabase.from('user_goals').delete().eq('user_id', user.id);
      await supabase.from('user_dietary_restrictions').delete().eq('user_id', user.id);
      await supabase.from('user_health_conditions').delete().eq('user_id', user.id);

      // Insert new goals
      if (formData.goals.length > 0) {
        const { error: goalsError } = await supabase
          .from('user_goals')
          .insert(formData.goals.map(goal => ({
            user_id: user.id,
            goal: goal
          })));
        if (goalsError) throw goalsError;
      }

      // Insert new dietary restrictions
      if (formData.dietaryRestrictions.length > 0) {
        const { error: restrictionsError } = await supabase
          .from('user_dietary_restrictions')
          .insert(formData.dietaryRestrictions.map(restriction => ({
            user_id: user.id,
            restriction: restriction
          })));
        if (restrictionsError) throw restrictionsError;
      }

      // Insert new health conditions
      if (formData.healthConditions.length > 0) {
        const { error: conditionsError } = await supabase
          .from('user_health_conditions')
          .insert(formData.healthConditions.map(condition => ({
            user_id: user.id,
            condition: condition
          })));
        if (conditionsError) throw conditionsError;
      }

      // Refresh user profile data
      await refetch();
    } catch (error) {
      console.error('Error saving profile to Supabase:', error);
      throw error;
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Tell us about yourself to personalize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="170"
              value={formData.height}
              onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Activity Level</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your current activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
              <SelectItem value="light">Light activity (1-3 days/week)</SelectItem>
              <SelectItem value="moderate">Moderate activity (3-5 days/week)</SelectItem>
              <SelectItem value="very_active">Very active (6-7 days/week)</SelectItem>
              <SelectItem value="extremely_active">Extremely active (2x/day, intense workouts)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Health Goals</CardTitle>
        <CardDescription>What do you want to achieve with HealthSync?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Primary Goals (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Weight Loss",
              "Weight Gain",
              "Muscle Building",
              "Better Nutrition",
              "Improved Fitness",
              "Better Sleep",
              "Stress Management",
              "General Wellness"
            ].map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={goal}
                  checked={formData.goals.includes(goal)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
                    } else {
                      setFormData(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
                    }
                  }}
                />
                <Label htmlFor={goal}>{goal}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Fitness Experience</Label>
          <RadioGroup 
            value={formData.fitnessExperience}
            onValueChange={(value) => setFormData(prev => ({ ...prev, fitnessExperience: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner">Beginner (0-6 months)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate">Intermediate (6 months - 2 years)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced">Advanced (2+ years)</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Final Details</CardTitle>
        <CardDescription>Just a few more details to personalize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Preferred Workout Time</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, preferredWorkoutTime: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="When do you prefer to workout?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="early-morning">Early Morning (5-8 AM)</SelectItem>
              <SelectItem value="morning">Morning (8-11 AM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
              <SelectItem value="evening">Evening (6-9 PM)</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Dietary Restrictions (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Vegetarian",
              "Vegan",
              "Gluten-Free",
              "Dairy-Free",
              "Keto",
              "Paleo",
              "Nut Allergies",
              "None"
            ].map((restriction) => (
              <div key={restriction} className="flex items-center space-x-2">
                <Checkbox
                  id={restriction}
                  checked={formData.dietaryRestrictions.includes(restriction)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({ ...prev, dietaryRestrictions: [...prev.dietaryRestrictions, restriction] }));
                    } else {
                      setFormData(prev => ({ ...prev, dietaryRestrictions: prev.dietaryRestrictions.filter(r => r !== restriction) }));
                    }
                  }}
                />
                <Label htmlFor={restriction}>{restriction}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Health Conditions (optional)</Label>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Diabetes",
              "High Blood Pressure",
              "Heart Disease",
              "Arthritis",
              "Thyroid Issues",
              "PCOS",
              "None"
            ].map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={condition}
                  checked={formData.healthConditions.includes(condition)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({ ...prev, healthConditions: [...prev.healthConditions, condition] }));
                    } else {
                      setFormData(prev => ({ ...prev, healthConditions: prev.healthConditions.filter(c => c !== condition) }));
                    }
                  }}
                />
                <Label htmlFor={condition}>{condition}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (authLoading || checking) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground mb-4">
              Step {currentStep} of 3 - This helps us create your personalized health plan
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? "Setting up your profile..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}