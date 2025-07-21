import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  user_id: string;
  age?: number;
  height?: number;
  weight?: number;
  activity_level?: string;
  fitness_experience?: string;
  preferred_workout_time?: string;
  created_at: string;
  updated_at: string;
}

interface UserGoal {
  id: string;
  user_id: string;
  goal: string;
  created_at: string;
}

interface UserDietaryRestriction {
  id: string;
  user_id: string;
  restriction: string;
  created_at: string;
}

interface UserHealthCondition {
  id: string;
  user_id: string;
  condition: string;
  created_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<UserDietaryRestriction[]>([]);
  const [healthConditions, setHealthConditions] = useState<UserHealthCondition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch goals
      const { data: goalsData } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id);

      // Fetch dietary restrictions
      const { data: restrictionsData } = await supabase
        .from('user_dietary_restrictions')
        .select('*')
        .eq('user_id', user.id);

      // Fetch health conditions
      const { data: conditionsData } = await supabase
        .from('user_health_conditions')
        .select('*')
        .eq('user_id', user.id);

      setProfile(profileData);
      setGoals(goalsData || []);
      setDietaryRestrictions(restrictionsData || []);
      setHealthConditions(conditionsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    goals,
    dietaryRestrictions,
    healthConditions,
    loading,
    refetch: fetchUserData
  };
}