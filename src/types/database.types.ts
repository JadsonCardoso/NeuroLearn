// Gerado automaticamente via Supabase MCP — NÃO editar manualmente
// Para regenerar: mcp__claude_ai_Supabase__generate_typescript_types

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      cognitive_events: {
        Row: {
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          user_id: string
        }
        Insert: {
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json
          user_id: string
        }
        Update: {
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cognitive_events_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      contents: {
        Row: {
          added_at: string
          author: string | null
          color: string
          description: string | null
          id: string
          progress: number
          title: string
          trail_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          added_at?: string
          author?: string | null
          color?: string
          description?: string | null
          id?: string
          progress?: number
          title: string
          trail_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          added_at?: string
          author?: string | null
          color?: string
          description?: string | null
          id?: string
          progress?: number
          title?: string
          trail_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contents_trail_id_fkey'
            columns: ['trail_id']
            isOneToOne: false
            referencedRelation: 'learning_trails'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contents_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      exercises: {
        Row: {
          answer: string
          content_id: string
          created_at: string
          id: string
          notes: string | null
          question: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          content_id: string
          created_at?: string
          id?: string
          notes?: string | null
          question: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          content_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          question?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'exercises_content_id_fkey'
            columns: ['content_id']
            isOneToOne: false
            referencedRelation: 'contents'
            referencedColumns: ['id']
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          content_id: string
          created_at: string
          ef: number
          front: string
          id: string
          interval: number
          last_review: string | null
          mastery: string
          next_review: string
          repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          content_id: string
          created_at?: string
          ef?: number
          front: string
          id?: string
          interval?: number
          last_review?: string | null
          mastery?: string
          next_review?: string
          repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          content_id?: string
          created_at?: string
          ef?: number
          front?: string
          id?: string
          interval?: number
          last_review?: string | null
          mastery?: string
          next_review?: string
          repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'flashcards_content_id_fkey'
            columns: ['content_id']
            isOneToOne: false
            referencedRelation: 'contents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'flashcards_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      learning_trails: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          goal: string | null
          icon_emoji: string
          id: string
          project_id: string | null
          skill_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string | null
          goal?: string | null
          icon_emoji?: string
          id?: string
          project_id?: string | null
          skill_id?: string | null
          title: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          goal?: string | null
          icon_emoji?: string
          id?: string
          project_id?: string | null
          skill_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'learning_trails_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'learning_trails_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      retention_metrics: {
        Row: {
          flashcard_id: string
          id: string
          retention: number
          snapshot_date: string
          user_id: string
        }
        Insert: {
          flashcard_id: string
          id?: string
          retention: number
          snapshot_date?: string
          user_id: string
        }
        Update: {
          flashcard_id?: string
          id?: string
          retention?: number
          snapshot_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'retention_metrics_flashcard_id_fkey'
            columns: ['flashcard_id']
            isOneToOne: false
            referencedRelation: 'flashcards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'retention_metrics_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      review_cycles: {
        Row: {
          ef_after: number
          ef_before: number
          flashcard_id: string
          id: string
          interval_after: number
          interval_before: number
          quality: number
          reviewed_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          ef_after: number
          ef_before: number
          flashcard_id: string
          id?: string
          interval_after: number
          interval_before: number
          quality: number
          reviewed_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          ef_after?: number
          ef_before?: number
          flashcard_id?: string
          id?: string
          interval_after?: number
          interval_before?: number
          quality?: number
          reviewed_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: 'review_cycles_flashcard_id_fkey'
            columns: ['flashcard_id']
            isOneToOne: false
            referencedRelation: 'flashcards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'review_cycles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      session_drafts: {
        Row: {
          content_id: string
          highlights: Json
          id: string
          notes: string
          teach_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          highlights?: Json
          id?: string
          notes?: string
          teach_text?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          highlights?: Json
          id?: string
          notes?: string
          teach_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_drafts_content_id_fkey'
            columns: ['content_id']
            isOneToOne: false
            referencedRelation: 'contents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_drafts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      skills: {
        Row: {
          category: string
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category: string
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      streak_shield_uses: {
        Row: {
          created_at: string | null
          id: string
          streak_preserved: number
          used_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          streak_preserved: number
          used_at: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          streak_preserved?: number
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          cards_created: number
          content_id: string
          duration: number
          ended_at: string | null
          highlights: Json
          id: string
          mode: string | null
          notes: string
          started_at: string
          teach_text: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          cards_created?: number
          content_id: string
          duration: number
          ended_at?: string | null
          highlights?: Json
          id?: string
          mode?: string | null
          notes?: string
          started_at?: string
          teach_text?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          cards_created?: number
          content_id?: string
          duration?: number
          ended_at?: string | null
          highlights?: Json
          id?: string
          mode?: string | null
          notes?: string
          started_at?: string
          teach_text?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: 'study_sessions_content_id_fkey'
            columns: ['content_id']
            isOneToOne: false
            referencedRelation: 'contents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'study_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      user_missions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string | null
          goal: number
          id: string
          mission_id: string
          period_start: string
          period_type: string
          progress: number
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          goal: number
          id?: string
          mission_id: string
          period_start: string
          period_type: string
          progress?: number
          user_id: string
          xp_reward: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          goal?: number
          id?: string
          mission_id?: string
          period_start?: string
          period_type?: string
          progress?: number
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          acquired_at: string
          id: string
          level: number
          max_xp: number
          skill_id: string
          user_id: string
          xp: number
        }
        Insert: {
          acquired_at?: string
          id?: string
          level?: number
          max_xp?: number
          skill_id: string
          user_id: string
          xp?: number
        }
        Update: {
          acquired_at?: string
          id?: string
          level?: number
          max_xp?: number
          skill_id?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: 'user_skills_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_skills_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          last_study_date: string | null
          name: string | null
          role: string
          streak: number
          streak_shields: number
          study_goals: Json | null
          total_xp: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          last_study_date?: string | null
          name?: string | null
          role?: string
          streak?: number
          streak_shields?: number
          study_goals?: Json | null
          total_xp?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          last_study_date?: string | null
          name?: string | null
          role?: string
          streak?: number
          streak_shields?: number
          study_goals?: Json | null
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Aliases de conveniência para os serviços de domínio
export type DbContent = Database['public']['Tables']['contents']['Row']
export type DbFlashcard = Database['public']['Tables']['flashcards']['Row']
export type DbSkill = Database['public']['Tables']['skills']['Row']
export type DbUserSkill = Database['public']['Tables']['user_skills']['Row']
export type DbSession = Database['public']['Tables']['study_sessions']['Row']
export type DbDraft = Database['public']['Tables']['session_drafts']['Row']
export type DbTrail = Database['public']['Tables']['learning_trails']['Row']
export type DbProject = Database['public']['Tables']['projects']['Row']
export type DbUserMission = Database['public']['Tables']['user_missions']['Row']
export type DbStreakShieldUse = Database['public']['Tables']['streak_shield_uses']['Row']
export type DbExercise = Database['public']['Tables']['exercises']['Row']
