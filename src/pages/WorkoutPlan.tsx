import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, CheckCircle, Pause, Clock, Target, Dumbbell, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useUserPlans } from "@/hooks/useUserPlans";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  completed: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface WorkoutDay {
  id: string;
  day: string;
  title: string;
  duration: string;
  targetMuscles: string[];
  exercises: Exercise[];
  completed: boolean;
}

const mockWorkoutPlan: WorkoutDay[] = [
  {
    id: "1",
    day: "Monday",
    title: "Upper Body Strength",
    duration: "45 mins",
    targetMuscles: ["Chest", "Shoulders", "Arms"],
    completed: true,
    exercises: [
      { id: "1", name: "Push-ups", sets: 3, reps: "12-15", rest: "60s", completed: true, difficulty: "Beginner" },
      { id: "2", name: "Pike Push-ups", sets: 3, reps: "8-10", rest: "60s", completed: true, difficulty: "Intermediate" },
      { id: "3", name: "Tricep Dips", sets: 3, reps: "10-12", rest: "60s", completed: true, difficulty: "Beginner" },
      { id: "4", name: "Plank Hold", sets: 3, reps: "30-45s", rest: "45s", completed: true, difficulty: "Beginner" }
    ]
  },
  {
    id: "2", 
    day: "Tuesday",
    title: "Lower Body Power",
    duration: "40 mins",
    targetMuscles: ["Quads", "Glutes", "Calves"],
    completed: false,
    exercises: [
      { id: "5", name: "Bodyweight Squats", sets: 4, reps: "15-20", rest: "60s", completed: false, difficulty: "Beginner" },
      { id: "6", name: "Lunges", sets: 3, reps: "12 each leg", rest: "60s", completed: false, difficulty: "Beginner" },
      { id: "7", name: "Single-leg Glute Bridges", sets: 3, reps: "10 each leg", rest: "45s", completed: false, difficulty: "Intermediate" },
      { id: "8", name: "Calf Raises", sets: 3, reps: "15-20", rest: "45s", completed: false, difficulty: "Beginner" }
    ]
  },
  {
    id: "3",
    day: "Wednesday", 
    title: "Active Recovery",
    duration: "30 mins",
    targetMuscles: ["Full Body", "Flexibility"],
    completed: false,
    exercises: [
      { id: "9", name: "Light Walking", sets: 1, reps: "20 mins", rest: "0s", completed: false, difficulty: "Beginner" },
      { id: "10", name: "Dynamic Stretching", sets: 1, reps: "10 mins", rest: "0s", completed: false, difficulty: "Beginner" }
    ]
  },
  {
    id: "4",
    day: "Thursday",
    title: "Core & Cardio",
    duration: "35 mins", 
    targetMuscles: ["Core", "Cardio"],
    completed: false,
    exercises: [
      { id: "11", name: "Mountain Climbers", sets: 3, reps: "30s", rest: "30s", completed: false, difficulty: "Intermediate" },
      { id: "12", name: "Russian Twists", sets: 3, reps: "20", rest: "45s", completed: false, difficulty: "Beginner" },
      { id: "13", name: "Burpees", sets: 3, reps: "8-10", rest: "90s", completed: false, difficulty: "Advanced" },
      { id: "14", name: "Dead Bug", sets: 3, reps: "10 each side", rest: "45s", completed: false, difficulty: "Beginner" }
    ]
  }
];

export default function WorkoutPlan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { currentPlan, loading } = useUserPlans();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Use user's workout plan if available, otherwise use mock data
    if (currentPlan?.workout_plan?.workouts) {
      setWorkoutPlan(currentPlan.workout_plan.workouts);
    } else {
      setWorkoutPlan(mockWorkoutPlan);
    }
  }, [user, currentPlan, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const startWorkout = (workoutId: string) => {
    setActiveWorkout(workoutId);
    toast({
      title: "Workout started!",
      description: "Good luck with your training session!",
    });
  };

  const completeExercise = (workoutId: string, exerciseId: string) => {
    setWorkoutPlan(prev => 
      prev.map(workout => 
        workout.id === workoutId 
          ? {
              ...workout,
              exercises: workout.exercises.map(exercise =>
                exercise.id === exerciseId 
                  ? { ...exercise, completed: true }
                  : exercise
              )
            }
          : workout
      )
    );
    
    toast({
      title: "Exercise completed!",
      description: "Great job! Keep it up!",
    });
  };

  const completeWorkout = (workoutId: string) => {
    setWorkoutPlan(prev =>
      prev.map(workout =>
        workout.id === workoutId
          ? { 
              ...workout, 
              completed: true,
              exercises: workout.exercises.map(ex => ({ ...ex, completed: true }))
            }
          : workout
      )
    );
    
    setActiveWorkout(null);
    toast({
      title: "Workout completed! 🎉",
      description: "Excellent work! You're one step closer to your goals!",
    });
  };

  const getCompletedWorkouts = () => workoutPlan.filter(w => w.completed).length;
  const getTotalWorkouts = () => workoutPlan.length;
  const getWeekProgress = () => (getCompletedWorkouts() / getTotalWorkouts()) * 100;

  const getDifficultyColor = (difficulty: Exercise["difficulty"]) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800"; 
      case "Advanced": return "bg-red-100 text-red-800";
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading your workout plan...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            {currentPlan ? 'Your Personalized Workout Plan' : 'Sample Workout Plan'}
          </h1>
          <p className="text-muted-foreground">
            {currentPlan 
              ? 'Based on your goals and fitness profile' 
              : 'Complete your profile setup to get a personalized plan'
            }
          </p>
        </div>

        {/* Weekly Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {getCompletedWorkouts()} of {getTotalWorkouts()} workouts completed
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(getWeekProgress())}%
              </span>
            </div>
            <Progress value={getWeekProgress()} className="h-2" />
          </CardContent>
        </Card>

        {/* Workout Days */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workoutPlan.map((workout) => (
            <Card key={workout.id} className={workout.completed ? "border-green-200 bg-green-50/50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {workout.completed && <Check className="h-4 w-4 mr-2 text-green-600" />}
                      <Dumbbell className="h-4 w-4 mr-2" />
                      {workout.day} - {workout.title}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {workout.duration}
                    </CardDescription>
                  </div>
                  {workout.completed && (
                    <Badge variant="default" className="bg-green-600">
                      Completed
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {workout.targetMuscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Exercises */}
                <div className="space-y-2">
                  {workout.exercises.map((exercise) => (
                    <div 
                      key={exercise.id}
                      className={`p-3 border rounded-lg ${
                        exercise.completed ? 'bg-green-50 border-green-200' : 'bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${exercise.completed && 'line-through text-muted-foreground'}`}>
                              {exercise.name}
                            </h4>
                            <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                              {exercise.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} • Rest: {exercise.rest}
                          </p>
                        </div>
                        
                        {activeWorkout === workout.id && !exercise.completed && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => completeExercise(workout.id, exercise.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {exercise.completed && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  {!workout.completed && activeWorkout !== workout.id && (
                    <Button 
                      className="w-full"
                      onClick={() => startWorkout(workout.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>
                  )}
                  
                  {activeWorkout === workout.id && (
                    <div className="space-y-2">
                      <Button 
                        variant="default"
                        className="w-full"
                        onClick={() => completeWorkout(workout.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Complete Workout
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveWorkout(null)}
                      >
                        Pause Workout
                      </Button>
                    </div>
                  )}
                  
                  {workout.completed && (
                    <Button variant="outline" className="w-full" disabled>
                      Workout Completed ✓
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}