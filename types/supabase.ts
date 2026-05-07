export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      decks: {
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
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      diagram_folders: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      diagrams: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          content: Json | null;
          folder_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          content?: Json | null;
          folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          content?: Json | null;
          folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      flashcards: {
        Row: {
          id: string;
          deck_id: string;
          type: string;
          front: string;
          back: string;
          image_url: string | null;
          audio_url: string | null;
          back_image_url: string | null;
          back_audio_url: string | null;
          multiple_choice_options: Json | null;
          tags: string[] | null;
          ease_factor: number;
          interval_days: number;
          repetitions: number;
          next_review: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          type: string;
          front: string;
          back: string;
          image_url?: string | null;
          audio_url?: string | null;
          back_image_url?: string | null;
          back_audio_url?: string | null;
          multiple_choice_options?: Json | null;
          tags?: string[] | null;
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          next_review?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          type?: string;
          front?: string;
          back?: string;
          image_url?: string | null;
          audio_url?: string | null;
          back_image_url?: string | null;
          back_audio_url?: string | null;
          multiple_choice_options?: Json | null;
          tags?: string[] | null;
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          next_review?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          parent_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          completed_dates: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          completed_dates?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          completed_dates?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          icon: string | null;
          cover_image: string | null;
          content: Json | null;
          folder_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          icon?: string | null;
          cover_image?: string | null;
          content?: Json | null;
          folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          icon?: string | null;
          cover_image?: string | null;
          content?: Json | null;
          folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
