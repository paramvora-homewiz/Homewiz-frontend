'use client'

import { useState } from 'react'
import SimpleRoomForm from '@/components/forms/SimpleRoomForm'

export default function TestSimpleFormPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      console.log('Form submitted:', data)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Form submitted successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Error submitting form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    console.log('Form cancelled')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Test Simple Room Form</h1>
        <SimpleRoomForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
