/**
 * Data Export Service
 * Handles exporting data in various formats (CSV, JSON, PDF)
 */

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  filename?: string
  includeHeaders?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: Record<string, any>
}

export interface ExportData {
  operators?: any[]
  buildings?: any[]
  rooms?: any[]
  leads?: any[]
  tenants?: any[]
  logs?: any[]
}

class DataExportService {
  /**
   * Export data in the specified format
   */
  async exportData(data: ExportData, options: ExportOptions): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = options.filename || `homewiz-export-${timestamp}`

    switch (options.format) {
      case 'csv':
        await this.exportToCSV(data, filename, options)
        break
      case 'json':
        await this.exportToJSON(data, filename, options)
        break
      case 'pdf':
        await this.exportToPDF(data, filename, options)
        break
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }

    // Data exported successfully
  }

  /**
   * Export to CSV format
   */
  private async exportToCSV(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    const csvContent: string[] = []

    // Export each data type to separate CSV sections
    Object.entries(data).forEach(([dataType, items]) => {
      if (!items || items.length === 0) return

      csvContent.push(`\n# ${dataType.toUpperCase()}`)
      
      // Get headers from first item
      const headers = Object.keys(items[0])
      if (options.includeHeaders !== false) {
        csvContent.push(headers.join(','))
      }

      // Add data rows
      items.forEach(item => {
        const row = headers.map(header => {
          const value = item[header]
          // Handle special characters and commas in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value ?? ''
        })
        csvContent.push(row.join(','))
      })
    })

    this.downloadFile(csvContent.join('\n'), `${filename}.csv`, 'text/csv')
  }

  /**
   * Export to JSON format
   */
  private async exportToJSON(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    const exportObject = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        format: 'json',
        filters: options.filters || {},
        dateRange: options.dateRange || null
      },
      data: data,
      summary: {
        operators: data.operators?.length || 0,
        buildings: data.buildings?.length || 0,
        rooms: data.rooms?.length || 0,
        leads: data.leads?.length || 0,
        tenants: data.tenants?.length || 0,
        logs: data.logs?.length || 0
      }
    }

    const jsonContent = JSON.stringify(exportObject, null, 2)
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json')
  }

  /**
   * Export to PDF format (simplified version)
   */
  private async exportToPDF(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    // For a full PDF implementation, you would use a library like jsPDF
    // For now, we'll create a simple HTML report that can be printed to PDF
    
    const htmlContent = this.generateHTMLReport(data, options)
    
    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } else {
      // Fallback: download as HTML file
      this.downloadFile(htmlContent, `${filename}.html`, 'text/html')
    }
  }

  /**
   * Generate HTML report for PDF export
   */
  private generateHTMLReport(data: ExportData, options: ExportOptions): string {
    const timestamp = new Date().toLocaleString()
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>HomeWiz Data Export Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8f9fa; }
          .summary { background-color: #e9ecef; padding: 15px; border-radius: 5px; }
          .no-data { color: #666; font-style: italic; }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HomeWiz Data Export Report</h1>
          <p>Generated on: ${timestamp}</p>
        </div>
    `

    // Summary section
    const summary = {
      operators: data.operators?.length || 0,
      buildings: data.buildings?.length || 0,
      rooms: data.rooms?.length || 0,
      leads: data.leads?.length || 0,
      tenants: data.tenants?.length || 0,
      logs: data.logs?.length || 0
    }

    html += `
      <div class="section">
        <h2>Summary</h2>
        <div class="summary">
          <p><strong>Operators:</strong> ${summary.operators}</p>
          <p><strong>Buildings:</strong> ${summary.buildings}</p>
          <p><strong>Rooms:</strong> ${summary.rooms}</p>
          <p><strong>Leads:</strong> ${summary.leads}</p>
          <p><strong>Tenants:</strong> ${summary.tenants}</p>
          <p><strong>Logs:</strong> ${summary.logs}</p>
        </div>
      </div>
    `

    // Data sections
    Object.entries(data).forEach(([dataType, items]) => {
      if (!items || items.length === 0) {
        html += `
          <div class="section">
            <h2>${dataType.charAt(0).toUpperCase() + dataType.slice(1)}</h2>
            <p class="no-data">No data available</p>
          </div>
        `
        return
      }

      html += `
        <div class="section">
          <h2>${dataType.charAt(0).toUpperCase() + dataType.slice(1)} (${items.length} records)</h2>
          <table>
            <thead>
              <tr>
      `

      // Table headers
      const headers = Object.keys(items[0])
      headers.forEach(header => {
        html += `<th>${header.replace(/_/g, ' ').toUpperCase()}</th>`
      })

      html += `
              </tr>
            </thead>
            <tbody>
      `

      // Table rows
      items.slice(0, 50).forEach(item => { // Limit to 50 rows for PDF
        html += '<tr>'
        headers.forEach(header => {
          const value = item[header]
          html += `<td>${this.formatCellValue(value)}</td>`
        })
        html += '</tr>'
      })

      if (items.length > 50) {
        html += `<tr><td colspan="${headers.length}" style="text-align: center; font-style: italic;">... and ${items.length - 50} more records</td></tr>`
      }

      html += `
            </tbody>
          </table>
        </div>
      `
    })

    html += `
      </body>
      </html>
    `

    return html
  }

  /**
   * Format cell value for display
   */
  private formatCellValue(value: any): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 47) + '...'
    }
    return String(value)
  }

  /**
   * Download file to user's computer
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Export specific data type
   */
  async exportDataType(dataType: keyof ExportData, items: any[], options: ExportOptions): Promise<void> {
    const data: ExportData = {
      [dataType]: items
    }
    await this.exportData(data, options)
  }

  /**
   * Export filtered data
   */
  async exportFilteredData(
    allData: ExportData, 
    filters: Record<string, any>, 
    options: ExportOptions
  ): Promise<void> {
    const filteredData: ExportData = {}

    Object.entries(allData).forEach(([dataType, items]) => {
      if (!items) return

      let filtered = items
      
      // Apply filters
      Object.entries(filters).forEach(([filterKey, filterValue]) => {
        if (filterValue && filterValue !== 'all') {
          filtered = filtered.filter(item => {
            if (filterKey === 'status') {
              return item.status === filterValue
            }
            if (filterKey === 'dateRange' && filterValue.start && filterValue.end) {
              const itemDate = new Date(item.created_at || item.date_joined || item.timestamp)
              return itemDate >= filterValue.start && itemDate <= filterValue.end
            }
            return true
          })
        }
      })

      if (filtered.length > 0) {
        filteredData[dataType as keyof ExportData] = filtered
      }
    })

    await this.exportData(filteredData, { ...options, filters })
  }

  /**
   * Get export statistics
   */
  getExportStats(data: ExportData): Record<string, number> {
    return {
      totalRecords: Object.values(data).reduce((sum, items) => sum + (items?.length || 0), 0),
      operators: data.operators?.length || 0,
      buildings: data.buildings?.length || 0,
      rooms: data.rooms?.length || 0,
      leads: data.leads?.length || 0,
      tenants: data.tenants?.length || 0,
      logs: data.logs?.length || 0
    }
  }
}

// Create singleton instance
export const dataExportService = new DataExportService()

// Export convenience functions
export const exportToCSV = (data: ExportData, filename?: string) =>
  dataExportService.exportData(data, { format: 'csv', filename })

export const exportToJSON = (data: ExportData, filename?: string) =>
  dataExportService.exportData(data, { format: 'json', filename })

export const exportToPDF = (data: ExportData, filename?: string) =>
  dataExportService.exportData(data, { format: 'pdf', filename })

export default dataExportService

// Additional utility functions for React components
export const createExportButton = (
  data: ExportData,
  format: 'csv' | 'json' | 'pdf',
  filename?: string
) => {
  return () => dataExportService.exportData(data, { format, filename })
}
