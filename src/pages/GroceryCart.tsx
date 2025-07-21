import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart, Truck, IndianRupee } from "lucide-react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserPlans } from "@/hooks/useUserPlans";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  swiggyPrice: number;
  blinkitPrice: number;
  zeptoPrice: number;
  category: string;
}

const mockGroceryItems: GroceryItem[] = [
  {
    id: "1",
    name: "Chicken Breast (1kg)",
    quantity: "1 kg",
    swiggyPrice: 450,
    blinkitPrice: 420,
    zeptoPrice: 435,
    category: "Protein"
  },
  {
    id: "2", 
    name: "Brown Rice (1kg)",
    quantity: "1 kg",
    swiggyPrice: 180,
    blinkitPrice: 175,
    zeptoPrice: 185,
    category: "Carbs"
  },
  {
    id: "3",
    name: "Broccoli (500g)",
    quantity: "500 g",
    swiggyPrice: 120,
    blinkitPrice: 110,
    zeptoPrice: 125,
    category: "Vegetables"
  },
  {
    id: "4",
    name: "Greek Yogurt (500g)",
    quantity: "500 g", 
    swiggyPrice: 200,
    blinkitPrice: 190,
    zeptoPrice: 195,
    category: "Dairy"
  },
  {
    id: "5",
    name: "Almonds (250g)",
    quantity: "250 g",
    swiggyPrice: 320,
    blinkitPrice: 310,
    zeptoPrice: 325,
    category: "Nuts"
  },
  {
    id: "6",
    name: "Spinach (250g)",
    quantity: "250 g",
    swiggyPrice: 40,
    blinkitPrice: 35,
    zeptoPrice: 42,
    category: "Vegetables"
  }
];

export default function GroceryCart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { currentPlan, loading } = useUserPlans();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'swiggy' | 'blinkit' | 'zepto'>('blinkit');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Use user's grocery list if available, otherwise use mock data
    if (currentPlan?.grocery_list && Array.isArray(currentPlan.grocery_list)) {
      setItems(currentPlan.grocery_list);
    } else {
      setItems(mockGroceryItems);
    }
  }, [user, currentPlan, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const calculateTotals = () => {
    return items.reduce((acc, item) => {
      acc.swiggy += item.swiggyPrice;
      acc.blinkit += item.blinkitPrice;
      acc.zepto += item.zeptoPrice;
      return acc;
    }, { swiggy: 0, blinkit: 0, zepto: 0 });
  };

  const totals = calculateTotals();
  const cheapestPlatform = Object.entries(totals).reduce((a, b) => totals[a[0] as keyof typeof totals] < totals[b[0] as keyof typeof totals] ? a : b)[0] as keyof typeof totals;

  const handleProceedToCheckout = () => {
    toast({
      title: "Redirecting to checkout",
      description: `Proceeding with ${selectedPlatform} - Total: ₹${totals[selectedPlatform]}`,
    });
    
    // In a real app, this would redirect to the actual platform
    setTimeout(() => {
      toast({
        title: "Order placed successfully!",
        description: "Your groceries will be delivered within 2 hours.",
      });
      navigate('/dashboard');
    }, 2000);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading your grocery list...</div>;
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
            {currentPlan ? 'Your Smart Grocery Cart' : 'Sample Grocery Cart'}
          </h1>
          <p className="text-muted-foreground">
            {currentPlan 
              ? 'Based on your personalized meal plan' 
              : 'Complete your profile to get personalized grocery lists'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Cart Items</CardTitle>
                <CardDescription>
                  {currentPlan ? 'Based on your personalized meal plan' : 'Sample items - complete setup for personalized lists'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.quantity}</p>
                      <Badge variant="secondary" className="mt-1">{item.category}</Badge>
                    </div>
                    <div className="text-right mr-4">
                      <div className="text-sm space-y-1">
                        <div className={selectedPlatform === 'swiggy' ? 'font-bold text-primary' : ''}>
                          Swiggy: ₹{item.swiggyPrice}
                        </div>
                        <div className={selectedPlatform === 'blinkit' ? 'font-bold text-primary' : ''}>
                          Blinkit: ₹{item.blinkitPrice}
                        </div>
                        <div className={selectedPlatform === 'zepto' ? 'font-bold text-primary' : ''}>
                          Zepto: ₹{item.zeptoPrice}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Price Comparison & Checkout */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Comparison</CardTitle>
                <CardDescription>Choose the best platform for your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPlatform === 'swiggy' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                  }`}
                  onClick={() => setSelectedPlatform('swiggy')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Swiggy Instamart</h4>
                      <p className="text-sm text-muted-foreground">Delivery in 15-30 mins</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{totals.swiggy}</div>
                      {cheapestPlatform !== 'swiggy' && (
                        <div className="text-sm text-red-500">
                          +₹{totals.swiggy - totals[cheapestPlatform]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPlatform === 'blinkit' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                  }`}
                  onClick={() => setSelectedPlatform('blinkit')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Blinkit</h4>
                      <p className="text-sm text-muted-foreground">Delivery in 10-20 mins</p>
                      {cheapestPlatform === 'blinkit' && (
                        <Badge variant="default" className="mt-1">Cheapest</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{totals.blinkit}</div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPlatform === 'zepto' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                  }`}
                  onClick={() => setSelectedPlatform('zepto')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Zepto</h4>
                      <p className="text-sm text-muted-foreground">Delivery in 10-15 mins</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{totals.zepto}</div>
                      {cheapestPlatform !== 'zepto' && (
                        <div className="text-sm text-red-500">
                          +₹{totals.zepto - totals[cheapestPlatform]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{totals[selectedPlatform]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee:</span>
                    <span>₹25</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₹{totals[selectedPlatform] + 25}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleProceedToCheckout}
                  disabled={items.length === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}