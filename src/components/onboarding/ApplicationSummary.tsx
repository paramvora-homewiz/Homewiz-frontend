'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Briefcase, 
  Home, 
  Building, 
  FileText, 
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

interface ApplicationSummaryProps {
  formData: any
  uploadedFiles: any[]
  onEdit: (step: number) => void
}

export function ApplicationSummary({ formData, uploadedFiles, onEdit }: ApplicationSummaryProps) {
  const getCompletionStatus = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'occupation',
      'budget_min', 'budget_max', 'preferred_move_in_date', 'preferred_lease_term'
    ]
    
    const completedRequired = requiredFields.filter(field => formData[field]).length
    const totalRequired = requiredFields.length
    
    const hasPropertySelection = formData.selected_room_id && formData.selected_building_id
    const hasDocuments = uploadedFiles.length > 0
    
    return {
      requiredComplete: completedRequired === totalRequired,
      requiredProgress: Math.round((completedRequired / totalRequired) * 100),
      hasPropertySelection,
      hasDocuments,
      readyForSubmission: completedRequired === totalRequired && hasPropertySelection
    }
  }

  const status = getCompletionStatus()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: -5 }}
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            status.readyForSubmission 
              ? 'bg-gradient-to-r from-green-600 to-blue-600' 
              : 'bg-gradient-to-r from-orange-600 to-red-600'
          }`}
        >
          {status.readyForSubmission ? (
            <CheckCircle className="h-8 w-8 text-white" />
          ) : (
            <Clock className="h-8 w-8 text-white" />
          )}
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {status.readyForSubmission ? 'Ready to Submit!' : 'Almost There!'}
        </h3>
        <p className="text-gray-600">
          {status.readyForSubmission 
            ? 'Your application is complete and ready for submission.'
            : 'Complete the remaining sections to submit your application.'
          }
        </p>
      </motion.div>

      {/* Application Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Required Information</span>
            <Badge variant={status.requiredComplete ? "default" : "secondary"}>
              {status.requiredProgress}% Complete
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Property Selection</span>
            <Badge variant={status.hasPropertySelection ? "default" : "secondary"}>
              {status.hasPropertySelection ? 'Complete' : 'Pending'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Documents</span>
            <Badge variant={status.hasDocuments ? "default" : "outline"}>
              {uploadedFiles.length} uploaded
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(0)}>
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-sm">{formData.firstName} {formData.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {formData.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {formData.phone}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nationality</p>
              <p className="text-sm">{formData.nationality || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
              Professional Information
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Occupation</p>
              <p className="text-sm">{formData.occupation}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Company</p>
              <p className="text-sm">{formData.company || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Annual Income</p>
              <p className="text-sm">
                {formData.annual_income ? formatCurrency(formData.annual_income) : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Visa Status</p>
              <p className="text-sm">{formData.visa_status || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Housing Preferences Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Home className="h-5 w-5 mr-2 text-green-600" />
              Housing Preferences
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Budget Range</p>
              <p className="text-sm flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                {formatCurrency(formData.budget_min)} - {formatCurrency(formData.budget_max)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Move-in Date</p>
              <p className="text-sm flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(formData.preferred_move_in_date)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Lease Term</p>
              <p className="text-sm">{formData.preferred_lease_term} months</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Room Type</p>
              <p className="text-sm">{formData.room_type || 'No preference'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Selection Summary */}
      {status.hasPropertySelection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-orange-600" />
                Selected Property
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Room</p>
                <p className="text-sm">Room {formData.room_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Building</p>
                <p className="text-sm flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {formData.selected_building_id}
                </p>
              </div>
              {formData.deposit_amount && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Security Deposit</p>
                  <p className="text-sm">{formatCurrency(formData.deposit_amount)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Documents ({uploadedFiles.length})
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
              {uploadedFiles.length > 0 ? 'Manage' : 'Add'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length > 0 ? (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {file.category}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {!status.readyForSubmission && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-orange-700">
              {!status.requiredComplete && (
                <li className="flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  Complete all required personal and professional information
                </li>
              )}
              {!status.hasPropertySelection && (
                <li className="flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  Select a room and building for your application
                </li>
              )}
              {!status.hasDocuments && (
                <li className="flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  Upload supporting documents (optional but recommended)
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
