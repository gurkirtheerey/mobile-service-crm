// Database types for Supabase
// These match the SQL schema defined in supabase/migrations

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
      businesses: {
        Row: {
          id: string;
          name: string;
          service_type: string;
          service_area: string;
          config: Json;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          service_type: string;
          service_area: string;
          config?: Json;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          service_type?: string;
          service_area?: string;
          config?: Json;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: 'admin' | 'technician';
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role: 'admin' | 'technician';
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: 'admin' | 'technician';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      zones: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          assigned_days: number[];
          center_lat: number;
          center_lng: number;
          radius_miles: number;
          max_appointments_per_day: number;
          avg_service_duration_minutes: number;
          travel_buffer_minutes: number;
          color: string;
          team_assignment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          assigned_days: number[];
          center_lat: number;
          center_lng: number;
          radius_miles: number;
          max_appointments_per_day?: number;
          avg_service_duration_minutes?: number;
          travel_buffer_minutes?: number;
          color?: string;
          team_assignment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          assigned_days?: number[];
          center_lat?: number;
          center_lng?: number;
          radius_miles?: number;
          max_appointments_per_day?: number;
          avg_service_duration_minutes?: number;
          travel_buffer_minutes?: number;
          color?: string;
          team_assignment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "zones_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      services: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          base_price: number;
          pricing_modifiers: Json | null;
          add_ons: Json | null;
          weather_dependent: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          base_price: number;
          pricing_modifiers?: Json | null;
          add_ons?: Json | null;
          weather_dependent?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          base_price?: number;
          pricing_modifiers?: Json | null;
          add_ons?: Json | null;
          weather_dependent?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          preferred_contact_method: 'sms' | 'email' | 'phone';
          street: string;
          city: string;
          state: string;
          zip: string;
          lat: number | null;
          lng: number | null;
          assigned_zone_id: string | null;
          custom_fields: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          preferred_contact_method?: 'sms' | 'email' | 'phone';
          street: string;
          city: string;
          state: string;
          zip: string;
          lat?: number | null;
          lng?: number | null;
          assigned_zone_id?: string | null;
          custom_fields?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          preferred_contact_method?: 'sms' | 'email' | 'phone';
          street?: string;
          city?: string;
          state?: string;
          zip?: string;
          lat?: number | null;
          lng?: number | null;
          assigned_zone_id?: string | null;
          custom_fields?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clients_assigned_zone_id_fkey";
            columns: ["assigned_zone_id"];
            isOneToOne: false;
            referencedRelation: "zones";
            referencedColumns: ["id"];
          }
        ];
      };
      appointments: {
        Row: {
          id: string;
          business_id: string;
          client_id: string;
          service_id: string;
          zone_id: string;
          scheduled_start: string;
          scheduled_end: string;
          assigned_technician_id: string | null;
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          weather_flagged: boolean;
          total_price: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          client_id: string;
          service_id: string;
          zone_id: string;
          scheduled_start: string;
          scheduled_end: string;
          assigned_technician_id?: string | null;
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          weather_flagged?: boolean;
          total_price: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          client_id?: string;
          service_id?: string;
          zone_id?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          assigned_technician_id?: string | null;
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          weather_flagged?: boolean;
          total_price?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_zone_id_fkey";
            columns: ["zone_id"];
            isOneToOne: false;
            referencedRelation: "zones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_assigned_technician_id_fkey";
            columns: ["assigned_technician_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      photos: {
        Row: {
          id: string;
          business_id: string;
          appointment_id: string;
          photo_type: 'before' | 'after' | 'issue' | 'progress';
          file_url: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          appointment_id: string;
          photo_type: 'before' | 'after' | 'issue' | 'progress';
          file_url: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          appointment_id?: string;
          photo_type?: 'before' | 'after' | 'issue' | 'progress';
          file_url?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_business_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
    };
    Enums: {
      appointment_status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
      contact_method: 'sms' | 'email' | 'phone';
      member_role: 'admin' | 'technician';
      photo_type: 'before' | 'after' | 'issue' | 'progress';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience type aliases
export type DbBusiness = Tables<'businesses'>;
export type DbZone = Tables<'zones'>;
export type DbService = Tables<'services'>;
export type DbClient = Tables<'clients'>;
export type DbAppointment = Tables<'appointments'>;
export type DbPhoto = Tables<'photos'>;
export type DbBusinessMember = Tables<'business_members'>;
