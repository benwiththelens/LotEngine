# Platform Architecture Blueprint: LotEngine

## System Overview
LotEngine is a lightweight, multi-tenant "Headless Dealership" operating platform. The engine abstracts away database and deployment complexity, allowing independent automotive lots to manage a physical "digital twin" of their sales inventory, operate a zero-friction service bay, enforce standardized asset capture, and automate local organic marketing.

## 1. Infrastructure & Stack
* **Database & Auth:** Supabase Cloud (PostgreSQL).
* **Frontend:** Next.js 16 (App Router) + React 19.
* **Middleware:** Dynamic Proxy (`proxy.ts`) for multi-tenant domain routing.
* **Email:** Resend (Server-side notifications).
* **Styling:** Tailwind CSS 4 + Framer Motion (Industrial animations).

## 2. Postgres Database Schema (Multi-Tenant Engine)

### `tenants` Table (The Dealership Profiles)
* `id` (uuid, primary key)
* `domain` (text, unique) -> e.g., 'dealer-a.com'
* `business_name` (text)
* `color_primary` (text) -> Default: `#E34234` (Red)
* `color_background` (text) -> Default: `#FFFFFF` (White)
* `logo_url` (text)
* `created_at` (timestamptz)

### `vehicles` Table (The Unified Hardware Repository)
* `id` (uuid, primary key)
* `tenant_id` (uuid, foreign key)
* `vin` (text, unique)
* `is_inventory` (boolean)
* `year`, `make`, `model`, `trim`, `engine`, `drivetrain` (auto-populated)
* `mileage` (integer)
* `price` (numeric) -> Retail asking price
* `acquisition_cost` (numeric) -> Cost to dealership
* `status` (text) -> `draft`, `available`, `pending`, `sold`
* `key_location`, `lot_location` (text)
* `public_description` (text)
* `processed_by` (uuid)
* `created_at` (timestamptz)

### `service_orders` Table (The Service Bay Hub)
* `id` (uuid, primary key)
* `tenant_id` (uuid, foreign key)
* `vehicle_id` (uuid, foreign key)
* `customer_name`, `customer_phone` (text)
* `status` (text) -> `intake`, `diagnostics`, `parts_hold`, `in_progress`, `ready`
* `priority` (text) -> `critical`, `high`, `standard`, `low`
* `assigned_technician_id` (uuid)
* `requested_completion` (timestamptz)
* `checklists` (jsonb)
* `technician_notes` (text)
* `parts_cost`, `labor_hours` (numeric)
* `is_internal_recon` (boolean)
* `created_at` (timestamptz)

### `vehicle_images` Table
* `id` (uuid)
* `vehicle_id` (uuid, foreign key -> vehicles.id)
* `storage_url` (text) -> *Supabase Storage Bucket URL*
* `is_primary` (boolean)
* `sort_order` (integer)

### `leads` Table
* `id` (uuid)
* `tenant_id` (uuid, foreign key -> tenants.id)
* `vehicle_id` (uuid, foreign key -> vehicles.id)
* `customer_name` (text)
* `customer_phone` (text)
* `status` (text) -> `new`, `contacted`, `dead`

## 3. Core Mechanisms & Workflows

### Multi-Tenant Proxy Routing
1. Next.js `proxy.ts` intercepts requests at the network edge.
2. If `hostname` matches `lot-engine.com`, serve `(marketing)` route.
3. Otherwise, rewrite request to `/(tenant)/[domain]` to serve dealership showroom.
4. Robust fallback: If `[domain]` has no database match, default to first available tenant.

### The VIN-Decode Pipeline
1. User inputs VIN on the mobile admin UI.
2. Postgres Database Webhook fires.
3. Supabase Edge Function hits the free NHTSA VIN API (`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{VIN}?format=json`).
4. Edge Function writes the decoded structural data back to the `vehicles` row instantly.

### Hybrid Authentication Gate
1. **Access Key:** Standard password-based entry for high-speed local use.
2. **Secure Link:** Passwordless Magic Link (OTP) for failsafe asphalt entry via mobile email.

### Zero-Click Service Workflow
* **Kanban Grid:** Drag-and-drop state management with visual priority coding.
* **Service Terminal:** Full-screen management hub for interactive checklists and technical note capture.
* **Smart Sync:** Auto-saving data entry with persistent "SAVED" states and offline-ready queuing.

### The Zero-Tax Syndication Engine
* **Ad Kit Generator:** Compiles database specs into an emoji-optimized text block.
* **Media Packager:** Generates a 1-click `.zip` downscale compression package of images for manual Craigslist/Facebook posting.
* **Social Scheduling:** Exports payloads to Publer (Free Tier) or self-hosted Postiz container on Cato.
* **Local Email Engine:** Captures leads into Brevo (Free Tier) for automated weekly "Fresh on the Lot" and "Service Reminder" SMS/Email triggers based on Kanban movement.
