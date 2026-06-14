# Changelog

All notable changes to the LotEngine project will be documented in this file.

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
