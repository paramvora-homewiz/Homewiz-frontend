'use client'

// Client-side email service that simulates email sending
// In production, this would call a server API endpoint

export interface TourConfirmationData {
  recipientEmail: string
  recipientName: string
  propertyAddress: string
  unitNumber: string
  tourDate: string
  tourTime: string
  leasingAgentName?: string
  leasingAgentPhone?: string
  additionalNotes?: string
}

class ClientEmailService {
  async sendTourConfirmation(data: TourConfirmationData): Promise<boolean> {
    console.log('📧 Tour Confirmation (Client-side simulation)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`To: ${data.recipientEmail}`)
    console.log(`Subject: Tour Confirmation - ${data.propertyAddress}, Unit ${data.unitNumber}`)
    console.log('')
    console.log(`Dear ${data.recipientName},`)
    console.log('')
    console.log('Thank you for scheduling a tour with HomeWiz!')
    console.log('')
    console.log('TOUR DETAILS:')
    console.log(`📍 Property: ${data.propertyAddress}`)
    console.log(`🏠 Unit: ${data.unitNumber}`)
    console.log(`📅 Date: ${data.tourDate}`)
    console.log(`⏰ Time: ${data.tourTime}`)
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // In production, this would make an API call to send the email
    // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify(data) })
    
    return true
  }

  async sendLeadNotification(leadData: any): Promise<boolean> {
    console.log('📋 New Lead Notification (Client-side simulation)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Name: ${leadData.name}`)
    console.log(`Email: ${leadData.email}`)
    console.log(`Phone: ${leadData.phone}`)
    console.log(`Move-in: ${leadData.moveInDate}`)
    console.log(`Bedrooms: ${leadData.bedsWanted}`)
    console.log(`Budget: $${leadData.budget.min}-$${leadData.budget.max}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return true
  }
}

export const clientEmailService = new ClientEmailService()
export default clientEmailService