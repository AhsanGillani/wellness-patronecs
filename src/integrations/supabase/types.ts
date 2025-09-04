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
      appointments: {
        Row: {
          appointment_status: Database["public"]["Enums"]["appointment_status"]
          created_at: string
          date: string
          end_time: string
          id: number
          location_address: string | null
          mode: Database["public"]["Enums"]["service_mode"]
          patient_profile_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          price_cents: number
          service_id: number
          start_time: string
          transaction_id: string | null
        }
        Insert: {
          appointment_status?: Database["public"]["Enums"]["appointment_status"]
          created_at?: string
          date: string
          end_time: string
          id?: number
          location_address?: string | null
          mode: Database["public"]["Enums"]["service_mode"]
          patient_profile_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price_cents: number
          service_id: number
          start_time: string
          transaction_id?: string | null
        }
        Update: {
          appointment_status?: Database["public"]["Enums"]["appointment_status"]
          created_at?: string
          date?: string
          end_time?: string
          id?: number
          location_address?: string | null
          mode?: Database["public"]["Enums"]["service_mode"]
          patient_profile_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price_cents?: number
          service_id?: number
          start_time?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_booked: boolean
          professional_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_booked?: boolean
          professional_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_booked?: boolean
          professional_id?: string
          start_time?: string
        }
        Relationships: []
      }
      availability_wishlist: {
        Row: {
          active: boolean
          created_at: string
          id: string
          patient_profile_id: string
          service_id: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          patient_profile_id: string
          service_id: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          patient_profile_id?: string
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_wishlist_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_wishlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_user_id: string | null
          body: string
          cover_url: string | null
          created_at: string
          id: string
          slug: string
          tags: string[] | null
          title: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          author_user_id?: string | null
          body: string
          cover_url?: string | null
          created_at?: string
          id?: string
          slug: string
          tags?: string[] | null
          title: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          author_user_id?: string | null
          body?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          slug?: string
          tags?: string[] | null
          title?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: number
          kind: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: number
          kind?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: number
          kind?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      community_answers: {
        Row: {
          author_user_id: string | null
          body: string
          created_at: string
          guest_fingerprint: string | null
          guest_name: string | null
          id: string
          is_professional: boolean
          parent_id: string | null
          question_id: string
          status: Database["public"]["Enums"]["community_status"]
          updated_at: string
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          is_professional?: boolean
          parent_id?: string | null
          question_id: string
          status?: Database["public"]["Enums"]["community_status"]
          updated_at?: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          is_professional?: boolean
          parent_id?: string | null
          question_id?: string
          status?: Database["public"]["Enums"]["community_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_answers_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_answers"
            referencedColumns: ["id"]
          },
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
          author_user_id: string | null
          body: string
          created_at: string
          guest_fingerprint: string | null
          guest_name: string | null
          id: string
          is_anonymous: boolean
          status: Database["public"]["Enums"]["community_status"]
          title: string
          topic_id: string
          updated_at: string
          views: number
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          is_anonymous?: boolean
          status?: Database["public"]["Enums"]["community_status"]
          title: string
          topic_id: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          is_anonymous?: boolean
          status?: Database["public"]["Enums"]["community_status"]
          title?: string
          topic_id?: string
          updated_at?: string
          views?: number
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
          author_user_id: string | null
          created_at: string
          description: string | null
          guest_fingerprint: string | null
          guest_name: string | null
          id: string
          image_base64: string | null
          slug: string
          status: Database["public"]["Enums"]["community_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_user_id?: string | null
          created_at?: string
          description?: string | null
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          image_base64?: string | null
          slug: string
          status?: Database["public"]["Enums"]["community_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string | null
          created_at?: string
          description?: string | null
          guest_fingerprint?: string | null
          guest_name?: string | null
          id?: string
          image_base64?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["community_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          agenda: Json | null
          category_id: number | null
          created_at: string
          date: string
          details: string | null
          end_time: string | null
          host_professional_id: string
          id: number
          image_url: string | null
          location: string | null
          registration_url: string | null
          rejection_reason: string | null
          slug: string
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"]
          summary: string | null
          ticket_price_cents: number | null
          title: string
          type: string
        }
        Insert: {
          agenda?: Json | null
          category_id?: number | null
          created_at?: string
          date: string
          details?: string | null
          end_time?: string | null
          host_professional_id: string
          id?: number
          image_url?: string | null
          location?: string | null
          registration_url?: string | null
          rejection_reason?: string | null
          slug: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          summary?: string | null
          ticket_price_cents?: number | null
          title: string
          type?: string
        }
        Update: {
          agenda?: Json | null
          category_id?: number | null
          created_at?: string
          date?: string
          details?: string | null
          end_time?: string | null
          host_professional_id?: string
          id?: number
          image_url?: string | null
          location?: string | null
          registration_url?: string | null
          rejection_reason?: string | null
          slug?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          summary?: string | null
          ticket_price_cents?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_host_professional_id_fkey"
            columns: ["host_professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          additional_comments: string | null
          appointment_id: number | null
          created_at: string
          feedback_text: string | null
          id: number
          patient_profile_id: string | null
          professional_id: string
          rating: number
          session_quality: Json | null
          would_recommend: boolean | null
        }
        Insert: {
          additional_comments?: string | null
          appointment_id?: number | null
          created_at?: string
          feedback_text?: string | null
          id?: number
          patient_profile_id?: string | null
          professional_id: string
          rating: number
          session_quality?: Json | null
          would_recommend?: boolean | null
        }
        Update: {
          additional_comments?: string | null
          appointment_id?: number | null
          created_at?: string
          feedback_text?: string | null
          id?: number
          patient_profile_id?: string | null
          professional_id?: string
          rating?: number
          session_quality?: Json | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          link_url: string | null
          read_at: string | null
          recipient_profile_id: string | null
          recipient_role: Database["public"]["Enums"]["user_role"] | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          link_url?: string | null
          read_at?: string | null
          recipient_profile_id?: string | null
          recipient_role?: Database["public"]["Enums"]["user_role"] | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          link_url?: string | null
          read_at?: string | null
          recipient_profile_id?: string | null
          recipient_role?: Database["public"]["Enums"]["user_role"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          bio: string | null
          created_at: string
          education_certifications: string | null
          id: string
          license_number: string | null
          location: string | null
          phone: string | null
          practice_address: string | null
          practice_name: string | null
          price_per_session: number | null
          profession: string | null
          profile_id: string
          slug: string
          specialization: string | null
          user_id: string | null
          verification: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          education_certifications?: string | null
          id?: string
          license_number?: string | null
          location?: string | null
          phone?: string | null
          practice_address?: string | null
          practice_name?: string | null
          price_per_session?: number | null
          profession?: string | null
          profile_id: string
          slug: string
          specialization?: string | null
          user_id?: string | null
          verification?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          education_certifications?: string | null
          id?: string
          license_number?: string | null
          location?: string | null
          phone?: string | null
          practice_address?: string | null
          practice_name?: string | null
          price_per_session?: number | null
          profession?: string | null
          profile_id?: string
          slug?: string
          specialization?: string | null
          user_id?: string | null
          verification?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          education_certifications: string | null
          email: string | null
          first_name: string | null
          health_goals: string | null
          id: string
          last_name: string | null
          license_number: string | null
          location: string | null
          phone: string | null
          practice_address: string | null
          practice_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          slug: string
          specialization: string | null
          state: string | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          years_experience: string | null
          zip: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_certifications?: string | null
          email?: string | null
          first_name?: string | null
          health_goals?: string | null
          id?: string
          last_name?: string | null
          license_number?: string | null
          location?: string | null
          phone?: string | null
          practice_address?: string | null
          practice_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          slug: string
          specialization?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          years_experience?: string | null
          zip?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_certifications?: string | null
          email?: string | null
          first_name?: string | null
          health_goals?: string | null
          id?: string
          last_name?: string | null
          license_number?: string | null
          location?: string | null
          phone?: string | null
          practice_address?: string | null
          practice_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          slug?: string
          specialization?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          years_experience?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          appointment_id: number
          created_at: string
          id: number
          patient_profile_id: string
          professional_profile_id: string
          reason: string | null
          status: Database["public"]["Enums"]["refund_status"]
          updated_at: string
        }
        Insert: {
          appointment_id: number
          created_at?: string
          id?: number
          patient_profile_id: string
          professional_profile_id: string
          reason?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
        }
        Update: {
          appointment_id?: number
          created_at?: string
          id?: number
          patient_profile_id?: string
          professional_profile_id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedule_requests: {
        Row: {
          appointment_id: number
          created_at: string
          current_appointment_date: string
          current_appointment_end_time: string
          current_appointment_start_time: string
          id: number
          patient_profile_id: string
          professional_profile_id: string
          reason: string
          requested_appointment_date: string
          requested_appointment_end_time: string
          requested_appointment_start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: number
          created_at?: string
          current_appointment_date: string
          current_appointment_end_time: string
          current_appointment_start_time: string
          id?: number
          patient_profile_id: string
          professional_profile_id: string
          reason: string
          requested_appointment_date: string
          requested_appointment_end_time: string
          requested_appointment_start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: number
          created_at?: string
          current_appointment_date?: string
          current_appointment_end_time?: string
          current_appointment_start_time?: string
          id?: number
          patient_profile_id?: string
          professional_profile_id?: string
          reason?: string
          requested_appointment_date?: string
          requested_appointment_end_time?: string
          requested_appointment_start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          availability: Json | null
          benefits: Json | null
          category_id: number | null
          created_at: string
          description: string | null
          duration_min: number
          id: number
          image_url: string | null
          mode: Database["public"]["Enums"]["service_mode"]
          name: string
          price_cents: number
          professional_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          availability?: Json | null
          benefits?: Json | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          duration_min: number
          id?: number
          image_url?: string | null
          mode?: Database["public"]["Enums"]["service_mode"]
          name: string
          price_cents?: number
          professional_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          availability?: Json | null
          benefits?: Json | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          duration_min?: number
          id?: number
          image_url?: string | null
          mode?: Database["public"]["Enums"]["service_mode"]
          name?: string
          price_cents?: number
          professional_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          event_id: string
          id: string
          quantity: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          quantity?: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          quantity?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          appointment_id: number | null
          created_at: string
          event_id: number | null
          fee_cents: number | null
          id: number
          method: string | null
          net_cents: number | null
          professional_id: string | null
          status: string | null
          user_profile_id: string | null
        }
        Insert: {
          amount_cents: number
          appointment_id?: number | null
          created_at?: string
          event_id?: number | null
          fee_cents?: number | null
          id?: number
          method?: string | null
          net_cents?: number | null
          professional_id?: string | null
          status?: string | null
          user_profile_id?: string | null
        }
        Update: {
          amount_cents?: number
          appointment_id?: number | null
          created_at?: string
          event_id?: number | null
          fee_cents?: number | null
          id?: number
          method?: string | null
          net_cents?: number | null
          professional_id?: string | null
          status?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount_cents: number
          approved_at: string | null
          id: number
          method: Database["public"]["Enums"]["withdraw_method"]
          payout_details: Json | null
          professional_id: string
          requested_at: string
          status: Database["public"]["Enums"]["withdraw_status"]
          transferred_at: string | null
        }
        Insert: {
          amount_cents: number
          approved_at?: string | null
          id?: number
          method: Database["public"]["Enums"]["withdraw_method"]
          payout_details?: Json | null
          professional_id: string
          requested_at?: string
          status?: Database["public"]["Enums"]["withdraw_status"]
          transferred_at?: string | null
        }
        Update: {
          amount_cents?: number
          approved_at?: string | null
          id?: number
          method?: Database["public"]["Enums"]["withdraw_method"]
          payout_details?: Json | null
          professional_id?: string
          requested_at?: string
          status?: Database["public"]["Enums"]["withdraw_status"]
          transferred_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      professional_ratings: {
        Row: {
          professional_id: string | null
          rating: number | null
          reviews: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_question_views: {
        Args: { qid: string }
        Returns: undefined
      }
    }
    Enums: {
      appointment_status: "scheduled" | "completed" | "cancelled" | "no_show"
      booking_status: "pending" | "confirmed" | "cancelled"
      community_status: "draft" | "published" | "archived"
      event_status: "pending" | "approved" | "rejected" | "cancelled"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      post_status: "published" | "hidden" | "deleted"
      post_visibility: "draft" | "published"
      refund_status: "pending" | "approved" | "rejected"
      reschedule_status: "pending" | "approved" | "declined"
      service_mode: "In-person" | "Virtual"
      user_role: "patient" | "professional" | "admin" | "doctor"
      vote_target: "question" | "answer"
      withdraw_method: "Bank" | "PayPal" | "Stripe"
      withdraw_status: "requested" | "approved" | "transferred"
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
      appointment_status: ["scheduled", "completed", "cancelled", "no_show"],
      booking_status: ["pending", "confirmed", "cancelled"],
      community_status: ["draft", "published", "archived"],
      event_status: ["pending", "approved", "rejected", "cancelled"],
      payment_status: ["pending", "paid", "refunded", "failed"],
      post_status: ["published", "hidden", "deleted"],
      post_visibility: ["draft", "published"],
      refund_status: ["pending", "approved", "rejected"],
      reschedule_status: ["pending", "approved", "declined"],
      service_mode: ["In-person", "Virtual"],
      user_role: ["patient", "professional", "admin", "doctor"],
      vote_target: ["question", "answer"],
      withdraw_method: ["Bank", "PayPal", "Stripe"],
      withdraw_status: ["requested", "approved", "transferred"],
    },
  },
} as const
