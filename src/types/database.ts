/**
 * Typen für die Datenbank.
 *
 * TIPP: Diese Datei kannst du automatisch aus deinem echten Supabase-Schema
 * generieren lassen, statt sie von Hand zu pflegen:
 *
 *   npx supabase gen types typescript --project-id <dein-projekt> > src/types/database.ts
 *
 * Unten ist ein handgeschriebenes Beispiel passend zur Migration
 * in supabase/migrations/0001_init.sql.
 */

export type UserRole = 'user' | 'admin';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
        };
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
  };
};

// Bequeme Kurz-Typen für den App-Code.
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type ItemInsert = Database['public']['Tables']['items']['Insert'];
export type ItemUpdate = Database['public']['Tables']['items']['Update'];
