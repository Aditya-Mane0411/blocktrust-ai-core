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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blockchain_transactions: {
        Row: {
          block_number: number
          created_at: string
          data: Json
          id: string
          related_id: string | null
          transaction_hash: string
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          block_number: number
          created_at?: string
          data?: Json
          id?: string
          related_id?: string | null
          transaction_hash: string
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          block_number?: number
          created_at?: string
          data?: Json
          id?: string
          related_id?: string | null
          transaction_hash?: string
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contract_deployments: {
        Row: {
          block_number: number
          contract_address: string
          created_at: string
          deployer_id: string | null
          deployment_params: Json
          id: string
          network_id: string
          status: string
          template_id: string
        }
        Insert: {
          block_number: number
          contract_address: string
          created_at?: string
          deployer_id?: string | null
          deployment_params?: Json
          id?: string
          network_id: string
          status?: string
          template_id: string
        }
        Update: {
          block_number?: number
          contract_address?: string
          created_at?: string
          deployer_id?: string | null
          deployment_params?: Json
          id?: string
          network_id?: string
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_deployments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "event_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      event_templates: {
        Row: {
          config: Json
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ipfs_objects: {
        Row: {
          cid: string
          content: Json
          content_type: string
          created_at: string
          created_by: string | null
          id: string
        }
        Insert: {
          cid: string
          content: Json
          content_type: string
          created_at?: string
          created_by?: string | null
          id?: string
        }
        Update: {
          cid?: string
          content?: Json
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
        }
        Relationships: []
      }
      petition_events: {
        Row: {
          blockchain_hash: string | null
          created_at: string
          created_by: string
          current_signatures: number
          description: string
          end_time: string
          id: string
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          target_signatures: number
          title: string
          updated_at: string
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string
          created_by: string
          current_signatures?: number
          description: string
          end_time: string
          id?: string
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          target_signatures?: number
          title: string
          updated_at?: string
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string
          created_by?: string
          current_signatures?: number
          description?: string
          end_time?: string
          id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          target_signatures?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      petition_signatures: {
        Row: {
          blockchain_hash: string | null
          comment: string | null
          created_at: string
          id: string
          petition_id: string
          user_id: string
        }
        Insert: {
          blockchain_hash?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          petition_id: string
          user_id: string
        }
        Update: {
          blockchain_hash?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          petition_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "petition_signatures_petition_id_fkey"
            columns: ["petition_id"]
            isOneToOne: false
            referencedRelation: "petition_events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          login_method: string | null
          updated_at: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          login_method?: string | null
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          login_method?: string | null
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          blockchain_hash: string | null
          created_at: string
          id: string
          user_id: string
          vote_option: string
          voting_event_id: string
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string
          id?: string
          user_id: string
          vote_option: string
          voting_event_id: string
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string
          id?: string
          user_id?: string
          vote_option?: string
          voting_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_voting_event_id_fkey"
            columns: ["voting_event_id"]
            isOneToOne: false
            referencedRelation: "voting_events"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_events: {
        Row: {
          blockchain_hash: string | null
          created_at: string
          created_by: string
          description: string
          end_time: string
          id: string
          options: Json
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          total_votes: number
          updated_at: string
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string
          created_by: string
          description: string
          end_time: string
          id?: string
          options?: Json
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          total_votes?: number
          updated_at?: string
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string
          created_by?: string
          description?: string
          end_time?: string
          id?: string
          options?: Json
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          total_votes?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "voter" | "petitioner"
      event_status: "draft" | "active" | "completed" | "cancelled"
      vote_choice: "yes" | "no" | "abstain"
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
      app_role: ["admin", "voter", "petitioner"],
      event_status: ["draft", "active", "completed", "cancelled"],
      vote_choice: ["yes", "no", "abstain"],
    },
  },
} as const
