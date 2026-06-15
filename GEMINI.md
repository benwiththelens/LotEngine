# LotEngine Gemini Instructions

This file provides foundational mandates for the LotEngine project. For comprehensive architectural and aesthetic rules, read **AGENTS.md**.

## Critical Workflow Mandates
- **Aesthetic Priority:** Always prioritize the "Rugged Professionalism" aesthetic (sharp 90° corners, 4px borders, zero shadows).
- **Multi-Tenancy:** All routes within `app/(tenant)` must be domain-aware using the `getLink` utility.
- **Security First:** Admin and Capture routes MUST use server-side session validation via `@supabase/ssr`.

## Key Files
- `AGENTS.md`: The project constitution (Rules of Engagement).
- `blueprint.md`: Detailed system architecture and data models.
- `proxy.ts`: Multi-tenant routing and domain rewrite logic.
- `lib/supabase-server.ts`: Secure server-side database access.
