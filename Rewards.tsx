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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      biatrix_sync_logs: {
        Row: {
          company_id: string
          completed_at: string | null
          error_message: string | null
          id: string
          records_synced: number
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_synced?: number
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_synced?: number
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "biatrix_sync_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          biatrix_company_id: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          biatrix_company_id?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Update: {
          biatrix_company_id?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          biatrix_collaborator_id: string | null
          biatrix_user_id: string | null
          company_id: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          role: string
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          biatrix_collaborator_id?: string | null
          biatrix_user_id?: string | null
          company_id?: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          role?: string
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          biatrix_collaborator_id?: string | null
          biatrix_user_id?: string | null
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_campaigns: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          max_points_per_user: number
          name: string
          points_per_action: number
          regulation_url: string | null
          start_date: string
          status: string
        }
        Insert: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          max_points_per_user: number
          name: string
          points_per_action: number
          regulation_url?: string | null
          start_date: string
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          max_points_per_user?: number
          name?: string
          points_per_action?: number
          regulation_url?: string | null
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_points: {
        Row: {
          campaign_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          points: number
          profile_id: string
          transaction_type: string
        }
        Insert: {
          campaign_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          points: number
          profile_id: string
          transaction_type: string
        }
        Update: {
          campaign_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          points?: number
          profile_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_points_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "reward_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_points_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_points_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_points_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_prizes: {
        Row: {
          company_id: string
          created_at: string
          delivery_days: number
          description: string | null
          expiration_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          points_cost: number
          quantity_available: number
        }
        Insert: {
          company_id?: string
          created_at?: string
          delivery_days?: number
          description?: string | null
          expiration_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          points_cost: number
          quantity_available?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          delivery_days?: number
          description?: string | null
          expiration_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          points_cost?: number
          quantity_available?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_prizes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          delivered_at: string | null
          estimated_delivery_date: string | null
          id: string
          idempotency_key: string
          points_spent: number
          prize_id: string
          profile_id: string
          rejection_reason: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          delivered_at?: string | null
          estimated_delivery_date?: string | null
          id?: string
          idempotency_key?: string
          points_spent: number
          prize_id: string
          profile_id: string
          rejection_reason?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          delivered_at?: string | null
          estimated_delivery_date?: string | null
          id?: string
          idempotency_key?: string
          points_spent?: number
          prize_id?: string
          profile_id?: string
          rejection_reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "reward_prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          biatrix_id: string | null
          company_id: string
          created_at: string
          description: string | null
          hierarchy_order: number
          id: string
          is_advisory: boolean
          leader_id: string | null
          level: number
          name: string
          parent_id: string | null
          synced_at: string | null
        }
        Insert: {
          biatrix_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          hierarchy_order?: number
          id?: string
          is_advisory?: boolean
          leader_id?: string | null
          level?: number
          name: string
          parent_id?: string | null
          synced_at?: string | null
        }
        Update: {
          biatrix_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          hierarchy_order?: number
          id?: string
          is_advisory?: boolean
          leader_id?: string | null
          level?: number
          name?: string
          parent_id?: string | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sectors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sectors_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sectors_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      current_profile_role: { Args: never; Returns: string }
      get_points_balance: { Args: { p_profile_id: string }; Returns: number }
      redeem_prize: {
        Args: {
          p_company_id: string
          p_idempotency_key: string
          p_prize_id: string
          p_profile_id: string
        }
        Returns: string
      }
      reject_redemption: {
        Args: {
          p_approved_by: string
          p_reason?: string
          p_redemption_id: string
        }
        Returns: undefined
      }
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
