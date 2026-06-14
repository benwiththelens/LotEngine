# Changelog

All notable changes to the LotEngine project will be documented in this file.

## [0.4.0] - 2026-06-14

### Added
- **Dynamic Tenant Branding:** Implemented CSS variable injection (`--theme-primary`) to support custom dealership brand colors across the platform. Fallbacks to Cobalt Blue (`#0047AB`).
- **Offline Photo Engine:** Built a robust IndexedDB wrapper to queue vehicle images locally when deep in the lot with zero connectivity.
- **Background Sync Engine:** Added a sequential, fault-tolerant background upload utility to transmit queued photos to Supabase Storage once connectivity is restored.
- **Guided Capture Terminal:** Implemented a mobile-first, high-density photography module supporting 5-shot Intake and 18-shot Retail protocols.
- **Auto-Advance Workflow:** The Capture Terminal now automatically expands and smooth-scrolls to the next required shot immediately after an image is taken.

### Fixed
- **Hydration Mismatches:** Refactored `AdminLayout` into explicit Server and Client components to ensure `hostname` dependent rendering executes consistently across SSR and CSR.
- **Persistent Red CSS Issues:** Resolved a Tailwind compilation quirk by splitting dynamic CSS variable shadows into standard offset utilities paired with a configured `shadow-brand-primary` color class.
- **Schema Alignment:** Synchronized the `00_init_schema.sql` file to include the `checklists` column and the new kanban `service_order_status` enums.
- **Inventory Payload Errors:** Updated the payload sanitizer to correctly strip out `age` and `audit` UI computed fields before hitting the database.

### Changed
- **Unified Labor Tracking:** Merged the visual timer readout and the manual labor input field in the Service Terminal into a single source of truth.
- **Terminal Headers:** Removed redundant sync status labels from terminal headers in favor of a prominent "Asset Identifier" (VIN) display.
- **Brand Identity Swap:** Shifted the platform's default fallback identity from industrial red to Cobalt Blue (`#0047AB`).

---

## [0.3.0] - 2026-06-13

### Added
- **Multi-Tenant Architecture:** Restructured application into `(tenant)` and `(marketing)` route groups with dynamic domain-based routing.
- **LotEngine Marketing Site:** Built a high-fidelity, dark-industrial landing page for the SaaS platform featuring `framer-motion` animations and a technical "3 Pillars" grid.
- **Hybrid Login Gate:** Implemented a failsafe authentication UI supporting both high-speed Access Keys (Passwords) and asphalt-ready Secure Links (Magic Link OTP).
- **Terminal Demo Request:** Replaced standard contact forms with a high-fidelity input terminal integrated with the Resend email protocol.
- **System Specifications Page:** Created a technical deep-dive route (`/specs`) mirroring system architecture and tech stack details.
- **Dynamic Proxy Infrastructure:** Implemented `proxy.ts` (Next.js 16) to handle intelligent domain rewrites, supporting both shared subpaths and custom dealer domains.
- **Official Brand Assets:** Fully integrated the new official LotEngine logo (Blue/White/Transparent) across the navigation, sidebars, and footers.
- **Finalized Favicon Pack (v3):** Integrated optimized, space-efficient brand icons for all platforms.

### Fixed
- **Domain-Aware Navigation:** Implemented a robust `getLink` helper using hostname detection to fix the "Exit" button and internal navigation across shared domains.
- **TypeScript & Build:** Resolved strict type check issues related to dynamic route parameters and null-safe numeric fields.
- **Middleware Migration:** Successfully migrated from deprecated `middleware.ts` to the new `proxy.ts` Next.js convention.

### Changed
- **Folder Restructuring:** Moved all dealership retail and admin logic into dynamic `[domain]` routes for true multi-tenant isolation.
- **Navigation Cleanup:** Hidden the "Leads" feature from the admin interface until Phase 2 development.

---

## [0.2.0] - 2026-06-13

### Added
- **Fresh on the Lot (Public):** Integrated a featured inventory grid directly onto the homepage with a high-conversion "Rugged Professionalism" aesthetic.
- **Service Terminal (Admin):** Implemented a full-screen, mobile-first management hub for service orders featuring interactive checklists, a visual progress timeline, and cost/labor tracking.
- **Acquisition Cost Tracking:** Added a dedicated `acquisition_cost` field to the vehicle repository and admin UI.
- **Smart Formatting:** Implemented comma-separated formatting for price and odometer inputs with support for "smart paste."
- **Vercel Analytics:** Integrated `@vercel/analytics` for performance and usage tracking.
- **Dynamic L Favicon:** Added an automatically generated high-fidelity "L" icon for browser tabs.

### Fixed
- **Vercel Deployment:** Implemented a robust tenant lookup fallback mechanism to resolve "Tenant Not Found" errors on preview and new domains.
- **Tablet Optimization:** Refined the Admin Dashboard with a "Hybrid Layout" that maintains the sidebar and table while scaling spacing for mid-sized screens.
- **Mobile Usability:** Replaced hover-dependent table actions with solid, always-visible tactical buttons for touch devices.
- **Database Schema Sync:** Added missing `service_order_status` enum values (`diagnostics`, `in_progress`) to match the new Kanban workflow.
- **Branding Consistency:** Forced the site title to "LotEngine" to eliminate legacy dealership placeholders in browser tabs.

### Changed
- **Aesthetic Pivot:** Shifted from the shadow-heavy "Fabrik8" look to the "Rugged Professionalism" standard: pure white backgrounds, 90-degree sharp corners, flat borders, and zero drop shadows.
- **Service Bay simplification:** Removed the legacy "Spatial" view to focus exclusively on the high-performance Kanban Grid.
- **Kanban Stages:** Standardized the service workflow into 5 core stages: Intake, Diagnostics, Awaiting Parts, In Progress, and Ready.

---

## [0.1.0] - 2026-06-12

### Initial Release
- Initial commit of the headless dealership OS.
- Core inventory repository with VIN/Plate decoding.
- Public Showroom and Admin Dashboard foundations.
- Supabase schema for multi-tenant dealership management.
