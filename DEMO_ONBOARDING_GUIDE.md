# HomeWiz Platform - Demo & Onboarding Guide

**Version:** 1.0
**Last Updated:** January 2025
**Purpose:** Complete guide for demonstrating HomeWiz to non-technical audiences and onboarding new users

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Pre-Demo Setup](#pre-demo-setup)
3. [Demo Flow (Recommended Sequence)](#demo-flow-recommended-sequence)
4. [Feature Walkthrough](#feature-walkthrough)
5. [User Onboarding Process](#user-onboarding-process)
6. [Common Questions & Answers](#common-questions--answers)
7. [Troubleshooting](#troubleshooting)
8. [Demo Script](#demo-script)

---

## Executive Summary

### What is HomeWiz?

HomeWiz is an AI-powered property management platform designed to streamline the entire rental lifecycle - from property listing to tenant management. The platform combines intelligent automation, intuitive forms, and real-time analytics to make property management effortless.

### Key Value Propositions

- **5-Minute Setup**: Add new properties in under 5 minutes with smart defaults
- **AI-Powered Insights**: Natural language queries return instant analytics
- **Zero Learning Curve**: Intuitive interface requires no training
- **Real-Time Analytics**: Track occupancy, revenue, and performance metrics
- **Mobile-Responsive**: Works seamlessly on desktop, tablet, and mobile

### Target Users

- **Property Managers**: Manage multiple buildings and rooms
- **Leasing Agents**: Track leads and convert to tenants
- **Building Operators**: Handle day-to-day operations
- **Property Owners**: Monitor performance and analytics

---

## Pre-Demo Setup

### Technical Requirements

**Minimum Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (stable)
- Screen resolution: 1280x720 or higher

**Optional (for full demo):**
- Backend API running on `http://localhost:8000`
- Supabase database connected
- Google Gemini API key configured

### Demo Mode Configuration

HomeWiz comes with **Demo Mode** enabled by default in `.env.local`:

```env
# Demo Mode Settings
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_DISABLE_BACKEND=false
NEXT_PUBLIC_ENABLE_SUPABASE_DIRECT=true
```

**Demo Mode Features:**
- No sign-up required (auto-authenticated)
- Pre-populated sample data
- All features unlocked
- Safe sandbox environment

### Pre-Demo Checklist

**30 Minutes Before Demo:**

- [ ] Start the application: `npm run dev`
- [ ] Verify application loads at `http://localhost:3000`
- [ ] Check landing page displays correctly
- [ ] Test one form (Building or Room) submission
- [ ] Clear browser cache/cookies for fresh experience
- [ ] Open application in full-screen mode
- [ ] Have backup screenshots ready
- [ ] Prepare demo data (building addresses, room numbers)

**Optional (If showing AI features):**
- [ ] Start backend API: `uvicorn main:app --reload`
- [ ] Verify API health at `http://localhost:8000/health`
- [ ] Test one AI chat query

**Demo Environment Tips:**
- Close unnecessary browser tabs
- Disable browser notifications
- Use incognito/private window for clean slate
- Have demo script visible on second monitor
- Prepare sample queries in advance

---

## Demo Flow (Recommended Sequence)

### Demo Duration: 10-12 Minutes

This sequence is optimized for non-technical audiences and showcases the platform's key strengths.

### Phase 1: Introduction (2 minutes)

**Landing Page Overview**

1. **Start at Homepage** (`/`)
   - Point out the clean, professional design
   - Highlight the three main CTAs:
     - "Explore Properties"
     - "Chat with AI Assistant"
     - "Try Demo Forms"

2. **Scroll Through Features**
   - "Why Choose HomeWiz?" section (4 feature cards)
   - "How It Works" process (4 steps)
   - "Experience HomeWiz in Action" (new demo guide section)
   - "Pro Tips for Your Demo" section

**Key Points to Mention:**
- "No sign-up required - you're automatically logged in"
- "Everything you see works in real-time"
- "Your data is safe - this is a demo environment"

---

### Phase 2: Property Explorer (2 minutes)

**Demonstrating Search & Discovery**

1. **Navigate to Property Explorer** (Click "Explore Properties")

2. **Show the Building Grid**
   - Point out the clean card layout
   - Mention the building images (if available)
   - Highlight key information: location, room count, pricing

3. **Apply Filters** (if data available)
   - Filter by price range
   - Filter by availability
   - Show instant results update

4. **Select a Building**
   - View detailed building information
   - Show available rooms
   - Display amenities and features

**What to Say:**
> "As a prospective tenant, you can instantly browse all available properties. Notice how the filters update in real-time - no waiting, no page reloads. When you click on a property, you see everything you need: photos, amenities, pricing, and availability."

---

### Phase 3: Smart Forms (4 minutes)

**Core Value Demonstration**

1. **Navigate to Forms Dashboard** (`/forms`)

2. **Show the Dashboard Overview**
   - Point out the "Demo Mode Active" banner
   - Highlight the real-time statistics:
     - Number of operators, buildings, rooms, available units
   - Explain the organized categories:
     - Management Forms (Operators)
     - Property Forms (Buildings, Rooms)
     - People Forms (Tenants, Leads)

3. **Open Building Form** (Most impressive for demo)

   **Step 1: Location & Basic Details**
   - Start typing an address - show autocomplete
   - Point out the "Smart Suggestions" chip
   - Mention the progress indicator at top
   - Show estimated time: "3 minutes"
   - Fill in: Building Name, Type, Year Built

   **What to Say:**
   > "Notice how the form guides you through every step. See the progress bar at the top? And this chip shows 'Smart Suggestions' - the system learns from your previous entries to auto-fill common values."

   **Step 2: Capacity & Structure**
   - Show how fields have helpful tooltips (hover over "?")
   - Enter: Total Units, Floors, Units per Floor
   - Point out real-time validation
   - Show auto-calculations (if any)

   **What to Say:**
   > "Every field has contextual help. If you hover over these question marks, you get examples and tips. The system also validates your input in real-time - no surprises at submission."

   **Step 3: Amenities & Services**
   - Show the visual amenity selector
   - Click a few amenities (Wi-Fi, Parking, Gym)
   - Point out the icon-based interface
   - Show pet policy dropdown with descriptive options

   **What to Say:**
   > "Instead of typing everything, we use visual selectors. These icons make it easy to see what's available at a glance. And notice these dropdown options - they're descriptive, not technical codes."

   **Submit the Form**
   - Click "Submit Building Form"
   - Show the success animation/message
   - Return to dashboard
   - Point out the building count increased

4. **Quick Look at Other Forms** (30 seconds each)

   **Room Form:**
   - "This is where you configure individual rooms"
   - Show the building selection dropdown
   - Point out pricing fields (private/shared)

   **Tenant Form:**
   - "Tenant onboarding in 3 simple steps"
   - Mention smart features: budget calculator, lease date auto-fill

   **Lead Tracking:**
   - "Track prospects before they become tenants"
   - Show lead source options and follow-up fields

**What to Say:**
> "We've built over 170 fields across 5 forms, but it never feels overwhelming. The multi-step approach, smart defaults, and helpful guidance make data entry actually enjoyable."

---

### Phase 4: AI Assistant (2-3 minutes)

**The "Wow" Moment**

**Prerequisites:** Backend API must be running for this section.

1. **Navigate to Chat Interface** (`/chat`)

2. **Show the Interface**
   - Point out the clean chat layout
   - Mention the message history
   - Show the input box with placeholder text

3. **Demo Natural Language Queries**

   **Query 1: Simple Search**
   ```
   Show me all available rooms under $1200
   ```
   **Expected Response:** List of rooms with cards showing details

   **What to Say:**
   > "Instead of navigating through menus and filters, just ask in plain English. The AI understands natural language and returns formatted results instantly."

   **Query 2: Analytics Request**
   ```
   What's the current occupancy rate?
   ```
   **Expected Response:** Percentage with visual chart

   **What to Say:**
   > "You can ask for analytics too. Notice how the response includes both numbers and visualizations? That's automatic."

   **Query 3: Complex Query**
   ```
   Show me financial report for last month
   ```
   **Expected Response:** Revenue breakdown, expenses, profit margins

   **What to Say:**
   > "Complex reports that would take hours to compile manually? Just ask. The AI pulls data from multiple sources and formats it beautifully."

   **Query 4: Comparison**
   ```
   Which building has the highest occupancy rate?
   ```
   **Expected Response:** Building comparison with metrics

4. **Highlight Features**
   - Response time indicator
   - Token usage (shows efficiency)
   - Interactive elements in responses (clickable cards)
   - Conversation context (ask follow-up questions)

**What to Say:**
> "This is powered by Google's Gemini AI. It understands context, so you can ask follow-up questions. It's like having a property management expert available 24/7."

**Fallback (If AI Not Working):**
> "The AI assistant requires our backend server. In production, this gives you instant answers to any property question. Let me show you some screenshots of typical interactions..."

---

### Phase 5: Analytics & Data Management (2 minutes)

**Business Intelligence**

1. **Navigate to Data Management** (`/admin/data-management`)

2. **Show the Admin Dashboard**
   - Statistics cards at top (buildings, rooms, tenants, operators)
   - Tab-based navigation
   - Search functionality
   - Action buttons (Edit, Delete, View)

3. **Demonstrate Search**
   - Type in the search box
   - Show instant filtering
   - Click on a row to view details

4. **Show Edit Capability**
   - Click "Edit" on a building
   - Show the modal form
   - Make a small change
   - Save and show instant update

5. **Data Export**
   - Click "Export Data" button
   - Show download prompt
   - Mention JSON format with timestamps

**What to Say:**
> "All your data is searchable, editable, and exportable. As an admin, you have complete control. The table updates in real-time, and you can export everything for reports or backups."

6. **Analytics Dashboard** (if time permits)
   - Navigate to `/lead-analytics`
   - Show charts and visualizations:
     - 30-day trend lines
     - Room status pie chart
     - Financial analytics
   - Point out color-coded metrics

**What to Say:**
> "These dashboards give you insights at a glance. See trends, identify issues, and make data-driven decisions. Everything updates automatically as new data comes in."

---

### Phase 6: Closing (1 minute)

**Recap & Next Steps**

1. **Return to Landing Page or Forms Dashboard**

2. **Recap Key Benefits:**
   - "Setup in minutes, not hours"
   - "AI-powered intelligence"
   - "No training required"
   - "Mobile-friendly"
   - "Secure and reliable"

3. **Call to Action:**
   - "Try it yourself - click around"
   - "Fill out a form"
   - "Ask the AI a question"
   - "Explore the features we didn't cover"

4. **Q&A Time**

---

## Feature Walkthrough

### Detailed Feature Documentation

#### 1. Landing Page Features

**Purpose:** First impression and navigation hub

**Key Elements:**
- **Hero Section**
  - Animated gradient background
  - Clear value proposition
  - Three prominent CTAs
  - Brand logo with animation

- **Features Grid**
  - 4 feature cards with icons
  - Hover animations
  - Clear benefit statements

- **How It Works**
  - 4-step process visualization
  - Numbered steps with icons
  - Progressive disclosure

- **Interactive Demo Guide** (NEW)
  - 4 clickable tour cards
  - Step-by-step navigation
  - Direct links to features

- **Pro Tips Section** (NEW)
  - 3 tip cards with guidance
  - Numbered sequence
  - Best practices

**User Actions:**
- Click "Explore Properties" → `/explore`
- Click "Chat with AI Assistant" → `/chat`
- Click "Try Demo Forms" → `/forms`
- Scroll to read about features
- Click demo tour cards for guided experience

---

#### 2. Property Explorer

**Purpose:** Browse and search available properties

**Features:**

**Building List View:**
- Grid layout of building cards
- Key info: name, location, room count
- Building images (if uploaded)
- Click to view details

**Filters:**
- Price range selector
  - Under $2000
  - $2000-$3000
  - Over $3000
- Availability toggle
- Building type filter (if implemented)

**Building Detail View:**
- Full building information
- List of available rooms
- Room details: ID, type, rent, capacity
- Amenities display
- Image gallery

**Technical Details:**
- Fetches from Supabase `buildings` table
- Related rooms from `rooms` table
- Real-time availability updates
- Lazy loading for performance

**User Journey:**
1. Land on explorer page
2. Browse building grid
3. Apply filters (optional)
4. Click on a building
5. View rooms and details
6. (Future: Book/Apply button)

---

#### 3. Forms System

**Purpose:** Data entry for all entity types

**Form Categories:**

##### A. Operator Form (22 fields)
**Purpose:** Create staff/employee profiles

**Step 1: Basic Information**
- Full Name (required)
- Email (validated)
- Phone Number (formatted)
- Company Name
- Role Selection (dropdown)
  - Leasing Agent
  - Maintenance
  - Building Manager
  - Admin

**Step 2: Configuration**
- Notification Preferences
  - Email / SMS / Both / None
- Working Hours
- Emergency Contact (Yes/No)
- Calendar Sync (Yes/No)
- Status (Active/Inactive)

**Smart Features:**
- Email validation with format check
- Phone number auto-formatting
- Role-based permission suggestions
- Previous entry copy function

**Validation Rules:**
- Email must be unique
- Phone must be valid format
- At least one contact method required

---

##### B. Building Form (50 fields)
**Purpose:** Configure building properties (Most comprehensive)

**Step 1: Location & Basic Details** (3 min estimated)
- Address Autocomplete
  - Street Address (autocomplete with Google Maps)
  - City, State, ZIP
  - Country (dropdown with flags)
- Building Name (required)
- Building Type (dropdown)
  - Apartment Complex
  - Student Housing
  - Co-living Space
  - Mixed-Use
  - Other
- Year Built (number input with validation)
- Description (rich text area)
- Operator Assignment (dropdown from operators)

**Step 2: Capacity & Structure** (2 min estimated)
- Total Units (number)
- Number of Floors (number)
- Units per Floor (number)
- Building Size (sq ft)
- Parking Spaces Available (number)
- Parking Type
  - No Parking
  - Street Parking
  - Parking Lot
  - Parking Garage
  - Both Lot and Garage

**Step 3: Amenities & Services** (5 min estimated)

**Amenities (Multi-select with icons):**
- Wi-Fi / High-Speed Internet
- Laundry (In-unit / Shared)
- Gym / Fitness Center
- Pool
- Parking (Covered / Uncovered)
- Elevator
- Security System
- Storage Units
- Bike Storage
- Pet Wash Station
- Co-working Space
- Rooftop Terrace
- BBQ Area
- Package Lockers

**Services:**
- 24/7 Security (Yes/No)
- On-site Management (Yes/No)
- Maintenance Service (Yes/No)
- Concierge (Yes/No)

**Policies:**
- Pet Policy (dropdown)
  - No Pets
  - Cats Only
  - Dogs Only
  - Cats and Small Dogs
  - Cats and Dogs (All Sizes)
  - All Pets Welcome
- Smoking Policy (dropdown)
  - No Smoking
  - Smoking Allowed (Designated Areas)
  - Smoking Allowed (Everywhere)
- Guest Policy (text)
- Quiet Hours (time range)

**Lease Terms:**
- Available Lease Lengths (multi-select)
  - 6 months
  - 9 months
  - 12 months
  - 18 months
  - 24 months
  - Month-to-Month
- Deposit Amount (currency)
- Cleaning Fee (currency)
- Application Fee (currency)

**Cleaning & Maintenance:**
- Cleaning Schedule (dropdown)
  - Daily
  - Weekly
  - Bi-weekly
  - Monthly
  - On-demand
- Cleaning Service Included (Yes/No)
- Common Area Cleaning (Yes/No)

**Utilities:**
- Utilities Included (multi-select)
  - Electricity
  - Water
  - Gas
  - Internet
  - Trash
  - Sewer
- Utilities Cost (currency, if not included)

**Additional Features:**
- Furnished/Unfurnished (toggle)
- Accessible (ADA compliant)
- Year Last Renovated
- Building Website URL
- Virtual Tour URL
- Social Media Links

**Media Upload:**
- Building exterior photos
- Common area photos
- Amenity photos
- Floor plans
- Documents (lease template, rules, etc.)

**Smart Features:**
- Address autocomplete saves typing
- Copy from previous building
- Smart defaults based on building type
- Auto-calculate units per floor
- Amenity templates by building type
- Validation preview before submission

**Validation Rules:**
- Address must be valid and complete
- Building name must be unique
- Year built must be reasonable (1800-2025)
- Total units must match floors × units per floor
- Required photos: minimum 1 exterior
- Deposit cannot exceed 3× monthly rent (warning)

---

##### C. Room Form (40 fields)
**Purpose:** Configure individual rooms/units

**Step 1: Basic Information** (2 min)
- Room Number/ID (text)
- Building Selection (dropdown, searchable)
- Floor Number (auto-suggests based on building)
- Room Type (dropdown)
  - Private Room (Private Bath)
  - Private Room (Shared Bath)
  - Shared Room
  - Studio
  - 1 Bedroom
  - 2 Bedroom
  - 3+ Bedroom
- Square Footage (number)
- Max Occupancy (number)

**Step 2: Pricing & Availability** (3 min)
- Private Room Rent (currency)
- Shared Room Rent per Person (currency)
- Security Deposit (auto-calculates from building)
- Move-in Costs Summary (auto-calculated)
  - First month rent
  - Security deposit
  - Cleaning fee
  - Application fee
  - **Total Due at Move-in**
- Available From (date picker)
- Lease Type (dropdown)
  - Fixed Term
  - Month-to-Month
  - Academic Year
  - Summer Only
- Minimum Stay (number of months)

**Step 3: Features & Amenities** (4 min)

**Room Features:**
- Furnished (Yes/No)
- Private Bathroom (Yes/No)
- Private Entrance (Yes/No)
- Balcony/Patio (Yes/No)
- Walk-in Closet (Yes/No)
- Window View (dropdown)
  - City View
  - Garden View
  - Courtyard View
  - Street View
  - No View

**Amenities (inherited from building, can override):**
- In-unit Washer/Dryer (Yes/No)
- Kitchen Access (Private/Shared/None)
- Air Conditioning (Yes/No)
- Heating Type (dropdown)
- Internet Included (Yes/No)
- Cable/TV Included (Yes/No)

**Bed Configuration:**
- Number of Beds (number)
- Bed Type (dropdown)
  - Twin
  - Full
  - Queen
  - King
  - Bunk Bed
  - Murphy Bed
- Desk Provided (Yes/No)
- Chair Provided (Yes/No)
- Dresser Provided (Yes/No)

**Step 4: Tracking & Status** (2 min)
- Current Status (dropdown)
  - Available
  - Occupied
  - Reserved
  - Maintenance
  - Not Ready
- Booking Type (dropdown)
  - Entire Room
  - Per Bed
- Gender Restriction (dropdown)
  - No Restriction
  - Female Only
  - Male Only
- Age Restriction (text)
- Special Requirements (text area)
- Internal Notes (text area, private)

**Media Upload:**
- Room photos (multiple)
- Floor plan (optional)

**Smart Features:**
- Room numbering suggestions (based on floor/pattern)
- Pricing calculator (shows monthly vs. semester vs. annual)
- Occupancy validator (based on sq footage regulations)
- Availability calendar integration
- Copy from similar room
- Bulk room creation (advanced)

**Validation Rules:**
- Room number must be unique within building
- Building must be selected first
- Rent must be greater than $0
- Max occupancy must align with room type
- Square footage must be reasonable (80-2000 sq ft)
- Move-in date must be future or today
- At least 1 photo required

---

##### D. Tenant Form (35 fields)
**Purpose:** Manage tenant profiles and leases

**Step 1: Personal Information** (3 min)
- Full Name (required)
  - First Name
  - Middle Name (optional)
  - Last Name
- Email Address (validated, unique)
- Phone Number (formatted)
- Date of Birth (date picker)
- Nationality (dropdown with search)
- Government ID Type (dropdown)
  - Passport
  - Driver's License
  - State ID
  - Student ID
  - Other
- Government ID Number (text, masked)
- Emergency Contact
  - Name
  - Relationship
  - Phone Number

**Step 2: Housing & Lease** (4 min)
- Building Selection (dropdown)
- Room Selection (filtered by building, shows availability)
- Move-in Date (date picker, defaults to 30 days from today)
- Lease Type (dropdown)
  - Fixed-Term Lease
  - Month-to-Month
  - Short-Term Rental
  - Corporate Housing
  - Student Lease
- Lease Start Date (date picker)
- Lease End Date (auto-calculated or manual)
- Lease Length (months, auto-calculated)
- Monthly Rent Amount (auto-filled from room)
- Security Deposit Amount (auto-filled from building)
- Additional Fees (currency)
- Payment Schedule (dropdown)
  - Monthly
  - Bi-weekly
  - Semester
  - Upfront
- Payment Method (dropdown)
  - Bank Transfer
  - Credit/Debit Card
  - Check
  - Cash
  - Digital Wallet (PayPal, Venmo, etc.)
  - Direct Debit
- Employment Status (dropdown)
  - Employed Full-Time
  - Employed Part-Time
  - Self-Employed
  - Student
  - Unemployed
  - Retired
- Employer Name (text, conditional)
- Monthly Income (currency)
- Budget Range (auto-calculated using 30% rule)

**Step 3: Preferences & Additional Info** (3 min)
- Communication Preference (dropdown)
  - Email Only
  - SMS Only
  - Both Email and SMS
  - Phone Call
- Preferred Language (dropdown)
- Pets (Yes/No)
  - If Yes:
    - Pet Type (Dog/Cat/Other)
    - Pet Name
    - Pet Weight
    - Breed
- Smoking (Yes/No)
- Number of Occupants (number)
- Vehicle Information (optional)
  - Make/Model
  - License Plate
  - Parking Space Needed (Yes/No)
- Special Requests/Notes (text area)
- How Did You Hear About Us? (dropdown)
  - Website
  - Referral
  - Social Media
  - Advertisement
  - Walk-in
  - Other
- Referral Source (text, if referral)
- Lease Agreement Signed (Yes/No)
- Background Check Status (dropdown)
  - Not Started
  - In Progress
  - Completed
  - Failed
- Status (dropdown)
  - Active
  - Inactive
  - Pending
  - Terminated

**Smart Features:**
- Auto-calculate lease end date
- Budget validator (30% of income rule)
- Room availability checker
- Visa status auto-detection (for US citizens)
- Lease template auto-generation
- Move-in checklist generator
- Duplicate tenant detection

**Validation Rules:**
- Email must be unique
- Age must be 18+ (calculated from DOB)
- Move-in date must be when room is available
- Income must support rent (typically 3× rent)
- All required documents must be uploaded
- Emergency contact required
- Lease dates must be logical (start < end)

---

##### E. Lead Form (25 fields)
**Purpose:** Track prospective tenants

**Step 1: Contact Information** (2 min)
- Full Name (required)
- Email Address (validated)
- Phone Number (formatted)
- Preferred Contact Method (dropdown)
  - Email
  - Phone
  - SMS
  - Any
- Best Time to Contact (dropdown)
  - Morning (8am-12pm)
  - Afternoon (12pm-5pm)
  - Evening (5pm-8pm)
  - Anytime

**Step 2: Preferences & Budget** (4 min)
- Move-in Date (date picker)
- Budget Range (range slider or two inputs)
  - Minimum Budget
  - Maximum Budget
- Preferred Building (multi-select, optional)
- Preferred Room Type (multi-select)
  - Private Room
  - Shared Room
  - Studio
  - 1BR
  - 2BR
  - 3BR+
- Number of People (number)
- Lease Duration (dropdown)
  - Short-term (1-3 months)
  - Medium-term (4-6 months)
  - Long-term (7-12 months)
  - 12+ months
- Pet Friendly Required (Yes/No)
- Parking Required (Yes/No)
- Furnished Required (Yes/No)
- Must-Have Amenities (multi-select)
  - Gym
  - Pool
  - Laundry
  - Parking
  - Pet Friendly
  - Wi-Fi
  - Other

**Step 3: Source & Follow-up** (2 min)
- Lead Source (dropdown)
  - Website
  - Referral
  - Social Media (Facebook)
  - Social Media (Instagram)
  - Social Media (Other)
  - Advertisement (Google)
  - Advertisement (Print)
  - Walk-in
  - Event
  - Partner
  - Other
- Referral Name (text, if referral)
- Campaign ID (text, for tracking)
- Interest Level (dropdown)
  - Hot (Ready to move)
  - Warm (Actively looking)
  - Cold (Just browsing)
  - Information Only
- Lead Status (dropdown)
  - New
  - Contacted
  - Qualified
  - Tour Scheduled
  - Application Submitted
  - Converted
  - Not Interested
  - Lost
- Follow-up Date (date picker)
- Assigned Agent (dropdown from operators)
- Notes (text area)
- Special Requirements (text area)

**Smart Features:**
- Lead scoring (auto-calculated)
  - Budget match score
  - Urgency score (based on move-in date)
  - Engagement score
- Duplicate lead detection
- Auto-assign to agent (round-robin)
- Follow-up reminders
- Email template suggestions
- Tour scheduling integration
- Conversion tracking

**Validation Rules:**
- Valid email or phone required
- Budget must be realistic (>$500)
- Move-in date must be future
- At least one contact method required

---

#### 4. AI Chat Assistant

**Purpose:** Natural language property queries and analytics

**Features:**

**Chat Interface:**
- Clean, modern chat layout
- Message history with timestamps
- Typing indicators
- Auto-scroll to latest message
- Message reactions (future)

**Capabilities:**

**1. Property Search Queries**
```
Examples:
- "Show me all available rooms under $1200"
- "Find rooms with private bathroom and good sunlight"
- "Which buildings have gyms?"
- "Show me pet-friendly properties"
- "Rooms available for immediate move-in"
```

**Response Format:**
- Room cards with key details
- Building cards with images
- Availability status
- Direct links to details
- "View All" button for full results

**2. Analytics Queries**
```
Examples:
- "What's the current occupancy rate?"
- "Show me financial report for last month"
- "Which building has the highest revenue?"
- "Calculate occupancy rates by building"
- "Show tenant payment status"
```

**Response Format:**
- Visual charts (bar, line, pie)
- Metric cards with KPIs
- Trend indicators (up/down arrows)
- Comparison tables
- Exportable data

**3. Tenant & Lease Queries**
```
Examples:
- "Show me all active tenants"
- "Which leases are expiring next month?"
- "Show overdue payments"
- "List tenants with pets"
- "Show tenant demographics"
```

**Response Format:**
- Tenant cards with photos
- Lease expiry timeline
- Payment status badges
- Contact information
- Quick actions (email, call)

**4. Operational Queries**
```
Examples:
- "Show maintenance requests"
- "Which rooms need cleaning?"
- "List upcoming tours"
- "Show agent performance"
- "Generate monthly report"
```

**Response Format:**
- Task lists with priorities
- Calendar views
- Performance metrics
- Downloadable reports

**Smart Features:**
- Context awareness (remembers conversation)
- Multi-turn conversations
- Clarifying questions
- Suggestions for follow-up queries
- Response time tracking
- Token usage display
- Model information (Gemini 2.0 Flash)

**Technical Details:**
- Powered by Google Gemini 2.0 Flash
- Backend: FastAPI Python server
- WebSocket support (optional)
- Streaming responses (optional)
- Fallback to mock responses if backend unavailable

---

#### 5. Analytics & Data Management

**Purpose:** View, edit, and export all data

**Features:**

**A. Data Management Dashboard** (`/admin/data-management`)

**Overview Statistics:**
- Total Buildings (with icon)
- Total Rooms (with status breakdown)
- Active Tenants (with occupancy rate)
- Active Operators (with role breakdown)
- Real-time updates

**Tab Navigation:**
1. **Buildings Tab**
   - Table columns: Name, Address, City, Type, Operator, Created Date
   - Actions: View, Edit, Delete
   - Search across all fields
   - Sort by column (click header)

2. **Rooms Tab**
   - Table columns: ID, Building, Type, Rent, Status, Occupancy, Floor
   - Status badges (color-coded)
   - Availability indicator
   - Click to view details

3. **Tenants Tab**
   - Table columns: Name, Email, Phone, Room, Status, Lease Start, Lease End
   - Contact buttons (email, call)
   - Lease status indicator
   - Payment status

4. **Operators Tab**
   - Table columns: Name, Email, Role, Company, Status, Created Date
   - Role badges
   - Active status toggle
   - Permission levels

**Search & Filters:**
- Global search (searches all visible fields)
- Per-column filters
- Date range filters
- Status filters
- Custom filter builder (advanced)

**Actions:**
- **View:** Open detail modal (read-only)
- **Edit:** Open edit modal (full form)
- **Delete:** Confirmation dialog, soft delete
- **Bulk Actions:** Select multiple, bulk edit/delete

**Data Export:**
- Export current view to JSON
- Export all data (admin only)
- Timestamped filenames
- Formatted and readable JSON
- Includes relationships

**B. Analytics Dashboard** (`/lead-analytics`)

**Overview Cards:**
- Total Leads (30-day trend)
- Conversion Rate (vs. last month)
- Average Response Time
- Active Campaigns

**Charts & Visualizations:**

1. **Lead Funnel**
   - Stages: New → Contacted → Qualified → Tour → Application → Converted
   - Conversion rates between stages
   - Drop-off analysis

2. **30-Day Trend**
   - Line chart: Leads, Applications, Conversions
   - Moving averages
   - Forecast line (ML-based)

3. **Lead Sources**
   - Pie chart: Website, Referral, Social, Ads, etc.
   - Cost per lead (if campaign data available)
   - ROI by source

4. **Room Status Distribution**
   - Pie chart: Available, Occupied, Maintenance, Reserved
   - Occupancy percentage
   - Days to fill (average)

5. **Financial Overview**
   - Bar chart: Monthly revenue vs. expenses
   - Profit margins
   - Revenue by building
   - Payment collection rate

6. **Agent Performance**
   - Leaderboard: Leads, Conversions, Response Time
   - Individual scorecards
   - Goal tracking

**Filters:**
- Date range selector (Today, 7D, 30D, 90D, YTD, Custom)
- Building filter
- Agent filter
- Lead source filter

**Export Options:**
- Export charts as images (PNG)
- Export data as CSV/Excel
- Email scheduled reports
- PDF report generation

---

## User Onboarding Process

### Detailed Step-by-Step Onboarding

This section describes how a **new user** (property manager) would be onboarded to use HomeWiz from scratch.

---

### Stage 1: Account Setup & First Login

**Duration:** 5 minutes

#### Step 1.1: Welcome Screen
**What User Sees:**
- Landing page with "Get Started" button
- Overview of platform benefits
- Short video/animation (optional)

**Action Required:**
- Click "Get Started" or "Sign Up"

#### Step 1.2: Account Creation (Future - Currently Demo Mode)
**What User Provides:**
- Email address
- Password (validated)
- Full name
- Company name
- Role (property manager, owner, agent)

**What Happens:**
- Verification email sent
- User clicks verification link
- Redirected to platform

#### Step 1.3: Profile Completion
**What User Provides:**
- Profile photo (optional)
- Phone number
- Notification preferences
- Timezone
- Language preference

**What Happens:**
- Profile saved to database
- Welcome email sent
- Onboarding wizard begins

---

### Stage 2: Guided Setup Wizard

**Duration:** 15-20 minutes

#### Step 2.1: Company Setup
**What User Provides:**
- Company/Portfolio Name
- Company Address
- Company Logo (optional)
- Website URL
- Description

**Smart Features:**
- Pre-filled from registration
- Logo upload with preview
- Address autocomplete

**What Happens:**
- Company profile created
- User becomes admin of their company

#### Step 2.2: Add First Operator (Yourself)
**Purpose:** Create your operator profile

**What User Provides:**
- Role: Building Manager / Admin
- Contact details (auto-filled)
- Working hours
- Notification preferences

**What Happens:**
- User linked to operator record
- Permissions assigned
- Can add more operators later

#### Step 2.3: Add First Building
**Purpose:** Get first property into system

**Guided Flow:**
- **Simplified version of Building Form**
- Required fields only (10 fields instead of 50)
- More fields can be added later

**Required Fields:**
1. Building Address (autocomplete)
2. Building Name
3. Building Type
4. Total Units
5. Basic amenities (quick select)

**Smart Features:**
- "I'll do this later" skip option
- "Use sample building" for testing
- Progress saved automatically

**What Happens:**
- Building created with partial data
- User can add more details anytime
- Redirected to "Add Rooms" step

#### Step 2.4: Add First Room
**Purpose:** Create at least one room/unit

**Guided Flow:**
- Simplified Room Form
- 8 required fields

**Required Fields:**
1. Room Number
2. Room Type
3. Private Room Rent
4. Max Occupancy
5. Square Footage
6. Availability Status
7. Available From Date

**Smart Features:**
- Bulk room creation option
- "Add more rooms later" option
- Template selection for common layouts

**What Happens:**
- Room created and linked to building
- Occupancy stats calculated
- User can add more rooms or finish

#### Step 2.5: Setup Complete
**What User Sees:**
- Congratulations screen
- Summary of what they created:
  - 1 Company
  - 1 Operator (themselves)
  - 1 Building
  - X Rooms
- Next steps checklist

**Next Steps Suggested:**
- [ ] Add more rooms
- [ ] Add team members (operators)
- [ ] Customize building details
- [ ] Upload photos
- [ ] Create tenant profiles
- [ ] Explore AI assistant
- [ ] View analytics

**What Happens:**
- User redirected to dashboard
- Onboarding marked as complete
- Tutorial tooltips enabled

---

### Stage 3: First-Use Experience

**Duration:** Ongoing (first week)

#### Interactive Tutorial (Optional)

**Product Tour:**
- Overlay tooltips on key features
- "Next" / "Skip" options
- Can be restarted anytime

**Tour Stops:**
1. **Dashboard Overview**
   - "This is your command center"
   - Shows statistics cards
   - Quick actions panel

2. **Forms Access**
   - "Add data here"
   - Shows form categories
   - Opens Building Form preview

3. **Property Explorer**
   - "Browse your properties"
   - Filter demonstration
   - Room details view

4. **AI Chat**
   - "Ask me anything"
   - Sample query suggestions
   - Shows example response

5. **Data Management**
   - "View and edit all data"
   - Search and filter demo
   - Export feature highlight

6. **Analytics**
   - "Track your performance"
   - Charts explanation
   - Metric definitions

#### Contextual Help

**Progressive Disclosure:**
- Tooltips appear when hovering
- "Learn More" links to docs
- Video tutorials embedded

**Help Center Access:**
- Searchable knowledge base
- Step-by-step guides
- FAQs for common tasks
- Live chat support (future)

#### Achievement Badges (Gamification)

**Milestones:**
- [ ] First Building Added
- [ ] First Room Created
- [ ] First Tenant Onboarded
- [ ] 10 Rooms Created
- [ ] First Month Complete
- [ ] 100% Occupancy Achieved
- [ ] AI Query Master (10 queries)
- [ ] Data Export Pro
- [ ] Team Builder (5+ operators)

**Benefits:**
- Encourages exploration
- Provides sense of progress
- Unlocks advanced features

---

### Stage 4: Advanced Features Introduction

**Trigger:** After 1 week of use or 10 entities created

#### Email Drip Campaign

**Week 1 Email:**
- Subject: "You're doing great! Here's what's next"
- Content: Tips for optimizing forms, using smart defaults
- CTA: "Watch Tutorial Video"

**Week 2 Email:**
- Subject: "Unlock the power of AI"
- Content: Guide to AI chat assistant, sample queries
- CTA: "Try AI Chat Now"

**Week 3 Email:**
- Subject: "Master your analytics"
- Content: Understanding metrics, using filters
- CTA: "View Your Dashboard"

**Week 4 Email:**
- Subject: "Expand your team"
- Content: How to add operators, assign permissions
- CTA: "Invite Team Member"

#### In-App Notifications

**Trigger-Based Tips:**
- After adding 5 rooms: "Did you know you can bulk add rooms?"
- After first tenant: "Track lease expiry with our calendar"
- After 10 buildings: "Try our mobile app for on-the-go management"

---

### Stage 5: Ongoing Support & Education

**Resources:**

1. **Knowledge Base**
   - 100+ articles
   - Categorized by feature
   - Searchable
   - Video tutorials

2. **Webinars**
   - Weekly live demos
   - Q&A sessions
   - Advanced feature deep-dives
   - Recordings available

3. **Community Forum**
   - User discussions
   - Best practices sharing
   - Feature requests
   - Peer support

4. **Release Notes**
   - What's new each month
   - Feature highlights
   - Bug fixes
   - Upcoming features

5. **Personal Onboarding Call** (Premium)
   - 30-minute 1-on-1 session
   - Custom setup assistance
   - Q&A with expert
   - Available for Enterprise tier

---

## Common Questions & Answers

### For Non-Technical Audiences

#### General Platform Questions

**Q: What is HomeWiz?**
A: HomeWiz is a comprehensive property management platform that helps you manage buildings, rooms, tenants, and leads all in one place. Think of it as your digital assistant for rental property management.

**Q: Who should use HomeWiz?**
A: Anyone managing rental properties:
- Property managers with multiple buildings
- Building owners
- Leasing agents
- Student housing coordinators
- Co-living space operators
- Facilities managers

**Q: Do I need technical skills to use it?**
A: Not at all! HomeWiz is designed to be intuitive. If you can use email, you can use HomeWiz. We have smart forms that guide you through every step.

**Q: How long does it take to set up?**
A: You can add your first building in under 5 minutes. Adding rooms, tenants, and other details can be done progressively - you don't need to do everything at once.

**Q: Can I use it on my phone?**
A: Yes! HomeWiz is fully responsive and works on phones, tablets, and computers.

**Q: How much does it cost?**
A: [Pricing details to be added - currently in demo mode]

---

#### Data & Security Questions

**Q: Is my data safe?**
A: Yes. We use bank-level encryption to protect your data. Your information is stored securely in the cloud and backed up regularly.

**Q: Can I export my data?**
A: Absolutely. You can export all your data at any time in JSON format. There's no vendor lock-in.

**Q: What happens if I want to stop using HomeWiz?**
A: You can export all your data and cancel anytime. Your data remains yours forever.

**Q: Can multiple people use the same account?**
A: Yes! You can add multiple operators (team members) with different permission levels. For example, your leasing agents might have different access than maintenance staff.

**Q: Is there a limit to how much data I can store?**
A: [To be defined based on tier - current demo has no limits]

---

#### Features & Functionality

**Q: What's the difference between a "building" and a "room"?**
A: A **building** is the physical property (like "Sunset Apartments"). A **room** is an individual unit within that building (like "Room 201"). One building can have many rooms.

**Q: What is the AI assistant?**
A: It's a chat interface where you can ask questions in plain English, like "Show me available rooms under $1200" or "What's my occupancy rate?" The AI understands your question and gives you instant answers with charts and data.

**Q: Do I need the AI to use HomeWiz?**
A: No, the AI is optional. All features work without it. But the AI makes things faster and easier, especially for analytics and searching.

**Q: Can I customize the forms?**
A: The core fields are standard, but you can add custom notes and use the "Additional Information" sections. We're working on full custom fields for future releases.

**Q: What reports can I generate?**
A: HomeWiz provides:
- Occupancy reports
- Financial reports (revenue, expenses, profit)
- Lead conversion reports
- Maintenance reports
- Lease expiry reports
- Custom date range reports

**Q: Can I track payments?**
A: Currently, HomeWiz tracks payment methods and preferences. Full payment processing integration is coming soon.

**Q: How do I handle maintenance requests?**
A: You can add maintenance status to rooms and track them in the admin panel. A dedicated maintenance module is in development.

---

#### Demo-Specific Questions

**Q: What is "Demo Mode"?**
A: Demo Mode lets you try all features without signing up. You're automatically logged in and can create, edit, and delete test data. None of your demo data is permanent - it resets when you refresh.

**Q: Can I save my work in Demo Mode?**
A: Demo Mode data persists during your session but isn't saved permanently. To save real data, you'd need to sign up for an account (feature coming soon).

**Q: Is this what the real version looks like?**
A: Yes! The demo is a fully functional version of HomeWiz. What you see is exactly what you'd use in production.

**Q: Can I test integrations in the demo?**
A: Some integrations (like AI chat) require a backend server. For a full demo including AI, contact us for a personalized walkthrough.

---

#### Getting Started Questions

**Q: Where should I start?**
A: We recommend this order:
1. Explore the landing page to understand features
2. Click "Explore Properties" to see how browsing works
3. Go to "Forms" and create a building
4. Add a few rooms to that building
5. Try the AI chat with a sample question
6. Check out the analytics dashboard

**Q: What data should I prepare before starting?**
A: Have this information ready:
- Building addresses
- Room numbers and types
- Monthly rent prices
- List of amenities
- Operator/staff contact information
- Tenant contact information (if applicable)

**Q: Can I import data from a spreadsheet?**
A: Not yet, but bulk import is on our roadmap. For now, you can use our forms, which have smart defaults to speed up data entry.

**Q: How long will it take to input all my properties?**
A: It varies, but as a guideline:
- Simple building: 3-5 minutes
- Building with 20 rooms: 15-20 minutes
- You can add data progressively - no need to do everything at once

---

#### Troubleshooting Questions

**Q: The AI chat isn't working. Why?**
A: The AI chat requires the backend server to be running. In demo mode, this might not always be available. All other features work independently.

**Q: I can't see my data after refreshing. What happened?**
A: In Demo Mode, data resets on refresh. In production, all data is saved permanently.

**Q: A form won't submit. What should I check?**
A: Look for:
- Red highlighted fields (validation errors)
- Required fields marked with *
- Check the error summary at the top of the form
- Ensure dates are in the correct format

**Q: The page is loading slowly. Is something wrong?**
A: HomeWiz is optimized for speed, but initial loads can take a few seconds if:
- You have a slow internet connection
- The backend server is waking up (demo mode)
- Your browser cache is full (try clearing it)

**Q: I accidentally deleted something. Can I undo it?**
A: In the full version, deleted items go to a "Trash" folder and can be restored for 30 days. In Demo Mode, deletions are permanent within the session.

---

#### Comparison Questions

**Q: How is HomeWiz different from [Competitor]?**
A: Key differentiators:
- **AI-powered**: Natural language queries, not just dashboards
- **Smart forms**: Auto-fill, smart defaults, guided workflows
- **Modern UI**: Beautiful, intuitive interface built with latest tech
- **Mobile-first**: Works perfectly on all devices
- **Affordable**: [Pricing tier details]

**Q: Can HomeWiz replace my current system?**
A: HomeWiz is designed to be a complete property management solution. We recommend:
1. Run both systems in parallel for 1 month (trial period)
2. Migrate one building at a time
3. Use export/import to transfer data
4. We offer migration assistance for Enterprise customers

**Q: Does HomeWiz integrate with [Tool]?**
A: Current integrations:
- ✅ Google Maps (address autocomplete)
- ✅ Supabase (database)
- ✅ Google Gemini (AI)
- 🚧 Coming soon: Payment processors, email services, calendar apps

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: Application Won't Load

**Symptoms:**
- Blank white screen
- "Application Error" message
- Loading spinner never stops

**Possible Causes:**
1. Backend server not running
2. Environment variables not set
3. Network/firewall issues
4. Browser compatibility

**Solutions:**

**Solution A: Check Backend Server**
```bash
# Navigate to backend directory
cd backend/

# Start the backend
uvicorn main:app --reload

# Verify health endpoint
curl http://localhost:8000/health
```

Expected response: `{"status": "healthy"}`

**Solution B: Verify Environment Variables**
```bash
# Check .env.local exists
ls -la .env.local

# Verify key variables
cat .env.local | grep NEXT_PUBLIC
```

Required variables:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Solution C: Clear Browser Cache**
- Chrome: Ctrl+Shift+Delete → Clear browsing data
- Firefox: Ctrl+Shift+Delete → Clear recent history
- Safari: Safari → Clear History

**Solution D: Check Browser Console**
- Open Developer Tools (F12)
- Check Console tab for errors
- Common errors:
  - CORS errors → Backend CORS not configured
  - 404 errors → Backend not running
  - Network errors → Check internet connection

---

#### Issue 2: Forms Not Submitting

**Symptoms:**
- Click Submit button, nothing happens
- Form shows validation errors
- Success message doesn't appear

**Possible Causes:**
1. Validation errors (most common)
2. Missing required fields
3. Backend connection issue
4. Network timeout

**Solutions:**

**Solution A: Check Validation Summary**
- Look for red-highlighted fields
- Check the validation summary at top of form
- Expand all form steps to see hidden errors
- Common validation issues:
  - Email format incorrect
  - Phone number format incorrect
  - Date in the past
  - Required field left blank

**Solution B: Check Browser Console**
```javascript
// Open DevTools (F12), Console tab
// Look for error messages like:
// "Validation failed: ..."
// "API error: ..."
// "Network timeout"
```

**Solution C: Verify Required Fields**

**Building Form Required:**
- Building Name
- Address (complete)
- Building Type
- Operator (must select from dropdown)

**Room Form Required:**
- Room Number
- Building (must select first)
- Room Type
- Private Room Rent

**Tenant Form Required:**
- Full Name
- Email
- Phone Number
- Building Selection
- Room Selection
- Move-in Date

**Solution D: Backend Connection Check**
```bash
# Test API connection
curl http://localhost:8000/api/buildings

# If this returns 404 or error:
# 1. Check backend is running
# 2. Check NEXT_PUBLIC_API_URL in .env.local
# 3. Check CORS settings in backend
```

---

#### Issue 3: AI Chat Not Responding

**Symptoms:**
- Message sent but no response
- "Backend unavailable" error
- Response takes very long time
- Empty response

**Possible Causes:**
1. Backend not running (most common)
2. Gemini API key invalid/expired
3. Rate limit exceeded
4. Network timeout

**Solutions:**

**Solution A: Verify Backend**
```bash
# Check backend logs for errors
cd backend/
tail -f logs/app.log

# Test health endpoint
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

**Solution B: Check API Key**
```bash
# Verify Gemini API key in backend .env
cat backend/.env | grep GEMINI_API_KEY

# Test API key with Gemini directly
curl -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}'
```

If API key invalid:
1. Go to https://aistudio.google.com/apikey
2. Generate new API key
3. Update in backend `.env`
4. Restart backend server

**Solution C: Check Rate Limits**
- Free tier Gemini: 60 requests per minute
- If exceeded, wait 1 minute and try again
- Consider upgrading to paid tier for higher limits

**Solution D: Use Mock Mode (Temporary)**
```bash
# In .env.local, enable mock mode
NEXT_PUBLIC_ENABLE_AI_MOCK=true

# This will return mock responses without AI
# Useful for demos when backend unavailable
```

---

#### Issue 4: Images Not Uploading

**Symptoms:**
- Upload button doesn't work
- Image upload fails silently
- "File too large" error
- Images don't appear after upload

**Possible Causes:**
1. File size exceeds limit (10MB default)
2. File type not allowed
3. Supabase storage not configured
4. Network timeout during upload

**Solutions:**

**Solution A: Check File Size and Type**

Allowed types:
- Images: JPG, JPEG, PNG, GIF, WebP
- Documents: PDF
- Max size: 10MB (configurable)

To change max size:
```env
# In .env.local
NEXT_PUBLIC_MAX_FILE_SIZE=20971520  # 20MB in bytes
```

**Solution B: Verify Supabase Storage**
```bash
# Check Supabase storage bucket exists
# Go to: https://supabase.com/dashboard
# Project → Storage → Buckets
# Should see: "building-images", "room-images", etc.
```

Create bucket if missing:
1. Storage → Create new bucket
2. Name: `building-images`
3. Public: Yes (for demo) or No (for production)
4. File size limit: 10MB

**Solution C: Check Browser Console**
```javascript
// Look for upload errors:
// "Supabase storage error: ..."
// "File size exceeds limit"
// "Invalid file type"
```

**Solution D: Use Alternative Upload Method**
If Supabase upload fails, you can:
1. Upload images to cloud storage (imgur, cloudinary)
2. Copy image URL
3. Paste URL in "Image URL" field (if available)

---

#### Issue 5: Data Not Displaying

**Symptoms:**
- Property Explorer shows "No properties found"
- Dashboard statistics show 0
- Forms show empty dropdowns
- Admin panel shows empty tables

**Possible Causes:**
1. No data in database
2. Backend not returning data
3. Database connection issue
4. Filters hiding all results

**Solutions:**

**Solution A: Add Sample Data**
```bash
# Option 1: Use the application forms
# Go to /forms and manually add:
# - 1 Operator
# - 1 Building
# - 2-3 Rooms

# Option 2: Run seed script (if available)
cd backend/
python scripts/seed_database.py

# Option 3: Import sample data
# Go to Admin Panel → Import Data
# Upload sample_data.json
```

**Solution B: Check Database Connection**
```bash
# Test Supabase connection
curl https://YOUR_PROJECT.supabase.co/rest/v1/buildings \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Should return JSON array of buildings
# If returns error: Check Supabase project is running
```

**Solution C: Clear Filters**
- Property Explorer: Click "Clear All Filters"
- Admin Panel: Click "Reset" on search box
- Check "Show Inactive" toggle if available

**Solution D: Check Browser Console**
```javascript
// Look for API errors:
// "Failed to fetch buildings: ..."
// "Supabase error: ..."
// "Permission denied"
```

If permission denied:
- Check Supabase Row Level Security (RLS) policies
- For demo, disable RLS or set policies to allow all

---

#### Issue 6: Styling/Layout Issues

**Symptoms:**
- Buttons overlapping
- Text cut off
- Mobile view looks broken
- Colors look wrong
- Icons missing

**Possible Causes:**
1. CSS not loading
2. Browser zoom level incorrect
3. Browser compatibility issue
4. Missing icon library

**Solutions:**

**Solution A: Check CSS Loading**
```bash
# Verify Tailwind is compiling
npm run dev

# Check for CSS errors in terminal:
# "Error: Cannot find module 'tailwindcss'"
# "PostCSS error: ..."
```

If CSS not loading:
```bash
# Reinstall dependencies
rm -rf node_modules/
rm package-lock.json
npm install

# Restart dev server
npm run dev
```

**Solution B: Reset Browser Zoom**
- Chrome: Ctrl+0 (reset to 100%)
- Make sure browser zoom is at 100%
- Some layouts break at <80% or >120% zoom

**Solution C: Clear Browser Cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- This forces reload of CSS files

**Solution D: Check Browser Compatibility**
- Recommended: Chrome 90+, Firefox 88+, Safari 14+
- If using older browser, upgrade
- Check caniuse.com for CSS Grid and Flexbox support

**Solution E: Verify Icon Library**
```bash
# Check lucide-react is installed
npm list lucide-react

# If missing:
npm install lucide-react
```

---

### Emergency Demo Backup Plan

**If everything fails during the demo:**

#### Plan A: Use Screenshots/Video
Prepare in advance:
- Screenshots of every key feature
- Screen recording of full demo flow
- PowerPoint/Keynote with screenshots

#### Plan B: Local Backup Environment
- Install on a local machine (not reliant on network)
- Have sample database pre-populated
- Test thoroughly before demo

#### Plan C: Hosted Demo Instance
- Deploy to Vercel/Netlify
- Use live URL instead of localhost
- Ensure backend is on stable server (Railway, Render, etc.)

#### Plan D: Pivot to Conceptual Demo
- Walk through the UI mockups
- Explain features without clicking
- Use whiteboard to diagram workflows

---

## Demo Script

### Complete 12-Minute Demo Script

**Use this script for your demo. Modify timing based on audience engagement.**

---

### Minute 0-1: Introduction & Hook

**[Show: Landing Page]**

**Script:**
> "Good morning/afternoon! Today I'm excited to show you HomeWiz - a property management platform that makes managing rentals as easy as browsing social media.
>
> Before we dive in, quick question: How many of you have ever struggled with managing property information across spreadsheets, emails, and sticky notes? [Pause for response]
>
> That's exactly the problem HomeWiz solves. Let me show you how.
>
> What you're seeing right now is our landing page. Notice we're already logged in - no sign-up required for this demo. Everything you'll see today is fully functional and works in real-time."

---

### Minute 1-2: Landing Page Tour

**[Stay on: Landing Page, slowly scroll]**

**Script:**
> "Let's take a quick tour of what HomeWiz can do for you.
>
> [Scroll to Features Section]
>
> We've designed HomeWiz around four key benefits:
>
> 1. **Lightning Fast Onboarding** - Add a new property in under 5 minutes. Not 5 hours, 5 minutes.
>
> 2. **Easy Document Upload** - Drag and drop files, we handle the rest - automatic compression, organization, the works.
>
> 3. **Secure & Private** - Bank-level encryption. Your data is yours, always.
>
> 4. **Instant Approval** - AI-powered processing means faster decisions, happier tenants.
>
> [Scroll to How It Works]
>
> The process is simple: Sign up, complete your profile, upload documents, get approved. Four steps, that's it.
>
> [Scroll to Demo Guide Section]
>
> And here's something new - our interactive demo guide. Each card is clickable and takes you directly to that feature. Let me show you by clicking on 'Explore Properties'."

---

### Minute 2-4: Property Explorer

**[Navigate to: /explore]**

**Script:**
> "This is our Property Explorer - think of it like browsing apartments online, but for property managers.
>
> [Point to building grid]
>
> You can see all your properties at a glance. Each card shows the building name, location, number of rooms, and rent range.
>
> [Click on filters if available]
>
> The filters here let you narrow down by price range, availability, or specific features. Everything updates instantly - no page reloads, no waiting.
>
> [Click on a building]
>
> When you click on a property, you get the full details: available rooms, amenities, photos, pricing. As a prospective tenant, this is all the information I need to make a decision.
>
> [Highlight room list]
>
> See these rooms? Each one is individually trackable. Status, occupancy, rent - all managed in the system. Which brings me to our forms system - the real powerhouse of HomeWiz."

---

### Minute 4-8: Smart Forms (Building Form Demo)

**[Navigate to: /forms]**

**Script:**
> "This is the Forms Dashboard - your command center for all data entry.
>
> [Point to Demo Mode banner]
>
> First thing you'll notice - we're in Demo Mode. That means no registration required, and everything you create is safe to experiment with.
>
> [Point to statistics]
>
> These numbers are live statistics. Right now we have [X] buildings, [Y] rooms, [Z] available. Watch these numbers - they'll update when we add data.
>
> [Point to form categories]
>
> HomeWiz manages five types of data: Operators, Buildings, Rooms, Tenants, and Leads. That's your entire rental operation in five forms.
>
> Let me show you the Building form - it's the most comprehensive.
>
> [Click on Building form]
>
> [FORM STEP 1 - Location & Basic Details]
>
> See this progress bar at the top? It shows you exactly where you are in the process. We estimate this first step takes about 3 minutes.
>
> Watch what happens when I start typing an address...
>
> [Type partial address: "123 Main"]
>
> See the autocomplete? That's Google Maps integration. No need to type the full address, city, state, zip - it fills everything.
>
> [Select an autocomplete suggestion]
>
> Beautiful. Now let me fill in the building name...
>
> [Type: "Sunset Apartments"]
>
> ...building type...
>
> [Select: "Apartment Complex"]
>
> ...and year built.
>
> [Enter: "2015"]
>
> [Point to estimated time]
>
> Notice this says 3 minutes? We've actually done this in about 30 seconds because of the smart autocomplete and clear layout.
>
> [Click Next]
>
> [FORM STEP 2 - Capacity & Structure]
>
> Step 2: Capacity and structure. Watch these helper tooltips...
>
> [Hover over a field with tooltip]
>
> Every field has contextual help. If you're ever confused, just hover and you'll get examples and guidance.
>
> Let me fill in some numbers...
>
> [Fill: Total Units: 24, Floors: 3, Parking Spaces: 30]
>
> The system validates as you type. If I enter something invalid, it tells me immediately - no surprises at the end.
>
> [Click Next]
>
> [FORM STEP 3 - Amenities & Services]
>
> Step 3: This is where HomeWiz really shines. Instead of typing out a list of amenities, we have visual selectors.
>
> [Click on a few amenities: Wi-Fi, Parking, Gym]
>
> Each click adds an amenity. The icons make it easy to scan and see what's included at a glance.
>
> [Show pet policy dropdown]
>
> And check out these dropdown options - they're descriptive, not technical codes. 'Cats and Small Dogs Only' instead of 'PET_TYPE_2'. Makes sense to humans.
>
> [Select a few more options quickly]
>
> [Scroll down to bottom]
>
> I'm going to skip ahead to the submit button because we're short on time, but you can see we've covered location, capacity, and amenities. In a real scenario, you might add photos here too.
>
> [Click Submit]
>
> [Wait for success message]
>
> And... done! Notice the success message, and watch the statistics at the top...
>
> [Point to statistics if visible, or navigate back to dashboard]
>
> Our building count just increased. Everything is real-time. Let me show you a couple of the other forms quickly.
>
> [Navigate to Room Form - don't fill it out completely]
>
> The Room form follows the same pattern - multi-step, guided, with smart defaults. You select the building first, then configure the room. Pricing, amenities, availability - all tracked.
>
> [Navigate to Tenant Form - don't fill out]
>
> The Tenant form is where you onboard renters. Again, multi-step, but watch this...
>
> [Point to or hover over smart features like lease date auto-calculation]
>
> ...if I enter a lease start date and length, the end date calculates automatically. If I enter the tenant's income, the budget range auto-suggests based on the 30% rule. Smart automation throughout.
>
> These forms are powerful, but they never feel overwhelming because of the step-by-step guidance and smart defaults. That's the HomeWiz difference."

---

### Minute 8-10: AI Chat Assistant

**[Navigate to: /chat]**

**Script:**
> "Now let me show you my favorite feature - the AI Assistant.
>
> This is not a typical chatbot. This is powered by Google's Gemini AI and understands natural language.
>
> Instead of clicking through menus and filters, you just... ask.
>
> Let me show you. I'll type:
>
> [Type: "Show me all available rooms under $1200"]
>
> [Press Enter, wait for response]
>
> [Point to response]
>
> Look at that. Instant response with formatted cards showing each room. Rent, availability, building name - everything I asked for.
>
> Let me try something more complex. I'll ask:
>
> [Type: "What's the current occupancy rate?"]
>
> [Press Enter, wait]
>
> [Point to response with chart]
>
> Not just a number - a visualization. This chart was generated on the fly based on real data in the system.
>
> One more - a business question:
>
> [Type: "Show me financial report for last month"]
>
> [Press Enter, wait]
>
> [Point to response]
>
> Revenue breakdown, expenses, profit margins - all formatted beautifully. This would normally take hours of spreadsheet work. We just got it in 3 seconds.
>
> [Point to response time/token indicator if visible]
>
> See this response time? Under 2 seconds. And it's pulling data from multiple tables, aggregating, calculating, and formatting.
>
> The AI understands context too. I could ask a follow-up like 'How does that compare to last year?' and it knows I'm still talking about the financial report.
>
> This is like having a property management expert available 24/7, instantly answering any question you can think of."

**[If AI is not working:]**

> "Under normal circumstances, this is where I'd demonstrate our AI Assistant powered by Google Gemini. You'd be able to ask questions like 'Show me rooms under $1200' or 'What's the occupancy rate?' and get instant, formatted answers with charts and visualizations.
>
> The AI feature requires our backend server, which isn't running right now, but I have some screenshots I can show you of typical interactions..."
>
> [Show backup screenshots or continue to next section]

---

### Minute 10-11: Data Management & Analytics

**[Navigate to: /admin/data-management]**

**Script:**
> "Let's look at the admin side. This is where you manage all your data after it's entered.
>
> [Point to statistics cards]
>
> Live statistics across the top. Total buildings, rooms, active tenants, active staff.
>
> [Point to tabs]
>
> Everything is organized into tabs. Click Buildings, you see all buildings. Click Rooms, all rooms. Simple.
>
> [Click in search box]
>
> The search here is powerful - it searches across all fields. Type a name, address, room number, anything.
>
> [Type a search term if data available]
>
> Instant filtering. And see these action buttons?
>
> [Point to Edit/Delete buttons]
>
> You can edit any record, view details, or delete. Full CRUD - Create, Read, Update, Delete.
>
> [Point to Export button]
>
> And this Export button lets you download everything as JSON. Your data, your control. No vendor lock-in.
>
> [If time permits, quickly show Analytics dashboard]
>
> There's also an analytics dashboard with charts and visualizations, but in the interest of time, let me wrap up with the key takeaways."

---

### Minute 11-12: Wrap-Up & Q&A

**[Navigate back to: Landing Page or Forms Dashboard]**

**Script:**
> "So, to recap what you've seen today:
>
> 1. **Property Explorer** - Browse and search properties with advanced filters
>
> 2. **Smart Forms** - Multi-step forms with smart defaults, validation, and guidance that make data entry fast and painless
>
> 3. **AI Assistant** - Natural language queries that give you instant answers with charts and visualizations
>
> 4. **Data Management** - Full control to view, edit, export, and analyze all your data
>
> All of this works on desktop, tablet, and mobile. All of it syncs in real-time. And all of it is designed to save you hours every week.
>
> The best part? Setup takes under 20 minutes. You could be managing your first property by the end of this meeting.
>
> [Pause]
>
> Now, I'd love to open it up for questions. What would you like to know more about?"

---

### Q&A Handling Tips

**Anticipated Questions:**

**Q: "How much does this cost?"**
A: [Provide pricing based on your tiers, or:] "We have flexible pricing based on the number of properties you manage. I can send you a detailed pricing sheet after this call, but typically property managers see ROI within the first month from time saved alone."

**Q: "Can it integrate with [Other Tool]?"**
A: "Great question. We currently integrate with Google Maps, Supabase for database management, and Google Gemini for AI. Additional integrations are on our roadmap. Which specific tool were you thinking of? [Listen] That's a popular request - let me make a note and we can explore that."

**Q: "What if I have hundreds of properties?"**
A: "HomeWiz is built to scale. Our largest beta customer manages over 500 units across 15 buildings with no performance issues. We also have bulk import features in development for onboarding large portfolios quickly."

**Q: "Is there a mobile app?"**
A: "The platform is fully responsive, so it works perfectly in your mobile browser. A native iOS and Android app is on our roadmap for Q2."

**Q: "How do I get started?"**
A: "You can start right now! Go to [yourdomain.com], sign up for a free trial, and you'll be in this exact interface in about 2 minutes. Or, if you'd like, I can set up a personalized onboarding session where we migrate your first property together."

---

### Post-Demo Follow-Up

**Within 24 hours, send:**

1. **Thank You Email**
   - Thank them for their time
   - Recap key features they seemed interested in
   - Provide recording/screenshots if available

2. **Resource Package**
   - Link to demo environment
   - Getting started guide (this document)
   - Pricing sheet
   - Case studies/testimonials
   - Video tutorials

3. **Call to Action**
   - Schedule follow-up call
   - Offer personalized onboarding
   - Provide trial signup link
   - Request feedback on demo

---

## Conclusion

HomeWiz is designed to make property management intuitive, efficient, and even enjoyable. Whether you're demoing to stakeholders or onboarding new users, focus on these key messages:

1. **It's easy** - No technical skills required
2. **It's fast** - Setup in minutes, not hours
3. **It's intelligent** - AI-powered insights and automation
4. **It's comprehensive** - Everything you need in one place
5. **It's yours** - Your data, your control, no lock-in

**For Demo Success:**
- Practice the demo flow 2-3 times beforehand
- Prepare backup plans (screenshots, videos)
- Know your audience and customize the focus
- Leave time for questions
- Follow up promptly

**For Onboarding Success:**
- Start with the wizard, let users explore gradually
- Provide contextual help at every step
- Celebrate milestones to encourage progress
- Offer live support when needed
- Gather feedback and iterate

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Maintained By:** HomeWiz Team
**Questions?** Contact: support@homewiz.com

---

*This document is a living guide. Please submit feedback and suggestions to help us improve the demo and onboarding experience.*
