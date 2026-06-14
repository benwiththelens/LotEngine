# Service Bay Hub: Kanban Refinement & Terminal Design

**Goal:** Transform the Service Bay Hub into a tactical, mobile-first workflow engine for small dealerships, implementing a 5-column Kanban board, color-coded priority signals, and a full-screen Service Terminal.

## 1. Database Schema Updates
To support priority tracking and complex state, the `service_orders` table requires new fields:
- `priority` (TEXT): 'critical', 'high', 'standard', 'low'.
- `last_status_change` (TIMESTAMP): For tracking time-in-column.
- `requested_completion` (TIMESTAMP): Deadline for the job.
- `assigned_technician_id` (UUID): References `auth.users` for the assigned mechanic.
- `parts_cost` (NUMERIC): Decimal for total parts cost.
- `labor_hours` (NUMERIC): Decimal for total labor hours.
- `checklists` (JSONB): To store structured checklist steps (e.g., `[{ id: 1, label: "Inspect pads", completed: true }]`).

## 2. Column Strategy (5 Core Stages)
The current "Spatial" and "Kanban" views will be updated to use the 5 essential workflow stages, with explicit column background colors to denote state:
1.  **Intake** (`bg-gray-100 border-gray-300`)
2.  **Diagnostics** (`bg-blue-100 border-blue-300`)
3.  **Awaiting Parts** (`bg-yellow-100 border-yellow-300`)
4.  **In Progress** (`bg-purple-100 border-purple-300`)
5.  **Ready** (`bg-green-100 border-green-300`)

## 3. Priority Signal & Visual Coding
**Visual Hierarchy Rule:** Column background = workflow stage. Card border accent = priority.

- **Intake Form:** Add a mandatory "Priority" dropdown matching the DB constraint ('critical', 'high', 'standard', 'low') and a "Requested Completion" deadline input.
- **Card Design:** Cards will feature a prominent left border color accent based on priority:
    - 🔴 **Red (`border-l-red-500`):** Critical
    - 🟡 **Yellow (`border-l-yellow-500`):** High
    - 🟢 **Green (`border-l-green-500`):** Standard
    - 🔵 **Blue (`border-l-blue-500`):** Low

## 4. The Service Terminal (Full-Screen Modal)
Clicking any active service card opens a full-screen modal mirroring the Fabrik8 design of the Inventory Terminal.

### Layout (Mobile-First)
- **Header:** Back Button, Vehicle/Customer Identity, Priority Badge, Requested Completion Time.
- **Timeline:** A visual horizontal progress bar showing all 5 workflow stages, with the current stage highlighted.
- **Section 1: Details:** Assigned Technician, Start Time, and core vehicle info.
- **Section 2: Checklists:** An expandable array of checkboxes powered by the `checklists` JSONB field.
- **Section 3: Costs & Notes:** Inputs for `parts_cost`, `labor_hours`, and a large text area for `technician_notes`.
- **Quick Actions:** Three buttons located right above the footer: `[⏱ Start Timer]`, `[📷 Add Photo]`, `[💬 Add Note]`.
- **Context-Aware Action Footer:** A sticky bottom bar with a primary button that advances the ticket based on its current column (e.g., "MOVE TO IN PROGRESS").

## 5. Mobile & Tablet Adaptations
- The Terminal will be 100% width/height on screens `< 768px` to maximize space for technicians on the shop floor.
- Large (48px+) touch targets for checklist items and quick actions.

## Phased Approach
This design represents **Phase 1 & 2** of the provided best-practices guide. Future phases (Auto-escalation, Threaded comments, Time Tracking) will build upon this foundation.
