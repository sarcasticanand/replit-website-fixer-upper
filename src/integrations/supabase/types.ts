export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      diet_templates: {
        Row: {
          calorie_range: string
          created_at: string
          cuisine_type: string | null
          dietary_restrictions: Json | null
          id: string
          meal_count: number
          meal_plan: Json
        }
        Insert: {
          calorie_range: string
          created_at?: string
          cuisine_type?: string | null
          dietary_restrictions?: Json | null
          id?: string
          meal_count?: number
          meal_plan: Json
        }
        Update: {
          calorie_range?: string
          created_at?: string
          cuisine_type?: string | null
          dietary_restrictions?: Json | null
          id?: string
          meal_count?: number
          meal_plan?: Json
        }
        Relationships: []
      }
      generated_plans: {
        Row: {
          created_at: string
          diet_plan: Json | null
          grocery_list: Json | null
          id: string
          nutritional_breakdown: Json | null
          plan_type: string
          updated_at: string
          user_id: string
          user_preferences: Json | null
          workout_plan: Json | null
        }
        Insert: {
          created_at?: string
          diet_plan?: Json | null
          grocery_list?: Json | null
          id?: string
          nutritional_breakdown?: Json | null
          plan_type: string
          updated_at?: string
          user_id: string
          user_preferences?: Json | null
          workout_plan?: Json | null
        }
        Update: {
          created_at?: string
          diet_plan?: Json | null
          grocery_list?: Json | null
          id?: string
          nutritional_breakdown?: Json | null
          plan_type?: string
          updated_at?: string
          user_id?: string
          user_preferences?: Json | null
          workout_plan?: Json | null
        }
        Relationships: []
      }
      grocery_items: {
        Row: {
          average_price: number | null
          category: string
          created_at: string
          id: string
          name: string
          nutritional_info: Json
          regional_names: Json | null
          seasonal_availability: Json | null
          substitutes: Json | null
          unit: string
        }
        Insert: {
          average_price?: number | null
          category: string
          created_at?: string
          id?: string
          name: string
          nutritional_info: Json
          regional_names?: Json | null
          seasonal_availability?: Json | null
          substitutes?: Json | null
          unit?: string
        }
        Update: {
          average_price?: number | null
          category?: string
          created_at?: string
          id?: string
          name?: string
          nutritional_info?: Json
          regional_names?: Json | null
          seasonal_availability?: Json | null
          substitutes?: Json | null
          unit?: string
        }
        Relationships: []
      }
      plan_feedback: {
        Row: {
          completion_percentage: number | null
          created_at: string
          feedback_text: string | null
          id: string
          plan_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string
          feedback_text?: string | null
          id?: string
          plan_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string
          feedback_text?: string | null
          id?: string
          plan_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_feedback_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "generated_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          fitness_experience: string | null
          height: number | null
          id: string
          preferred_workout_time: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          fitness_experience?: string | null
          height?: number | null
          id?: string
          preferred_workout_time?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          fitness_experience?: string | null
          height?: number | null
          id?: string
          preferred_workout_time?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_dietary_restrictions: {
        Row: {
          created_at: string
          id: string
          restriction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restriction: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restriction?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          goal: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_health_conditions: {
        Row: {
          condition: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string
          diet_plan: string | null
          id: string
          updated_at: string
          user_id: string
          workout_plan: string | null
        }
        Insert: {
          created_at?: string
          diet_plan?: string | null
          id?: string
          updated_at?: string
          user_id: string
          workout_plan?: string | null
        }
        Update: {
          created_at?: string
          diet_plan?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          workout_plan?: string | null
        }
        Relationships: []
      }
      workout_templates: {
        Row: {
          activity_level: string
          created_at: string
          duration_weeks: number
          exercise_data: Json
          experience: string
          goal: string
          id: string
          workouts_per_week: number
        }
        Insert: {
          activity_level: string
          created_at?: string
          duration_weeks?: number
          exercise_data: Json
          experience: string
          goal: string
          id?: string
          workouts_per_week?: number
        }
        Update: {
          activity_level?: string
          created_at?: string
          duration_weeks?: number
          exercise_data?: Json
          experience?: string
          goal?: string
          id?: string
          workouts_per_week?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
