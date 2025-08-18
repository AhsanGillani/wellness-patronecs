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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      community_answers: {
        Row: {
          body: string
          created_at: string
          guest_fingerprint: string | null
          guest_name: string | null
          id: string
          is_from_professional: boolean
          is_verified: boolean
          question_id: string
          status: Database["public"]["Enums"]["post_status"]
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          is_from_professional?: boolean
          is_verified?: boolean
          question_id: string
          status?: Database["public"]["Enums"]["post_status"]
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          is_from_professional?: boolean
          is_verified?: boolean
          question_id?: string
          status?: Database["public"]["Enums"]["post_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "community_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_questions: {
        Row: {
          body: string
          created_at: string
          guest_fingerprint: string | null
          guest_name: string | null
          id: string
          is_anonymous: boolean
          status: Database["public"]["Enums"]["post_status"]
          title: string
          topic_id: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          is_anonymous?: boolean
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          topic_id: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          is_anonymous?: boolean
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          topic_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      community_topics: {
        Row: {
          created_at: string
          description: string | null
          guest_fingerprint: string | null
          guest_name: string | null
          id: string
          slug: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          slug: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          slug?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      community_votes: {
        Row: {
          created_at: string
          entity_id: string
          guest_fingerprint: string | null
          id: string
          target: Database["public"]["Enums"]["vote_target"]
          user_id: string | null
          vote: number
        }
        Insert: {
          created_at?: string
          entity_id: string
          guest_fingerprint?: string | null
          id?: string
          target: Database["public"]["Enums"]["vote_target"]
          user_id?: string | null
          vote: number
        }
        Update: {
          created_at?: string
          entity_id?: string
          guest_fingerprint?: string | null
          id?: string
          target?: Database["public"]["Enums"]["vote_target"]
          user_id?: string | null
          vote?: number
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
      post_status: "published" | "hidden" | "deleted"
      vote_target: "question" | "answer"
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
      post_status: ["published", "hidden", "deleted"],
      vote_target: ["question", "answer"],
    },
  },
} as const
