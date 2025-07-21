import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Target, Calendar, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPlans } from "@/hooks/useUserPlans";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, goals, loading: profileLoading } = useUserProfile();
  const { currentPlan, loading: plansLoading } = useUserPlans();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading || plansLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Calculate dynamic stats based on user data
  const getProgressPercentage = () => {
    if (currentPlan?.workout_plan) {
      // Calculate based on completed workouts in the plan
      return 75; // Mock for now
    }
    return 0;
  };

  const getWeeklyWorkouts = () => {
    // This would be calculated from actual user activity
    return 4;
  };

  const getStreak = () => {
    // This would be calculated from user's consistent activity
    return 12;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{profile?.user_id ? `` : `, ${user.email}`}!
          </h1>
          <p className="text-muted-foreground">
            {goals.length > 0 
              ? `Working towards: ${goals.map(g => g.goal).join(', ')}`
              : "Here's your personalized health dashboard"
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getProgressPercentage()}%</div>
              <p className="text-xs text-muted-foreground">
                {currentPlan ? 'Based on your current plan' : 'Complete onboarding to see progress'}
              </p>
              <Progress value={getProgressPercentage()} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getWeeklyWorkouts()}</div>
              <p className="text-xs text-muted-foreground">
                {currentPlan ? 'Based on your workout plan' : 'Start a plan to track workouts'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStreak()} days</div>
              <p className="text-xs text-muted-foreground">
                {getStreak() > 0 ? 'Keep it up!' : 'Start your streak today!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.weight ? `${profile.weight}kg` : 'Set weight'}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.weight ? 'Current weight' : 'Update your profile'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Plan */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Plan</CardTitle>
                <CardDescription>Your personalized fitness and nutrition plan for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentPlan?.workout_plan ? (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Today's Workout</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {currentPlan.workout_plan.workouts?.[0]?.name || 'Personalized workout plan'}
                    </p>
                    <Button size="sm" onClick={() => navigate('/workout-plan')}>Start Workout</Button>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Generate Your Plan</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Complete your profile to get a personalized workout plan
                    </p>
                    <Button size="sm" onClick={() => navigate('/onboarding')}>Complete Setup</Button>
                  </div>
                )}
                
                {currentPlan?.diet_plan ? (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Today's Nutrition</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Follow your personalized meal plan
                    </p>
                    <Button size="sm" variant="outline">View Meal Plan</Button>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Nutrition Planning</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Get a personalized nutrition plan
                    </p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/onboarding')}>Set Up Nutrition</Button>
                  </div>
                )}
                
                {currentPlan?.grocery_list ? (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Smart Grocery List</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {currentPlan.grocery_list.length || 8} items ready for shopping
                    </p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/grocery-cart')}>View List</Button>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Grocery Planning</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Generate optimized grocery lists
                    </p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/onboarding')}>Set Up Groceries</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!currentPlan && (
                  <Button className="w-full" onClick={() => navigate('/onboarding')}>
                    Complete Profile Setup
                  </Button>
                )}
                <Button className="w-full" variant="outline">
                  Log Food
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/workout-plan')}>
                  {currentPlan ? 'Start Workout' : 'View Sample Workout'}
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/fridge')}>
                  Check Fridge
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/grocery-cart')}>
                  {currentPlan ? 'Order Groceries' : 'View Sample Cart'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Completed leg workout</p>
                  <p className="text-muted-foreground">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Logged breakfast</p>
                  <p className="text-muted-foreground">4 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Updated grocery list</p>
                  <p className="text-muted-foreground">Yesterday</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}