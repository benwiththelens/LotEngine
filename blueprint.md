# Platform Architecture Blueprint: LotEngine

## System Overview
LotEngine is a lightweight, multi-tenant "Headless Dealership" operating platform. The engine abstracts away database and deployment complexity, allowing independent automotive lots to manage a physical "digital twin" of their sales inventory, operate a zero-friction service bay, enforce standardized asset capture, and automate local organic marketing.

## 1. Infrastructure & Stack
* **Database & Auth:** Supabase Cloud (PostgreSQL + Row-Level Security).
* **Frontend:** Next.js 16 (App Router) + React 19.
* **Middleware:** `middleware.ts` — Next.js standard edge middleware for multi-tenant domain routing.
* **Email:** Resend (Server-side notifications).
* **Styling:** Tailwind CSS 4 + Framer Motion (Industrial animations).
* **Deployment:** Vercel (Edge network).

## 2. Shared Utilities (`lib/`)

| File | Purpose |
|------|---------|
| `lib/getLink.ts` | Domain-aware link builder. Accepts `(path, domain, isMarketingDomain)`. Used across all tenant route files. |
| `lib/supabase-browser.ts` | Browser Supabase client factory (`createClient()`). Used in all `"use client"` components. |
| `lib/supabase-server.ts` | Server Supabase client factory using `@supabase/ssr` cookies. Used in Server Components and admin layout guards. |
| `lib/sync-engine.ts` | LocalStorage-based offline action queue with fault-tolerant retry (failed items retained). |
| `lib/vin-service.ts` | NHTSA VIN decode wrapper with null guards on engine/cylinder fields. |
| `lib/plate-service.ts` | License plate lookup utility. No PII logging. |

## 3. Postgres Database Schema (Multi-Tenant Engine)

### `tenants` Table (The Dealership Profiles)
* `id` (uuid, primary key)
* `domain` (text, unique) -> e.g., 'dealer-a.com'
* `business_name` (text)
* `color_primary` (text) -> Default: `#0047AB` (Cobalt Blue)
* `color_background` (text) -> Default: `#FFFFFF` (White)
* `logo_url` (text)
* `address` (text)
* `phone` (text)
* `hours` (jsonb)
* `reviews` (jsonb)
* `created_at` (timestamptz)

### `user_tenant_roles` Table (Authorization Junction)
* `user_id` (uuid, foreign key -> auth.users)
* `tenant_id` (uuid, foreign key -> tenants.id)
* `role` (text) -> e.g., `admin`, `technician`
* Primary Key: `(user_id, tenant_id)`
* **All RLS policies on operational tables enforce tenant isolation via this table.**

### `vehicles` Table (The Unified Hardware Repository)
* `id` (uuid, primary key)
* `tenant_id` (uuid, foreign key)
* `vin` (text, unique)
* `is_inventory` (boolean)
* `year`, `make`, `model`, `trim`, `engine`, `drivetrain` (auto-populated via NHTSA)
* `mileage` (integer)
* `price` (numeric) -> Retail asking price
* `acquisition_cost` (numeric) -> Cost to dealership
* `status` (text) -> `draft`, `available`, `pending`, `sold`
* `key_location`, `lot_location` (text)
* `public_description` (text)
* `exterior_color`, `interior_color` (text)
* `features` (text[])
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

## 4. Security Model

### Row-Level Security (RLS)
All operational tables (`vehicles`, `service_orders`, `vehicle_images`, `leads`) enforce tenant isolation through RLS policies that join against `user_tenant_roles`. A user can only read or write rows that belong to a tenant they are explicitly assigned to.

```sql
-- Example: vehicles SELECT policy
CREATE POLICY "tenant_select" ON vehicles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenant_roles WHERE user_id = auth.uid()
    )
  );
```

### Server-Side Auth Guard
The admin layout (`app/(tenant)/[domain]/admin/layout.tsx`) performs a server-side session check via `@supabase/ssr` before rendering any admin child route. Unauthenticated requests are redirected to `/login`.

### Login Open Redirect Protection
The `?next=` redirect parameter on the login page is validated against an allowlist (`/admin`, `/inventory`, `/`). Any external URL or unrecognized path is rejected.

## 5. Core Mechanisms & Workflows

### Multi-Tenant Middleware Routing
1. Next.js `middleware.ts` intercepts requests at the network edge.
2. If `hostname` matches `lot-engine.com` or `localhost:3000`, serve `(marketing)` route for non-tenant paths.
3. Otherwise, rewrite request to `/(tenant)/[domain]` to serve dealership showroom.
4. Robust fallback: If `[domain]` has no database match, default to first available tenant.

### The `getLink()` Contract
All internal navigation across tenant routes must use the shared `getLink` utility from `lib/getLink.ts`. Direct hardcoded strings are forbidden per `AGENTS.md`.

```ts
// lib/getLink.ts
export function getLink(path: string, domain: string, isMarketingDomain: boolean): string {
  if (!isMarketingDomain) return path;
  return `/${domain}${path === '/' ? '' : path}`;
}
```

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

### The Photography Engine (Offline-First)
1. Technician opens the mobile Capture Module in `intake` or `retail` mode.
2. The UI guides them through a strict sequence of 5 or 18 mandatory angles.
3. Photos are captured using native device hardware (`<input capture="environment">`).
4. **Offline Queue:** Heavy binary data is stored instantly in IndexedDB using the `photo-queue` wrapper.
5. **Background Sync:** The `syncEngine` sequential uploader transmits the queue to Supabase Storage once connectivity returns. Failed items are retained and retried — no data is silently dropped.

### The Zero-Tax Syndication Engine
* **Ad Kit Generator:** Compiles database specs into an emoji-optimized text block.
* **Media Packager:** Generates a 1-click `.zip` downscale compression package of images for manual Craigslist/Facebook posting.
* **Social Scheduling:** Exports payloads to Publer (Free Tier) or self-hosted Postiz container on Cato.
* **Local Email Engine:** Captures leads into Brevo (Free Tier) for automated weekly "Fresh on the Lot" and "Service Reminder" SMS/Email triggers based on Kanban movement.
