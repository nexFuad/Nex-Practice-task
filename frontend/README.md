# Guardly — Intelligent Security Operations

Guardly is a role-based security operations application. Operations Managers (OM) manage sites, shifts, employees, attendance, and their profile. Officers use the application to check in and check out from an assigned site with location and photo information.

This repository has two applications:

- `frontend/` — Next.js web application, deployed to Vercel.
- `backend/` — Hono REST API with Prisma and PostgreSQL, deployed to Railway.

## Technology used

| Area | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript | App Router pages, layouts, and UI |
| Styling | Tailwind CSS 4 | Responsive UI styling |
| Server state | TanStack Query | API caching, loading, mutation, and refetching |
| Forms | React Hook Form | Site, shift, employee, profile, and attendance forms |
| Icons | Lucide React | Navigation, status, form, and action icons |
| Backend | Hono + `@hono/node-server` | REST API and middleware |
| Database | PostgreSQL | Persistent data storage |
| ORM | Prisma 7 + PostgreSQL adapter | Schema, typed database queries, migrations |
| Authentication | JWT, HTTP-only cookies, bcryptjs | Login, session refresh, logout, role protection |
| Image upload | Cloudinary | Profile and attendance photo uploads |
| Deployment | Vercel + Railway | Frontend and backend hosting |
| Code quality | ESLint, Prettier, TypeScript | Linting, formatting, and static type checks |

## Main features

- Public landing page and login page.
- Role-based access for `ADMIN`, `OM`, and `OFFICER`.
- Remember Me session using a refresh-token cookie.
- OM management for sites, shifts, users, attendance, and profile.
- Employee creation, editing, bio-data, deployment, employment, and payroll data.
- Officer check-in/check-out with GPS validation and photo capture/upload.
- Database-backed search and filters, loading states, reusable tables, pagination, and action menus.
- Responsive role-aware dashboard sidebar.

## Full repository structure

```text
Practice-Task/
├── frontend/                         # Next.js application
│   ├── src/
│   │   ├── app/                      # App Router routes, layouts, and page UI
│   │   ├── Hooks/                    # Reusable React hooks
│   │   ├── Services/                 # Every frontend API call
│   │   ├── Shared/                   # Reusable UI components
│   │   └── Types/                    # Shared TypeScript types
│   ├── public/                       # Static assets
│   ├── .env.local                    # Local frontend values; never commit secrets
│   └── package.json
│
└── backend/                          # Hono API application
    ├── prisma/                       # Prisma schema and migrations
    ├── src/
    │   ├── lib/                      # Prisma client setup
    │   ├── modules/                  # Feature-specific API modules
    │   ├── generated/prisma/          # Generated Prisma client/types
    │   └── index.ts                  # API server, CORS, middleware, route setup
    ├── .env                          # Local backend configuration; never commit secrets
    └── package.json
```

## Frontend folder guide

### `src/app/` — routes and layouts

Next.js App Router uses a `page.tsx` file as a URL route and `layout.tsx` as the shared wrapper for a route group.

```text
src/app/
├── layout.tsx                        # Root HTML layout and QueryProvider
├── page.tsx                          # `/` public landing-page entry
├── globals.css                       # Global styles
├── QueryProvider.tsx                 # TanStack Query client provider
├── SessionRedirect.tsx               # Validates an existing user session and redirects safely
│
├── public/                           # Landing-page sections
│   ├── landingpage.tsx               # Navbar → Hero → About → How it works → Footer
│   ├── navbar.tsx                    # Public navigation/login link
│   ├── publichero.tsx                # Hero section
│   ├── about.tsx                     # About section
│   ├── howitwork.tsx                 # How-it-works section
│   └── footer.tsx                    # Footer
│
├── login/
│   ├── page.tsx                      # Login form and submit flow
│   ├── RoleGuard.tsx                 # Client-side role/access protection
│   └── auth.session.ts               # Safe browser-side signed-in-user helpers
│
├── om/                               # Operations Manager private area
│   ├── layout.tsx                    # OM role guard and dashboard layout
│   ├── site/page.tsx                 # `/om/site` — site management
│   ├── shifts/page.tsx               # `/om/shifts` — shift management
│   ├── attendance/page.tsx           # `/om/attendance` — attendance management
│   ├── profile/page.tsx              # `/om/profile` — OM profile/settings
│   └── users/                        # `/om/users` and employee routes
│
└── officer/
    ├── layout.tsx                    # Officer role guard and dashboard layout
    └── check-in/page.tsx             # `/officer/check-in` — check-in/out and history
```

### `src/app/om/users/` — employee UI

```text
users/
├── page.tsx                          # User table, filters, actions, and shared Table use
├── create-new-employee/page.tsx      # Create employee route
├── edit-employee/[employeeId]/page.tsx # Edit selected employee
├── bio-data/[employeeId]/page.tsx    # Employee bio-data route
├── employee/                         # Reusable employee form sections
│   ├── BasicEmployeeForm.tsx          # Basic employee information
│   ├── DeploymentAssignments.tsx      # Site/deployment assignment
│   ├── EmployeeTabs.tsx               # Employee form navigation
│   ├── FormField.tsx                  # Reusable form input wrapper
│   ├── PayrollForm.tsx                # Payroll information form
│   └── ProfileUploader.tsx            # Profile image upload
├── UsersFilters.tsx                  # Search, role, and status filters
├── UserStats.tsx                     # User summary cards
├── UserActionDialog.tsx              # Confirmation/action dialog
└── UserActionsMenu.tsx               # User action type/menu support
```

### `src/Services/` — all API calls in one place

