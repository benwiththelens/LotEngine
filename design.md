# Interface & UX Blueprint: LotEngine

## Aesthetic Philosophy: "Rugged Professionalism"
The system avoids looking like a sleek tech startup. The UI is a heavy-duty garage tool—clean, high-contrast, structured, and highly capable without visual bloat. Sharp 90-degree corners, flat 1px or 2px borders, and absolute zero drop shadows characterize the industrial standard.

## 1. Color Palette System

### SaaS Marketing Site
* **Background:** Deep Zinc (`#09090b`).
* **Accent:** Cobalt Blue (`#0055FF`). Used for primary CTAs and technical highlights.

### Tenant Retail & Dashboards
* **Background / Dominant:** Pure White (`#FFFFFF`). Maximizes readability for asphalt operations.
* **Structure:** Solid Black (`#000000`). Maximum contrast for data grids and structural lines.
* **Accent / Action:** Cinnabar Red (`#E34234`). Used for high-leverage elements: primary buttons, active status tags, and Kanban progression.

## 2. Typography
* **Headers & Labels:** `Inter (Bold)`. technical, structured sans-serif. Uppercase for vehicle titles.
* **Data & Numbers:** `JetBrains Mono`. Monospaced structure ensures prices, mileage, and VINs align perfectly in tables and terminals.

## 3. High-Performance Dashboard Experiences

### The Inventory Grid
* A dense table tracking all active inventory and physical locations. Replaces hover-dependent actions with solid tactical buttons for touch-compatibility.

### The Service Kanban Board
* 5-stage workflow (`Intake` -> `Diagnostics` -> `Awaiting Parts` -> `In Progress` -> `Ready`).
* **Lane Color:** Denotes workflow stage.
* **Card Border:** Denotes priority (🔴 Red = Critical, 🟡 Yellow = High, etc).

## 4. The Operator Terminals
Full-screen, mobile-first management hubs designed for interaction on the lot.

### Inventory Terminal
* Optimized for asset capture and VIN decoding.
* Comma-formatted inputs with "Smart Paste" support for technical data entry.

### Service Terminal
* Interactive checklists and technical note capture.
* Visual timeline progress bar for tracking repair lifecycles.
* Smart contextual footer for one-tap status advancement.
