/**
 * Test Suite for API Client
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ApiClient, ApiError, ApiErrorType } from '../api-client'

// Mock config
vi.mock('../config', () => ({
  default: {
    api: {
      baseUrl: 'http://localhost:8000/api',
      timeout: 5000,
    },
    app: {
      version: '1.0.0',
      demoMode: false,
    },
    environment: 'test',
  },
}))

// Mock data collection
vi.mock('../data-collection', () => ({
  collectApiCall: vi.fn(),
  collectError: vi.fn(),
}))

describe('ApiClient', () => {
  let apiClient: ApiClient
  let fetchSpy: any

  beforeEach(() => {
    apiClient = ApiClient.getInstance()
    apiClient.clearCache()
    fetchSpy = vi.spyOn(global, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
    vi.clearAllMocks()
  })

  describe('Request Handling', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' }
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const result = await apiClient.get('/test')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(result.statusCode).toBe(200)
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Client-Version': '1.0.0',
            'X-Environment': 'test',
          }),
        })
      )
    })

    it('should make successful POST request', async () => {
      const mockResponse = { id: '123' }
      const requestData = { name: 'test' }
      
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const result = await apiClient.post('/test', requestData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(result.statusCode).toBe(201)
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
        })
      )
    })

    it('should handle 404 errors', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Not found' }), {
          status: 404,
        })
      )

      await expect(apiClient.get('/nonexistent')).rejects.toThrow(ApiError)
      
      try {
        await apiClient.get('/nonexistent')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).type).toBe(ApiErrorType.VALIDATION_ERROR)
        expect((error as ApiError).statusCode).toBe(404)
      }
    })

    it('should handle 500 errors', async () => {
      fetchSpy.mockResolvedValue(
        new Response('Internal Server Error', { status: 500 })
      )

      await expect(apiClient.get('/error')).rejects.toThrow(ApiError)
      
      try {
        await apiClient.get('/error')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).type).toBe(ApiErrorType.SERVER_ERROR)
        expect((error as ApiError).statusCode).toBe(500)
      }
    })

    it('should handle network errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      await expect(apiClient.get('/test')).rejects.toThrow('Network error')
    })

    it('should handle timeout', async () => {
      fetchSpy.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      )

      await expect(
        apiClient.request({
          method: 'GET',
          endpoint: '/slow',
          timeout: 100,
        })
      ).rejects.toThrow()
    })
  })

  describe('Retry Logic', () => {
    it('should retry on server errors', async () => {
      fetchSpy
        .mockResolvedValueOnce(new Response('', { status: 500 }))
        .mockResolvedValueOnce(new Response('', { status: 500 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: 'success' }), { status: 200 })
        )

      const result = await apiClient.request({
        method: 'GET',
        endpoint: '/test',
        retries: 3,
      })

      expect(result.success).toBe(true)
      expect(fetchSpy).toHaveBeenCalledTimes(3)
    })

    it('should not retry on client errors', async () => {
      fetchSpy.mockResolvedValue(new Response('', { status: 400 }))

      await expect(
        apiClient.request({
          method: 'GET',
          endpoint: '/test',
          retries: 3,
        })
      ).rejects.toThrow(ApiError)

      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    it('should fail after max retries', async () => {
      fetchSpy.mockResolvedValue(new Response('', { status: 500 }))

      await expect(
        apiClient.request({
          method: 'GET',
          endpoint: '/test',
          retries: 2,
        })
      ).rejects.toThrow(ApiError)

      expect(fetchSpy).toHaveBeenCalledTimes(3) // initial + 2 retries
    })
  })

  describe('Caching', () => {
    it('should cache GET requests when enabled', async () => {
      const mockResponse = { data: 'cached' }
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      )

      // First request
      const result1 = await apiClient.request({
        method: 'GET',
        endpoint: '/test',
        cache: true,
      })

      // Second request (should use cache)
      const result2 = await apiClient.request({
        method: 'GET',
        endpoint: '/test',
        cache: true,
      })

      expect(result1.data).toEqual(mockResponse)
      expect(result2.data).toEqual(mockResponse)
      expect(result2.message).toBe('Retrieved from cache')
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    it('should not cache POST requests', async () => {
      const mockResponse = { data: 'not cached' }
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      )

      await apiClient.request({
        method: 'POST',
        endpoint: '/test',
        cache: true,
        data: { test: 'data' },
      })

      await apiClient.request({
        method: 'POST',
        endpoint: '/test',
        cache: true,
        data: { test: 'data' },
      })

      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('should respect cache TTL', async () => {
      const mockResponse = { data: 'expired' }
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      )

      // First request
      await apiClient.request({
        method: 'GET',
        endpoint: '/test',
        cache: true,
        cacheTtl: 100, // 100ms TTL
      })

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Second request (should not use cache)
      await apiClient.request({
        method: 'GET',
        endpoint: '/test',
        cache: true,
        cacheTtl: 100,
      })

      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Authentication', () => {
    it('should add auth token to requests', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 })
      )

      apiClient.setAuthToken('test-token')
      await apiClient.get('/protected')

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )
    })

    it('should remove auth token', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 })
      )

      apiClient.setAuthToken('test-token')
      apiClient.removeAuthToken()
      await apiClient.get('/public')

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/public',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      )
    })
  })

  describe('Request Deduplication', () => {
    it('should deduplicate identical requests', async () => {
      const mockResponse = { data: 'deduplicated' }
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      )

      // Make two identical requests simultaneously
      const [result1, result2] = await Promise.all([
        apiClient.get('/test'),
        apiClient.get('/test'),
      ])

      expect(result1.data).toEqual(mockResponse)
      expect(result2.data).toEqual(mockResponse)
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Response Parsing', () => {
    it('should parse JSON responses', async () => {
      const mockData = { message: 'json response' }
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const result = await apiClient.get('/json')
      expect(result.data).toEqual(mockData)
    })

    it('should parse text responses', async () => {
      const mockText = 'plain text response'
      fetchSpy.mockResolvedValue(
        new Response(mockText, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        })
      )

      const result = await apiClient.get('/text')
      expect(result.data).toBe(mockText)
    })

    it('should handle blob responses', async () => {
      const mockBlob = new Blob(['binary data'])
      fetchSpy.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
          headers: { 'Content-Type': 'application/octet-stream' },
        })
      )

      const result = await apiClient.get('/binary')
      expect(result.data).toBeInstanceOf(Blob)
    })
  })

  describe('Cache Management', () => {
    it('should provide cache statistics', () => {
      const stats = apiClient.getCacheStats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('keys')
      expect(Array.isArray(stats.keys)).toBe(true)
    })

    it('should clear cache', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 })
      )

      // Add something to cache
      await apiClient.request({
        method: 'GET',
        endpoint: '/test',
        cache: true,
      })

      let stats = apiClient.getCacheStats()
      expect(stats.size).toBeGreaterThan(0)

      apiClient.clearCache()
      stats = apiClient.getCacheStats()
      expect(stats.size).toBe(0)
    })
  })
})
