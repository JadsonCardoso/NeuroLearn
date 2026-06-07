// Gerado automaticamente via Supabase MCP — NÃO editar manualmente
// Para regenerar: mcp__claude_ai_Supabase__generate_typescript_types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contents_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
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
      study_sessions: {
        Row: {
          cards_created: number
          content_id: string
          duration: number
          ended_at: string | null
          id: string
          mode: string | null
          started_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          cards_created?: number
          content_id: string
          duration: number
          ended_at?: string | null
          id?: string
          mode?: string | null
          started_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          cards_created?: number
          content_id?: string
          duration?: number
          ended_at?: string | null
          id?: string
          mode?: string | null
          started_at?: string
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
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, 'public'>]

// Helpers de acesso rápido às rows
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbContent = Database['public']['Tables']['contents']['Row']
export type DbFlashcard = Database['public']['Tables']['flashcards']['Row']
export type DbReviewCycle = Database['public']['Tables']['review_cycles']['Row']
export type DbStudySession = Database['public']['Tables']['study_sessions']['Row']
export type DbSkill = Database['public']['Tables']['skills']['Row']
export type DbUserSkill = Database['public']['Tables']['user_skills']['Row']
export type DbRetentionMetric = Database['public']['Tables']['retention_metrics']['Row']
export type DbCognitiveEvent = Database['public']['Tables']['cognitive_events']['Row']

export type Tables<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Update']
