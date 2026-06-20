-- LotEngine Supabase Database Schema
-- Generated from Platform Architecture Blueprint

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Types / Enums
DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('draft', 'available', 'pending', 'sold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_order_status AS ENUM ('intake', 'diagnostics', 'parts_hold', 'in_progress', 'ready');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'dead');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tables

-- Tenants (Dealership Profiles)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    color_primary TEXT DEFAULT '#0047AB',
    color_background TEXT DEFAULT '#FFFFFF',
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    hours JSONB,
    reviews JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicles (Unified Hardware Repository)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vin TEXT UNIQUE NOT NULL,
    is_inventory BOOLEAN DEFAULT TRUE,
    year INTEGER,
    make TEXT,
    model TEXT,
    trim TEXT,
    engine TEXT,
    drivetrain TEXT,
    mileage INTEGER,
    price NUMERIC(12, 2),
    acquisition_cost NUMERIC(12, 2),
    status vehicle_status DEFAULT 'draft',
    key_location TEXT,
    lot_location TEXT,
    public_description TEXT,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Service Orders (The Service Bay Hub)
CREATE TABLE IF NOT EXISTS service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    status service_order_status DEFAULT 'intake',
    priority TEXT CHECK (priority IN ('critical', 'high', 'standard', 'low')) DEFAULT 'standard',
    last_status_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_completion TIMESTAMP WITH TIME ZONE,
    assigned_technician_id UUID REFERENCES auth.users(id),
    parts_cost NUMERIC(10, 2) DEFAULT 0.00,
    labor_hours NUMERIC(5, 2) DEFAULT 0.00,
    labor_cost NUMERIC(12, 2) DEFAULT 0.00,
    checklists JSONB DEFAULT '[]'::jsonb,
    technician_notes TEXT DEFAULT '',
    mechanic_notes TEXT,
    is_internal_recon BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicle Images
CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    status lead_status DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_service_orders_tenant ON service_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_vehicle ON service_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies

-- tenants
CREATE POLICY "Allow public read access to tenants" ON tenants 
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert/update/delete to tenants" ON tenants 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- vehicles
CREATE POLICY "Allow public read access to available vehicles" ON vehicles 
    FOR SELECT USING (status = 'available' OR auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to vehicles" ON vehicles 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- service_orders
CREATE POLICY "Allow authenticated users full access to service_orders" ON service_orders 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- vehicle_images
CREATE POLICY "Allow public read access to vehicle_images" ON vehicle_images 
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access to vehicle_images" ON vehicle_images 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- leads
CREATE POLICY "Allow authenticated users full access to leads" ON leads 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert to leads" ON leads 
    FOR INSERT WITH CHECK (true);

