# Kognit — Web App

Frontend for **Kognit**, a task-collaboration workspace built for product managers and engineers — spaces for organising work, tasks with acceptance criteria and priorities, and drag-and-drop boards for moving work from backlog to done.

**API:** [kognit-backend](https://github.com/muhammadatiq1/kognit-backend) (Express 5 · Prisma · MySQL · JWT)

## Features

- **Structured workspaces** — work organised into spaces (public or private) with task boards
- **Drag-and-drop boards** — move tasks between `BACKLOG`, `IN_PROGRESS`, `REVIEW` and `COMPLETED` with dnd-kit
- **PM-grade task details** — acceptance criteria, priority levels, assignees, due dates, tags and comments
- **Role-aware experience** — interfaces shaped for both PM and Engineer roles
- **Auth & public areas** — separated route groups for the app, authentication flows, and public pages
- **Themeable UI** — shadcn/ui component system with light/dark theming

## Tech stack

- **Framework:** Next.js 16 (App Router) · React · TypeScript
- **UI:** shadcn/ui (Radix/Base UI primitives) · Tailwind CSS 4 · Lucide icons
- **Interaction:** dnd-kit (drag and drop) · date-fns (dates)
- **State & forms:** React context, class-variance-authority, clsx / tailwind-merge

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment — create .env.local with the API base URL:
#    NEXT_PUBLIC_API_URL=http://localhost:5000

# 3. Run (start kognit-backend first)
npm run dev

# Production
npm run build && npm start
```

Open http://localhost:3000.

## Project structure

```
src/
  app/
    (app)/      # authenticated workspace — boards, spaces, tasks
    (auth)/     # sign-in / registration flows
    (public)/   # public-facing pages
    context/    # app-wide providers
  components/   # shared UI (shadcn/ui)
  lib/          # utilities
```

## License

MIT
