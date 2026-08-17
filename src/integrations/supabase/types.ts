export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      default_schedule_tasks: {
        Row: {
          day_type: string
          end_min: number
          id: string
          kind: string
          note: string
          requires_reflection: boolean
          start_min: number
          subject: string
          title: string
          xp: number
        }
        Insert: {
          day_type: string
          end_min: number
          id?: string
          kind: string
          note?: string
          requires_reflection?: boolean
          start_min: number
          subject: string
          title: string
          xp?: number
        }
        Update: {
          day_type?: string
          end_min?: number
          id?: string
          kind?: string
          note?: string
          requires_reflection?: boolean
          start_min?: number
          subject?: string
          title?: string
          xp?: number
        }
        Relationships: []
      }
      focus_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          log_id: string | null
          seconds_away: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          log_id?: string | null
          seconds_away?: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          log_id?: string | null
          seconds_away?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_events_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "task_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          last_streak_date: string | null
          longest_streak: number
          name: string
          onboarded: boolean
          settings: Json
          streak: number
          updated_at: string
          xp: number
        }
        Insert: {
          created_at?: string
          id: string
          last_streak_date?: string | null
          longest_streak?: number
          name?: string
          onboarded?: boolean
          settings?: Json
          streak?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_streak_date?: string | null
          longest_streak?: number
          name?: string
          onboarded?: boolean
          settings?: Json
          streak?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      schedule_tasks: {
        Row: {
          active: boolean
          created_at: string
          day_type: string
          end_min: number
          id: string
          kind: string
          note: string
          requires_reflection: boolean
          start_min: number
          subject: string
          title: string
          user_id: string
          xp: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          day_type: string
          end_min: number
          id?: string
          kind?: string
          note?: string
          requires_reflection?: boolean
          start_min: number
          subject?: string
          title: string
          user_id: string
          xp?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          day_type?: string
          end_min?: number
          id?: string
          kind?: string
          note?: string
          requires_reflection?: boolean
          start_min?: number
          subject?: string
          title?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      task_logs: {
        Row: {
          active_seconds: number
          completed_at: string | null
          id: string
          interruptions: number
          log_date: string
          rating: number | null
          reason: string | null
          reflection: string | null
          started_at: string
          status: string
          task_id: string
          updated_at: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          active_seconds?: number
          completed_at?: string | null
          id?: string
          interruptions?: number
          log_date: string
          rating?: number | null
          reason?: string | null
          reflection?: string | null
          started_at?: string
          status?: string
          task_id: string
          updated_at?: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          active_seconds?: number
          completed_at?: string | null
          id?: string
          interruptions?: number
          log_date?: string
          rating?: number | null
          reason?: string | null
          reflection?: string | null
          started_at?: string
          status?: string
          task_id?: string
          updated_at?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "schedule_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          id: string
          name: string
          priority: string
          subject: string
          syllabus: string
          test_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          priority?: string
          subject: string
          syllabus?: string
          test_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          priority?: string
          subject?: string
          syllabus?: string
          test_date?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_setup: { Args: { p_name?: string }; Returns: undefined }
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
