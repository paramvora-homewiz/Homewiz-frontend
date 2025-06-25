/**
 * Utility Functions for HomeWiz Frontend
 *
 * This module provides common utility functions used throughout the application
 * for styling, formatting, validation, and general purpose operations.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS classes with clsx
 * Handles conditional classes and removes conflicts
 *
 * @param inputs - Class values to combine (strings, objects, arrays)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': isActive })
 * cn('px-4', 'px-6') // Returns 'px-6' (later class wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date into a human-readable string
 *
 * @param date - Date object or ISO string to format
 * @returns Formatted date string (e.g., "January 15, 2024")
 *
 * @example
 * formatDate(new Date()) // "December 25, 2024"
 * formatDate("2024-01-15") // "January 15, 2024"
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formats a number as USD currency
 *
 * @param amount - Numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 *
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1000) // "$1,000.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Generates a random alphanumeric ID
 *
 * @returns Random 9-character string
 *
 * @example
 * generateId() // "k2j8h3m9p"
 *
 * @note This is not cryptographically secure. Use crypto.randomUUID() for secure IDs.
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Creates a debounced version of a function
 * Delays execution until after the specified wait time has elapsed since the last call
 *
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query: string) => search(query), 300)
 * debouncedSearch('hello') // Will only execute after 300ms of no new calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Validates an email address format
 *
 * @param email - Email string to validate
 * @returns True if email format is valid
 *
 * @example
 * validateEmail('user@example.com') // true
 * validateEmail('invalid-email') // false
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates a phone number format
 * Accepts various formats including international numbers
 *
 * @param phone - Phone number string to validate
 * @returns True if phone format is valid
 *
 * @example
 * validatePhone('(555) 123-4567') // true
 * validatePhone('+1-555-123-4567') // true
 * validatePhone('invalid') // false
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Compresses an image file by resizing and reducing quality
 * Maintains aspect ratio while ensuring maximum dimensions
 *
 * @param file - Image file to compress
 * @param quality - Compression quality (0-1, default: 0.8)
 * @returns Promise resolving to compressed File
 *
 * @example
 * const compressedFile = await compressImage(imageFile, 0.7)
 *
 * @note Maximum dimensions: 1920x1080 pixels
 * @note Only works in browser environment (uses Canvas API)
 */
export function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Define maximum dimensions for compression
      const maxWidth = 1920
      const maxHeight = 1080
      let { width, height } = img

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions and draw resized image
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      // Convert canvas to compressed blob
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        },
        file.type,
        quality
      )
    }

    // Load image from file
    img.src = URL.createObjectURL(file)
  })
}
