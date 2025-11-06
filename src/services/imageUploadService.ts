/**
 * Image Upload Service - Compatibility Layer
 * 
 * This service has been consolidated into utils/fileUpload.ts for better organization.
 * This file now serves as a proxy for backward compatibility.
 * 
 * @deprecated Use utils/fileUpload.ts for new development
 */

// Re-export everything from the unified file upload utilities
export * from '../utils/fileUpload'

// Migration notice
console.warn(
  'Notice: imageUploadService has been migrated to utils/fileUpload.ts. Please update your imports for better organization.'
)