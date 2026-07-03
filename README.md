# GXO Operations Monorepo

This repository contains the centralized code for the GXO Load Verification and Warehouse Operations system. It is built on a **Palantir-inspired Ontology Architecture**, separating the visual UI from the strict business rules and database mutations.

The repository is structured as a **Turborepo Monorepo**, allowing multiple applications (frontends and backends) to share unified TypeScript types, business rules, and API clients seamlessly.

---

## 🏗️ High-Level Architecture

The monorepo is divided into two primary zones:
1. **`/apps`**: Deployable applications. These are the physical websites or serverless API environments that run in the Azure cloud.
2. **`/packages`**: Internal shared libraries. These are modular chunks of code (like data types, UI components, and API clients) that are imported by the apps but are never deployed on their own.

---

## 📂 Directory Deep Dive

### 1. `/apps/api` (The Serverless Gatekeeper)
This is the Azure Functions v4 backend. It acts as the strict gatekeeper between the frontend apps and the Azure SQL Database. No frontend app talks to the database directly; they must route through this API.

* **`prisma/schema.prisma`**: The single source of truth for the database layout. It maps out the real-world Ontology objects (Loads, Pallets, Staging Lanes, Inspections) and their relationships.
* **`src/index.ts`**: The main Azure entry point. It registers the HTTP endpoints (`getOntology` and `executeAction`) with the serverless environment.
* **`src/database.ts`**: The shared Prisma database client instance. It ensures serverless functions reuse connections efficiently rather than crashing the database with too many handshakes.
* **`src/handlers/executeAction.ts`**: The dynamic orchestration engine. It intercepts incoming POST requests, verifies the action token, and routes it to the correct kinetic logic file.
* **`src/actions/`**: The "Verbs" of the system. Each file here (e.g., `verifyPallet.ts`, `assignLoadToLane.ts`) contains the isolated business rules and the safe, atomic database transactions for a specific action.
* **`host.json` & `local.settings.json`**: Azure runtime configurations and local environment variables (like the database connection string).

### 2. `/apps/gxo-loadout` (The Specialized Frontend)
This is the Vite/React application used on tablets and scanners by dock clerks to verify outbound freight. It is a "thin client"—it handles UI rendering and camera captures, but delegates all heavy data logic to the shared packages.

* **`src/App.tsx` & `src/main.tsx`**: The React DOM initializers and global context providers.
* **`src/routes/`**: Contains the page-level components (e.g., `ScanPalletRoute.tsx`, `StagingLanesRoute.tsx`, `AdminRoute.tsx`). These map directly to URLs in the browser.
* **`src/components/`**: Reusable visual blocks like `StagingLanesMap.tsx`, `PhotoCapture.tsx`, and `QualityFlagButton.tsx`.
* **`src/hooks/`**: Custom React hooks (e.g., `useInspection.ts`, `useCameraCapture.ts`) that manage local component state before dispatching to the API.
* **`src/services/`**: Local utility wrappers for things like IndexedDB offline sync (`db.ts`), image compression (`compressPhoto.ts`), and device configurations.

### 3. `/packages/semantic` (The Shared Ontology SDK)
This is the "Brain" of the repository. It contains the data definitions, state machines, and API fetch wrappers. By keeping this in a shared package, future apps (like an Operations Hub dashboard) can import it and instantly understand how the warehouse works.

* **`src/types/`**: The strict TypeScript definitions for real-world nouns (`ontology.ts`, `load.ts`, `site.ts`). This ensures compile-time safety across the entire monorepo.
* **`src/client.ts`**: The unified API wrapper. Frontends use `ontologyClient.executeAction(...)` instead of writing raw `fetch` commands, standardizing network calls and error handling.
* **`src/rules/`**: Agnostic business logic functions (e.g., `photoQuality.ts`, `handoffValidation.ts`). These enforce rules before data even leaves the device.
* **`src/state/`**: XState machine configurations (`inspectionMachine.ts`, `palletMachine.ts`). These dictate complex multi-step workflows, ensuring an inspection cannot be marked "Complete" until "Photos Captured" is finished.
* **`__tests__/`**: Vitest suites guaranteeing that business rules calculate accurately. 

### 4. `/packages/shared` (The Utility Belt)
Reserved for highly generic, non-business-specific tools.
* Currently houses shared ESLint, Prettier, or TypeScript configurations (`tsconfig.json`) to keep formatting perfectly synced across all teams and projects.

---

## ⚙️ Root Configuration Files

At the very base of the repository are the files that stitch the monorepo together:

* **`package.json`**: The master dependency manager. The `"workspaces": ["apps/*", "packages/*"]` array tells npm to symlink all internal folders together so they can share code locally without public publishing.
* **`turbo.json`**: The Turborepo pipeline configuration. It defines how tasks like `build`, `dev`, and `test` are executed across multiple folders simultaneously. It dictates caching rules (e.g., don't re-run tests if the code hasn't changed) to drastically speed up CI/CD.
* **`.github/workflows/ci.yml`**: The automated GitHub Actions deployment script. When code is merged to `main`, this file triggers Azure to build the frontends, compile the API, and release them securely to the cloud.

---

## 🚀 Getting Started Locally

Because of the Turborepo setup, spinning up the entire localized cloud environment takes a single command.

1. **Install Dependencies:** (Run from the root directory)
   ```bash
   npm install
   ```
2. **Start the Development Environment:**
   ```bash
   npm run dev
   ```
   *This command leverages Turborepo to simultaneously launch the Vite frontend and the Azure Functions emulator.*
