import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, Refrigerator, Search, ChefHat } from "lucide-react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDays: number;
}

const mockFridgeItems: FridgeItem[] = [
  { id: "1", name: "Chicken Breast", quantity: 500, unit: "g", category: "Protein", expiryDays: 2 },
  { id: "2", name: "Brown Rice", quantity: 800, unit: "g", category: "Carbs", expiryDays: 30 },
  { id: "3", name: "Broccoli", quantity: 300, unit: "g", category: "Vegetables", expiryDays: 3 },
  { id: "4", name: "Greek Yogurt", quantity: 400, unit: "g", category: "Dairy", expiryDays: 5 },
  { id: "5", name: "Almonds", quantity: 200, unit: "g", category: "Nuts", expiryDays: 60 },
  { id: "6", name: "Eggs", quantity: 8, unit: "pcs", category: "Protein", expiryDays: 7 },
  { id: "7", name: "Spinach", quantity: 150, unit: "g", category: "Vegetables", expiryDays: 2 },
  { id: "8", name: "Milk", quantity: 1, unit: "L", category: "Dairy", expiryDays: 4 }
];

const suggestedRecipes = [
  {
    id: "1",
    name: "Chicken & Broccoli Stir Fry",
    ingredients: ["Chicken Breast", "Broccoli", "Brown Rice"],
    cookTime: "20 mins",
    difficulty: "Easy"
  },
  {
    id: "2", 
    name: "Greek Yogurt Parfait",
    ingredients: ["Greek Yogurt", "Almonds"],
    cookTime: "5 mins",
    difficulty: "Easy"
  },
  {
    id: "3",
    name: "Spinach Omelette",
    ingredients: ["Eggs", "Spinach"],
    cookTime: "10 mins", 
    difficulty: "Easy"
  }
];

export default function Fridge() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [items, setItems] = useState<FridgeItem[]>(mockFridgeItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // In a real app, you'd fetch user's fridge data here
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateQuantity = (id: string, change: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        if (newQuantity === 0) {
          toast({
            title: "Item finished",
            description: `${item.name} has been removed from your fridge`,
          });
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as FridgeItem[]);
  };

  const addNewItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: FridgeItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: 1,
      unit: "pcs",
      category: "Other",
      expiryDays: 7
    };
    
    setItems([...items, newItem]);
    setNewItemName("");
    toast({
      title: "Item added",
      description: `${newItemName} has been added to your fridge`,
    });
  };

  const getExpiryBadgeVariant = (days: number) => {
    if (days <= 1) return "destructive";
    if (days <= 3) return "default";
    return "secondary";
  };

  const getExpiryText = (days: number) => {
    if (days === 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    return `${days} days left`;
  };

  const canMakeRecipe = (recipe: typeof suggestedRecipes[0]) => {
    return recipe.ingredients.every(ingredient => 
      items.some(item => item.name === ingredient && item.quantity > 0)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">My Digital Fridge</h1>
          <p className="text-muted-foreground">
            Track your ingredients and get personalized recipe suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fridge Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Add */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Refrigerator className="h-5 w-5 mr-2" />
                  Fridge Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new item..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                  />
                  <Button onClick={addNewItem} disabled={!newItemName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={getExpiryBadgeVariant(item.expiryDays)}>
                        {getExpiryText(item.expiryDays)}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Refrigerator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No items found matching your search" : "Your fridge is empty"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recipe Suggestions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="h-5 w-5 mr-2" />
                  Recipe Suggestions
                </CardTitle>
                <CardDescription>Based on what you have</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedRecipes.map((recipe) => {
                  const canMake = canMakeRecipe(recipe);
                  return (
                    <div 
                      key={recipe.id} 
                      className={`p-4 border rounded-lg ${
                        canMake ? 'border-primary bg-primary/5' : 'border-muted bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${!canMake && 'text-muted-foreground'}`}>
                          {recipe.name}
                        </h4>
                        {canMake && <Badge variant="default">Can Make!</Badge>}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {recipe.cookTime} • {recipe.difficulty}
                      </p>
                      
                      <div className="space-y-1">
                        {recipe.ingredients.map((ingredient) => {
                          const hasIngredient = items.some(item => 
                            item.name === ingredient && item.quantity > 0
                          );
                          return (
                            <div 
                              key={ingredient}
                              className={`text-xs ${
                                hasIngredient ? 'text-green-600' : 'text-red-500'
                              }`}
                            >
                              • {ingredient} {hasIngredient ? '✓' : '✗'}
                            </div>
                          );
                        })}
                      </div>
                      
                      {canMake && (
                        <Button size="sm" variant="outline" className="w-full mt-3">
                          Start Cooking
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expiring soon:</span>
                  <span className="font-medium text-orange-600">
                    {items.filter(item => item.expiryDays <= 3).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recipes available:</span>
                  <span className="font-medium text-green-600">
                    {suggestedRecipes.filter(canMakeRecipe).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}