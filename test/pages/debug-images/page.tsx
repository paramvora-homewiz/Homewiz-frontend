'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function DebugImagesPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase
        .from('rooms')
        .select('room_id, room_number, room_images, buildings(building_images)')
        .not('room_images', 'is', null)
        .limit(5)
      
      if (error) {
        console.error('Error:', error)
      } else {
        console.log('Raw data:', data)
        setRooms(data || [])
      }
      setLoading(false)
    }
    
    fetchRooms()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Room Images</h1>
      
      {rooms.map((room) => (
        <div key={room.room_id} className="mb-8 p-4 border rounded">
          <h2 className="font-bold mb-2">Room {room.room_number}</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold">Raw room_images value:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(room.room_images, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold">Parsed images:</h3>
            {(() => {
              let images: string[] = []
              try {
                if (typeof room.room_images === 'string') {
                  if (room.room_images.startsWith('[')) {
                    images = JSON.parse(room.room_images)
                  } else if (room.room_images.includes(',')) {
                    images = room.room_images.split(',').map(img => img.trim())
                  } else {
                    images = [room.room_images]
                  }
                } else if (Array.isArray(room.room_images)) {
                  images = room.room_images
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
              
              return (
                <ul className="list-disc list-inside">
                  {images.map((img, idx) => (
                    <li key={idx} className="text-sm">
                      <a href={img} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {img}
                      </a>
                      <img 
                        src={img} 
                        alt={`Test ${idx}`}
                        className="mt-2 w-32 h-32 object-cover border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          console.error(`Failed to load: ${img}`)
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )
            })()}
          </div>
          
          {room.buildings?.building_images && (
            <div>
              <h3 className="font-semibold">Building images (fallback):</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(room.buildings.building_images, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}