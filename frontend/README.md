# Harborline Insurance CRM

Frontend-only insurance advisor CRM demo built with Vite, React, TypeScript, MUI, TanStack Query, React Hook Form, and Zod. All data is local mock data behind hooks in `src/api`, so the pages are ready to swap to a real API later.

## Run

```bash
cd frontend
npm install
npm run dev
```

Useful commands:

```bash
npm run lint
npm run build
npm run preview
```

The development-only design system is available at `/design-system`.

## Demo Roles

Use the role switcher in the top bar:

- **Admin**: full settings access and reward/export actions
- **Manager**: renewal export and reward actions, no settings access
- **Advisor**: read-only operational views, no privileged actions

## Demo Paths

- `/renewals`
- `/customers`
- `/customers/CU-2201`
- `/customers/CU-2202`
- `/contests`
- `/settings`
- `/design-system` (development only)
