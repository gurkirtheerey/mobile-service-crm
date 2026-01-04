# Project Specification: Configurable Mobile Service CRM

## 1. Executive Summary

### Product Vision

A **flexible, zone-optimized CRM** for any mobile service business that prioritizes route efficiency over calendar flexibility. The system provides a core booking and client management platform that adapts to different service types through configuration, not custom code.

### Universal Problem Being Solved

Mobile service businesses (detailing, gardening, cleaning, renovation, pet grooming, etc.) lose 20-40% of their workday to inefficient routing. Traditional booking systems optimize for "first available slot" rather than "geographically sensible slot."

### Core Value Proposition

**One CRM, Any Service.** Configure your service area into geographic zones, set your custom fields, and let the system cluster appointments intelligently. What changes: your industry. What doesn't change: wasted drive time.

### Key Differentiators

1. **Zone-First Scheduling**: Geographic clustering built into the booking flow
2. **Configurable Data Model**: Custom fields for any business without coding
3. **Mobile-First Design**: Built for technicians in the field, not desk workers
4. **Multi-Tenant Ready**: Each business is isolated with custom configuration

---

## 2. Universal User Personas

### Primary Persona: The Mobile Service Operator

**Examples**: House cleaner, mobile detailer, gardener, handyman, pet groomer, mobile mechanic

**Common Pain Points Across All Services**:

- **Inefficient Routing**: Driving across the metro area multiple times per day
- **Scattered Client Data**: Notes on paper, codes in phone, schedules in multiple apps
- **Communication Overhead**: Manual reminder calls/texts, missed appointments
- **Payment Collection**: Chasing invoices, managing cash/checks
- **Service Documentation**: No record of what was done, when, or any issues

**Universal Success Metrics**:

- Reduce daily drive time by 30-50%
- Increase billable hours without working longer days
- Reduce no-shows from 15-20% to <5%
- Collect payment within 48 hours of service
- Access all client info from phone while on-site

### Secondary Persona: The Growing Service Business

**Profile**: Started solo, now managing 2-5 technicians

**Additional Needs**:

- Assign specific zones to specific team members
- Track which technician serviced which client
- Monitor team performance and utilization
- Prevent scheduling conflicts

---

## 3. Core System Architecture

### A. Configurable Multi-Tenant Platform

Each business gets an isolated instance with custom configuration:

```json
{
  "business_id": "biz_mobile_detail_sac",
  "business_name": "Sacramento Mobile Detailing",
  "service_type": "auto_detailing",
  "service_area": "sacramento_region",
  "configuration": {
    "zones": {...},          // Geographic zone setup
    "service_catalog": {...}, // Services offered + pricing
    "custom_fields": {...},   // Business-specific data fields
    "features_enabled": {...}, // Which modules are active
    "integrations": {...}     // Payment, SMS, weather APIs
  }
}
```

**Benefits**:

- One codebase serves multiple business types
- Each business has private data (no cross-contamination)
- Configuration changes don't require code deployment
- Easy to onboard new business types

---

### B. Universal Zone-Based Scheduling System

#### Core Zone Concept (Service-Agnostic)

```json
{
  "zone_id": "zone_north_suburbs",
  "zone_name": "North Suburbs",
  "assigned_days": [1, 3], // Monday, Wednesday
  "service_area": {
    "type": "radius",
    "center": { "lat": 38.7521, "lng": -121.288 },
    "radius_miles": 7
  },
  "capacity": {
    "max_appointments_per_day": 8,
    "average_service_duration_minutes": 90,
    "travel_time_buffer_minutes": 15
  },
  "team_assignment": "team_a" // Optional: for multi-team ops
}
```

#### Booking Flow (Works for Any Service)

```
1. Customer provides service address
   ↓
2. System geocodes address → lat/lng
   ↓
3. Match address to zone (closest center point)
   ↓
4. Display calendar filtered to zone's assigned days
   ↓
5. Customer selects time slot
   ↓
6. System confirms booking + sends automated notification
```

#### Zone Configuration Examples

**Mobile Detailing** (weather-sensitive, outdoor):

- Smaller zones (5-6 miles) for shorter detail jobs
- More days per zone (flexibility for weather cancellations)
- 1.5-hour time blocks

**Landscaping** (equipment-heavy, longer jobs):

- Larger zones (8-10 miles) - already hauling trailer
- Fewer appointments per day (4-hour jobs)
- All-day blocks

**House Cleaning** (predictable, indoor):

- Medium zones (6-8 miles)
- Tighter scheduling (2-hour blocks)
- Recurring appointments (every Tuesday)

---

