/**
 * Supabase Database types for the Mr & Miss Unibadan voting system.
 * Derived from supabase/migrations/001_init_voting_schema.sql
 *
 * In production, run `supabase gen types typescript --local` to auto-generate
 * these. This manual file replaces all `as unknown as` type assertions
 * throughout the codebase.
 */

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      voters: {
        Row: {
          id: string;
          email: string;
          has_voted: boolean;
          vote_token: string | null;
          token_expires_at: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          has_voted?: boolean;
          vote_token?: string | null;
          token_expires_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          has_voted?: boolean;
          vote_token?: string | null;
          token_expires_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      candidates: {
        Row: {
          id: string;
          name: string;
          category: "mr" | "miss";
          is_active: boolean;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: "mr" | "miss";
          is_active?: boolean;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: "mr" | "miss";
          is_active?: boolean;
          photo_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          candidate_id: string;
          category: "mr" | "miss";
          vote_session_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          category: "mr" | "miss";
          vote_session_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          category?: "mr" | "miss";
          vote_session_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      confirm_vote_atomic: {
        Args: {
          p_token: string;
          p_mr_candidate_id: string;
          p_miss_candidate_id: string;
          p_vote_session_id: string;
        };
        Returns: void;
      };
      get_leaderboard_counts: {
        Args: Record<string, never>;
        Returns: { candidate_id: string; vote_count: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
