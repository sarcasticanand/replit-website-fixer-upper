import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Heart, ShoppingCart, Refrigerator } from "lucide-react";
import { Header } from "@/components/Header";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Your Complete Health Journey <span className="text-primary bg-gradient-primary bg-clip-text text-transparent">Starts Here</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect your health goals to personalized fitness plans and automated grocery shopping. 
          Transform your lifestyle in under 5 minutes.
        </p>
        <Link to="/signup">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Start Your Journey
          </Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Smart Fitness Plans</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered workout routines tailored to your goals, fitness level, and schedule. 
                From beginner to advanced, 15 minutes to 60 minutes.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Personalized Nutrition</h3>
              <p className="text-sm text-muted-foreground">
                Custom meal plans with macro tracking, calorie counting, and portion recommendations. 
                Supports all dietary preferences and restrictions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Automated Grocery Shopping</h3>
              <p className="text-sm text-muted-foreground">
                Compare prices across major delivery platforms. Auto-generate shopping lists from your meal plans. 
                Save time and money with one-click ordering.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Refrigerator className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Digital Fridge Management</h3>
              <p className="text-sm text-muted-foreground">
                Track your inventory, get expiry alerts, and receive recipe suggestions based on available ingredients. 
                Never waste food again.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Health?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands who have already started their journey to better health and smarter living.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}