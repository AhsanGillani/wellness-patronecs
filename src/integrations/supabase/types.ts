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
      appointments: {
        Row: {
          created_at: string
          details: string | null
          duration_minutes: number
          healer_id: string
          id: string
          meeting_link: string | null
          mode: Database["public"]["Enums"]["consultation_mode"]
          notes_by_healer: string | null
          notes_by_patient: string | null
          patient_id: string
          prescription_id: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          duration_minutes: number
          healer_id: string
          id?: string
          meeting_link?: string | null
          mode: Database["public"]["Enums"]["consultation_mode"]
          notes_by_healer?: string | null
          notes_by_patient?: string | null
          patient_id: string
          prescription_id?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          duration_minutes?: number
          healer_id?: string
          id?: string
          meeting_link?: string | null
          mode?: Database["public"]["Enums"]["consultation_mode"]
          notes_by_healer?: string | null
          notes_by_patient?: string | null
          patient_id?: string
          prescription_id?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      booked_slots: {
        Row: {
          appointment_date: string
          appointment_id: string | null
          created_at: string
          end_time: string
          healer_id: string
          id: string
          start_time: string
        }
        Insert: {
          appointment_date: string
          appointment_id?: string | null
          created_at?: string
          end_time: string
          healer_id: string
          id?: string
          start_time: string
        }
        Update: {
          appointment_date?: string
          appointment_id?: string | null
          created_at?: string
          end_time?: string
          healer_id?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "booked_slots_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booked_slots_healer_id_fkey"
            columns: ["healer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: string
          participants: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          participants: string[]
        }
        Update: {
          created_at?: string
          id?: string
          participants?: string[]
        }
        Relationships: []
      }
      healer_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          healer_id: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          healer_id: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          healer_id?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "healer_availability_healer_id_fkey"
            columns: ["healer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          image_url: string | null
          message_for: string[]
          read_by: string[]
          sender_id: string
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          image_url?: string | null
          message_for?: string[]
          read_by?: string[]
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          image_url?: string | null
          message_for?: string[]
          read_by?: string[]
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          created_at: string
          end_date: string | null
          healer_id: string
          id: string
          medications: string[] | null
          notes: string | null
          patient_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          end_date?: string | null
          healer_id: string
          id?: string
          medications?: string[] | null
          notes?: string | null
          patient_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          end_date?: string | null
          healer_id?: string
          id?: string
          medications?: string[] | null
          notes?: string | null
          patient_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: Json | null
          bio: string | null
          certifications: string[] | null
          consultation_fee: number | null
          consultation_modes: string[] | null
          created_at: string
          date_of_birth: string | null
          experience_years: number | null
          gender: string | null
          id: string
          language: string[] | null
          location: string | null
          profile_picture_url: string | null
          rating_average: number | null
          reviews_count: number | null
          role: Database["public"]["Enums"]["user_role"]
          specialties: string[] | null
          updated_at: string
          user_id: string
          usr_name: string | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          certifications?: string[] | null
          consultation_fee?: number | null
          consultation_modes?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          language?: string[] | null
          location?: string | null
          profile_picture_url?: string | null
          rating_average?: number | null
          reviews_count?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          specialties?: string[] | null
          updated_at?: string
          user_id: string
          usr_name?: string | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          certifications?: string[] | null
          consultation_fee?: number | null
          consultation_modes?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          language?: string[] | null
          location?: string | null
          profile_picture_url?: string | null
          rating_average?: number | null
          reviews_count?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
          usr_name?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          created_at: string
          healer_id: string
          id: string
          patient_id: string
          rating: number
          review_text: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          healer_id: string
          id?: string
          patient_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          healer_id?: string
          id?: string
          patient_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_plans: {
        Row: {
          appointment_id: string | null
          created_at: string
          description: string
          end_date: string
          healer_id: string
          id: string
          is_active: boolean | null
          patient_id: string
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          description: string
          end_date: string
          healer_id: string
          id?: string
          is_active?: boolean | null
          patient_id: string
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          description?: string
          end_date?: string
          healer_id?: string
          id?: string
          is_active?: boolean | null
          patient_id?: string
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wellness_plans_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "rescheduled"
      consultation_mode: "chat" | "video" | "in_person"
      user_role: "healer" | "patient"
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
    Enums: {
      appointment_status: [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      consultation_mode: ["chat", "video", "in_person"],
      user_role: ["healer", "patient"],
    },
  },
} as const
