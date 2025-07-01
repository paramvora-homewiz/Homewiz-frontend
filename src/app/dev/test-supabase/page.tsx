'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'

export default function TestSupabase() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    try {
      setLoading(true)
      const results: any = {}

      // Test 1: Check if we can connect
      const { data: testData, error: testError } = await supabaseClient.client
        .from('buildings')
        .select('count')
        .single()
      
      if (testError) {
        console.error('Connection test error:', testError)
        results.connectionTest = { error: testError.message }
      } else {
        results.connectionTest = { success: true }
      }

      // Test 2: Try to get buildings
      const { data: buildings, error: buildingsError, count: buildingsCount } = await supabaseClient.client
        .from('buildings')
        .select('*', { count: 'exact' })
      
      results.buildings = {
        data: buildings,
        count: buildingsCount,
        error: buildingsError?.message
      }

      // Test 3: Try to get rooms
      const { data: rooms, error: roomsError, count: roomsCount } = await supabaseClient.client
        .from('rooms')
        .select('*', { count: 'exact' })
      
      results.rooms = {
        data: rooms,
        count: roomsCount,
        error: roomsError?.message
      }

      // Test 4: Try to get tenants
      const { data: tenants, error: tenantsError, count: tenantsCount } = await supabaseClient.client
        .from('tenants')
        .select('*', { count: 'exact' })
      
      results.tenants = {
        data: tenants,
        count: tenantsCount,
        error: tenantsError?.message
      }

      // Test 5: Try to get operators
      const { data: operators, error: operatorsError, count: operatorsCount } = await supabaseClient.client
        .from('operators')
        .select('*', { count: 'exact' })
      
      results.operators = {
        data: operators,
        count: operatorsCount,
        error: operatorsError?.message
      }

      // Test 6: Check RLS policies
      const { data: rlsEnabled } = await supabaseClient.client
        .rpc('check_rls_enabled', {})
        .single()
      
      results.rlsEnabled = rlsEnabled

      setResults(results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const disableRLS = async (tableName: string) => {
    alert(`To disable RLS for ${tableName}:
    
1. Go to: https://supabase.com/dashboard/project/ushsurulbffbbqkyfynd/editor
2. Run this SQL command:
   ALTER TABLE ${tableName} DISABLE ROW LEVEL SECURITY;
3. Or create a policy:
   CREATE POLICY "Enable read access for all users" ON "${tableName}"
   FOR SELECT USING (true);`)
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-6">
        {Object.entries(results).map(([key, value]: [string, any]) => (
          <div key={key} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">{key}</h2>
            
            {value.error ? (
              <div>
                <p className="text-red-500">Error: {value.error}</p>
                {value.error.includes('row-level security') && (
                  <button
                    onClick={() => disableRLS(key)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    How to Fix RLS
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p className="text-green-500">✓ Success</p>
                {value.count !== undefined && (
                  <p>Count: {value.count}</p>
                )}
                {value.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-500">View Data</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                      {JSON.stringify(value.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Fix for RLS Issues:</h3>
        <p className="mb-2">Run these SQL commands in Supabase SQL Editor:</p>
        <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
{`-- Disable RLS for all tables (for development only!)
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Or create permissive policies
CREATE POLICY "Enable read access for all users" ON "buildings"
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "rooms"
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "tenants"
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "operators"
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "leads"
FOR SELECT USING (true);`}
        </pre>
        <a 
          href="https://supabase.com/dashboard/project/ushsurulbffbbqkyfynd/sql/new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Open SQL Editor →
        </a>
      </div>
    </div>
  )
}