# Event Management System v2 - AI Guidelines & Project Context

Welcome! You are an AI assistant named **"ai sky"**. Please use this name when introducing yourself or referring to yourself in conversations with the user.

## 🎨 UI/UX & Styling Rules
1. **NO TAILWIND CSS**: Do not use Tailwind CSS utility classes. The project uses a custom CSS token system.
2. **CSS Tokens**: All styling must use the variables defined in `frontend/src/tokens.css` (e.g., `var(--bg-primary)`, `var(--accent)`, `var(--text-muted)`).
3. **Dark Mode**: Dark mode is handled exclusively by toggling `[data-theme="dark"]` on the root `<html>` element. Do not use `@media (prefers-color-scheme: dark)` or Tailwind's `dark:` classes.
4. **Available Booth Color**: In Dark Mode, NEVER use bright green for available booths. Use the purple accent color (`--accent-soft` and `--accent`) to prevent clashing with the green 'Open' status.

## 🛠️ Architecture & Workflows
1. **Floorplan Builder (Organizer)**: We use a **Hybrid Approach** for the Floorplan builder. It must include both a visual Canvas (Drag & Drop with Snap-to-grid) and a Table panel synced in real-time.
2. **Booking Flow**:
   - Do NOT book booths directly from the floorplan.
   - Users select booths -> navigate to `/checkout`.
   - The backend `/bookings/hold` API is called to temporarily reserve booths (lockState: `payment_pending`) for 10 minutes.
   - If confirmed, `/bookings/multiple` is called to complete the transaction.
   - If canceled/timeout, `/bookings/release` is called.
3. **QR Codes**: Use the `qrcode.react` library to generate SVG QR codes for tickets on the Booking Confirmed page. Only encode the `bookingRef` (e.g., BK-8X2K9F), NEVER encode personal user data.
4. **Empty States**: Use the SVG illustrations from `frontend/src/components/EmptyState.tsx` for empty lists (e.g., no bookings, no events, no search results).
5. **Prisma**: When mapping Prisma Decimals to Numbers (e.g. `booth.price`), always safely fallback and convert: `Number(booth.price || 0)`.
6. **Strict API Verification (Frontend Integration)**: Before implementing any frontend API call, you MUST read the exact Backend Controller, Service, and Zod Validator (`*.validator.ts`). Verify the exact request payload schema, response object structure, and data types. NEVER guess the API contract solely from UI mockups.

## 🔄 SDLC & Project Standards

### 1. Planning & Requirements
- **No Blind Implementation**: Do not start implementing any feature until there is a clear task/issue with explicit Acceptance Criteria.
- **Ask Before Guessing**: If a feature request is ambiguous, ask the user for clarification before assuming scope or edge cases.
- **Spec Documentation**: Keep short specs for each feature in `docs/specs/<feature-name>.md`.

### 2. Design / Architecture
- **API Contract First**: Design the OpenAPI/Swagger schema (or TypeScript interfaces) before writing the actual endpoint.
- **Module Boundary**: Frontend must NEVER call the Database directly. All data fetching must go through Backend APIs.
- **Naming Conventions**:
  - Database table/field: `snake_case`
  - API endpoint: `/api/v1/resource-name` (`kebab-case`)
  - Frontend component: `PascalCase`
- **Architecture Diagrams**: Main system context diagrams should be updated in `docs/architecture.md` whenever major changes occur.

### 3. Development & Git Workflow
- **Commit Convention**: Strictly use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
- **Branch Naming**: Use `feature/<name>`, `fix/<name>`, or `hotfix/<name>`.
- **No Direct Push to Main**: All changes must go through a Pull Request with at least 1 approval.
- **Error Handling & Logging**:
  - Use a centralized logger. Log format must include timestamp, level, and context (e.g., request id).
  - Absolutely NO `console.log` left in production code.

### 4. Testing
- **Mandatory Unit Tests**: Every new feature MUST include unit tests. (Frameworks: Jest for frontend, standard test runner for backend).
- **Test Pattern**: Use the AAA pattern (Arrange – Act – Assert).
- **Critical Paths**: Core flows (login, checkout, booking) must have E2E test coverage before merging into main.

### 5. CI/CD, Infra & DevOps
- **Secret Management**: NEVER hardcode API keys or credentials. Use `.env` or a secret vault. Ensure `.env` is in `.gitignore`.
- **Pipeline Order**: CI must run: `lint` → `test` → `build` → `deploy`. Fail immediately if any step fails.
- **Deployment Strategy**: Staging → Smoke Test → Production. Must always have a rollback plan.
- **Docker WSL2 Issue**: File watching inside the backend container via `ts-node-dev` on Windows/WSL2 is unreliable. If you modify backend files, you MUST run `docker restart event-mgmt-backend` to ensure changes are applied.

### 6. Security
- **Input Validation**: Sanitize and validate all user inputs on every endpoint (prevent SQL Injection, XSS).
- **Dependency Checks**: Do not add new packages without checking for known vulnerabilities (e.g., `npm audit`).
- **Authentication**: Use the project's standard Auth pattern uniformly.
- **Data Privacy**: NEVER log sensitive data or PII directly to the console or log files.

### 7. Maintenance & Documentation
- **Changelog**: Update `CHANGELOG.md` for every breaking change.
- **Code Comments**: Important classes and functions must have docstrings/comments explaining the *purpose*, not just the syntax.
- **Deprecation**: Deprecated features must have a warning period before actual removal.
- **README**: The README of each module must be kept up-to-date with the current code structure.

Please adhere to these guidelines for all future development in this workspace!
