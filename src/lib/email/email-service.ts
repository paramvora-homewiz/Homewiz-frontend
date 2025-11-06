// Only import nodemailer on the server side
let nodemailer: any
if (typeof window === 'undefined') {
  nodemailer = require('nodemailer')
}

export interface EmailConfig {
  host?: string
  port?: number
  secure?: boolean
  auth?: {
    user: string
    pass: string
  }
  from?: string
}

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

class EmailService {
  private transporter: any = null
  private isConfigured = false

  constructor() {
    // Only initialize on server side
    if (typeof window === 'undefined') {
      this.initializeTransporter()
    }
  }

  private initializeTransporter() {
    // Check for email configuration in environment variables
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && nodemailer) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
      this.isConfigured = true
    } else {
      console.warn('Email service not configured. Tour confirmations will be logged only.')
    }
  }

  async sendTourConfirmation(data: TourConfirmationData): Promise<boolean> {
    const emailContent = this.generateTourConfirmationEmail(data)
    
    if (!this.isConfigured || !this.transporter) {
      // Log to console if email is not configured
      console.log('📧 Tour Confirmation Email (Not sent - Email not configured):')
      console.log('To:', data.recipientEmail)
      console.log('Subject:', emailContent.subject)
      console.log('Content:', emailContent.text)
      return true
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"HomeWiz" <noreply@homewiz.com>',
        to: data.recipientEmail,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      })

      console.log('✅ Tour confirmation email sent:', info.messageId)
      return true
    } catch (error) {
      console.error('❌ Failed to send tour confirmation email:', error)
      return false
    }
  }

  private generateTourConfirmationEmail(data: TourConfirmationData) {
    const subject = `Tour Confirmation - ${data.propertyAddress}, Unit ${data.unitNumber}`
    
    const text = `
Dear ${data.recipientName},

Thank you for scheduling a tour with HomeWiz! We're excited to show you your potential new home.

TOUR DETAILS:
-------------
Property: ${data.propertyAddress}
Unit: ${data.unitNumber}
Date: ${data.tourDate}
Time: ${data.tourTime}

${data.leasingAgentName ? `Your leasing agent: ${data.leasingAgentName}` : ''}
${data.leasingAgentPhone ? `Contact: ${data.leasingAgentPhone}` : ''}

WHAT TO BRING:
- Valid ID
- Proof of income (recent pay stubs or bank statements)
- References (if available)

DIRECTIONS:
The leasing office is located at the main entrance of the building. Look for the HomeWiz signs.

${data.additionalNotes ? `\nADDITIONAL NOTES:\n${data.additionalNotes}` : ''}

If you need to reschedule or have any questions, please reply to this email or call us at (555) 123-4567.

We look forward to meeting you!

Best regards,
The HomeWiz Team
`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    h2 { color: #7c3aed; }
    .highlight { font-weight: bold; color: #7c3aed; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tour Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear ${data.recipientName},</p>
      <p>Thank you for scheduling a tour with HomeWiz! We're excited to show you your potential new home.</p>
      
      <div class="details">
        <h2>📅 Tour Details</h2>
        <p><span class="highlight">Property:</span> ${data.propertyAddress}</p>
        <p><span class="highlight">Unit:</span> ${data.unitNumber}</p>
        <p><span class="highlight">Date:</span> ${data.tourDate}</p>
        <p><span class="highlight">Time:</span> ${data.tourTime}</p>
        ${data.leasingAgentName ? `<p><span class="highlight">Leasing Agent:</span> ${data.leasingAgentName}</p>` : ''}
        ${data.leasingAgentPhone ? `<p><span class="highlight">Contact:</span> ${data.leasingAgentPhone}</p>` : ''}
      </div>
      
      <div class="details">
        <h2>📋 What to Bring</h2>
        <ul>
          <li>Valid ID</li>
          <li>Proof of income (recent pay stubs or bank statements)</li>
          <li>References (if available)</li>
        </ul>
      </div>
      
      <div class="details">
        <h2>📍 Directions</h2>
        <p>The leasing office is located at the main entrance of the building. Look for the HomeWiz signs.</p>
      </div>
      
      ${data.additionalNotes ? `
      <div class="details">
        <h2>📝 Additional Notes</h2>
        <p>${data.additionalNotes}</p>
      </div>
      ` : ''}
      
      <p>If you need to reschedule or have any questions, please reply to this email or call us at <strong>(555) 123-4567</strong>.</p>
      <p>We look forward to meeting you!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The HomeWiz Team</p>
      <p>© ${new Date().getFullYear()} HomeWiz. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

    return { subject, text, html }
  }

  // Additional email templates can be added here
  async sendLeadNotification(leadData: any): Promise<boolean> {
    // Notify leasing team about new lead
    const subject = `New Lead: ${leadData.name} - ${leadData.bedsWanted} BR`
    const text = `
New lead received via AI Chat:

Name: ${leadData.name}
Email: ${leadData.email}
Phone: ${leadData.phone}
Move-in Date: ${leadData.moveInDate}
Bedrooms: ${leadData.bedsWanted}
Budget: $${leadData.budget.min}-$${leadData.budget.max}

Tour scheduled for: ${leadData.tourDate} at ${leadData.tourTime}
Unit shown: ${leadData.unitNumber}

Please follow up within 24 hours.
`

    if (!this.isConfigured) {
      console.log('📧 Lead Notification (Not sent):', text)
      return true
    }

    try {
      await this.transporter!.sendMail({
        from: process.env.SMTP_FROM || '"HomeWiz Leads" <leads@homewiz.com>',
        to: process.env.LEASING_TEAM_EMAIL || 'leasing@homewiz.com',
        subject,
        text
      })
      return true
    } catch (error) {
      console.error('Failed to send lead notification:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
export default emailService