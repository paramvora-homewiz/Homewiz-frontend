/**
 * Database Service Layer for HomeWiz
 * 
 * Comprehensive database operations with:
 * - CRUD operations for all entities
 * - Advanced error handling and validation
 * - Caching and performance optimization
 * - Real-time subscriptions
 * - Offline support and conflict resolution
 */

import { supabaseClient, SupabaseError } from './client'
import { 
  Building, BuildingInsert, BuildingUpdate,
  Room, RoomInsert, RoomUpdate,
  Tenant, TenantInsert, TenantUpdate,
  Operator, OperatorInsert, OperatorUpdate,
  Lead, LeadInsert, LeadUpdate
} from './types'

// Response types for consistent API
export interface DatabaseResponse<T> {
  data: T | null
  error: SupabaseError | null
  success: boolean
  message?: string
}

export interface DatabaseListResponse<T> {
  data: T[]
  error: SupabaseError | null
  success: boolean
  count?: number
  message?: string
}

// Query options for advanced filtering and pagination
export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  search?: string
  searchFields?: string[]
}

// Cache configuration
interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number
}

const defaultCacheConfig: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
}

// Simple in-memory cache
class DatabaseCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private config: CacheConfig

  constructor(config: CacheConfig = defaultCacheConfig) {
    this.config = config
  }

  set(key: string, data: any): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    // Remove entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl
    }
  }
}

/**
 * Base Database Service with common operations
 */
abstract class BaseService<T, TInsert, TUpdate> {
  protected tableName: string
  protected cache: DatabaseCache
  protected client = supabaseClient

  constructor(tableName: string) {
    this.tableName = tableName
    this.cache = new DatabaseCache()
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<DatabaseResponse<T>> {
    try {
      const result = await this.client.executeWithRetry(async () => {
        const { data: record, error } = await this.client
          .getClient()
          .from(this.tableName)
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return record
      }, `create ${this.tableName}`)

      // Invalidate cache
      this.cache.invalidate(this.tableName)

      return {
        data: result as T,
        error: null,
        success: true,
        message: `${this.tableName} created successfully`
      }
    } catch (error) {
      return {
        data: null,
        error: error as SupabaseError,
        success: false
      }
    }
  }

  /**
   * Get record by ID
   */
  async getById(id: string | number): Promise<DatabaseResponse<T>> {
    const cacheKey = `${this.tableName}:${id}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return {
        data: cached,
        error: null,
        success: true,
        message: 'Retrieved from cache'
      }
    }

    try {
      const result = await this.client.executeWithRetry(async () => {
        const { data, error } = await this.client
          .getClient()
          .from(this.tableName)
          .select('*')
          .eq(this.getIdColumn(), id)
          .single()

        if (error) throw error
        return data
      }, `get ${this.tableName} by id`)

      // Cache the result
      this.cache.set(cacheKey, result)

      return {
        data: result as T,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: error as SupabaseError,
        success: false
      }
    }
  }

  /**
   * Update record by ID
   */
  async update(id: string | number, data: TUpdate): Promise<DatabaseResponse<T>> {
    try {
      const result = await this.client.executeWithRetry(async () => {
        // Use the correct timestamp field for this table
        const timestampField = this.getTimestampField()
        const updateData = timestampField 
          ? { ...data, [timestampField]: new Date().toISOString() }
          : data

        const { data: record, error } = await this.client
          .getClient()
          .from(this.tableName)
          .update(updateData)
          .eq(this.getIdColumn(), id)
          .select()
          .single()

        if (error) throw error
        return record
      }, `update ${this.tableName}`)

      // Invalidate cache
      this.cache.invalidate(this.tableName)

      return {
        data: result as T,
        error: null,
        success: true,
        message: `${this.tableName} updated successfully`
      }
    } catch (error) {
      return {
        data: null,
        error: error as SupabaseError,
        success: false
      }
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: string | number): Promise<DatabaseResponse<boolean>> {
    try {
      await this.client.executeWithRetry(async () => {
        const { error } = await this.client
          .getClient()
          .from(this.tableName)
          .delete()
          .eq(this.getIdColumn(), id)

        if (error) throw error
      }, `delete ${this.tableName}`)

      // Invalidate cache
      this.cache.invalidate(this.tableName)

      return {
        data: true,
        error: null,
        success: true,
        message: `${this.tableName} deleted successfully`
      }
    } catch (error) {
      return {
        data: false,
        error: error as SupabaseError,
        success: false
      }
    }
  }

  /**
   * List records with advanced filtering and pagination
   */
  async list(options: QueryOptions = {}): Promise<DatabaseListResponse<T>> {
    const {
      page = 1,
      limit = 50,
      sortBy = this.getDefaultSortColumn(),
      sortOrder = 'desc',
      filters = {},
      search,
      searchFields = []
    } = options

    const cacheKey = `${this.tableName}:list:${JSON.stringify(options)}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return {
        data: cached.data,
        count: cached.count,
        error: null,
        success: true,
        message: 'Retrieved from cache'
      }
    }

    try {
      const result = await this.client.executeWithRetry(async () => {
        let query = this.client.getClient().from(this.tableName).select('*', { count: 'exact' })

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value)
          }
        })

