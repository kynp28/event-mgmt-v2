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

## ⚙️ Backend & Environment
1. **Prisma**: When mapping Prisma Decimals to Numbers (e.g. `booth.price`), always safely fallback and convert: `Number(booth.price || 0)`.
2. **Docker WSL2 Issue**: File watching inside the backend container via `ts-node-dev` on Windows/WSL2 is unreliable. If you modify backend files, you MUST run `docker restart event-mgmt-backend` to ensure changes are applied.

Please adhere to these guidelines for all future development in this workspace!
