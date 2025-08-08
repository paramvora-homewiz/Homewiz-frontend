'use client'

import { supabase } from './client'

export interface TableInfo {
  table_name: string
  table_schema: string
  table_type: string
}

export interface ColumnInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  character_maximum_length: number | null
}

export interface TableRelation {
  source_table: string
  source_column: string
  target_table: string
  target_column: string
  constraint_name: string
}

export interface TableStats {
  table_name: string
  row_count: number
  size: string
}

class DatabaseExplorer {
  private tableCache: Map<string, TableInfo[]> = new Map()
  private columnCache: Map<string, ColumnInfo[]> = new Map()
  private relationCache: Map<string, TableRelation[]> = new Map()

  /**
   * Discover all tables in the database
   */
  async discoverTables(): Promise<TableInfo[]> {
    try {
      // Try to get tables from information_schema
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema, table_type')
        .eq('table_schema', 'public')
        .not('table_name', 'like', 'pg_%')
        .order('table_name')

      if (error) {
        console.error('Error discovering tables:', error)
        // Fallback: try to detect tables by attempting common operations
        return this.discoverTablesFallback()
      }

      const tables = data || []
      this.tableCache.set('public', tables)
      return tables
    } catch (error) {
      console.error('Failed to discover tables:', error)
      return this.discoverTablesFallback()
    }
  }

  /**
   * Fallback method to discover tables by trying common table names
   */
  private async discoverTablesFallback(): Promise<TableInfo[]> {
    const commonTables = [
      'users', 'profiles', 'posts', 'comments', 'messages',
      'buildings', 'rooms', 'tenants', 'leads', 'operators',
      'properties', 'units', 'leases', 'payments', 'maintenance',
      'bookings', 'reservations', 'inquiries', 'applications',
      'documents', 'files', 'images', 'notifications', 'settings'
    ]

    const discoveredTables: TableInfo[] = []

    for (const tableName of commonTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(0)

        if (!error) {
          discoveredTables.push({
            table_name: tableName,
            table_schema: 'public',
            table_type: 'BASE TABLE'
          })
        }
      } catch {
        // Table doesn't exist, continue
      }
    }

    return discoveredTables
  }

  /**
   * Get columns for a specific table
   */
  async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    if (this.columnCache.has(tableName)) {
      return this.columnCache.get(tableName)!
    }

    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position')

      if (error) {
        console.error(`Error getting columns for ${tableName}:`, error)
        return this.getTableColumnsFallback(tableName)
      }

      const columns = data || []
      this.columnCache.set(tableName, columns)
      return columns
    } catch (error) {
      return this.getTableColumnsFallback(tableName)
    }
  }

  /**
   * Fallback method to get table structure by querying a single row
   */
  private async getTableColumnsFallback(tableName: string): Promise<ColumnInfo[]> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error || !data || data.length === 0) {
        return []
      }

      // Infer columns from the data
      const sample = data[0]
      return Object.keys(sample).map((key, index) => ({
        table_name: tableName,
        column_name: key,
        data_type: this.inferDataType(sample[key]),
        is_nullable: 'YES',
        column_default: null,
        character_maximum_length: null
      }))
    } catch {
      return []
    }
  }

  /**
   * Infer data type from a sample value
   */
  private inferDataType(value: any): string {
    if (value === null) return 'unknown'
    if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'numeric'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'object') return Array.isArray(value) ? 'array' : 'jsonb'
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'timestamp'
      if (/^\d+$/.test(value)) return 'text'
      return 'text'
    }
    return 'unknown'
  }

  /**
   * Get table relationships (foreign keys)
   */
  async getTableRelations(tableName: string): Promise<TableRelation[]> {
    try {
      const query = `
        SELECT 
          tc.table_name as source_table,
          kcu.column_name as source_column,
          ccu.table_name AS target_table,
          ccu.column_name AS target_column,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
          AND tc.table_name = $1;
      `

      const { data, error } = await supabase.rpc('get_table_relations', { 
        table_name: tableName 
      })

      if (error) {
        console.error('Error getting relations:', error)
        return []
      }

      return data || []
    } catch {
      return []
    }
  }

  /**
   * Get row count for a table
   */
  async getTableRowCount(tableName: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`Error counting rows in ${tableName}:`, error)
        return 0
      }

      return count || 0
    } catch {
      return 0
    }
  }

  /**
   * Get sample data from a table
   */
  async getTableSample(tableName: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(limit)

      if (error) {
        console.error(`Error getting sample from ${tableName}:`, error)
        return []
      }

      return data || []
    } catch {
      return []
    }
  }

  /**
   * Execute a dynamic query on any table
   */
  async queryTable(
    tableName: string,
    options: {
      select?: string
      filters?: Record<string, any>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
    } = {}
  ): Promise<{ data: any[]; error: any }> {
    try {
      let query = supabase.from(tableName).select(options.select || '*')

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([column, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(column, value)
          }
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  }

  /**
   * Search across multiple tables
   */
  async searchAcrossTables(searchTerm: string, tables?: string[]): Promise<any[]> {
    const results: any[] = []
    const tablesToSearch = tables || (await this.discoverTables()).map(t => t.table_name)

    for (const tableName of tablesToSearch) {
      const columns = await this.getTableColumns(tableName)
      const textColumns = columns
        .filter(col => ['text', 'character varying', 'varchar'].includes(col.data_type))
        .map(col => col.column_name)

      if (textColumns.length === 0) continue

      try {
        // Build a query that searches across all text columns
        let query = supabase.from(tableName).select('*')
        
        // Use OR conditions for text search
        const orConditions = textColumns.map(col => `${col}.ilike.%${searchTerm}%`).join(',')
        query = query.or(orConditions)
        
        const { data, error } = await query.limit(10)

        if (!error && data && data.length > 0) {
          results.push({
            table: tableName,
            matches: data,
            count: data.length
          })
        }
      } catch {
        // Continue with next table
      }
    }

    return results
  }

  /**
   * Get database overview statistics
   */
  async getDatabaseOverview(): Promise<any> {
    const tables = await this.discoverTables()
    const overview = {
      total_tables: tables.length,
      tables: [] as any[]
    }

    for (const table of tables) {
      const rowCount = await this.getTableRowCount(table.table_name)
      const columns = await this.getTableColumns(table.table_name)
      
      overview.tables.push({
        name: table.table_name,
        type: table.table_type,
        row_count: rowCount,
        column_count: columns.length,
        columns: columns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES'
        }))
      })
    }

    return overview
  }
}

export const databaseExplorer = new DatabaseExplorer()
export default databaseExplorer