'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SimplifiedMediaGallery from '@/components/media/SimplifiedMediaGallery'
import { 
  extractCategoryFromUrl, 
  groupImagesByCategory, 
  getCategoryDisplayName,
  getFeaturedImageUrl 
} from '@/lib/supabase/url-category-utils'

export default function TestMediaGallery() {
  const [buildingId, setBuildingId] = useState('BLD_1751400686950_8a7r84h4m')
  const [testUrls] = useState([
    'https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/BLD_1751400686950_8a7r84h4m/outside/1751401002723_spacejoy-YqFz7UMm8qE-unsplash.jpg',
    'https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/BLD_1751400686950_8a7r84h4m/amenities/1751401003578_spacejoy-nEtpvJjnPVo-unsplash.jpg',
    'https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/BLD_1751400686950_8a7r84h4m/kitchen_bathrooms/1751401004434_minh-pham-7pCFUybP_P8-unsplash.jpg'
  ])

  const testUrlParsing = () => {
    console.log('🧪 Testing URL parsing:')
    testUrls.forEach(url => {
      const category = extractCategoryFromUrl(url)
      console.log(`📄 ${url}`)
      console.log(`📁 Category: ${category} (${getCategoryDisplayName(category)})`)
      console.log('---')
    })

    const grouped = groupImagesByCategory(testUrls)
    console.log('📊 Grouped by category:', grouped)

    const featured = getFeaturedImageUrl(testUrls)
    console.log('⭐ Featured image:', featured)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Media Gallery</h1>
          <p className="text-gray-600 mt-2">
            Test the simplified URL-based categorization system
          </p>
        </div>

        {/* URL Parsing Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">URL Parsing Test</h2>
          <Button onClick={testUrlParsing} className="mb-4">
            Test URL Parsing (Check Console)
          </Button>
          
          <div className="space-y-2">
            <h3 className="font-medium">Test URLs:</h3>
            {testUrls.map((url, index) => (
              <div key={index} className="text-sm bg-gray-100 p-2 rounded">
                <div className="font-mono text-xs truncate">{url}</div>
                <div className="text-gray-600">
                  Category: {getCategoryDisplayName(extractCategoryFromUrl(url))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Building ID Input */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Building Media Gallery</h2>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Enter Building ID"
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline">
              Load Media
            </Button>
          </div>
        </Card>

        {/* Media Gallery */}
        {buildingId && (
          <SimplifiedMediaGallery
            buildingId={buildingId}
            showCategories={true}
            showVideos={true}
            allowDelete={true}
            maxImagesPerCategory={20}
          />
        )}

        {/* Success Message */}
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Simplified Approach Working!
          </h3>
          <div className="text-green-700 space-y-2">
            <p>
              <strong>✅ Images uploaded to categorized folders</strong> (as seen in your logs)
            </p>
            <p>
              <strong>✅ URLs stored in existing building_images column</strong> (no schema changes needed)
            </p>
            <p>
              <strong>✅ Categories extracted from URL paths</strong> (e.g., /amenities/, /outside/)
            </p>
            <p>
              <strong>✅ Simple, maintainable, and AI-friendly</strong>
            </p>
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">1. File Upload Structure</h4>
              <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                buildings/&#123;building_id&#125;/&#123;category&#125;/&#123;timestamp&#125;_&#123;filename&#125;
              </div>
            </div>
            
            <div>
              <h4 className="font-medium">2. Database Storage</h4>
              <div className="text-sm text-gray-600">
                Only the <code>building_images</code> array is updated with URLs - no new columns needed!
              </div>
            </div>
            
            <div>
              <h4 className="font-medium">3. Category Extraction</h4>
              <div className="text-sm text-gray-600">
                Categories are parsed from URL paths in real-time when displaying images
              </div>
            </div>
            
            <div>
              <h4 className="font-medium">4. Benefits</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>No database schema changes required</li>
                <li>Works with existing infrastructure</li>
                <li>Self-documenting via folder structure</li>
                <li>Perfect for AI agent consumption</li>
                <li>Easy to maintain and debug</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}