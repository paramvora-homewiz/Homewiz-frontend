/**
 * Supabase Database Types for HomeWiz
 * 
 * Updated types to match exact backend schema
 * These types are aligned with the actual database structure
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
          full_address: string | null
          street: string | null
          area: string | null
          city: string | null
          state: string | null
          zip: string | null
          operator_id: number | null
          available: boolean
          floors: number | null
          total_rooms: number | null
          total_bathrooms: number | null
          bathrooms_on_each_floor: number | null
          priority: number | null
          min_lease_term: number | null
          pref_min_lease_term: number | null
          wifi_included: boolean
          laundry_onsite: boolean
          secure_access: boolean
          bike_storage: boolean
          rooftop_access: boolean
          utilities_included: boolean
          fitness_area: boolean
          work_study_area: boolean
          social_events: boolean
          disability_access: boolean
          common_kitchen: string | null
          common_area: string | null
          pet_friendly: string | null
          cleaning_common_spaces: string | null
          nearby_conveniences_walk: string | null
          nearby_transportation: string | null
          building_rules: string | null
          amenities_details: string | null
          neighborhood_description: string | null
          building_description: string | null
          public_transit_info: string | null
          parking_info: string | null
          security_features: string | null
          disability_features: string | null
          building_images: string | null
          virtual_tour_url: string | null
          created_at: string
          last_modified: string
          year_built: number | null
          last_renovation: number | null
        }
        Insert: {
          building_id?: string
          building_name: string
          full_address?: string | null
          street?: string | null
          area?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          operator_id?: number | null
          available?: boolean
          floors?: number | null
          total_rooms?: number | null
          total_bathrooms?: number | null
          bathrooms_on_each_floor?: number | null
          priority?: number | null
          min_lease_term?: number | null
          pref_min_lease_term?: number | null
          wifi_included?: boolean
          laundry_onsite?: boolean
          secure_access?: boolean
          bike_storage?: boolean
          rooftop_access?: boolean
          utilities_included?: boolean
          fitness_area?: boolean
          work_study_area?: boolean
          social_events?: boolean
          disability_access?: boolean
          common_kitchen?: string | null
          common_area?: string | null
          pet_friendly?: string | null
          cleaning_common_spaces?: string | null
          nearby_conveniences_walk?: string | null
          nearby_transportation?: string | null
          building_rules?: string | null
          amenities_details?: string | null
          neighborhood_description?: string | null
          building_description?: string | null
          public_transit_info?: string | null
          parking_info?: string | null
          security_features?: string | null
          disability_features?: string | null
          building_images?: string | null
          virtual_tour_url?: string | null
          created_at?: string
          last_modified?: string
          year_built?: number | null
          last_renovation?: number | null
        }
        Update: {
          building_id?: string
          building_name?: string
          full_address?: string | null
          street?: string | null
          area?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          operator_id?: number | null
          available?: boolean
          floors?: number | null
          total_rooms?: number | null
          total_bathrooms?: number | null
          bathrooms_on_each_floor?: number | null
          priority?: number | null
          min_lease_term?: number | null
          pref_min_lease_term?: number | null
          wifi_included?: boolean
          laundry_onsite?: boolean
          secure_access?: boolean
          bike_storage?: boolean
          rooftop_access?: boolean
          utilities_included?: boolean
          fitness_area?: boolean
          work_study_area?: boolean
          social_events?: boolean
          disability_access?: boolean
          common_kitchen?: string | null
          common_area?: string | null
          pet_friendly?: string | null
          cleaning_common_spaces?: string | null
          nearby_conveniences_walk?: string | null
          nearby_transportation?: string | null
          building_rules?: string | null
          amenities_details?: string | null
          neighborhood_description?: string | null
          building_description?: string | null
          public_transit_info?: string | null
          parking_info?: string | null
          security_features?: string | null
          disability_features?: string | null
          building_images?: string | null
          virtual_tour_url?: string | null
          created_at?: string
          last_modified?: string
          year_built?: number | null
          last_renovation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["operator_id"]
          }
        ]
      }
      rooms: {
        Row: {
          room_id: string
          room_number: string
          building_id: string
          ready_to_rent: boolean
          status: string
          booked_from: string | null
          booked_till: string | null
          available_from: string | null
          active_tenants: number
          maximum_people_in_room: number | null
          private_room_rent: number
          shared_room_rent_2: number | null
          floor_number: number | null
          bed_count: number | null
          sq_footage: number | null
          bathroom_type: string | null
          bed_size: string | null
          bed_type: string | null
          view: string | null
          room_storage: string | null
          noise_level: string | null
          sunlight: string | null
          mini_fridge: boolean
          sink: boolean
          bedding_provided: boolean
          work_desk: boolean
          work_chair: boolean
          heating: boolean
          air_conditioning: boolean
          cable_tv: boolean
          furnished: boolean
          current_booking_types: string | null
          furniture_details: string | null
          public_notes: string | null
          internal_notes: string | null
          additional_features: string | null
          last_check: string | null
          last_check_by: number | null
          last_renovation_date: string | null
          room_images: string | null
          virtual_tour_url: string | null
          last_modified: string
        }
        Insert: {
          room_id?: string
          room_number: string
          building_id: string
          ready_to_rent?: boolean
          status?: string
          booked_from?: string | null
          booked_till?: string | null
          available_from?: string | null
          active_tenants?: number
          maximum_people_in_room?: number | null
          private_room_rent: number
          shared_room_rent_2?: number | null
          floor_number?: number | null
          bed_count?: number | null
          sq_footage?: number | null
          bathroom_type?: string | null
          bed_size?: string | null
          bed_type?: string | null
          view?: string | null
          room_storage?: string | null
          noise_level?: string | null
          sunlight?: string | null
          mini_fridge?: boolean
          sink?: boolean
          bedding_provided?: boolean
          work_desk?: boolean
          work_chair?: boolean
          heating?: boolean
          air_conditioning?: boolean
          cable_tv?: boolean
          furnished?: boolean
          current_booking_types?: string | null
          furniture_details?: string | null
          public_notes?: string | null
          internal_notes?: string | null
          additional_features?: string | null
          last_check?: string | null
          last_check_by?: number | null
          last_renovation_date?: string | null
          room_images?: string | null
          virtual_tour_url?: string | null
          last_modified?: string
        }
        Update: {
          room_id?: string
          room_number?: string
          building_id?: string
          ready_to_rent?: boolean
          status?: string
          booked_from?: string | null
          booked_till?: string | null
          available_from?: string | null
          active_tenants?: number
          maximum_people_in_room?: number | null
          private_room_rent?: number
          shared_room_rent_2?: number | null
          floor_number?: number | null
          bed_count?: number | null
          sq_footage?: number | null
          bathroom_type?: string | null
          bed_size?: string | null
          bed_type?: string | null
          view?: string | null
          room_storage?: string | null
          noise_level?: string | null
          sunlight?: string | null
          mini_fridge?: boolean
          sink?: boolean
          bedding_provided?: boolean
          work_desk?: boolean
          work_chair?: boolean
          heating?: boolean
          air_conditioning?: boolean
          cable_tv?: boolean
          furnished?: boolean
          current_booking_types?: string | null
          furniture_details?: string | null
          public_notes?: string | null
          internal_notes?: string | null
          additional_features?: string | null
          last_check?: string | null
          last_check_by?: number | null
          last_renovation_date?: string | null
          room_images?: string | null
          virtual_tour_url?: string | null
          last_modified?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "rooms_last_check_by_fkey"
            columns: ["last_check_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["operator_id"]
          }
        ]
      }
      tenants: {
        Row: {
          tenant_id: string
          tenant_name: string
          tenant_email: string
          phone: string | null
          tenant_nationality: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          building_id: string | null
          room_id: string | null
          room_number: string | null
          lease_start_date: string | null
          lease_end_date: string | null
          deposit_amount: number | null
          payment_status: string | null
          rent_payment_method: string | null
          account_status: string
          operator_id: number | null
          booking_type: string | null
          special_requests: string | null
          communication_preferences: string | null
          payment_reminders_enabled: boolean
          last_payment_date: string | null
          next_payment_date: string | null
          has_pets: boolean
          pet_details: string | null
          has_vehicles: boolean
          vehicle_details: string | null
          has_renters_insurance: boolean
          insurance_details: string | null
          status: string
          created_at: string
          last_modified: string
        }
        Insert: {
          tenant_id?: string
          tenant_name: string
          tenant_email: string
          phone?: string | null
          tenant_nationality?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          building_id?: string | null
          room_id?: string | null
          room_number?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          deposit_amount?: number | null
          payment_status?: string | null
          rent_payment_method?: string | null
          account_status?: string
          operator_id?: number | null
          booking_type?: string | null
          special_requests?: string | null
          communication_preferences?: string | null
          payment_reminders_enabled?: boolean
          last_payment_date?: string | null
          next_payment_date?: string | null
          has_pets?: boolean
          pet_details?: string | null
          has_vehicles?: boolean
          vehicle_details?: string | null
          has_renters_insurance?: boolean
          insurance_details?: string | null
          status?: string
          created_at?: string
          last_modified?: string
        }
        Update: {
          tenant_id?: string
          tenant_name?: string
          tenant_email?: string
          phone?: string | null
          tenant_nationality?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          building_id?: string | null
          room_id?: string | null
          room_number?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          deposit_amount?: number | null
          payment_status?: string | null
          rent_payment_method?: string | null
          account_status?: string
          operator_id?: number | null
          booking_type?: string | null
          special_requests?: string | null
          communication_preferences?: string | null
          payment_reminders_enabled?: boolean
          last_payment_date?: string | null
          next_payment_date?: string | null
          has_pets?: boolean
          pet_details?: string | null
          has_vehicles?: boolean
          vehicle_details?: string | null
          has_renters_insurance?: boolean
          insurance_details?: string | null
          status?: string
          created_at?: string
          last_modified?: string
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
          role: string | null
          active: boolean
          date_joined: string | null
          last_active: string | null
          operator_type: string
          permissions: string | null
          notification_preferences: string
          working_hours: string | null
          emergency_contact: boolean
          calendar_sync_enabled: boolean
          calendar_external_id: string | null
        }
        Insert: {
          operator_id?: number
          name: string
          email: string
          phone?: string | null
          role?: string | null
          active?: boolean
          date_joined?: string | null
          last_active?: string | null
          operator_type?: string
          permissions?: string | null
          notification_preferences?: string
          working_hours?: string | null
          emergency_contact?: boolean
          calendar_sync_enabled?: boolean
          calendar_external_id?: string | null
        }
        Update: {
          operator_id?: number
          name?: string
          email?: string
          phone?: string | null
          role?: string | null
          active?: boolean
          date_joined?: string | null
          last_active?: string | null
          operator_type?: string
          permissions?: string | null
          notification_preferences?: string
          working_hours?: string | null
          emergency_contact?: boolean
          calendar_sync_enabled?: boolean
          calendar_external_id?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          lead_id: string
          email: string
          status: string
          interaction_count: number
          lead_score: number
          rooms_interested: string | null
          selected_room_id: string | null
          showing_dates: string | null
          planned_move_in: string | null
          planned_move_out: string | null
          preferred_move_in_date: string | null
          preferred_lease_term: number | null
          visa_status: string | null
          notes: string | null
          additional_preferences: string | null
          budget_min: number | null
          budget_max: number | null
          lead_source: string | null
          preferred_communication: string
          last_contacted: string | null
          next_follow_up: string | null
          created_at: string
          last_modified: string
        }
        Insert: {
          lead_id?: string
          email: string
          status?: string
          interaction_count?: number
          lead_score?: number
          rooms_interested?: string | null
          selected_room_id?: string | null
          showing_dates?: string | null
          planned_move_in?: string | null
          planned_move_out?: string | null
          preferred_move_in_date?: string | null
          preferred_lease_term?: number | null
          visa_status?: string | null
          notes?: string | null
          additional_preferences?: string | null
          budget_min?: number | null
          budget_max?: number | null
          lead_source?: string | null
          preferred_communication?: string
          last_contacted?: string | null
          next_follow_up?: string | null
          created_at?: string
          last_modified?: string
        }
        Update: {
          lead_id?: string
          email?: string
          status?: string
          interaction_count?: number
          lead_score?: number
          rooms_interested?: string | null
          selected_room_id?: string | null
          showing_dates?: string | null
          planned_move_in?: string | null
          planned_move_out?: string | null
          preferred_move_in_date?: string | null
          preferred_lease_term?: number | null
          visa_status?: string | null
          notes?: string | null
          additional_preferences?: string | null
          budget_min?: number | null
          budget_max?: number | null
          lead_source?: string | null
          preferred_communication?: string
          last_contacted?: string | null
          next_follow_up?: string | null
          created_at?: string
          last_modified?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_selected_room_id_fkey"
            columns: ["selected_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["room_id"]
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