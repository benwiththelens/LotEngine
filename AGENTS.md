# LotEngine Project Constitution

This document serves as the absolute source of truth for all AI agents working on the LotEngine codebase. Adherence to these mandates is non-negotiable.

## 1. The "Rugged Professionalism" Aesthetic
LotEngine is a digital twin of the physical asphalt. It is designed for maximum sunlight readability and industrial performance.

- **NO ROUNDED CORNERS:** Use `rounded-none` or omit `rounded` classes entirely. Sharp 90° angles only.
- **HEAVY BORDERS:** Standard components must use `border-4 border-black` or `border-2 border-black`.
- **ZERO SOFT SHADOWS:** Never use `shadow-sm`, `shadow-md`, etc. Use only hard-offset shadows like `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`.
- **BRAND COLORS:** Use CSS variables `--theme-primary` (mapped to `brand-primary`) for all tenant-specific accenting. Default: Cobalt Blue (`#0047AB`).
- **TYPOGRAPHY:** Italic black caps for headings (`font-black uppercase italic tracking-tighter`). Monospace for data readouts (`font-mono`).

## 2. Multi-Tenant Architecture (Next.js 16)
The platform uses a dynamic proxy for domain-based routing.

- **DOMAIN REWRITES:** Requests are rewritten in `proxy.ts` from `hostname/path` to `/(tenant)/[domain]/path`.
- **LINK GENERATION:** Never use hardcoded strings for internal links. Use the `getLink(path)` helper present in most page components to ensure the user stays on the correct domain (Marketing vs. Tenant).
- **ROUTE STRUCTURE:**
  - `(marketing)`: SaaS landing pages.
  - `(tenant)/[domain]/inventory`: Public dealer showrooms.
  - `(tenant)/[domain]/admin`: Secure dealer management tools.

## 3. Security & Authorization
- **SERVER-SIDE AUTH:** Sensitive routes (Admin, Capture Terminal) MUST use `@supabase/ssr` to verify sessions on the server.
- **CLIENT-SIDE FALLBACKS:** Always include a secondary auth check in `useEffect` or `fetch` cycles to handle hydration states.
- **TENANT ISOLATION:** All database queries must include a filter for `tenant_id` to prevent cross-tenant data leakage.

## 4. Hardware & Offline Strategy
LotEngine is a mobile-first field tool.

- **OFFLINE QUEUING:** High-density data (like photos) must be saved to `IndexedDB` (`utils/indexedDB.ts`) first.
- **BACKGROUND SYNC:** Use `utils/syncEngine.ts` to sequentially transmit payloads to Supabase Storage.
- **CAMERA ACCESS:** Use `<input type="file" capture="environment">` for native mobile camera triggering.

---
*Note: This project is NOT the Next.js you know. Heed all deprecation notices and read the blueprint before suggesting major refactors.*
