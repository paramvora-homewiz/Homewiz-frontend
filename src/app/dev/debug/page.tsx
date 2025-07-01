'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DebugPage() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testDirectly()
  }, [])

  const testDirectly = async () => {
    try {
      // Direct Supabase connection
      const supabase = createClient(
        'https://ushsurulbffbbqkyfynd.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHN1cnVsYmZmYmJxa3lmeW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzE2MDMsImV4cCI6MjA2NTgwNzYwM30.ITybGpihJbJHppQIbq2O3CF6VSJwoH8-KsuA2hhsi4s'
      )

      // Test buildings
      const { data: buildings, error: buildingsError, count: buildingsCount } = await supabase
        .from('buildings')
        .select('*', { count: 'exact' })

      console.log('Buildings result:', { buildings, buildingsError, buildingsCount })

      // Test rooms
      const { data: rooms, error: roomsError, count: roomsCount } = await supabase
        .from('rooms')
        .select('*', { count: 'exact' })

      console.log('Rooms result:', { rooms, roomsError, roomsCount })

      // Test operators
      const { data: operators, error: operatorsError, count: operatorsCount } = await supabase
        .from('operators')
        .select('*', { count: 'exact' })

      console.log('Operators result:', { operators, operatorsError, operatorsCount })

      setData({
        buildings: { data: buildings, error: buildingsError?.message, count: buildingsCount },
        rooms: { data: rooms, error: roomsError?.message, count: roomsCount },
        operators: { data: operators, error: operatorsError?.message, count: operatorsCount }
      })
    } catch (err: any) {
      console.error('Test error:', err)
      setData({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Supabase Debug Test</h1>
      
      <h2>Results:</h2>
      <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>

      <h2>Check RLS in Supabase Dashboard:</h2>
      <p>
        <a href="https://supabase.com/dashboard/project/ushsurulbffbbqkyfynd/editor" target="_blank">
          Open SQL Editor
        </a>
      </p>
      
      <h3>Run these SQL commands to fix RLS:</h3>
      <pre style={{ background: '#f9f9f9', padding: '10px' }}>
{`-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('buildings', 'rooms', 'operators', 'tenants', 'leads');

-- Disable RLS for all tables (development only)
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;`}
      </pre>
    </div>
  )
}