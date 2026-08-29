# AccessTrack

**From Accessibility Audit to Action**

AccessTrack is a demo-ready accessibility accountability platform for public and private buildings in India. The Chennai pilot follows every barrier through a clear manual workflow:

`Audit → Finding → Responsible owner → Deadline → Repair → Evidence → Human verification → Closure`

Missed deadlines become overdue, trigger reminders, and move through three escalation levels. Optional AI can assist with photo review, voice entry, before/after comparison, and complaint classification, but it never verifies compliance.

## Features

- Four role workspaces: Citizen, Auditor, Building Manager, and Administrator
- Public landing page, building directory, profiles, monitoring scores, and issue visibility
- Mobile-first citizen reporting with photo validation, geolocation, voice input, and tracking IDs
- Professional audit checklist covering entrance, movement, toilets, parking, and communication
- Automatic issue creation for partial and non-compliant audit items
- Admin assignment with responsible person, department, deadline, and required action
- Manager work queue, progress updates, and before/after evidence upload
- Human-only approve/reject verification with required comments and rework loop
- Deadline, overdue, reminder, and three-level escalation presentation
- Admin analytics with Recharts and a Leaflet/OpenStreetMap building map
- In-app notification center
- Optional mock AI analysis when no API key is configured
- Seeded fictional Chennai data: 20 buildings, 20 audits, 120 issues, and 28 role-based users
- Local demo mode that persists changes in `localStorage`
- Supabase schema, Row Level Security policies, storage bucket, and seed script

## Architecture

The project uses the Next.js App Router and keeps UI, mock state, service selection, and Supabase integration separate.

- `app/` — routes, layout, metadata, global styles
- `components/` — reusable interface and workflow components
- `components/views/` — public and role-specific product screens
- `lib/mock-data.ts` — deterministic fictional demo dataset
- `lib/store.tsx` — local demo workflow state and actions
- `lib/supabase/` — Supabase client configuration
- `services/data-service.ts` — demo/Supabase data-service boundary
- `types/` — shared TypeScript domain types
- `supabase/migrations/` — PostgreSQL schema and RLS policies
- `supabase/seed.sql` — 20 buildings, 20 audits, and 120 issues

## Technology

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL, Authentication, Storage, and RLS
- Recharts
- Leaflet + OpenStreetMap
- React Hook Form + Zod
- Lucide icons
- Vinext/Vite output for OpenAI Sites hosting

## Local setup

Requirements: Node.js 22.13 or later.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Environment variables are optional for demo mode.

Production validation:

```bash
npm run build
npm run lint
```

## Demo mode and accounts

Choose **Demo login** on the landing page. No passwords are required.

| Role | Demo user | Main capability |
|---|---|---|
| Citizen | Meena | Report and track barriers |
| Auditor | Arun | Audit and verify work |
| Building Manager | Kavitha | Fix assigned issues and upload evidence |
| Administrator | Priya | Assign, monitor, and escalate |

Changes are stored in the browser. Use **Reset demo data** in the sidebar to restore the seeded state.

## Judge walkthrough

1. Log in as **Auditor** and open **Audits → New audit**.
2. Select **Government General Hospital**. The ramp requirement is already marked **Not compliant** with an editable finding.
3. Submit the audit; AccessTrack creates a new high-priority issue.
4. Switch role to **Administrator**, open the newest issue, assign **Kavitha Mani / Hospital Engineering**, and set a deadline.
5. Switch to **Building Manager**, open the assigned issue, click **Start work**, add evidence, optionally run the mock before/after comparison, and select **Ready for verification**.
6. Switch to **Auditor**, open **Verification**, review the original finding and evidence, add a comment, and choose **Approve & close** or **Rework required**.
7. Return as **Administrator** to see the status, notifications, score context, overdue queue, and escalation path.

The seeded `ACC-1024` hospital ramp issue also demonstrates overdue and Level 2 escalation immediately.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/202608290001_initial_schema.sql` in the SQL editor or through the Supabase CLI.
3. Run `supabase/seed.sql` for fictional pilot data.
4. Add the values below to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The migration enables RLS, role policies, indexes, and a private 5 MB evidence bucket restricted to JPEG, PNG, WebP, and PDF. Never expose the service-role key in client code.

Demo role switching is intentionally frictionless for judging. A production rollout should create real Supabase Auth users, populate `profiles`, and enforce server-side route checks in addition to the included database policies.

## AI configuration

No AI key is required. Without one, the interface presents realistic, clearly labelled mock analysis. To connect an AI service, set server-only values:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
```

Keep requests in a server action or route handler. Never send the key to the browser and never let model output set `VERIFIED` or `CLOSED`.

## Deployment

Set the environment variables in the hosting provider, set `NEXT_PUBLIC_SITE_URL` to the trusted public origin, and run the production build. The application remains fully usable in demo mode if Supabase or AI configuration is absent.

## Security and accessibility

- Zod input validation, safe file type/size checks, and private evidence storage
- RLS policies scoped by authenticated profile role and ownership
- No hard-coded secrets or real personal data
- Semantic HTML, explicit labels, visible focus states, high contrast, keyboard navigation, responsive controls, and text-backed status badges
- Monitoring scores are consistently labelled as non-legal certification
