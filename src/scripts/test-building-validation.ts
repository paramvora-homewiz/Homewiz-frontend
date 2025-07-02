/**
 * Test script to verify building form validation
 */

import { validateBuildingFormData, transformBuildingDataForBackend } from '@/lib/backend-sync'
import { validateBuildingForm } from '@/lib/form-validation'

// Test data scenarios
const testCases = [
  {
    name: 'Valid Complete Building Data',
    data: {
      building_name: 'Test Building',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      operator_id: 1,
      floors: 5,
      total_rooms: 20,
      total_bathrooms: 10,
      bathrooms_on_each_floor: 2,
      year_built: 2020,
      last_renovation: 2022,
      min_lease_term: 6,
      pref_min_lease_term: 12,
      common_kitchen: 'Shared',
      pet_friendly: 'Yes',
      cleaning_common_spaces: 'Yes',
      virtual_tour_url: 'https://example.com/tour'
    },
    expectedValid: true
  },
  {
    name: 'Missing Required Fields',
    data: {
      building_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: ''
    },
    expectedValid: false
  },
  {
    name: 'Invalid Numeric Values',
    data: {
      building_name: 'Test Building',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      operator_id: 1,
      floors: 0, // Invalid: should be >= 1
      total_rooms: -5, // Invalid: should be >= 1
      total_bathrooms: 0, // Invalid: should be >= 1
      bathrooms_on_each_floor: 0 // Invalid: should be >= 1
    },
    expectedValid: false
  },
  {
    name: 'Invalid Year Values',
    data: {
      building_name: 'Test Building',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      operator_id: 1,
      year_built: 1700, // Invalid: too old
      last_renovation: 2030 // Invalid: future date
    },
    expectedValid: false
  },
  {
    name: 'Business Logic Violations',
    data: {
      building_name: 'Test Building',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      operator_id: 1,
      year_built: 2020,
      last_renovation: 2010, // Invalid: before year built
      min_lease_term: 12,
      pref_min_lease_term: 6, // Invalid: less than min lease term
      floors: 3,
      total_bathrooms: 6,
      bathrooms_on_each_floor: 5 // Invalid: too many per floor
    },
    expectedValid: false
  },
  {
    name: 'Invalid Enum Values',
    data: {
      building_name: 'Test Building',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      operator_id: 1,
      common_kitchen: 'Invalid Option', // Invalid enum
      pet_friendly: 'Maybe', // Invalid enum
      cleaning_common_spaces: 'Sometimes' // Invalid enum
    },
    expectedValid: false
  },
  {
    name: 'Invalid URL',
    data: {
      building_name: 'Test Building',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      operator_id: 1,
      virtual_tour_url: 'not-a-valid-url' // Invalid URL
    },
    expectedValid: false
  }
]

function runValidationTests() {
  console.log('🏢 Testing Building Form Validation...\n')

  let passedTests = 0
  let totalTests = testCases.length

  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test ${index + 1}: ${testCase.name}`)
    console.log('   Data:', JSON.stringify(testCase.data, null, 2))

    try {
      // Test backend-sync validation
      const backendValidation = validateBuildingFormData(testCase.data)
      console.log(`   Backend Validation - Valid: ${backendValidation.isValid}`)
      
      if (!backendValidation.isValid) {
        console.log(`   Backend Errors:`, backendValidation.errors)
        console.log(`   Missing Required:`, backendValidation.missingRequired)
      }

      // Test form validation
      const formValidation = validateBuildingForm(testCase.data)
      console.log(`   Form Validation - Valid: ${formValidation.isValid}`)
      
      if (!formValidation.isValid) {
        console.log(`   Form Errors:`, formValidation.errors)
      }

      if (formValidation.warnings && Object.keys(formValidation.warnings).length > 0) {
        console.log(`   Form Warnings:`, formValidation.warnings)
      }

      // Check if result matches expectation
      const actualValid = backendValidation.isValid && formValidation.isValid
      if (actualValid === testCase.expectedValid) {
        console.log(`   ✅ PASS: Validation result matches expectation`)
        passedTests++
      } else {
        console.log(`   ❌ FAIL: Expected ${testCase.expectedValid}, got ${actualValid}`)
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error}`)
    }
  })

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All validation tests passed!')
  } else {
    console.log('⚠️  Some validation tests failed. Please review the results above.')
  }
}

function testDataTransformation() {
  console.log('\n🔄 Testing Data Transformation...\n')

  const sampleData = {
    building_name: 'Sample Building',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90210',
    operator_id: 2,
    floors: 3,
    total_rooms: 15,
    amenities_details: { wifi: true, parking: true },
    images: ['url1.jpg', 'url2.jpg']
  }

  try {
    const transformedData = transformBuildingDataForBackend(sampleData)
    console.log('✅ Data transformation successful:')
    console.log('   Original:', JSON.stringify(sampleData, null, 2))
    console.log('   Transformed:', JSON.stringify(transformedData, null, 2))

    // Verify key transformations
    if (transformedData.building_id && transformedData.building_id.startsWith('BLD_')) {
      console.log('✅ Building ID generated correctly')
    } else {
      console.log('❌ Building ID generation failed')
    }

    if (transformedData.street === sampleData.address) {
      console.log('✅ Address mapped to street correctly')
    } else {
      console.log('❌ Address mapping failed')
    }

  } catch (error) {
    console.log(`❌ Data transformation failed: ${error}`)
  }
}

// Run all tests
export function runBuildingFormTests() {
  runValidationTests()
  testDataTransformation()
}

// Allow running from command line
if (typeof window === 'undefined') {
  runBuildingFormTests()
}
