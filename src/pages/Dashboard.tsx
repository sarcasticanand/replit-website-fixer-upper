import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Target, Calendar, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/login');
      return;
    }

    // Load user data
    const userProfile = localStorage.getItem('userProfile');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userProfile) {
      setUser(JSON.parse(userProfile));
    } else if (userEmail) {
      setUser({ email: userEmail });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('tempUser');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back to HealthSync!</h1>
          <p className="text-muted-foreground">
            Here's your personalized health dashboard
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
              <div className="text-2xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground">
                +5% from yesterday
              </p>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                3 more to reach weekly goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 days</div>
              <p className="text-xs text-muted-foreground">
                Personal best!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2.3kg</div>
              <p className="text-xs text-muted-foreground">
                Muscle gain this month
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
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Morning Workout</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upper body strength training - 45 minutes
                  </p>
                  <Button size="sm" onClick={() => navigate('/workout-plan')}>Start Workout</Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Nutrition Goal</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    2,200 calories | 150g protein | 250g carbs | 75g fat
                  </p>
                  <Button size="sm" variant="outline">View Meal Plan</Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Grocery List</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    8 items ready for shopping - optimized for best prices
                  </p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/grocery-cart')}>View List</Button>
                </div>
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
                <Button className="w-full" variant="outline">
                  Log Food
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/workout-plan')}>
                  Start Workout
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/fridge')}>
                  Check Fridge
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/grocery-cart')}>
                  Order Groceries
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