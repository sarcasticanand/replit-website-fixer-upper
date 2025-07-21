import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface GeneratedPlan {
  id: string;
  user_id: string;
  plan_type: string;
  workout_plan?: any;
  diet_plan?: any;
  grocery_list?: any;
  nutritional_breakdown?: any;
  user_preferences?: any;
  created_at: string;
  updated_at: string;
}

export function useUserPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<GeneratedPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPlans();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserPlans = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: plansData } = await supabase
        .from('generated_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPlans(plansData || []);
      setCurrentPlan(plansData?.[0] || null);
    } catch (error) {
      console.error('Error fetching user plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    plans,
    currentPlan,
    loading,
    refetch: fetchUserPlans
  };
}