# ⚙️ LotEngine

LotEngine is a lightweight, headless operating system built for independent automotive dealerships. It abstracts away the bloat and "luxury tax" of legacy dealership software, providing a unified and extensible platform for inventory management, marketing automation, and dealership operations.

## 🏗️ System Architecture

The platform utilizes a **true multi-tenant architecture** with domain-based routing, serving both the global SaaS marketing site and individual dealer showrooms from a single optimized instance.

```mermaid
graph TD;
    subgraph Multi-Tenant Boundary [Network Edge]
        P[Dynamic Proxy] -->|lot-engine.com| M[Marketing Site]
        P -->|dealer-a.com| T[Tenant Showroom A]
        P -->|dealer-b.com| T2[Tenant Showroom B]
    end

    subgraph Operations Layer [The Hub]
        M -->|SaaS Signup| S[(Supabase Postgres)]
        T -->|Inventory Sync| S
        T2 -->|Inventory Sync| S
    end
```

## 🛠️ The Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Animations**: Framer Motion (Industrial-grade UI)
- **Database & Auth**: Supabase (PostgreSQL)
- **Infrastructure**: Vercel (Edge) with dynamic Proxy routing

## 🚀 Core Mechanisms

- **Dynamic Multi-Tenancy**: Zero-configuration domain mapping with robust lookup fallbacks for Vercel preview environments.
- **Rugged Professionalism Aesthetic**: A high-contrast, flat design system optimized for maximum sunlight readability and industrial performance. (No shadows, sharp 90° corners, pure white/black).
- **Service Kanban Engine**: An industrial-grade 5-stage workflow for managing repairs on the lot (Intake → Diagnostics → Awaiting Parts → In Progress → Ready).
- **Inventory Terminal**: A deep-dive management hub for asset capture, VIN decoding, and multi-tenant repository management.
- **Smart Sync**: Built-in support for offline-first data entry with persistent "SAVED" states.
... Applied fuzzy match at line 1-32.

## 📱 Mobile-First Operations

LotEngine is designed to be used while walking the asphalt. Every admin interface is optimized for thumb-friendly interaction and tablet hybrid layouts.
- **Admin Layout**: Responsive sidebar that collapses into a bottom navigation bar on phones.
- **Always-Visible Actions**: Tactical hardware-style buttons for high-performance touch interaction.
- **Service Terminal**: Full-screen "native app" experience for mechanics on the shop floor.


To run LotEngine locally, you need Node.js and a Supabase project.

### Clone the repository:

```bash
git clone https://github.com/benwiththelens/LotEngine.git
cd lotengine
```

### Install dependencies:

```bash
npm install
```

### Configure Environment Variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_VIN_API_URL="https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/"
```

### Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

Built for speed, clarity, and zero friction.