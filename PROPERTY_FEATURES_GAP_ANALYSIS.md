# HomeWiz Property Listing Features - Gap Analysis

**Date:** January 2025
**Purpose:** Compare HomeWiz implementation against industry standards for property rental listings

---

## Executive Summary

Based on web research of property rental listing requirements (2025), student housing/coliving best practices, and property management system standards, this document analyzes:

1. **What the Industry Requires** - Essential features for modern property listings
2. **What HomeWiz Has Implemented** - Current feature coverage (✅ Fully Implemented, 🟡 Partially Implemented, ❌ Missing)
3. **Gap Analysis** - Critical missing features
4. **Recommendations** - Priority additions for demo and production

---

## Table of Contents

1. [Essential Property Listing Information](#1-essential-property-listing-information)
2. [Room Assignment & Bed Management](#2-room-assignment--bed-management)
3. [Coliving/Student Housing Specific Features](#3-colivingstudent-housing-specific-features)
4. [Property Management System Capabilities](#4-property-management-system-capabilities)
5. [Gap Analysis Summary](#5-gap-analysis-summary)
6. [Priority Recommendations](#6-priority-recommendations)

---

## 1. Essential Property Listing Information

### Industry Requirements (2025)

According to research from Stessa, Vrbo, and multiple property listing sites:

| Feature Category | Required Information | HomeWiz Status |
|-----------------|---------------------|----------------|
| **Basic Property Info** | | |
| Address | Street, City, State, ZIP | ✅ Fully Implemented |
| Property Type | Apartment, House, Studio, etc. | ✅ `building_type` field |
| Number of Bedrooms | Count | ✅ Via `total_units` |
| Number of Bathrooms | Count | 🟡 Building level only |
| Square Footage | Total area | ✅ `sq_footage` in Room |
| Monthly Rent | Price | ✅ `private_room_rent` |
| | | |
| **Property Description** | | |
| Detailed Description | Min 400 characters | ✅ `description` field |
| High-Quality Photos | Multiple images | ✅ `room_images[]`, `building_images[]` |
| Virtual Tours | 360° or video | ✅ `virtual_tour_url` |
| Headline/Title | 80+ characters | 🟡 Uses building_name (no dedicated headline) |
| | | |
| **Financial Information** | | |
| Security Deposit | Amount | ✅ `deposit_amount` in Tenant |
| Application Fee | Cost | 🟡 Mentioned in Building but not standardized |
| Utility Responsibilities | What's included | ✅ `utilities_included` boolean |
| Additional Fees | Pet fees, parking, etc. | 🟡 `additional_fees` text field only |
| | | |
| **Lease Terms** | | |
| Lease Duration | Months | ✅ `preferred_lease_term` |
| Available From | Date | ✅ `available_from` |
| Minimum Stay | Duration | ✅ `min_lease_term` |
| Flexible Terms | Month-to-month option | ✅ Via `booking_type` |
| | | |
| **Policies** | | |
| Pet Policy | Details & restrictions | ✅ `pet_friendly` + details |
| Smoking Policy | Allowed/Not allowed | 🟡 Not explicitly tracked |
| Guest Policy | Visitor rules | 🟡 Text field in building_rules |
| Parking Policy | Available & cost | ✅ `parking_available` + info |
| | | |
| **Amenities** | | |
| Kitchen | Type and access | ✅ `common_kitchen` |
| Laundry | In-unit or on-site | ✅ `laundry_onsite` |
| Wi-Fi | Speed and inclusion | ✅ `wifi_included` |
| Heating/Cooling | Type | ✅ In room amenities |
| Parking | Spaces & type | ✅ `parking_available` |
| Storage | Available | ✅ `bike_storage`, room storage |
| | | |
| **Location Details** | | |
| Neighborhood Description | Area info | ✅ `neighborhood_description` |
| Nearby Attractions | Points of interest | ✅ `nearby_conveniences_walk` |
| Public Transit | Access info | ✅ `nearby_transportation` |
| | | |
| **Contact Information** | | |
| Property Manager | Name & contact | ✅ Via `operator_id` |
| Viewing/Inquiry Method | How to contact | 🟡 Via operator, not explicit |
| Response Time | Expected | ❌ Not tracked |

### Overall Score: **85% Coverage** ✅

**Strengths:**
- Comprehensive basic information
- Strong amenity tracking
- Good financial fields
- Location details included

**Gaps:**
- No explicit bathroom count per room
- Smoking policy not tracked
- Response time expectations missing
- Fee breakdown could be more detailed

---

## 2. Room Assignment & Bed Management

### Industry Best Practices (Hotel PMS & Coliving)

Based on research from Oracle PMS, hotel management systems, and coliving platforms:

| Feature | Industry Standard | HomeWiz Status | Implementation Details |
|---------|------------------|----------------|----------------------|
| **Room Assignment** | | | |
| Automatic Room Assignment | Based on availability & preferences | ❌ Missing | **Critical Gap** - Manual only |
| Priority Assignment | VIP/loyalty member preference | ❌ Missing | No guest prioritization system |
| Room Blocking | Reserve rooms for events/groups | 🟡 Partial | Can set status to RESERVED but no date range blocking |
| Room Availability Calendar | Visual calendar view | ❌ Missing | Only `available_from` date field |
| Check-in/Check-out Tracking | Date tracking with status updates | ✅ Implemented | `booked_from`, `booked_till` |
| | | | |
| **Bed Management** | | | |
| Bed Count per Room | Number of beds | ✅ Implemented | `bed_count` field |
| Bed Type | Twin/Full/Queen/King | ✅ Implemented | `bed_type` field |
| Bed Size | Dimensions | ✅ Implemented | `bed_size` field |
| Bed Assignment (Individual) | Assign specific beds to tenants | ❌ Missing | **Critical Gap for coliving** |
| Bed Availability Status | Per-bed tracking | ❌ Missing | **Critical Gap for shared rooms** |
| Conventional Bed vs Bunk | Bed style tracking | 🟡 Partial | `bed_type` can specify but no dedicated field |
| Bedding Provided | Included or not | ✅ Implemented | `bedding_provided` boolean |
| Multiple Bed Configurations | Different setups per room | 🟡 Partial | Single bed_type per room |
| | | | |
| **Occupancy Management** | | | |
| Current Occupancy | How many beds occupied | ✅ Implemented | `active_tenants` |
| Maximum Occupancy | Capacity limit | ✅ Implemented | `maximum_people_in_room` |
| Per-Bed Pricing | Different rates per bed | 🟡 Partial | `shared_room_rent_2/3/4` but not per-bed |
| Gender-Specific Assignments | Room/bed gender restrictions | ❌ Missing | **Important for coliving** |
| Age Restrictions | Minimum age per room | ❌ Missing | |
| | | | |
| **Shared Room Features** | | | |
| Private vs Shared Designation | Clear room type | ✅ Implemented | Via `room_type` |
| Shared Room Pricing Tiers | 2-person, 3-person, 4-person | ✅ Implemented | `shared_room_rent_2/3/4` |
| Roommate Matching | Compatibility system | ❌ Missing | **Important for coliving** |
| Privacy Curtains/Dividers | Available or not | ❌ Missing | |
| Personal Storage per Bed | Locker/shelf availability | 🟡 Partial | `room_storage` text field |
| | | | |
| **Assignment Automation** | | | |
| Auto-assign based on preferences | Smart matching | ❌ Missing | **Critical for scale** |
| Waitlist Management | Queue for unavailable rooms | ❌ Missing | |
| Transfer/Room Change Tracking | Move history | ❌ Missing | |
| Emergency Reassignment | Quick moves for issues | ❌ Missing | |

### Overall Score: **45% Coverage** 🟡

**Critical Gaps Identified:**

1. **❌ No Individual Bed Assignment System**
   - Cannot assign Bed A, Bed B in shared rooms
   - Cannot track which bed is occupied
   - No bed-level availability calendar

2. **❌ No Automatic Room Assignment**
   - All assignments are manual
   - No smart matching based on preferences
   - No prioritization system

3. **❌ No Gender/Age Restrictions**
   - Important for coliving and student housing
   - Industry standard for shared spaces

4. **❌ No Roommate Matching**
   - Critical for coliving experience
   - Compatibility scoring missing

5. **❌ No Visual Room/Bed Calendar**
   - Hard to see availability at a glance
   - No date range blocking visualization

---

## 3. Coliving/Student Housing Specific Features

### Industry Standards (Outpost Club, SharedEasy, Coliving.com, Harrington Housing)

| Feature | Industry Standard | HomeWiz Status | Notes |
|---------|------------------|----------------|-------|
| **All-Inclusive Pricing** | | | |
| Rent includes utilities | Standard | ✅ Implemented | `utilities_included` |
| Rent includes Wi-Fi | Standard | ✅ Implemented | `wifi_included` |
| Rent includes cleaning | Standard | ✅ Implemented | Cleaning schedule tracked |
| Transparent fee breakdown | Show what's included | 🟡 Partial | Could be more detailed UI |
| | | | |
| **Flexible Terms** | | | |
| Short-term leases (1-3 months) | Common | ✅ Implemented | Via `booking_type` |
| Month-to-month options | Standard | ✅ Implemented | `MONTH_TO_MONTH` type |
| Academic year leases | For students | ✅ Implemented | Can configure |
| Move-in ready | No wait time | ✅ Implemented | `ready_to_rent` |
| | | | |
| **Community Spaces** | | | |
| Shared Kitchen | Essential | ✅ Implemented | `common_kitchen` |
| Living/Lounge Areas | Community spaces | ✅ Implemented | `common_area` |
| Study/Work Spaces | Quiet areas | ✅ Implemented | `work_study_area` |
| Coworking Spaces | Professional areas | ✅ Implemented | Part of amenities |
| Social Event Spaces | Community building | ✅ Implemented | `social_events` |
| | | | |
| **Furniture & Appliances** | | | |
| Fully Furnished | Standard | ✅ Implemented | `furnished` boolean |
| Bed Included | Essential | ✅ Implemented | Always assumed |
| Desk & Chair | Work setup | ✅ Implemented | `work_desk`, `work_chair` |
| Mini Fridge | In-room option | ✅ Implemented | `mini_fridge` |
| Microwave | Common or in-room | 🟡 Partial | Not explicitly tracked |
| Cookware/Dishes | Kitchen supplies | ❌ Missing | |
| Linens/Towels | Bedding | ✅ Implemented | `bedding_provided` |
| | | | |
| **Technology** | | | |
| High-Speed Wi-Fi | Minimum 100Mbps | 🟡 Partial | Tracked as boolean, not speed |
| Smart Locks | Digital access | 🟡 Partial | `room_access_type` added |
| App-Based Check-in | Mobile access | ❌ Missing | |
| Smart Thermostats | Temperature control | ❌ Missing | |
| | | | |
| **Safety & Security** | | | |
| 24/7 Security | Or secure access | ✅ Implemented | `secure_access` |
| Building Access Control | Entry systems | ✅ Implemented | Via `security_features` |
| Camera Surveillance | Common areas | 🟡 Partial | Part of security_features text |
| Emergency Protocols | Clear procedures | ❌ Missing | |
| Fire Safety Equipment | Required | ❌ Missing | |
| | | | |
| **Services** | | | |
| Regular Cleaning | Schedule | ✅ Implemented | `cleaning_frequency` |
| Maintenance On-Demand | Quick response | 🟡 Partial | Can set MAINTENANCE status |
| 24/7 Support | Contact availability | 🟡 Partial | Via operator contact |
| Package Receiving | Mail handling | ❌ Missing | |
| Laundry Service | Professional cleaning | ❌ Missing | |
| | | | |
| **Community Features** | | | |
| Social Events | Organized activities | ✅ Implemented | `social_events` boolean |
| Community Manager | On-site staff | ✅ Implemented | Via operators |
| Resident Portal | Online access | 🟡 Partial | This platform is the portal |
| Community Guidelines | House rules | ✅ Implemented | `building_rules` |
| | | | |
| **Location Perks** | | | |
| Near Universities | Academic access | 🟡 Partial | Can describe in location fields |
| Near Public Transit | Transportation | ✅ Implemented | `nearby_transportation` |
| Near City Center | Urban location | ✅ Implemented | In description |
| Walkability Score | Pedestrian-friendly | ❌ Missing | Could calculate from API |
| Bike-Friendly | Storage & routes | ✅ Implemented | `bike_storage` |

### Overall Score: **70% Coverage** ✅

**Strengths:**
- Strong community space tracking
- Good furniture & amenity coverage
- Flexible lease terms supported
- Location details included

**Notable Gaps:**
- Internet speed not tracked (just boolean)
- Emergency protocols missing
- Package handling not tracked
- Smart home features limited

---

## 4. Property Management System Capabilities

### Industry Standards (Hotel PMS, Property Management Software)

| Capability | Industry Standard | HomeWiz Status | Notes |
|-----------|------------------|----------------|-------|
| **Real-Time Availability** | | | |
| Live room availability | Instant updates | ✅ Implemented | Status tracked in real-time |
| Synchronized calendar | Across all platforms | 🟡 Partial | Single system, not multi-platform sync |
| Overbooking prevention | Lock on reservation | 🟡 Partial | Status management but no locking |
| Rate management | Dynamic pricing | ❌ Missing | Static pricing only |
| | | | |
| **Automated Assignment** | | | |
| Auto-assign rooms | Based on criteria | ❌ Missing | **Critical Gap** |
| Guest prioritization | VIP/loyalty scoring | ❌ Missing | |
| Preference matching | Room features to requests | ❌ Missing | |
| Load balancing | Even distribution | ❌ Missing | |
| | | | |
| **Visual Management** | | | |
| Color-coded calendar | Status visualization | ❌ Missing | **Important for UX** |
| Drag-and-drop assignment | Easy management | ❌ Missing | |
| Floor plan view | Visual room layout | ❌ Missing | Could enhance UX |
| Occupancy heatmap | Visual density | ❌ Missing | |
| | | | |
| **Housekeeping Integration** | | | |
| Cleaning status tracking | Room-by-room | ✅ Implemented | `last_cleaning_date` |
| Maintenance requests | Track issues | ✅ Implemented | MAINTENANCE status |
| Staff assignment | Who cleans what | 🟡 Partial | Can assign operators |
| Task completion tracking | Mark as done | 🟡 Partial | Status changes only |
| | | | |
| **Check-in/Check-out** | | | |
| Digital check-in | Self-service | ❌ Missing | |
| ID verification | Automated | ❌ Missing | Manual document upload only |
| Payment processing | At check-in | ❌ Missing | Payment tracking only |
| Key/Access card issuance | Digital or physical | 🟡 Partial | `room_access_type` field |
| | | | |
| **Reporting & Analytics** | | | |
| Occupancy reports | Rates & trends | ✅ Implemented | Via AI chat & analytics |
| Revenue reports | Financial tracking | ✅ Implemented | AI-generated reports |
| Maintenance history | Per-room logs | 🟡 Partial | Status only, not full history |
| Guest history | Past stays | ❌ Missing | No historical tracking |
| | | | |
| **Mobile Access** | | | |
| Mobile-responsive | Works on phones | ✅ Implemented | Fully responsive |
| Native app | iOS/Android | ❌ Missing | Web-only currently |
| Push notifications | Real-time alerts | 🟡 Partial | Notification system exists |
| Offline mode | Work without internet | ❌ Missing | |
| | | | |
| **Integration Capabilities** | | | |
| Payment gateways | Stripe, PayPal, etc. | ❌ Missing | **Important for production** |
| Email automation | Confirmations, reminders | 🟡 Partial | Manual emails only |
| SMS notifications | Text alerts | 🟡 Partial | Notification preference tracked |
| Calendar sync | Google, Outlook | 🟡 Partial | `calendar_sync_enabled` tracked |
| Accounting software | QuickBooks, Xero | ❌ Missing | |

### Overall Score: **40% Coverage** 🟡

**Critical PMS Gaps:**

1. **❌ No Automated Room Assignment**
   - Biggest operational gap
   - Manual assignment doesn't scale

2. **❌ No Visual Calendar/Management**
   - Hard to see occupancy at a glance
   - No drag-and-drop functionality

3. **❌ No Payment Integration**
   - Critical for production
   - Currently tracking only, not processing

4. **❌ No Digital Check-in/Check-out**
   - Industry standard for modern PMS
   - Reduces manual workload

5. **❌ Limited Historical Tracking**
   - Can't see past maintenance
   - No guest history

---

## 5. Gap Analysis Summary

### Overall Implementation Status

| Category | Coverage | Grade | Priority |
|----------|----------|-------|----------|
| Essential Property Listing Info | 85% | ✅ Excellent | Low |
| Room Assignment & Bed Management | 45% | 🟡 Needs Work | **Critical** |
| Coliving/Student Housing Features | 70% | ✅ Good | Medium |
| Property Management System | 40% | 🟡 Basic | **High** |
| **Overall Average** | **60%** | 🟡 **Functional but Gaps** | - |

---

### Critical Missing Features (Prioritized)

#### **Priority 1: CRITICAL (Must-Have for Coliving/Student Housing)** 🔴

1. **Individual Bed Assignment System**
   - **Impact:** Cannot properly manage shared rooms
   - **Use Case:** Coliving/student housing with 2-4 person rooms
   - **What's Needed:**
     - Bed-level tracking (Bed A, B, C, D)
     - Per-bed availability status
     - Per-bed pricing
     - Bed assignment to specific tenants
     - Gender restrictions per bed/room

2. **Room Assignment Automation**
   - **Impact:** Manual assignment doesn't scale beyond 50 rooms
   - **Use Case:** Auto-assign rooms based on preferences, availability, and priority
   - **What's Needed:**
     - Preference matching algorithm
     - Priority scoring (date, loyalty, payment)
     - Automatic assignment on application approval
     - Conflict resolution

3. **Visual Availability Calendar**
   - **Impact:** Hard to see which rooms/beds are available when
   - **Use Case:** Property managers need quick visual reference
   - **What's Needed:**
     - Month/week/day view calendar
     - Color-coded by status
     - Date range blocking
     - Drag-and-drop assignment (nice-to-have)

---

#### **Priority 2: HIGH (Important for Demo & Production)** 🟠

4. **Gender & Age Restrictions**
   - **Impact:** Cannot enforce occupancy policies common in coliving
   - **Use Case:** Female-only floors, 18+ buildings, etc.
   - **What's Needed:**
     - Gender restriction field (No Restriction, Female Only, Male Only)
     - Age restriction field (minimum age)
     - Validation on assignment

5. **Roommate Matching System**
   - **Impact:** Poor tenant satisfaction without compatibility
   - **Use Case:** Match compatible roommates in shared rooms
   - **What's Needed:**
     - Lifestyle preferences (sleep schedule, cleanliness, noise)
     - Interest tags
     - Compatibility scoring
     - Suggested matches

6. **Conventional Bed Type Details**
   - **Impact:** Bed type currently tracked but not detailed enough
   - **Use Case:** Tenants need to know exact bed configuration
   - **What's Needed:**
     - Bed style: Conventional vs Bunk vs Loft vs Murphy
     - Per-bed type when multiple beds
     - Bed dimensions (not just size)
     - Mattress type/quality

7. **Detailed Fee Breakdown UI**
   - **Impact:** Tenants want transparency on all costs
   - **Use Case:** Show itemized move-in costs
   - **What's Needed:**
     - First month rent (auto-calculated)
     - Security deposit (from building)
     - Application fee
     - Cleaning fee
     - Pet fee (if applicable)
     - Parking fee (if applicable)
     - Admin fee
     - **Total due at move-in** (auto-summed)

---

#### **Priority 3: MEDIUM (Enhancements for Better UX)** 🟡

8. **Internet Speed Tracking**
   - **What's Needed:** Change `wifi_included` boolean to include speed (Mbps)

9. **Bathroom Count per Room**
   - **What's Needed:** Add `bathroom_count` to Room (not just building total)

10. **Smoking Policy**
    - **What's Needed:** Add smoking_allowed: 'NO_SMOKING' | 'DESIGNATED_AREAS' | 'ALLOWED'

11. **Emergency Protocols**
    - **What's Needed:** Text field for emergency procedures per building

12. **Package Handling**
    - **What's Needed:** Package locker tracking, mail room info

13. **Walkability Score**
    - **What's Needed:** Integrate Walk Score API or similar

14. **Floor Plan Uploads**
    - **What's Needed:** Allow floor plan images per room/building

---

#### **Priority 4: LOW (Nice-to-Have for Future)** 🟢

15. **Payment Integration** (Stripe, PayPal)
16. **Digital Check-in/Check-out**
17. **Smart Home Features** (smart locks, thermostats)
18. **Native Mobile App**
19. **Historical Tracking** (past maintenance, guest stays)
20. **Accounting Software Integration**

---

## 6. Priority Recommendations

### For Tomorrow's Demo 🎯

**Focus on showcasing what you HAVE:**
- Strong property listing information (85% coverage)
- Comprehensive amenity tracking
- Multi-tenant room support (shared room pricing)
- Real-time availability
- AI-powered analytics

**Avoid highlighting gaps:**
- Don't mention "automatic room assignment" unless asked
- If asked about bed assignment, say: "We track bed count and type; individual bed assignment is on the roadmap for shared room management"
- If asked about roommate matching, say: "We support shared rooms with multi-tenant pricing; compatibility matching is a planned feature"

**Demo script talking points:**
- "We support flexible occupancy - from private rooms to 4-person shared spaces"
- "Our pricing model accommodates different occupancy levels automatically"
- "Property managers can track room status in real-time"
- "All essential property information is captured for comprehensive listings"

---

### Quick Wins (Can Add Before Demo) ⚡

These could be added in 30-60 minutes each:

1. **Add "Conventional Bed" Badge**
   - In `RoomForm.tsx`, add a visual indicator if `bed_type` includes "Standard" or "Conventional"
   - Quick UI enhancement

2. **Add "Total Move-In Cost" Calculator**
   - In `TenantForm.tsx`, add a summary card that auto-sums:
     - First month rent
     - Security deposit
     - Application fee
     - Show total prominently

3. **Add Gender Restriction Field**
   - Add to `RoomFormData` type:
     ```typescript
     gender_restriction?: 'NO_RESTRICTION' | 'FEMALE_ONLY' | 'MALE_ONLY'
     ```
   - Add dropdown in Room Form Step 2
   - Shows you're thinking about coliving needs

4. **Add Internet Speed Field**
   - Change `wifi_included: boolean` to:
     ```typescript
     wifi_included: boolean
     internet_speed_mbps?: number
     ```
   - Add number input in Building Form
   - Display as "High-Speed Internet (300 Mbps)" in listings

---

### Post-Demo Development Priorities 🚀

#### Sprint 1 (Week 1-2): Bed Assignment System

**Goal:** Enable individual bed tracking in shared rooms

**Tasks:**
1. Create `beds` table with schema:
   ```sql
   - bed_id (UUID)
   - room_id (FK)
   - bed_identifier (A, B, C, D)
   - bed_type (Conventional, Bunk-Top, Bunk-Bottom, Loft)
   - bed_size (Twin, Full, Queen, King)
   - bed_status (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
   - tenant_id (FK, nullable)
   - assigned_from (date)
   - assigned_to (date)
   ```

2. Create `BedForm` component for adding/editing beds

3. Update `RoomForm` to support "Add Beds" step
   - Auto-create beds based on `bed_count`
   - Allow customization per bed

4. Create `BedAssignment` component
   - Assign specific tenants to specific beds
   - Show bed layout visually

5. Update tenant form to show available beds (not just rooms)

**Estimated Time:** 3-4 days

---

#### Sprint 2 (Week 3-4): Visual Calendar & Room Assignment

**Goal:** Make room/bed availability visual and add auto-assignment

**Tasks:**
1. Install calendar library (e.g., `react-big-calendar`)

2. Create `AvailabilityCalendar` component
   - Month/week view
   - Color-coded by status
   - Click to see room details
   - Filter by building, floor, room type

3. Create date range blocking feature
   - Select date range on calendar
   - Set room to RESERVED for those dates
   - Prevent bookings during blocked periods

4. Build automatic assignment algorithm:
   ```typescript
   function autoAssignRoom(lead: Lead, availableRooms: Room[]): Room {
     // 1. Filter by budget
     // 2. Filter by preferences (room type, amenities)
     // 3. Filter by gender restriction
     // 4. Score each room (preferences match %)
     // 5. Return highest-scoring available room
   }
   ```

5. Add "Auto-Assign" button to Lead form
   - Shows top 3 matches
   - Property manager approves
   - Creates tenant & assigns room automatically

**Estimated Time:** 5-6 days

---

#### Sprint 3 (Week 5-6): Enhanced Listing Features

**Goal:** Close gaps in property listing information

**Tasks:**
1. Add detailed fee breakdown:
   - Create `FeesBreakdown` component
   - Calculate and display all move-in costs
   - Add to tenant onboarding flow

2. Add gender & age restrictions:
   - Add fields to Room form
   - Validate on tenant assignment
   - Display in property listings

3. Enhance bed type details:
   - Add bed configuration options
   - Support multiple bed types per room
   - Visual bed layout diagram

4. Add missing policies:
   - Smoking policy (building level)
   - Guest policy (detailed)
   - Quiet hours (time range)

5. Add internet speed tracking:
   - Migrate `wifi_included` to include speed
   - Display prominently in listings

**Estimated Time:** 4-5 days

---

#### Sprint 4 (Week 7-8): Roommate Matching (Optional)

**Goal:** Add compatibility features for shared rooms

**Tasks:**
1. Create lifestyle preference questionnaire
2. Build compatibility scoring algorithm
3. Show suggested roommates to property managers
4. Allow tenants to see potential roommates (with privacy controls)

**Estimated Time:** 5-7 days

---

## 7. Comparison with Top Competitors

### Outpost Club (Coliving Platform)

| Feature | Outpost Club | HomeWiz |
|---------|-------------|---------|
| Individual bed assignment | ✅ Yes | ❌ No |
| Gender-specific rooms | ✅ Yes | ❌ No |
| Roommate matching | ✅ Yes | ❌ No |
| All-inclusive pricing | ✅ Yes | ✅ Yes |
| Flexible terms | ✅ Yes | ✅ Yes |
| Community events | ✅ Yes | ✅ Yes |
| Mobile app | ✅ Yes | ❌ Web only |
| AI analytics | ❌ No | ✅ Yes (HomeWiz advantage!) |

### SharedEasy (Student Housing)

| Feature | SharedEasy | HomeWiz |
|---------|-----------|---------|
| Bed-level booking | ✅ Yes | ❌ No |
| Visual calendar | ✅ Yes | ❌ No |
| Lease templates | ✅ Yes | 🟡 Partial |
| Payment processing | ✅ Yes | ❌ No |
| Smart forms | 🟡 Basic | ✅ Yes (HomeWiz advantage!) |
| Real-time analytics | 🟡 Basic | ✅ Yes (HomeWiz advantage!) |

### Comparative Advantages of HomeWiz 🏆

**What HomeWiz Does BETTER:**
1. **AI-Powered Chat Assistant** - Natural language property queries (competitors don't have this!)
2. **Smart Forms with Validation** - Best-in-class form UX with auto-fill, smart defaults
3. **Real-Time Analytics** - Comprehensive dashboards with AI-generated insights
4. **Modern UI/UX** - Beautiful, intuitive interface built with latest tech
5. **Comprehensive Data Model** - 170+ fields tracking everything about properties
6. **Property Manager Focus** - Built for operators, not just tenants

**What Competitors Do BETTER:**
1. **Individual Bed Management** - Critical for coliving
2. **Automated Room Assignment** - Saves time at scale
3. **Visual Availability Tools** - Easier to see what's available
4. **Payment Processing** - Integrated payments
5. **Mobile Native Apps** - Better mobile experience
6. **Roommate Matching** - Tenant satisfaction feature

---

## 8. SQL Schema Additions Needed

### For Individual Bed Assignment

```sql
-- Create beds table
CREATE TABLE beds (
    bed_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    bed_identifier VARCHAR(10) NOT NULL, -- A, B, C, D, etc.
    bed_number INTEGER, -- 1, 2, 3, 4
    bed_type VARCHAR(50) NOT NULL, -- Conventional, Bunk-Top, Bunk-Bottom, Loft, Murphy
    bed_size VARCHAR(20), -- Twin, Full, Queen, King
    bed_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    mattress_type VARCHAR(50), -- Memory Foam, Spring, Hybrid, etc.
    bedding_provided BOOLEAN DEFAULT true,

    -- Assignment tracking
    current_tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE SET NULL,
    assigned_from DATE,
    assigned_to DATE,

    -- Features
    has_privacy_curtain BOOLEAN DEFAULT false,
    has_reading_light BOOLEAN DEFAULT false,
    has_shelf BOOLEAN DEFAULT false,
    has_outlet BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(room_id, bed_identifier)
);

-- Create index for lookups
CREATE INDEX idx_beds_room ON beds(room_id);
CREATE INDEX idx_beds_status ON beds(bed_status);
CREATE INDEX idx_beds_tenant ON beds(current_tenant_id);

-- Add bed assignment history
CREATE TABLE bed_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_id UUID NOT NULL REFERENCES beds(bed_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    assigned_from DATE NOT NULL,
    assigned_to DATE,
    assigned_by INTEGER REFERENCES operators(operator_id),
    reason VARCHAR(255), -- NEW_MOVE_IN, ROOM_CHANGE, CONFLICT_RESOLUTION, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bed_assignments_bed ON bed_assignments(bed_id);
CREATE INDEX idx_bed_assignments_tenant ON bed_assignments(tenant_id);
```

### For Room Enhancements

```sql
-- Add missing fields to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS gender_restriction VARCHAR(20) DEFAULT 'NO_RESTRICTION'; -- NO_RESTRICTION, FEMALE_ONLY, MALE_ONLY
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS age_restriction INTEGER; -- Minimum age, e.g., 18
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS smoking_allowed BOOLEAN DEFAULT false;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS bathroom_count INTEGER DEFAULT 1;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS balcony_available BOOLEAN DEFAULT false;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS window_count INTEGER DEFAULT 1;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_orientation VARCHAR(20); -- NORTH, SOUTH, EAST, WEST
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS natural_light_rating INTEGER; -- 1-5 scale

-- Add bed configuration as JSON (alternative to beds table for simpler cases)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS bed_configuration JSONB;
-- Example: {"beds": [{"id": "A", "type": "Conventional", "size": "Queen"}, {"id": "B", "type": "Bunk-Top", "size": "Twin"}]}
```

### For Building Enhancements

```sql
-- Add missing fields to buildings table
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS smoking_policy VARCHAR(50) DEFAULT 'NO_SMOKING'; -- NO_SMOKING, DESIGNATED_AREAS, ALLOWED
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS guest_policy TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS quiet_hours_start TIME;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS quiet_hours_end TIME;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS package_room_available BOOLEAN DEFAULT false;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS package_locker_count INTEGER;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS emergency_protocols TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS fire_safety_equipment TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS walkability_score INTEGER; -- 0-100
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS internet_speed_mbps INTEGER;
```

---

## 9. TypeScript Type Additions Needed

Add to `/src/types/index.ts`:

```typescript
// Bed types for individual bed management
export type BedType = 'Conventional' | 'Bunk-Top' | 'Bunk-Bottom' | 'Loft' | 'Murphy' | 'Sofa-Bed'
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
export type GenderRestriction = 'NO_RESTRICTION' | 'FEMALE_ONLY' | 'MALE_ONLY'
export type SmokingPolicy = 'NO_SMOKING' | 'DESIGNATED_AREAS' | 'ALLOWED'

export interface Bed {
  bed_id: string
  room_id: string
  bed_identifier: string // A, B, C, D
  bed_number: number // 1, 2, 3, 4
  bed_type: BedType
  bed_size: string
  bed_status: BedStatus
  mattress_type?: string
  bedding_provided: boolean

  // Features
  has_privacy_curtain: boolean
  has_reading_light: boolean
  has_shelf: boolean
  has_outlet: boolean

  // Assignment
  current_tenant_id?: string
  assigned_from?: string
  assigned_to?: string

  created_at: string
  updated_at: string
}

export interface BedFormData extends Omit<Bed, 'bed_id' | 'created_at' | 'updated_at'> {
  bed_id?: string
}

export interface BedAssignment {
  assignment_id: string
  bed_id: string
  tenant_id: string
  assigned_from: string
  assigned_to?: string
  assigned_by?: number
  reason?: string
  notes?: string
  created_at: string
}

// Enhanced room data with bed support
export interface RoomWithBeds extends Room {
  beds?: Bed[]
  available_beds_count?: number
  occupied_beds_count?: number
}

// Room enhancement additions
export interface RoomFormData {
  // ... existing fields ...

  // NEW FIELDS
  gender_restriction?: GenderRestriction
  age_restriction?: number
  smoking_allowed?: boolean
  bathroom_count?: number
  balcony_available?: boolean
  window_count?: number
  room_orientation?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
  natural_light_rating?: number // 1-5
  bed_configuration?: BedConfiguration
}

export interface BedConfiguration {
  beds: Array<{
    id: string
    type: BedType
    size: string
  }>
}

// Building enhancement additions
export interface BuildingFormData {
  // ... existing fields ...

  // NEW FIELDS
  smoking_policy?: SmokingPolicy
  guest_policy?: string
  quiet_hours_start?: string
  quiet_hours_end?: string
  package_room_available?: boolean
  package_locker_count?: number
  emergency_protocols?: string
  fire_safety_equipment?: string
  walkability_score?: number
  internet_speed_mbps?: number
}

// Fee breakdown
export interface MoveInCostBreakdown {
  first_month_rent: number
  security_deposit: number
  application_fee: number
  cleaning_fee?: number
  pet_fee?: number
  parking_fee?: number
  admin_fee?: number
  other_fees?: Array<{
    name: string
    amount: number
  }>
  total: number
}
```

---

## 10. UI Components to Build

### Priority Components

1. **`BedSelector.tsx`** - Visual bed selection for room assignment
   ```tsx
   // Shows beds in a room visually (like airplane seat selection)
   // Click to assign tenant to specific bed
   // Color-coded by status
   ```

2. **`AvailabilityCalendar.tsx`** - Calendar view of room availability
   ```tsx
   // Month/week/day view
   // Color-coded by room status
   // Click date to see available rooms
   // Click room to see details
   ```

3. **`MoveInCostSummary.tsx`** - Breakdown of all move-in costs
   ```tsx
   // Auto-calculates from room + building + tenant data
   // Shows itemized list
   // Prominent total
   // Can be printed/emailed
   ```

4. **`RoomAssignmentWizard.tsx`** - Guided room assignment
   ```tsx
   // Step 1: Select building
   // Step 2: Filter rooms by preferences
   // Step 3: See available beds (if shared room)
   // Step 4: Assign and confirm
   ```

5. **`GenderRestrictionBadge.tsx`** - Visual indicator for room restrictions
   ```tsx
   // Shows icon + text for gender restriction
   // Displays on room cards
   // Color-coded (pink, blue, neutral)
   ```

---

## Conclusion

### Current State: **60% Industry Coverage** 🟡

HomeWiz has **strong fundamentals** in property listing information and amenity tracking, but has **critical gaps** in bed-level management and room assignment automation that are essential for coliving/student housing operations.

### Key Strengths ✅
- Comprehensive property data (170+ fields)
- AI-powered analytics (unique competitive advantage)
- Smart forms with excellent UX
- Real-time availability tracking
- Flexible pricing models (shared room support)

### Critical Gaps ❌
1. No individual bed assignment
2. No automatic room assignment
3. No visual calendar view
4. No gender/age restrictions
5. No roommate matching

### Recommended Path Forward 🚀

**For Tomorrow's Demo:**
- Focus on your strengths (AI, smart forms, analytics)
- Acknowledge gaps honestly if asked
- Position missing features as "on the roadmap"

**Post-Demo (Next 8 Weeks):**
- Sprint 1: Build bed assignment system
- Sprint 2: Add visual calendar & auto-assignment
- Sprint 3: Close listing information gaps
- Sprint 4: Add roommate matching (optional)

**Result:** After 8 weeks of focused development, HomeWiz would achieve **85%+ industry coverage** and be competitive with top coliving platforms while maintaining its unique AI advantages.

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Next Review:** After Sprint 1 completion
