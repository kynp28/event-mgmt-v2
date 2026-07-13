# EventCore (Event Management Platform)

EventCore is a comprehensive event and exhibition management platform. It allows **Organizers** to manage events and booth layouts, **Vendors** to book booths through an interactive floor plan, and **Admins** to oversee the entire ecosystem.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-teal.svg)

## 🌟 Key Features

### For Vendors & Visitors
- **Event Discovery:** Search and browse upcoming events and exhibitions.
- **Interactive Floor Plan:** View booth availability in real-time and select booths directly from the interactive map.
- **Easy Booking:** Simple booth booking process with waitlist support for fully booked zones.
- **Dashboard:** Track booking statuses, invoices, and event details.

### For Organizers
- **Event Management:** Create and edit event details, dates, and locations.
- **Visual Layout Editor:** Drag-and-drop or grid-based layout editor to design the event floor plan.
- **Booth Management:** Define booth zones, pricing, and sizes.
- **Booking Management:** Approve/reject vendor bookings and manage waitlists.

### For System Admins
- **Role Management:** Approve organizer requests and manage user roles.
- **System Overview:** Monitor platform statistics, active events, and users.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Routing:** React Router DOM
- **State Management:** React Query / Context API
- **Styling:** Custom CSS Utility Classes (Tailwind-inspired structure) & Lucide-React Icons
- **Internationalization:** i18next (English / Thai)

### Backend
- **Framework:** Node.js with Express
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Validation:** Zod

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (or Docker for running the database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kynp28/event-mgmt-v2.git
   cd event-mgmt-v2
   ```

2. **Setup the Database (using Docker):**
   ```bash
   docker-compose up -d
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   
   # Apply Prisma migrations
   npx prisma generate
   npx prisma migrate dev
   
   # Start the development server
   npm run dev
   ```

4. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   
   # Start the Vite development server
   npm run dev
   ```

### Default Accounts (Seed Data)
If you have run the seed script (`npm run seed` in the backend), you can use the following default accounts to log in:
- **Admin:** `admin@example.com` / `password123`
- **Organizer:** `organizer@example.com` / `password123`
- **Vendor:** `vendor@example.com` / `password123`

---

## 📁 Project Structure

```text
event-mgmt-v2/
├── backend/                  # Node.js + Express API
│   ├── prisma/               # Prisma schema and migrations
│   └── src/
│       ├── common/           # Middleware, errors, utils
│       ├── config/           # App configurations
│       ├── modules/          # Feature modules (auth, event, booking, etc.)
│       └── server.ts         # App entry point
│
└── frontend/                 # React Application
    ├── public/               # Static assets
    └── src/
        ├── components/       # Reusable UI components
        ├── context/          # React contexts (Auth)
        ├── pages/            # Page components (Home, Admin, Organizer, Vendor)
        ├── services/         # API integration (Axios)
        ├── locales/          # i18n translation files
        └── App.tsx           # Main application routing
```

## 📄 License
This project is proprietary and confidential.