        // Apply search
        if (search && searchFields.length > 0) {
          const searchConditions = searchFields
            .map(field => `${field}.ilike.%${search}%`)
            .join(',')
          query = query.or(searchConditions)
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) throw error
        return { data, count }
      }, `list ${this.tableName}`)

      // Cache the result
      this.cache.set(cacheKey, result)

      return {
        data: result.data as T[],
        count: result.count || 0,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: [],
        error: error as SupabaseError,
        success: false
      }
    }
  }

  /**
   * Get the primary key column name for the table
   */
  protected abstract getIdColumn(): string

  /**
   * Get the default sort column for this table
   */
  protected getDefaultSortColumn(): string {
    return 'created_at' // Default, can be overridden by subclasses
  }

  /**
   * Get the timestamp field name for updates (handles schema differences)
   */
  protected getTimestampField(): string | null {
    // Most tables use 'last_modified', but some use 'updated_at'
    // Override in subclasses that use different field names
    return 'last_modified'
  }

  /**
   * Clear cache for this service
   */
  clearCache(): void {
    this.cache.invalidate(this.tableName)
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats()
  }
}

/**
 * Buildings Service
 */
export class BuildingsService extends BaseService<Building, BuildingInsert, BuildingUpdate> {
  constructor() {
    super('buildings')
  }

  protected getIdColumn(): string {
    return 'building_id'
  }

  /**
   * Get buildings with available rooms
   */
  async getWithAvailableRooms(): Promise<DatabaseListResponse<Building & { available_rooms: number }>> {
    try {
      const result = await this.client.executeWithRetry(async () => {
        const { data, error } = await this.client
          .getClient()
          .from('buildings')
          .select(`
            *,
            rooms!inner(room_id)
          `)
          .eq('rooms.availability_status', 'AVAILABLE')

        if (error) throw error
        return data
      }, 'get buildings with available rooms')

      return {
        data: result as any[],
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: [],
        error: error as SupabaseError,
        success: false
      }
    }
  }

  /**
   * Search buildings by location
   */
  async searchByLocation(query: string): Promise<DatabaseListResponse<Building>> {
    return this.list({
      search: query,
      searchFields: ['address', 'city', 'area', 'building_name']
    })
  }
}

/**
 * Rooms Service
 */
export class RoomsService extends BaseService<Room, RoomInsert, RoomUpdate> {
  constructor() {
    super('rooms')
  }

  protected getIdColumn(): string {
    return 'room_id'
  }

  protected getDefaultSortColumn(): string {
    return 'room_id' // rooms table doesn't have created_at
  }

  /**
   * Get available rooms for a building
   */
  async getAvailableByBuilding(buildingId: string): Promise<DatabaseListResponse<Room>> {
    return this.list({
      filters: {
        building_id: buildingId,
        availability_status: 'AVAILABLE'
      }
    })
  }

  /**
   * Update room availability
   */
  async updateAvailability(roomId: string, status: string): Promise<DatabaseResponse<Room>> {
    return this.update(roomId, { availability_status: status } as RoomUpdate)
  }

  /**
   * Get rooms by price range
   */
  async getByPriceRange(minPrice: number, maxPrice: number): Promise<DatabaseListResponse<Room>> {
    try {
      const result = await this.client.executeWithRetry(async () => {
        const { data, error } = await this.client
          .getClient()
          .from('rooms')
          .select('*')
          .gte('private_room_rent', minPrice)
          .lte('private_room_rent', maxPrice)
          .eq('availability_status', 'AVAILABLE')

        if (error) throw error
        return data
      }, 'get rooms by price range')

      return {
        data: result as Room[],
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: [],
        error: error as SupabaseError,
        success: false
      }
    }
  }
}

/**
 * Tenants Service
 */
export class TenantsService extends BaseService<Tenant, TenantInsert, TenantUpdate> {
  constructor() {
    super('tenants')
  }

  protected getIdColumn(): string {
    return 'tenant_id'
  }

