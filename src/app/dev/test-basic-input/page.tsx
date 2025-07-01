'use client'

import { useState } from 'react'

export default function TestBasicInputPage() {
  const [value1, setValue1] = useState('')
  const [value2, setValue2] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Basic Input Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Native HTML Input
            </label>
            <input
              type="text"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              placeholder="Type here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Value: {value1}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Another Native Input
            </label>
            <input
              type="text"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              placeholder="Type here too..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Value: {value2}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Test Instructions:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Click in the first input field</li>
              <li>Start typing - does the focus stay in the input?</li>
              <li>Does the page reload or refresh?</li>
              <li>Try typing multiple characters quickly</li>
              <li>Switch between the two inputs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