Pages should not contain raw API URLs or duplicate fetch logic. A page calls a service function, and every service uses `client.ts`.

| File | Responsibility |
| --- | --- |
| `client.ts` | Shared `fetch`, JSON headers, credentials, 401 refresh handling |
| `auth.ts` | Login, logout, session, refresh, profile, and password APIs |
| `site.ts` | Site list, create, update, delete, and status APIs |
| `shift.ts` | Shift list, create, update, delete, and options APIs |
| `user.ts` | User list, filter options, employee/user APIs |
| `attendance.ts` | OM attendance APIs |
| `officerAttendance.ts` | Officer check-in/out, options, active record, and history APIs |
| `employment.ts` | Employment and payroll APIs |
| `dashboard.ts` | Dashboard overview APIs |
| `upload.ts` | Cloudinary upload helper |

### `src/Shared/` — reusable components

| File | Responsibility |
| --- | --- |
| `Table.tsx` | Generic typed table: dynamic columns, loading skeleton, empty state, three-dot action menu, responsive horizontal scroll, and built-in pagination |
| `pagination.tsx` | Reusable Previous / page number / Next controls used inside `Table.tsx` |
| `DashboardSidebar.tsx` | Shared OM/Officer sidebar; navigation links change by role while account/logout area remains common |

### `src/Hooks/` and `src/Types/`

- `Hooks/useSearchBar.tsx` supplies reusable input state and debounced search text.
- `Types/` contains TypeScript types for attendance, employees, shifts, sites, and users. This prevents duplicated interfaces inside page components.

## Backend folder guide

```text
backend/src/
├── index.ts                           # Starts Hono server; security headers, CORS, middleware, routes
├── lib/
│   └── prisma.ts                      # Prisma PostgreSQL client singleton
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts             # Login, session, refresh, logout, profile APIs
│   │   ├── auth.guard.ts              # JWT/cookie helpers and role middleware
│   │   └── auth.seed.ts               # Development demo-login seed
│   ├── sites/                         # Site CRUD and development seed
│   ├── shifts/                        # Shift CRUD
│   ├── users/                         # Users and employee account APIs
│   ├── employment/                    # Employment/payroll APIs
│   ├── attendance/                    # OM and Officer attendance APIs
│   └── dashboard/                     # Dashboard overview APIs
└── generated/prisma/                  # Generated Prisma client; do not edit manually
```

### API route groups

| Prefix | Purpose | Main permitted role |
| --- | --- | --- |
| `/api/auth` | Login, session, refresh, logout, profile | Public/session owner |
| `/api/sites` | Manage security sites | `ADMIN`, `OM` |
| `/api/shifts` | Manage shifts | `ADMIN`, `OM` |
| `/api/users` | Manage users/employees | `ADMIN`, `OM` |
| `/api/employment` | Employment and payroll data | `ADMIN`, `OM` |
| `/api/attendance` | OM attendance management | `ADMIN`, `OM` |
| `/api/officer/attendance` | Officer check-in/out and own history | `OFFICER` |
| `/api/dashboard` | Dashboard data | Role/session dependent |

## Authentication flow

1. The login page sends employee ID, company, password, and optional `rememberMe`.
2. `Services/auth.ts` calls `POST /api/auth/login` through `Services/client.ts`.
3. The backend validates the account/password with bcrypt and creates an HTTP-only access-token cookie.
4. If Remember Me is checked, the backend also creates a long-lived refresh-token cookie.
5. The backend returns user data and the role-specific dashboard path.
6. `RoleGuard.tsx` protects OM and Officer layouts through `/api/auth/session`.
7. After a `401` response, `client.ts` calls `/api/auth/refresh` once and retries the original request when refresh succeeds.
8. Logout calls `/api/auth/logout`, clears cookies and browser-side session helpers, then returns the user to `/`.

## Database

The Prisma schema is at `../backend/prisma/schema.prisma`.

Important database models include:

- `Account` and `User` — login identity, role, status, and basic user information.
- `Site` and `UserSite` — security sites and employee/site assignment.
- `Shift` — shift schedule, color, time, and status.
- `AttendanceRecord` — check-in/out times, photos, GPS values, timing, and validation result.
- `EmployeeBasic`, `EmploymentRecord`, `EmployeePayroll*`, and related models — HR/payroll data.

Do not manually edit `backend/src/generated/prisma/`; Prisma generates it from the schema.

## Run locally

Open two terminals from the repository root.

### Backend

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:3001` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Never commit real database URLs, JWT secrets, passwords, or Cloudinary secrets.

### Frontend: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

### Backend: `backend/.env`

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
AUTH_JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:3000
```

For Railway production configuration, see `../backend/.env.example`. Railway must allow the exact deployed Vercel domain through `FRONTEND_URLS`, otherwise browsers block login requests with a CORS error.

## Useful commands

### Frontend

```bash
cd frontend
npm run dev          # Start development server
npm run lint         # Run ESLint
npx tsc --noEmit     # Run TypeScript type check
npm run build        # Production build
```

### Backend

```bash
cd backend
npm run dev          # Start API with watch mode
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled API
```

## Deployment notes

- Deploy `frontend/` to Vercel.
- Deploy `backend/` to Railway.
- Set Vercel `NEXT_PUBLIC_API_URL` to the Railway HTTPS API URL, then redeploy Vercel.
- Set Railway `NODE_ENV=production`, `DATABASE_URL`, `AUTH_JWT_SECRET`, and `FRONTEND_URLS` to exact HTTPS Vercel domain(s), then redeploy Railway.
- The frontend origin must be explicitly allowed by Railway CORS for cookie-based login to work.
