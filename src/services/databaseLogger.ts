/**
 * Database Logger Service
 * Tracks all database operations and provides detailed logging
 */

export interface DatabaseOperation {
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  data: any
  timestamp: string
  id?: string | number
}

export interface LogEntry {
  id: string
  timestamp: string
  operation: DatabaseOperation
  success: boolean
  error?: string
}

class DatabaseLogger {
  private logs: LogEntry[] = []
  private maxLogs = 1000 // Keep last 1000 logs

  /**
   * Log a database operation
   */
  logOperation(operation: DatabaseOperation, success: boolean, error?: string): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      operation,
      success,
      error
    }

    this.logs.unshift(logEntry) // Add to beginning

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Console logging with emojis and colors
    this.consoleLog(logEntry)

    // Trigger notifications for this operation
    this.triggerNotifications(logEntry)
  }

  /**
   * Trigger notifications based on database operations
   */
  private triggerNotifications(logEntry: LogEntry): void {
    // Import notification service dynamically to avoid circular dependencies
    import('./notificationService').then(({ notificationService }) => {
      notificationService.processDataChange({
        operation: logEntry.operation.operation,
        table: logEntry.operation.table,
        data: logEntry.operation.data,
        success: logEntry.success,
        error: logEntry.error,
        timestamp: logEntry.timestamp
      })
    }).catch(error => {
      console.error('Failed to trigger notifications:', error)
    })
  }

  /**
   * Log when data is added to the database
   */
  logDataAdded(table: string, data: any, id?: string | number): void {
    console.group(`🆕 NEW ${table.toUpperCase()} ADDED`)
    console.log('📅 Timestamp:', new Date().toLocaleString())
    console.log('🆔 ID:', id || 'Auto-generated')
    console.log('📊 Data Added:', data)
    console.groupEnd()

    this.logOperation({
      operation: 'INSERT',
      table,
      data,
      timestamp: new Date().toISOString(),
      id
    }, true)
  }

  /**
   * Log when data is updated in the database
   */
  logDataUpdated(table: string, data: any, id: string | number): void {
    console.group(`✏️ ${table.toUpperCase()} UPDATED`)
    console.log('📅 Timestamp:', new Date().toLocaleString())
    console.log('🆔 ID:', id)
    console.log('📊 Updated Data:', data)
    console.groupEnd()

    this.logOperation({
      operation: 'UPDATE',
      table,
      data,
      timestamp: new Date().toISOString(),
      id
    }, true)
  }

  /**
   * Log when data is deleted from the database
   */
  logDataDeleted(table: string, id: string | number): void {
    console.group(`🗑️ ${table.toUpperCase()} DELETED`)
    console.log('📅 Timestamp:', new Date().toLocaleString())
    console.log('🆔 ID:', id)
    console.groupEnd()

    this.logOperation({
      operation: 'DELETE',
      table,
      data: { id },
      timestamp: new Date().toISOString(),
      id
    }, true)
  }

  /**
   * Log database operation errors
   */
  logError(operation: DatabaseOperation, error: string): void {
    console.group(`❌ DATABASE ERROR`)
    console.log('📅 Timestamp:', new Date().toLocaleString())
    console.log('🔧 Operation:', operation.operation)
    console.log('📋 Table:', operation.table)
    console.log('💥 Error:', error)
    console.log('📊 Data:', operation.data)
    console.groupEnd()

    this.logOperation(operation, false, error)
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Get logs for a specific table
   */
  getLogsForTable(table: string): LogEntry[] {
    return this.logs.filter(log => log.operation.table === table)
  }

  /**
   * Get recent logs (last N entries)
   */
  getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(0, count)
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
    console.log('🧹 Database logs cleared')
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Get summary statistics
   */
  getStats(): {
    total: number
    byOperation: Record<string, number>
    byTable: Record<string, number>
    successRate: number
  } {
    const stats = {
      total: this.logs.length,
      byOperation: {} as Record<string, number>,
      byTable: {} as Record<string, number>,
      successRate: 0
    }

    let successCount = 0

    this.logs.forEach(log => {
      // Count by operation
      const op = log.operation.operation
      stats.byOperation[op] = (stats.byOperation[op] || 0) + 1

      // Count by table
      const table = log.operation.table
      stats.byTable[table] = (stats.byTable[table] || 0) + 1

      // Count successes
      if (log.success) successCount++
    })

    stats.successRate = this.logs.length > 0 ? (successCount / this.logs.length) * 100 : 0

    return stats
  }

  /**
   * Console log with formatting
   */
  private consoleLog(logEntry: LogEntry): void {
    const { operation, success, error } = logEntry
    const emoji = success ? '✅' : '❌'
    const opEmoji = {
      INSERT: '🆕',
      UPDATE: '✏️',
      DELETE: '🗑️'
    }[operation.operation]

    console.log(
      `${emoji} ${opEmoji} ${operation.operation} ${operation.table}`,
      success ? 'SUCCESS' : `FAILED: ${error}`
    )
  }

  /**
   * Generate unique ID for log entries
   */
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Create singleton instance
export const databaseLogger = new DatabaseLogger()

// Export convenience functions
export const logDataAdded = (table: string, data: any, id?: string | number) => 
  databaseLogger.logDataAdded(table, data, id)

export const logDataUpdated = (table: string, data: any, id: string | number) => 
  databaseLogger.logDataUpdated(table, data, id)

export const logDataDeleted = (table: string, id: string | number) => 
  databaseLogger.logDataDeleted(table, id)

export const logDatabaseError = (operation: DatabaseOperation, error: string) => 
  databaseLogger.logError(operation, error)

export default databaseLogger
