# ⚙️ LotEngine

LotEngine is a lightweight, headless operating system built for independent automotive dealerships. It abstracts away the bloat and "luxury tax" of legacy dealership software, providing a unified and extensible platform for inventory management, marketing automation, and dealership operations.

It is designed to act as a 1:1 digital twin of the physical asphalt.

## 🏗️ System Architecture

The platform utilizes a decoupled, headless architecture to maximize mobile performance on the lot and ensure absolute data portability.

```mermaid
graph TD;
    subgraph Input Layer [The Lot]
        M[Mechanic Mobile UI] -->|Guided Camera & Data| S[(Supabase Postgres)]
        V[VIN Input] -->|Webhook| E[Edge Function]
        E <-->|Fetch Specs| N(NHTSA API)
        E -->|Write Specs| S
    end

    subgraph Distribution Layer [The Web]
        S -->|Static Build via API| W[Next.js Front-End]
        S -->|Ad-Kit Payload| P[Social Syndication / Postiz]
        S -->|Service Webhooks| B[Brevo Email/SMS]
    end
```

## 🛠️ The Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL)
- **Hosting (Phase 1)**: Vercel (Edge) + Supabase Cloud
- **Hosting (Phase 2)**: Self-hosted Docker / Traefik on bare metal

## 🚀 Core Mechanisms

- **Rugged Professionalism Aesthetic**: A high-contrast, flat design system optimized for maximum sunlight readability and industrial performance. (No shadows, sharp 90° corners, pure white/black).
- **Service Kanban Engine**: An industrial-grade 5-stage workflow for managing repairs on the lot (Intake → Diagnostics → Awaiting Parts → In Progress → Ready).
- **Inventory Terminal**: A deep-dive management hub for asset capture, VIN decoding, and multi-tenant repository management.
- **Smart Sync**: Built-in support for offline-first data entry with persistent "SAVED" states.

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