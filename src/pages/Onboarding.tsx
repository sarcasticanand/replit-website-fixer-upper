import { useState } from "react";
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
import { generatePersonalizedPlans } from "@/services/perplexityService";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    activityLevel: "",
    goals: [],
    dietaryRestrictions: [],
    fitnessExperience: "",
    preferredWorkoutTime: "",
    healthConditions: []
  });

  const [apiKey, setApiKey] = useState("");

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
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Perplexity API key to generate personalized plans.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Generate personalized plans using Perplexity API
      const { workoutPlan, dietPlan } = await generatePersonalizedPlans(formData, apiKey);

      // Store user data and generated plans
      const userProfileWithPlans = {
        ...formData,
        workoutPlan,
        dietPlan,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.setItem('userProfile', JSON.stringify(userProfileWithPlans));
      
      toast({
        title: "Setup complete!",
        description: "Your personalized health plans have been generated!",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Setup failed:", error);
      
      toast({
        title: "Setup failed",
        description: error instanceof Error ? error.message : "Failed to generate personalized plans. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <Label>Activity Level</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your current activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
              <SelectItem value="light">Light activity (1-3 days/week)</SelectItem>
              <SelectItem value="moderate">Moderate activity (3-5 days/week)</SelectItem>
              <SelectItem value="very-active">Very active (6-7 days/week)</SelectItem>
              <SelectItem value="extremely-active">Extremely active (2x/day, intense workouts)</SelectItem>
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
          <Label htmlFor="apiKey">Perplexity API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Perplexity API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Required to generate personalized workout and diet plans. 
            <a href="https://docs.perplexity.ai/docs/getting-started" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
              Get your API key here
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );

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