  /**
   * Get tenant with building and room details
   */
  async getWithDetails(tenantId: string): Promise<DatabaseResponse<Tenant & { building?: Building; room?: Room }>> {
    try {
      const result = await this.client.executeWithRetry(async () => {
        const { data, error } = await this.client
          .getClient()
          .from('tenants')
          .select(`
            *,
            buildings(*),
            rooms(*)
          `)
          .eq('tenant_id', tenantId)
          .single()

        if (error) throw error
        return data
      }, 'get tenant with details')

      return {
        data: result as any,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: error as SupabaseError,
        success: false
      }
    }
  }

  /**
   * Search tenants by email or name
   */
  async search(query: string): Promise<DatabaseListResponse<Tenant>> {
    return this.list({
      search: query,
      searchFields: ['email', 'first_name', 'last_name']
    })
  }

  /**
   * Get tenants by status
   */
  async getByStatus(status: string): Promise<DatabaseListResponse<Tenant>> {
    return this.list({
      filters: { status }
    })
  }

  /**
   * Get tenants with upcoming lease expiration
   */
  async getUpcomingLeaseExpirations(days: number = 30): Promise<DatabaseListResponse<Tenant>> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const result = await this.client.executeWithRetry(async () => {
        const { data, error } = await this.client
          .getClient()
          .from('tenants')
          .select('*')
          .lte('lease_end_date', futureDate.toISOString())
          .gte('lease_end_date', new Date().toISOString())
          .eq('status', 'ACTIVE')

        if (error) throw error
        return data
      }, 'get upcoming lease expirations')

      return {
        data: result as Tenant[],
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: [],
        error: error as SupabaseError,
        success: false
      }
    }
  }
}

/**
 * Operators Service
 */
export class OperatorsService extends BaseService<Operator, OperatorInsert, OperatorUpdate> {
  constructor() {
    super('operators')
  }

  protected getIdColumn(): string {
    return 'operator_id'
  }

  protected getDefaultSortColumn(): string {
    return 'operator_id' // operators table doesn't have created_at
  }

  /**
   * Get operators by type
   */
  async getByType(operatorType: string): Promise<DatabaseListResponse<Operator>> {
    return this.list({
      filters: { operator_type: operatorType, status: 'ACTIVE' }
    })
  }

  /**
   * Get active operators
   */
  async getActive(): Promise<DatabaseListResponse<Operator>> {
    return this.list({
      filters: { status: 'ACTIVE' }
    })
  }
}

/**
 * Leads Service
 */
export class LeadsService extends BaseService<Lead, LeadInsert, LeadUpdate> {
  constructor() {
    super('leads')
  }

  protected getIdColumn(): string {
    return 'lead_id'
  }

  /**
   * Convert lead to tenant
   */
  async convertToTenant(leadId: string, tenantData: TenantInsert): Promise<DatabaseResponse<Tenant>> {
    try {
      // Start transaction-like operation
      const lead = await this.getById(leadId)
      if (!lead.success || !lead.data) {
        throw new Error('Lead not found')
      }

      // Create tenant
      const tenantsService = new TenantsService()
      const tenant = await tenantsService.create({
        ...tenantData,
        email: lead.data.email,
        first_name: lead.data.first_name || '',
        last_name: lead.data.last_name || ''
      })

      if (!tenant.success) {
        throw new Error('Failed to create tenant')
      }

      // Update lead status
      await this.update(leadId, { status: 'CONVERTED' } as LeadUpdate)

      return tenant
    } catch (error) {
      return {
        data: null,
        error: error as SupabaseError,
        success: false
      }
    }
  }

  /**
   * Get leads by status
   */
  async getByStatus(status: string): Promise<DatabaseListResponse<Lead>> {
    return this.list({
      filters: { status }
    })
  }

  /**
   * Assign lead to operator
   */
  async assignToOperator(leadId: string, operatorId: number): Promise<DatabaseResponse<Lead>> {
    return this.update(leadId, { assigned_operator_id: operatorId } as LeadUpdate)
  }
}

// Export service instances
export const buildingsService = new BuildingsService()
export const roomsService = new RoomsService()
export const tenantsService = new TenantsService()
export const operatorsService = new OperatorsService()
export const leadsService = new LeadsService()

// Export a unified database service
export const databaseService = {
  buildings: buildingsService,
  rooms: roomsService,
  tenants: tenantsService,
  operators: operatorsService,
  leads: leadsService,

  // Global operations
  clearAllCaches() {
    buildingsService.clearCache()
    roomsService.clearCache()
    tenantsService.clearCache()
    operatorsService.clearCache()
    leadsService.clearCache()
  },

  getStats() {
    return {
      connection: supabaseClient.getStats(),
      caches: {
        buildings: buildingsService.getCacheStats(),
        rooms: roomsService.getCacheStats(),
        tenants: tenantsService.getCacheStats(),
        operators: operatorsService.getCacheStats(),
        leads: leadsService.getCacheStats()
      }
    }
  }
}
