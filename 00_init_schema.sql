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
    CREATE TYPE service_order_status AS ENUM ('intake', 'lift_1', 'lift_2', 'parts_hold', 'ready');
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
    color_primary TEXT DEFAULT '#E34234',
    color_background TEXT DEFAULT '#FFFFFF',
    logo_url TEXT,
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
