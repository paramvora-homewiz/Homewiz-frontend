/**
 * Test Setup Configuration for Vitest
 * 
 * This file configures the global test environment for the Homewiz frontend application.
 * It sets up necessary mocks, polyfills, and global configurations required for testing.
 * 
 * @fileoverview Global test setup for Vitest testing framework
 * @author Homewiz Development Team
 * @version 1.0.0
 */

import { vi } from 'vitest'

// Mock global fetch for API testing
global.fetch = vi.fn()

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver for component visibility tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver for responsive component tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock localStorage for client-side storage tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage for session-based storage tests
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock URL.createObjectURL for file upload tests
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock File and FileReader for file handling tests
global.File = class MockFile {
  constructor(bits: any[], name: string, options?: any) {
    this.name = name
    this.size = bits.reduce((acc, bit) => acc + (bit.length || 0), 0)
    this.type = options?.type || ''
  }
  name: string
  size: number
  type: string
}

global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null
  error: any = null
  readyState: number = 0
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onabort: ((event: any) => void) | null = null
  
  readAsDataURL(file: any) {
    this.readyState = 2
    this.result = 'data:text/plain;base64,dGVzdA=='
    if (this.onload) {
      this.onload({ target: this })
    }
  }
  
  readAsText(file: any) {
    this.readyState = 2
    this.result = 'test content'
    if (this.onload) {
      this.onload({ target: this })
    }
  }
  
  abort() {
    this.readyState = 2
    if (this.onabort) {
      this.onabort({ target: this })
    }
  }
}

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
  
  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
})

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks()
})

// Suppress console errors and warnings during tests unless explicitly needed
console.error = vi.fn()
console.warn = vi.fn()

// Restore console methods after all tests
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})
