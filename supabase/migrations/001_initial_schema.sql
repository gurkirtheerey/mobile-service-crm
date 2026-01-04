-- Mobile Service CRM - Initial Schema
-- This migration creates all tables required for the multi-tenant CRM

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial features
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE contact_method AS ENUM ('sms', 'email', 'phone');
CREATE TYPE member_role AS ENUM ('admin', 'technician');
CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);
CREATE TYPE photo_type AS ENUM ('before', 'after', 'issue', 'progress');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Businesses table (multi-tenant root)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  service_area TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business members (users who can access a business)
CREATE TABLE business_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'technician',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Zones table
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assigned_days INTEGER[] NOT NULL DEFAULT '{}',
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius_miles DOUBLE PRECISION NOT NULL DEFAULT 6,
  max_appointments_per_day INTEGER NOT NULL DEFAULT 6,
  avg_service_duration_minutes INTEGER NOT NULL DEFAULT 90,
  travel_buffer_minutes INTEGER NOT NULL DEFAULT 15,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  team_assignment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  pricing_modifiers JSONB,
  add_ons JSONB,
  weather_dependent BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  preferred_contact_method contact_method NOT NULL DEFAULT 'sms',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  geolocation GEOGRAPHY(POINT),
  assigned_zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  custom_fields JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE RESTRICT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  assigned_technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  weather_flagged BOOLEAN NOT NULL DEFAULT false,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  photo_type photo_type NOT NULL,
  file_url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Business lookups
CREATE INDEX idx_businesses_owner ON businesses(owner_id);

-- Member lookups
CREATE INDEX idx_business_members_business ON business_members(business_id);
CREATE INDEX idx_business_members_user ON business_members(user_id);

-- Zone lookups
CREATE INDEX idx_zones_business ON zones(business_id);

-- Service lookups
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_services_active ON services(business_id, active);

-- Client lookups
CREATE INDEX idx_clients_business ON clients(business_id);
CREATE INDEX idx_clients_zone ON clients(assigned_zone_id);
CREATE INDEX idx_clients_geolocation ON clients USING GIST (geolocation);

-- Appointment lookups
CREATE INDEX idx_appointments_business ON appointments(business_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_zone ON appointments(zone_id);
CREATE INDEX idx_appointments_scheduled ON appointments(business_id, scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(business_id, status);

-- Photo lookups
CREATE INDEX idx_photos_appointment ON photos(appointment_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to get the business ID for the current user
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS UUID AS $$
  SELECT business_id
  FROM business_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is a member of a business
CREATE OR REPLACE FUNCTION is_business_member(business_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = business_uuid
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is an admin of a business
CREATE OR REPLACE FUNCTION is_business_admin(business_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = business_uuid
    AND user_id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to auto-update geolocation from lat/lng
CREATE OR REPLACE FUNCTION update_client_geolocation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geolocation := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update geolocation
CREATE TRIGGER client_geolocation_trigger
  BEFORE INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_client_geolocation();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER zones_updated_at
  BEFORE UPDATE ON zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Businesses policies
CREATE POLICY "Users can view businesses they are members of" ON businesses
  FOR SELECT USING (is_business_member(id) OR owner_id = auth.uid());

CREATE POLICY "Owners can update their businesses" ON businesses
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their businesses" ON businesses
  FOR DELETE USING (owner_id = auth.uid());

-- Business members policies
CREATE POLICY "Members can view their business memberships" ON business_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_business_admin(business_id)
  );

CREATE POLICY "Admins can manage business members" ON business_members
  FOR ALL USING (is_business_admin(business_id));

-- Zones policies
CREATE POLICY "Members can view zones" ON zones
  FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Admins can manage zones" ON zones
  FOR ALL USING (is_business_admin(business_id));

-- Services policies
CREATE POLICY "Members can view services" ON services
  FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (is_business_admin(business_id));

-- Clients policies
CREATE POLICY "Members can view clients" ON clients
  FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can create clients" ON clients
  FOR INSERT WITH CHECK (is_business_member(business_id));

CREATE POLICY "Members can update clients" ON clients
  FOR UPDATE USING (is_business_member(business_id));

CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE USING (is_business_admin(business_id));

-- Appointments policies
CREATE POLICY "Members can view appointments" ON appointments
  FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can create appointments" ON appointments
  FOR INSERT WITH CHECK (is_business_member(business_id));

CREATE POLICY "Members can update appointments" ON appointments
  FOR UPDATE USING (is_business_member(business_id));

CREATE POLICY "Admins can delete appointments" ON appointments
  FOR DELETE USING (is_business_admin(business_id));

-- Photos policies
CREATE POLICY "Members can view photos" ON photos
  FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can upload photos" ON photos
  FOR INSERT WITH CHECK (is_business_member(business_id));

CREATE POLICY "Admins can delete photos" ON photos
  FOR DELETE USING (is_business_admin(business_id));

-- =============================================================================
-- SEED DATA FUNCTION (for development)
-- =============================================================================

-- Function to create seed data for a new business
CREATE OR REPLACE FUNCTION seed_business_data(
  p_business_id UUID,
  p_service_type TEXT DEFAULT 'mobile_service'
)
RETURNS void AS $$
BEGIN
  -- Create default zones
  INSERT INTO zones (business_id, name, assigned_days, center_lat, center_lng, radius_miles, color)
  VALUES
    (p_business_id, 'North District', ARRAY[1,3], 38.62, -121.30, 6, '#3B82F6'),
    (p_business_id, 'South District', ARRAY[2,4], 38.52, -121.49, 6, '#10B981'),
    (p_business_id, 'East District', ARRAY[1,4], 38.58, -121.40, 5, '#F59E0B'),
    (p_business_id, 'West District', ARRAY[2,5], 38.58, -121.55, 6, '#8B5CF6'),
    (p_business_id, 'Central District', ARRAY[3,5], 38.58, -121.49, 4, '#EF4444');

  -- Create default services
  INSERT INTO services (business_id, name, description, duration_minutes, base_price, weather_dependent)
  VALUES
    (p_business_id, 'Basic Service', 'Standard service package', 60, 75.00, false),
    (p_business_id, 'Standard Service', 'Comprehensive service with additional care', 90, 125.00, false),
    (p_business_id, 'Premium Service', 'Full premium treatment with all extras', 120, 200.00, true),
    (p_business_id, 'Maintenance Visit', 'Quick maintenance check and touch-up', 30, 45.00, false);
END;
$$ LANGUAGE plpgsql;