### C. Configurable Client Data Model

#### Universal Fields (Every Business)

```json
{
  "client_id": "CLT-2024-0892",
  "contact_info": {
    "name": "John Smith",
    "phone": "+1-916-555-0123",
    "email": "john@email.com",
    "preferred_contact_method": "sms"
  },
  "service_address": {
    "street": "1234 Oak Street",
    "city": "Sacramento",
    "state": "CA",
    "zip": "95819",
    "geocode": { "lat": 38.5816, "lng": -121.4944 },
    "assigned_zone": "zone_midtown"
  },
  "billing_address": {
    "same_as_service": true
  },
  "payment_method": {
    "type": "card",
    "stripe_customer_id": "cus_abc123"
  }
}
```

#### Configurable Custom Fields (Per Business Type)

**Example: Mobile Detailing**

```json
"custom_fields": [
  {
    "field_id": "vehicle_info",
    "field_type": "group",
    "fields": [
      {"name": "make", "type": "text"},
      {"name": "model", "type": "text"},
      {"name": "year", "type": "number"},
      {"name": "color", "type": "text"},
      {"name": "license_plate", "type": "text"}
    ]
  },
  {
    "field_id": "parking_location",
    "field_type": "text",
    "description": "Where to find vehicle on property"
  },
  {
    "field_id": "water_access",
    "field_type": "boolean",
    "label": "Water spigot available on-site?"
  },
  {
    "field_id": "shade_available",
    "field_type": "boolean",
    "label": "Covered area for hot days?"
  }
]
```

**Example: House Cleaning**

```json
"custom_fields": [
  {
    "field_id": "property_details",
    "field_type": "group",
    "fields": [
      {"name": "square_footage", "type": "number"},
      {"name": "bedrooms", "type": "number"},
      {"name": "bathrooms", "type": "number"},
      {"name": "floors", "type": "number"}
    ]
  },
  {
    "field_id": "pets",
    "field_type": "repeatable_group",
    "fields": [
      {"name": "pet_name", "type": "text"},
      {"name": "pet_type", "type": "select", "options": ["Dog", "Cat", "Other"]},
      {"name": "location_during_service", "type": "text"}
    ]
  },
  {
    "field_id": "access_method",
    "field_type": "select",
    "options": ["Key", "Lockbox", "Client Home", "Unlocked"]
  }
]
```

**Example: Landscaping**

```json
"custom_fields": [
  {
    "field_id": "lot_size",
    "field_type": "number",
    "unit": "square_feet"
  },
  {
    "field_id": "irrigation_system",
    "field_type": "boolean"
  },
  {
    "field_id": "lawn_type",
    "field_type": "select",
    "options": ["Grass", "Artificial Turf", "Xeriscaping", "Mixed"]
  },
  {
    "field_id": "equipment_storage",
    "field_type": "text",
    "description": "Where to access mower, tools, etc."
  }
]
```

#### Secure Vault (Optional Module)

```json
"secure_fields": {
  "enabled": true,
  "fields": [
    {
      "field_id": "gate_code",
      "field_type": "encrypted_text",
      "access_control": "technician_on_appointment_day"
    },
    {
      "field_id": "alarm_code",
      "field_type": "encrypted_text",
      "access_control": "technician_on_appointment_day"
    },
    {
      "field_id": "wifi_password",
      "field_type": "encrypted_text",
      "access_control": "admin_only"
    }
  ],
  "audit_log": true,
  "encryption": "AES-256"
}
```

---

### D. Modular Feature System

Features can be enabled/disabled per business type:

```json
"features_enabled": {
  "zone_scheduling": true,          // CORE - always on
  "payment_processing": true,        // CORE - always on
  "sms_notifications": true,         // CORE - always on

  "weather_alerts": true,            // Optional - for outdoor services
  "photo_documentation": true,       // Optional - for liability/quality
  "recurring_appointments": true,    // Optional - for regular services
  "team_management": false,          // Optional - for multi-person businesses
  "secure_vault": true,              // Optional - for access codes
  "inventory_tracking": false,       // Optional - for supply management
  "equipment_tracking": false,       // Optional - for tools/vehicles
  "customer_portal": false           // Optional - self-service booking
}
```

#### Weather Alert Module (Configurable)

**Configuration Per Business**:

```json
"weather_alerts": {
  "enabled": true,
  "rules": [
    {
      "condition": "precipitation_probability",
      "threshold": 40,
      "operator": "greater_than",
      "action": "flag_appointment",
      "notification": "Rain forecasted. Reschedule outdoor appointment?"
    },
    {
      "condition": "temperature",
      "threshold": 95,
      "operator": "greater_than",
      "action": "warn_technician",
      "notification": "High heat warning. Ensure adequate water/breaks."
    },
    {
      "condition": "wind_speed",
      "threshold": 15,
      "operator": "greater_than",
      "action": "warn_technician",
      "notification": "Windy conditions. Secure loose items."
    }
  ],
  "check_frequency": "daily",
  "notification_lead_time_hours": 24
}
```

**Use Cases**:

- **Mobile Detailing**: Rain, heat, wind all matter
- **Landscaping**: Rain okay for mowing, not for fertilizing
- **House Cleaning**: Heat warnings only (indoor work)
- **Roof Repair**: Rain + wind critical

#### Photo Documentation Module (Configurable)

**Configuration Per Business**:

```json
"photo_documentation": {
  "enabled": true,
  "photo_types": [
    {
      "type": "before",
      "required": true,
      "timing": "start_of_appointment",
      "description": "Pre-service condition photos"
    },
    {
      "type": "after",
      "required": true,
      "timing": "end_of_appointment",
      "description": "Completed work photos"
    },
    {
      "type": "issue",
      "required": false,
      "timing": "anytime",
      "description": "Document problems or damage"
    },
    {
      "type": "progress",
      "required": false,
      "timing": "anytime",
      "description": "Multi-day project updates"
    }
  ],
  "storage": {
    "max_file_size_mb": 10,
    "auto_compress": true,
    "retention_days": 1095,  // 3 years
    "require_gps_metadata": true
  }
}
```

**Use Cases**:

- **Auto Detailing**: Before/after for liability (scratches, dents)
- **Home Renovation**: Progress photos for customer updates
- **Landscaping**: Before/after for marketing
- **House Cleaning**: Quality assurance

---

### E. Flexible Service Catalog

```json
"service_catalog": [
  {
    "service_id": "svc_exterior_detail",
    "service_name": "Exterior Detail",
    "description": "Hand wash, clay bar, wax",
    "duration_minutes": 90,
    "base_price": 150.00,
    "pricing_modifiers": [
      {
        "modifier_type": "vehicle_size",
        "options": [
          {"label": "Sedan/Coupe", "multiplier": 1.0},
          {"label": "SUV/Truck", "multiplier": 1.3},
          {"label": "Large SUV/Van", "multiplier": 1.5}
        ]
      },
      {
        "modifier_type": "condition",
        "options": [
          {"label": "Good", "multiplier": 1.0},
          {"label": "Fair", "multiplier": 1.2},
          {"label": "Poor", "multiplier": 1.4}
        ]
      }
    ],
    "add_ons": [
      {"id": "addon_engine_bay", "name": "Engine bay detail", "price": 50.00},
      {"id": "addon_headlight", "name": "Headlight restoration", "price": 75.00}
    ],
    "weather_dependent": true,
    "requires_water": true,
    "requires_shade": false
  }
]
```

**Flexible Pricing Models**:

- Flat rate (e.g., $150 per detail)
- Per unit (e.g., $0.50 per square foot for cleaning)
- Hourly (e.g., $85/hour for handyman work)
- Package deals (e.g., monthly lawn care)
- Dynamic modifiers (vehicle size, property size, condition)

---

## 4. Universal Workflows

### Workflow 1: New Client Onboarding

```
1. Admin creates client record
   ↓
2. Enters service address → system geocodes
   ↓
3. System assigns to optimal zone
   ↓
4. Admin completes custom fields (pet info, vehicle details, etc.)
   ↓
5. Optional: Upload photos (property access, equipment location)
   ↓
6. Optional: Add secure codes (gate, alarm)
   ↓
7. Client receives welcome SMS/email with service area confirmation
```

### Workflow 2: Customer Booking (Self-Service or Admin)

```
1. Select service type from catalog
   ↓
2. Enter/confirm service address
   ↓
3. System identifies zone → filters calendar to zone days
   ↓
4. Customer selects available time slot
   ↓
5. System calculates price (base + modifiers)
   ↓
6. Confirm booking
   ↓
7. Automated confirmation SMS/email sent
   ↓
8. If weather-dependent service: scheduled weather check
```

### Workflow 3: Day-of-Service (Technician View)

```
Morning:
├─ Technician opens mobile app
├─ Views daily route (appointments ordered by proximity)
├─ Total drive time estimate: "32 minutes between 5 jobs"
└─ Downloads offline data (in case of poor signal)

At Each Appointment:
├─ Mark "En Route" → customer gets ETA notification
├─ View property details + custom fields
├─ Access secure codes (if enabled)
├─ Start job timer
├─ Take before photos (if required)
├─ Complete service
├─ Take after photos (if required)
├─ Mark "Complete"
└─ Customer immediately gets payment link

End of Day:
├─ Review completed appointments
├─ Total revenue: $720 (5 jobs)
├─ Total drive time: 35 minutes (8% of workday)
└─ Submit any issues/notes to admin
```

### Workflow 4: Payment Collection

```
1. Job marked complete → invoice auto-generated
   ↓
2. SMS sent to customer: "Service complete. Pay now: [link]"
   ↓
3. Customer clicks → Stripe payment page
   ↓
4. Payment processed → receipt emailed
   ↓
5. Funds settle to business account (T+2 days)
   ↓
6. IF payment not received in 24 hours:
   → Automated reminder SMS
   ↓
7. IF payment not received in 72 hours:
   → Admin notification for manual follow-up
```

---

## 5. Technical Architecture

### Stack (Simplified for Flexibility)

#### Frontend

```
Framework: React 18 (or Next.js 14 for SSR)
UI: Tailwind CSS (rapid customization per business)
State: Zustand or React Context (simpler than Redux for this scale)
Mobile: Progressive Web App (PWA) - no app store required
  → Add to home screen on iOS/Android
  → Offline mode for poor signal areas
  → Push notifications
```

#### Backend

```
Option 1 (Recommended): Supabase
  ✅ PostgreSQL + PostGIS (geospatial)
  ✅ Built-in auth + row-level security (multi-tenant)
  ✅ Real-time subscriptions (live updates)
  ✅ Storage for photos
  ✅ Edge functions for serverless logic
  ✅ Cost: Free tier → $25/mo → $599/mo (scales well)

Option 2 (Max Control): Node.js + Express
  → PostgreSQL 15 + PostGIS
  → Redis for caching
  → Custom auth with JWT
  → More work, more flexibility
```

#### Database Schema (Simplified)

```sql
-- Multi-tenant structure
CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  name TEXT,
  config JSONB,  -- All custom settings here
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  contact_info JSONB,
  service_address JSONB,
  geolocation GEOGRAPHY(POINT),  -- PostGIS type
  assigned_zone TEXT,
  custom_fields JSONB,  -- Flexible per business type
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  client_id UUID REFERENCES clients(id),
  service_type TEXT,
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  assigned_technician UUID,
  status TEXT,  -- scheduled, in_progress, completed, cancelled
  zone TEXT,
  weather_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE photos (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  appointment_id UUID REFERENCES appointments(id),
  photo_type TEXT,  -- before, after, issue, progress
  file_url TEXT,
  metadata JSONB,  -- GPS, timestamp, device
  created_at TIMESTAMP DEFAULT NOW()
);

-- Geospatial index for zone queries
CREATE INDEX idx_clients_geo ON clients USING GIST (geolocation);
```

#### External Services

**Required (Always)**:

- **Stripe**: Payment processing
  - Cost: 2.9% + $0.30 per transaction
- **Twilio**: SMS notifications
  - Cost: ~$0.0079 per SMS = $40/mo for 5000 messages
- **Google Maps**: Geocoding + distance calculations
  - Cost: ~$50-100/mo for typical usage

**Optional (Module-Dependent)**:

- **OpenWeatherMap**: Weather alerts
  - Cost: $40/mo for 100k calls OR free tier (1k/day)
- **AWS S3 / Cloudflare R2**: Photo storage
  - Cost: ~$10/mo for 10k photos
- **SendGrid**: Email notifications
  - Cost: Free tier (100/day) or $15/mo

---

## 6. Configuration Templates by Business Type

### Template 1: Mobile Auto Detailing

```json
{
  "business_type": "auto_detailing",
  "zones": {
    "count": 5,
    "radius_miles": 6,
    "appointments_per_day": 6,
    "service_duration": 90
  },
  "custom_fields": ["vehicle_info", "parking_location", "water_access"],
  "features": {
    "weather_alerts": true,
    "photo_documentation": true,
    "secure_vault": false,
    "recurring_appointments": false
  },
  "service_catalog": [
    "Exterior Detail ($150)",
    "Interior Detail ($120)",
    "Full Detail ($250)",
    "Ceramic Coating ($600)"
  ]
}
```

### Template 2: House Cleaning

```json
{
  "business_type": "house_cleaning",
  "zones": {
    "count": 5,
    "radius_miles": 7,
    "appointments_per_day": 5,
    "service_duration": 120
  },
  "custom_fields": ["property_details", "pets", "access_method"],
  "features": {
    "weather_alerts": false,
    "photo_documentation": true,
    "secure_vault": true,
    "recurring_appointments": true
  },
  "service_catalog": [
    "Standard Clean (per sq ft)",
    "Deep Clean (per sq ft)",
    "Move-out Clean (flat rate)"
  ]
}
```

### Template 3: Landscaping

```json
{
  "business_type": "landscaping",
  "zones": {
    "count": 4,
    "radius_miles": 10,
    "appointments_per_day": 3,
    "service_duration": 240
  },
  "custom_fields": ["lot_size", "irrigation_system", "equipment_storage"],
  "features": {
    "weather_alerts": true,
    "photo_documentation": true,
    "secure_vault": false,
    "recurring_appointments": true
  },
  "service_catalog": [
    "Weekly Mowing ($75)",
    "Fertilization ($120)",
    "Aeration ($150)",
    "Full Maintenance Package ($300/mo)"
  ]
}
```

### Template 4: Home Renovation/Handyman

```json
{
  "business_type": "handyman",
  "zones": {
    "count": 3,
    "radius_miles": 12,
    "appointments_per_day": 2,
    "service_duration": 360
  },
  "custom_fields": ["project_type", "materials_provided", "permit_required"],
  "features": {
    "weather_alerts": false,
    "photo_documentation": true,
    "secure_vault": true,
    "recurring_appointments": false
  },
  "service_catalog": [
    "Hourly Rate ($85/hr)",
    "Half Day ($300)",
    "Full Day ($550)"
  ]
}
```

---

## 7. MVP Scope (4-Week Development)

### Week 1: Core Infrastructure

```
✅ Multi-tenant database setup
✅ Basic auth (business admin + technician roles)
✅ Client CRUD (create, read, update, delete)
✅ Geocoding integration (address → lat/lng)
✅ Zone configuration interface
```

### Week 2: Scheduling System

```
✅ Zone assignment algorithm
✅ Calendar component (zone-filtered)
✅ Appointment booking flow
✅ Appointment management (edit, cancel)
✅ Daily route view (technician mobile UI)
```

### Week 3: Communication & Payment

```
✅ Twilio SMS integration
  → Confirmation messages
  → Reminder messages (24h before)
✅ Stripe payment processing
✅ Invoice generation
✅ Payment link distribution
```

### Week 4: Custom Fields & Polish

```
✅ Dynamic custom field system
✅ Field configuration UI for admins
✅ Mobile-responsive refinement
✅ Testing with 2-3 beta businesses (different types)
✅ Bug fixes
```

**MVP Launch Criteria**:

1. ✅ Business can configure zones + custom fields
2. ✅ Customers can book appointments (zone-filtered)
3. ✅ Technicians see daily route on mobile
4. ✅ Automated SMS confirmations
5. ✅ Payment processing works
6. ✅ Works on mobile (PWA)

**Out of Scope for MVP** (Phase 2):

- Weather alerts
- Photo uploads
- Secure vault
- Recurring appointments
- Customer self-service portal
- Team management
- Advanced analytics

---

## 8. Onboarding Flow (New Business Setup)

### Step 1: Business Registration

```
Admin creates account:
├─ Business name
├─ Service type (select from templates OR custom)
├─ Service area (city/region)
├─ Phone number for SMS sender ID
└─ Payment account (Stripe Connect onboarding)
```

### Step 2: Zone Configuration

```
Wizard guides admin:
1. "How many zones do you want?" (3-7 recommended)
2. "What's your service area?" → Draw on map OR enter ZIP codes
3. System suggests optimal zones (equal distribution)
4. Admin adjusts zone boundaries + assigns days
5. Set capacity: "How many jobs per day per zone?"
```

### Step 3: Service Catalog Setup

```
Admin defines services:
├─ Service name
├─ Duration
├─ Base price
├─ Pricing modifiers (optional)
└─ Weather sensitivity (yes/no)

Example:
  Name: "Standard Lawn Mow"
  Duration: 45 minutes
  Base Price: $75
  Modifier: +$25 for lots over 10,000 sq ft
  Weather: No (mow in rain if needed)
```

### Step 4: Custom Fields Configuration

```
Admin selects from field library:
☐ Vehicle information
☐ Property details (sq ft, bedrooms, etc.)
☐ Pet information
☐ Access method (key, lockbox, etc.)
☐ Equipment location
☐ Special instructions
☐ Custom field: ________________

OR start from template:
→ "Mobile Detailing" template (pre-selects vehicle fields)
→ "House Cleaning" template (pre-selects pet + access fields)
```

### Step 5: Feature Activation

```
Enable optional modules:
☐ Weather alerts ($10/mo)
☐ Photo storage (free tier: 1GB, paid: $5/mo per 10GB)
☐ Secure vault for codes ($5/mo)
☐ Customer self-service portal ($15/mo)
☐ Team management ($20/mo)
```

### Step 6: First Client & Booking

```
Guided walkthrough:
1. "Add your first client" → demo form
2. "Create a test appointment" → shows zone filtering in action
3. "Send yourself a test SMS" → see customer experience
4. "Ready to go live? Invite your clients!"
```

**Total Onboarding Time**: 15-20 minutes

---

## 9. Pricing Model (SaaS)

### Tier 1: Solo Operator - $49/month

```
✅ Unlimited clients
✅ Zone-based scheduling
✅ 1 admin user + 1 technician login
✅ SMS notifications (up to 500/mo)
✅ Payment processing (Stripe fees apply)
✅ 1GB photo storage
✅ Mobile web app access
✅ Email support
```

### Tier 2: Small Team - $99/month

```
✅ Everything in Solo
✅ Up to 3 technician logins
✅ Team management features
✅ SMS notifications (up to 1500/mo)
✅ 10GB photo storage
✅ Customer self-service portal
✅ Priority email support
```

### Tier 3: Growing Business - $199/month

```
✅ Everything in Small Team
✅ Up to 10 technician logins
✅ Unlimited SMS
✅ 50GB photo storage
✅ Advanced analytics dashboard
✅ API access (for custom integrations)
✅ Phone + email support
```

### Add-Ons (All Tiers)

```
Weather Alerts: +$10/month
Secure Vault: +$5/month
Additional storage: +$5/10GB/month
Extra technician seats: +$10/user/month
White-label branding: +$50/month
```

**No Commission on Payments**: Businesses keep 100% of revenue (only pay Stripe's standard 2.9% + $0.30)

---

## 10. Success Metrics (6 Months Post-Launch)

### Product Metrics

- **Active Businesses**: 50+ (across 3+ service types)
- **Appointments Processed**: 10,000+
- **Average Drive Time Reduction**: 35% (measured via before/after survey)
- **Payment Collection Rate**: 92% within 48 hours
- **No-Show Rate**: <5% (vs 15-20% industry average without reminders)

### Business Metrics (Company)

- **Monthly Recurring Revenue (MRR)**: $5,000
- **Customer Acquisition Cost (CAC)**: <$150
- **Churn Rate**: <10% monthly
- **Net Revenue Retention**: >100% (upgrades exceed cancellations)

### User Satisfaction

- **NPS (Net Promoter Score)**: >40
- **Mobile App Rating**: 4.5+ stars
- **Support Ticket Volume**: <5 per business per month
- **Feature Request Adoption**: Ship 1-2 top requests per quarter

---

## 11. Development Roadmap

### Phase 1: MVP (Weeks 1-4)

**Goal**: Core CRM with zone scheduling working for 1 service type

```
✅ Multi-tenant architecture
✅ Client management + geocoding
✅ Zone configuration + filtering
✅ Appointment booking
✅ SMS notifications (confirm, remind)
✅ Stripe payment processing
✅ Mobile-responsive UI
✅ Dynamic custom fields
```

**Launch**: Private beta with 3-5 businesses (1 detailer, 1 cleaner, 1 landscaper)

### Phase 2: Enhancement (Weeks 5-8)

**Goal**: Add value-add features based on beta feedback

```
✅ Photo upload module
✅ Weather alert system (configurable rules)
✅ Recurring appointment logic
✅ Improved daily route view (drive time calculations)
✅ Email notifications (in addition to SMS)
✅ Admin analytics dashboard (revenue, utilization)
```

**Launch**: Open beta - accept signups from website

### Phase 3: Scale Features (Weeks 9-16)

**Goal**: Support growing businesses + multi-tenant improvements

```
✅ Team management (assign zones to team members)
✅ Secure vault for access codes
✅ Customer self-service portal
  → View appointment history
  → Reschedule appointments
  → Update payment method
✅ Advanced route optimization (TSP algorithm)
✅ Inventory tracking module (optional)
✅ Mobile app (React Native) for iOS/Android
```

**Launch**: v1.0 - General availability with marketing push

### Phase 4: Enterprise & Expansion (Weeks 17-24)

**Goal**: White-label + API + new verticals

```
✅ White-label branding options
✅ Public API for custom integrations
✅ Franchise/multi-location support
✅ Additional templates (pool service, mobile mechanics, etc.)
✅ Integration marketplace (QuickBooks, Mailchimp, etc.)
✅ Advanced analytics (predictive scheduling, customer lifetime value)
```

---

## 12. Key Technical Decisions

### Why Supabase Over Custom Backend?

```
Pros:
✅ Built-in multi-tenancy (row-level security)
✅ Real-time updates (appointment changes sync across devices)
✅ Faster development (auth + storage + DB in one)
✅ Generous free tier ($0/mo up to 500MB + 50k monthly active users)
✅ Auto-scaling infrastructure

Cons:
⚠️ Less control over DB optimization
⚠️ Potential vendor lock-in (but PostgreSQL is portable)
⚠️ Edge functions limited vs custom Node.js server

Decision: Start with Supabase for MVP speed, migrate to custom if needed at scale
```

### Why PWA Over Native App?

```
Pros:
✅ One codebase for iOS + Android + web
✅ No app store approval delays
✅ Instant updates (no user download required)
✅ Works offline (service workers)
✅ Push notifications supported

Cons:
⚠️ Limited iOS features (no background location tracking)
⚠️ Less "native" feel than React Native
⚠️ Discovery harder (no app store search)

Decision: PWA for MVP, React Native app for Phase 3 if needed
```

### Why Tailwind CSS?

```
Pros:
✅ Rapid prototyping
✅ Easy to customize per business (change color scheme via config)
✅ Mobile-first by default
✅ Small bundle size

Cons:
⚠️ HTML can get verbose

Decision: Use Tailwind + headlessUI for component primitives
```

---

## 13. Risk Mitigation

### Technical Risks

| Risk                                                      | Mitigation                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| Zone algorithm doesn't work across different city layouts | Start with one metro area (Sacramento), expand carefully   |
| Geocoding costs exceed budget                             | Cache geocoded addresses, use free tier (2500/day)         |
| Multi-tenant data leak                                    | Implement row-level security, security audit before launch |
| SMS costs spike                                           | Set per-business limits, offer opt-out for customers       |

### Business Risks

| Risk                                                    | Mitigation                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| Market too niche (not enough mobile service businesses) | Target 10+ service types, not just 2-3                          |
| Businesses reject zone rigidity                         | Implement admin override + "VIP client" exceptions              |
| Churn due to learning curve                             | Comprehensive onboarding wizard + video tutorials               |
| Competitors copy zone concept                           | First-mover advantage + superior UX + multi-service flexibility |

### Go-to-Market Risks

| Risk                                          | Mitigation                                                     |
| --------------------------------------------- | -------------------------------------------------------------- |
| Slow organic growth                           | Content marketing (SEO for "mobile detailing CRM") + local ads |
| High CAC relative to $49 price point          | Focus on word-of-mouth, referral incentives ($50 credit)       |
| Free alternative exists (Google Cal + Sheets) | Emphasize time saved ($1000s/year in drive time reduction)     |

---

## 14. Immediate Next Steps (Week 1)

### Day 1: Project Setup

```bash
# Frontend
npx create-next-app@latest mobile-service-crm --typescript --tailwind
cd mobile-service-crm

# Backend (Supabase)
npm install @supabase/supabase-js
# Create Supabase project at supabase.com
```

### Day 2: Database Schema

```sql
-- Run in Supabase SQL editor
CREATE TABLE businesses (...);
CREATE TABLE clients (...);
CREATE TABLE appointments (...);
CREATE EXTENSION postgis;
-- Define RLS policies
```

### Day 3: Zone Configuration Logic

```typescript
// /lib/zones.ts
interface Zone {
  id: string;
  name: string;
  centerPoint: { lat: number; lng: number };
  radiusMiles: number;
  assignedDays: number[];
}

function assignClientToZone(
  address: { lat: number; lng: number },
  zones: Zone[]
): string {
  // Calculate distances, return closest zone ID
}
```

### Day 4: Basic UI Scaffolding

```
/app
  /dashboard
    page.tsx        // Admin dashboard
  /clients
    page.tsx        // Client list
    /[id]
      page.tsx      // Client detail + edit
  /appointments
    page.tsx        // Calendar view
  /settings
    /zones
      page.tsx      // Zone configuration
```

### Day 5: Geocoding Integration

```typescript
// /lib/geocoding.ts
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number }> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  // Parse response, return coordinates
}
```

---

## Conclusion

This CRM is **purposefully generic** while maintaining a **specific competitive advantage** (zone-based scheduling). The key innovation is making the zone concept work for any mobile service business through configuration, not code.

**What Makes This Different**:

1. **Not Another Jobber**: Jobber/Housecall Pro are feature-bloated. This is lean, focused on routing efficiency.
2. **Not Another Calendly**: Calendly optimizes for "first available." This optimizes for "geographically sensible."
3. **Not A Vertical SaaS**: It's horizontal (works for many services) but with domain expertise (mobile businesses need route optimization).

**The Path to $10k MRR**:

- 50 businesses × $49/mo (Solo tier) = $2,450 MRR
- 30 businesses × $99/mo (Small Team tier) = $2,970 MRR
- 10 businesses × $199/mo (Growing tier) = $1,990 MRR
- Add-ons + overages = ~$1,500 MRR
- **Total: $8,910 MRR in first 6-12 months** (realistic if positioned well)

**Start Building**: The 4-week MVP is achievable. Focus on making the zone scheduler delightful, nail the onboarding wizard, and get 3 real businesses using it before building anything else.

Let's build this. 🚀

---

## 15. Implementation Status (Current State)

### Completed Features

The following has been implemented and is functional:

#### Backend Infrastructure
- ✅ Supabase integration with SSR support
- ✅ Multi-tenant database schema with RLS policies
- ✅ Authentication (signup, login, logout)
- ✅ Server actions for all CRUD operations
- ✅ Zone assignment algorithm (Haversine formula)
- ✅ Geocoding utilities (mock + Google Maps fallback)

#### Database Tables
All tables created with Row Level Security:
- `businesses` - Multi-tenant business accounts
- `business_members` - User roles (admin/technician)
- `zones` - Geographic service zones
- `services` - Service catalog with pricing
- `clients` - Customer records with geocoding
- `appointments` - Bookings with status tracking
- `photos` - Service documentation (schema only)

#### API Routes
- `/api/webhooks/stripe` - Payment event handling
- `/api/cron/weather-check` - Flag weather-sensitive appointments
- `/api/cron/send-reminders` - SMS reminder notifications

### File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── api/
│   │   ├── cron/
│   │   │   ├── send-reminders/route.ts
│   │   │   └── weather-check/route.ts
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── appointments/
│   │   ├── page.tsx
│   │   └── appointments-calendar.tsx
│   ├── clients/
│   │   ├── page.tsx
│   │   ├── clients-table.tsx
│   │   └── [id]/page.tsx
│   ├── dashboard/page.tsx
│   └── settings/zones/page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── actions/
│   │   ├── appointments.ts
│   │   ├── auth.ts
│   │   ├── clients.ts
│   │   ├── dashboard.ts
│   │   ├── services.ts
│   │   └── zones.ts
│   ├── supabase/
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server + admin client
│   │   └── middleware.ts  # Session refresh
│   └── geocoding.ts
├── middleware.ts
└── types/
    ├── database.ts        # Supabase types
    └── index.ts           # App types
```

### Environment Setup

Required environment variables (`.env.local`):

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Maps (optional - has mock fallback)
GOOGLE_MAPS_API_KEY=your-key

# Stripe (for payments - not yet integrated in UI)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio (for SMS - not yet integrated)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Database Setup

Run the migration in Supabase SQL Editor:
```
supabase/migrations/001_initial_schema.sql
```

### Key Implementation Details

#### Two Supabase Clients
```typescript
// Regular client - respects RLS, for authenticated operations
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Admin client - bypasses RLS, for system operations
import { createAdminClient } from '@/lib/supabase/server';
const admin = createAdminClient();
```

#### Zone Assignment Algorithm
Uses Haversine formula to calculate distance between client address and zone centers:
```typescript
// src/lib/actions/zones.ts
export async function assignToZone(lat: number, lng: number)
```

#### Type Safety
All database operations use generated types:
```typescript
import type { DbClient, DbZone, InsertTables, UpdateTables } from '@/types/database';
```

### What's NOT Yet Implemented

These features exist in the spec but need frontend UI:
- [ ] Zone creation/editing UI (form exists, needs map integration)
- [ ] Client creation/editing forms
- [ ] Appointment creation flow
- [ ] Service catalog management UI
- [ ] Photo uploads
- [ ] SMS notifications (Twilio integration ready, no UI)
- [ ] Payment processing (Stripe webhook ready, no checkout UI)
- [ ] Weather alerts (cron ready, no configuration UI)
- [ ] Recurring appointments
- [ ] Team management
- [ ] Customer self-service portal

### Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

### Common Issues

1. **RLS Policy Errors**: Use `createAdminClient()` for operations that need to bypass RLS (e.g., signup flow)

2. **Type 'never' Errors**: Ensure `src/types/database.ts` has `Relationships` field for each table

3. **Environment Variables**: Must restart dev server after changing `.env.local`
