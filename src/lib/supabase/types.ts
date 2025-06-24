/**
 * Supabase Database Types for HomeWiz
 * 
 * Auto-generated types for type-safe database operations
 * These types should be updated when the database schema changes
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      buildings: {
        Row: {
          building_id: string
          building_name: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          total_units: number
          available_units: number
          building_type: string
          year_built: number | null
          amenities: Json | null
          contact_info: Json | null
          created_at: string
          updated_at: string
          status: string
          area: string | null
          description: string | null
          images: Json | null
          parking_available: boolean
          pet_friendly: boolean
          furnished_options: boolean
        }
        Insert: {
          building_id?: string
          building_name: string
          address: string
          city: string
          state: string
          zip_code: string
          country?: string
          total_units: number
          available_units?: number
          building_type: string
          year_built?: number | null
          amenities?: Json | null
          contact_info?: Json | null
          created_at?: string
          updated_at?: string
          status?: string
          area?: string | null
          description?: string | null
          images?: Json | null
          parking_available?: boolean
          pet_friendly?: boolean
          furnished_options?: boolean
        }
        Update: {
          building_id?: string
          building_name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          total_units?: number
          available_units?: number
          building_type?: string
          year_built?: number | null
          amenities?: Json | null
          contact_info?: Json | null
          created_at?: string
          updated_at?: string
          status?: string
          area?: string | null
          description?: string | null
          images?: Json | null
          parking_available?: boolean
          pet_friendly?: boolean
          furnished_options?: boolean
        }
        Relationships: []
      }
      rooms: {
        Row: {
          room_id: string
          building_id: string
          room_number: string
          room_type: string
          square_footage: number | null
          private_room_rent: number | null
          shared_room_rent_2: number | null
          shared_room_rent_3: number | null
          shared_room_rent_4: number | null
          availability_status: string
          lease_start_date: string | null
          lease_end_date: string | null
          amenities: Json | null
          created_at: string
          updated_at: string
          floor_number: number | null
          bathroom_type: string | null
          furnished: boolean
          utilities_included: Json | null
          images: Json | null
          description: string | null
        }
        Insert: {
          room_id?: string
          building_id: string
          room_number: string
          room_type: string
          square_footage?: number | null
          private_room_rent?: number | null
          shared_room_rent_2?: number | null
          shared_room_rent_3?: number | null
          shared_room_rent_4?: number | null
          availability_status?: string
          lease_start_date?: string | null
          lease_end_date?: string | null
          amenities?: Json | null
          created_at?: string
          updated_at?: string
          floor_number?: number | null
          bathroom_type?: string | null
          furnished?: boolean
          utilities_included?: Json | null
          images?: Json | null
          description?: string | null
        }
        Update: {
          room_id?: string
          building_id?: string
          room_number?: string
          room_type?: string
          square_footage?: number | null
          private_room_rent?: number | null
          shared_room_rent_2?: number | null
          shared_room_rent_3?: number | null
          shared_room_rent_4?: number | null
          availability_status?: string
          lease_start_date?: string | null
          lease_end_date?: string | null
          amenities?: Json | null
          created_at?: string
          updated_at?: string
          floor_number?: number | null
          bathroom_type?: string | null
          furnished?: boolean
          utilities_included?: Json | null
          images?: Json | null
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["building_id"]
          }
        ]
      }
      tenants: {
        Row: {
          tenant_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          date_of_birth: string | null
          tenant_nationality: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          building_id: string | null
          room_id: string | null
          lease_start_date: string | null
          lease_end_date: string | null
          rent_amount: number | null
          deposit_amount: number | null
          payment_status: string | null
          rent_payment_method: string | null
          account_status: string
          operator_id: number | null
          booking_type: string | null
          special_requests: string | null
          communication_preferences: string | null
          payment_reminders_enabled: boolean
          has_pets: boolean
          has_vehicles: boolean
          has_renters_insurance: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          tenant_id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          date_of_birth?: string | null
          tenant_nationality?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          building_id?: string | null
          room_id?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          rent_amount?: number | null
          deposit_amount?: number | null
          payment_status?: string | null
          rent_payment_method?: string | null
          account_status?: string
          operator_id?: number | null
          booking_type?: string | null
          special_requests?: string | null
          communication_preferences?: string | null
          payment_reminders_enabled?: boolean
          has_pets?: boolean
          has_vehicles?: boolean
          has_renters_insurance?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          tenant_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          tenant_nationality?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          building_id?: string | null
          room_id?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          rent_amount?: number | null
          deposit_amount?: number | null
          payment_status?: string | null
          rent_payment_method?: string | null
          account_status?: string
          operator_id?: number | null
          booking_type?: string | null
          special_requests?: string | null
          communication_preferences?: string | null
          payment_reminders_enabled?: boolean
          has_pets?: boolean
          has_vehicles?: boolean
          has_renters_insurance?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "tenants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "tenants_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["operator_id"]
          }
        ]
      }
      operators: {
        Row: {
          operator_id: number
          name: string
          email: string
          phone: string | null
          operator_type: string
          status: string
          created_at: string
          updated_at: string
          department: string | null
          hire_date: string | null
          permissions: Json | null
        }
        Insert: {
          operator_id?: number
          name: string
          email: string
          phone?: string | null
          operator_type: string
          status?: string
          created_at?: string
          updated_at?: string
          department?: string | null
          hire_date?: string | null
          permissions?: Json | null
        }
        Update: {
          operator_id?: number
          name?: string
          email?: string
          phone?: string | null
          operator_type?: string
          status?: string
          created_at?: string
          updated_at?: string
          department?: string | null
          hire_date?: string | null
          permissions?: Json | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          lead_id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          status: string
          source: string | null
          created_at: string
          updated_at: string
          notes: string | null
          assigned_operator_id: number | null
          interested_buildings: Json | null
          budget_range: Json | null
          move_in_date: string | null
          preferences: Json | null
        }
        Insert: {
          lead_id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          status?: string
          source?: string | null
          created_at?: string
          updated_at?: string
          notes?: string | null
          assigned_operator_id?: number | null
          interested_buildings?: Json | null
          budget_range?: Json | null
          move_in_date?: string | null
          preferences?: Json | null
        }
        Update: {
          lead_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          status?: string
          source?: string | null
          created_at?: string
          updated_at?: string
          notes?: string | null
          assigned_operator_id?: number | null
          interested_buildings?: Json | null
          budget_range?: Json | null
          move_in_date?: string | null
          preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_operator_id_fkey"
            columns: ["assigned_operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["operator_id"]
          }
        ]
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

// Utility types for easier usage
export type Building = Database['public']['Tables']['buildings']['Row']
export type BuildingInsert = Database['public']['Tables']['buildings']['Insert']
export type BuildingUpdate = Database['public']['Tables']['buildings']['Update']

export type Room = Database['public']['Tables']['rooms']['Row']
export type RoomInsert = Database['public']['Tables']['rooms']['Insert']
export type RoomUpdate = Database['public']['Tables']['rooms']['Update']

export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']

export type Operator = Database['public']['Tables']['operators']['Row']
export type OperatorInsert = Database['public']['Tables']['operators']['Insert']
export type OperatorUpdate = Database['public']['Tables']['operators']['Update']

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']
