import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Star, ShoppingCart } from "lucide-react";
import { generatePersonalizedPlan, type UserProfile, type HealthPlan } from "@/services/healthPlanService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface PlanGeneratorProps {
  userProfile: UserProfile;
  onPlanGenerated?: (plan: HealthPlan, planId: string) => void;
}

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ userProfile, onPlanGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<HealthPlan | null>(null);
  const [planId, setPlanId] = useState<string>('');
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const { plan, planId: newPlanId } = await generatePersonalizedPlan(userProfile);
      setGeneratedPlan(plan);
      setPlanId(newPlanId);
      onPlanGenerated?.(plan, newPlanId);
      
      toast({
        title: "Plan Generated Successfully!",
        description: "Your personalized Indian health plan is ready.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPlan = () => {
    if (!generatedPlan) return;
    
    const planData = JSON.stringify(generatedPlan, null, 2);
    const blob = new Blob([planData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'indian-health-plan.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!generatedPlan) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Generate Your Personalized Plan
          </CardTitle>
          <CardDescription>
            Get a comprehensive Indian diet and workout plan tailored just for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Your Profile Summary:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Age: {userProfile.age} years</div>
              <div>Height: {userProfile.height} cm</div>
              <div>Weight: {userProfile.weight} kg</div>
              <div>Activity: {userProfile.activityLevel}</div>
              <div>Goal: {userProfile.primaryGoal}</div>
              <div>Experience: {userProfile.fitnessExperience}</div>
            </div>
            {userProfile.dietaryRestrictions?.length > 0 && (
              <div className="mt-2">
                <span className="font-medium">Dietary Restrictions: </span>
                {userProfile.dietaryRestrictions.map((restriction, idx) => (
                  <Badge key={idx} variant="outline" className="ml-1">
                    {restriction}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleGeneratePlan} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Your Plan...
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Generate My Indian Health Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Your Personalized Indian Health Plan</CardTitle>
            <CardDescription>
              A comprehensive 4-week program designed specifically for you
            </CardDescription>
          </div>
          <Button onClick={downloadPlan} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Plan
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workout">Workout Plan</TabsTrigger>
          <TabsTrigger value="diet">Diet Plan</TabsTrigger>
          <TabsTrigger value="grocery">Grocery List</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workout Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {generatedPlan.workoutPlan?.overview}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{generatedPlan.workoutPlan?.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule:</span>
                    <span className="font-medium">5-6 days/week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diet Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {generatedPlan.dietPlan?.overview}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Daily Calories:</span>
                    <span className="font-medium">{generatedPlan.dietPlan?.dailyCalories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-medium">{generatedPlan.dietPlan?.macros?.protein}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span className="font-medium">{generatedPlan.dietPlan?.macros?.carbs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fats:</span>
                    <span className="font-medium">{generatedPlan.dietPlan?.macros?.fats}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {generatedPlan.additionalTips && (
            <Card>
              <CardHeader>
                <CardTitle>Cultural & Practical Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedPlan.additionalTips.culturalConsiderations && (
                  <div>
                    <h4 className="font-semibold mb-2">Cultural Considerations:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {generatedPlan.additionalTips.culturalConsiderations.map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {generatedPlan.additionalTips.budgetTips && (
                  <div>
                    <h4 className="font-semibold mb-2">Budget Tips:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {generatedPlan.additionalTips.budgetTips.map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Workout Schedule</CardTitle>
              <CardDescription>Follow this progressive 4-week program</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPlan.workoutPlan?.schedule?.week1 && (
                <div className="space-y-4">
                  {generatedPlan.workoutPlan.schedule.week1.map((day: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">{day.day}</h4>
                      <p className="text-sm text-muted-foreground mb-3">Duration: {day.duration}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium mb-1">Warm-up:</h5>
                          <p className="text-sm">{day.warmup}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Exercises:</h5>
                          <div className="grid gap-2">
                            {day.exercises.map((exercise: any, exerciseIdx: number) => (
                              <div key={exerciseIdx} className="bg-secondary/50 p-3 rounded">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium">{exercise.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {exercise.sets} sets × {exercise.reps}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">Cool-down:</h5>
                          <p className="text-sm">{day.cooldown}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Menu Plan</CardTitle>
              <CardDescription>Authentic Indian meals with exact portions</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPlan.dietPlan?.weeklyMenu?.week1?.monday && (
                <div className="space-y-6">
                  {Object.entries(generatedPlan.dietPlan.weeklyMenu.week1).map(([day, meals]: [string, any]) => (
                    <div key={day} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-4 capitalize">{day}</h4>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <h5 className="font-medium text-primary">Breakfast</h5>
                          <div className="bg-secondary/50 p-3 rounded">
                            <p className="font-medium">{meals.breakfast?.name}</p>
                            <p className="text-sm text-muted-foreground">{meals.breakfast?.calories} kcal</p>
                            <p className="text-sm">{meals.breakfast?.protein} protein</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-primary">Lunch</h5>
                          <div className="bg-secondary/50 p-3 rounded">
                            <p className="font-medium">{meals.lunch?.name}</p>
                            <p className="text-sm text-muted-foreground">{meals.lunch?.calories} kcal</p>
                            <p className="text-sm">{meals.lunch?.protein} protein</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-primary">Dinner</h5>
                          <div className="bg-secondary/50 p-3 rounded">
                            <p className="font-medium">{meals.dinner?.name}</p>
                            <p className="text-sm text-muted-foreground">{meals.dinner?.calories} kcal</p>
                            <p className="text-sm">{meals.dinner?.protein} protein</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grocery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Weekly Grocery List
              </CardTitle>
              <CardDescription>
                Estimated total cost: {generatedPlan.groceryList?.totalWeeklyCost}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPlan.groceryList && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(generatedPlan.groceryList).map(([category, items]: [string, any]) => (
                    category !== 'totalWeeklyCost' && Array.isArray(items) && (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold capitalize">{category}</h4>
                        <div className="space-y-1">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm bg-secondary/30 p-2 rounded">
                              <span>{item.item}</span>
                              <div className="text-right">
                                <div>{item.quantity}</div>
                                <div className="text-muted-foreground">{item.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Breakdown</CardTitle>
              <CardDescription>Daily averages and key nutrients</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPlan.nutritionalBreakdown && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3">Daily Averages</h4>
                    <div className="space-y-2">
                      {Object.entries(generatedPlan.nutritionalBreakdown.dailyAverages || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Nutrients</h4>
                    <div className="space-y-2">
                      {Object.entries(generatedPlan.nutritionalBreakdown.keyNutrients || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {generatedPlan.nutritionalBreakdown?.hydrationGoal && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Hydration Goal</h4>
                  <p className="text-blue-800 dark:text-blue-200">{generatedPlan.nutritionalBreakdown.hydrationGoal}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanGenerator;