# IBL Insurance Claims

Health insurance claims processing app with an Express/MongoDB backend and a React/Vite frontend. It supports provider claim submission, reviewer claim decisions, admin user management, claim audit trails, fraud flags, JWT auth, file uploads, and simple policy coverage calculation.

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB/Mongoose
- Frontend: React, TypeScript, Vite
- Auth: JWT, bcrypt password hashing
- Validation: Zod on backend request payloads
- Uploads: Multer, served from `/uploads`
- Tests: Vitest

## Setup Instructions

Install backend dependencies from the project root:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Create a backend `.env` file in the project root:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/ibl_insurance
JWT_SECRET=replace-with-a-strong-secret
```

Start MongoDB locally, then run the backend from the project root:

```bash
npm run dev
```

Run the frontend from `client/`:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5001`, so `PORT=5001` is recommended for local development.

## Optional Seed User

The repo includes `src/scripts/seedUser.ts` for creating a single user.

Environment variables:

```env
SEED_EMAIL=admin@example.com
SEED_PASSWORD=Admin123!
SEED_ROLE=admin
```

Run it from the project root:

```bash
./node_modules/.bin/ts-node src/scripts/seedUser.ts
```

Allowed roles are `admin`, `reviewer`, and `provider`.

## Environment Variables

Backend:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Express server port. Use `5001` with the current Vite proxy config. |
| `MONGO_URI` | Yes for normal app use | none in `server.ts` | MongoDB connection string. If omitted, the backend starts without a DB connection, but DB routes will not work correctly. |
| `JWT_SECRET` | Recommended | `dev-secret` | Secret used to sign and verify JWTs. Replace for any non-local environment. |
| `SEED_EMAIL` | No | `admin@example.com` | Email used by the seed script. |
| `SEED_PASSWORD` | No | `Admin123!` | Password used by the seed script. |
| `SEED_ROLE` | No | `admin` | Role used by the seed script. |

Frontend:

The frontend currently uses relative URLs through Vite proxy:

- `/api` -> backend API
- `/uploads` -> uploaded files

No frontend `.env` file is required for local development.

## Scripts

Backend, from project root:

```bash
npm run dev      # start Express with ts-node-dev
npm run build    # compile TypeScript to dist/
npm run start    # run compiled backend
npm run test     # run Vitest tests
```

Frontend, from `client/`:

```bash
npm run dev      # start Vite
npm run build    # type-check and build frontend
npm run preview  # preview production build
```

## Architecture

The app is split into a TypeScript Express API and a Vite React client.

Backend folders:

- `src/models`: Mongoose models for `User` and `Claim`
- `src/routes`: auth, claims, reviewer, and admin API routes
- `src/middleware`: JWT auth and role checks
- `src/utils`: policy calculation, upload setup, payload parsing, validation, and currency helpers
- `src/tests`: focused unit tests for policy and payload parsing

Frontend folders:

- `client/src/api`: Axios API clients
- `client/src/context`: auth state and JWT expiry logout handling
- `client/src/pages`: provider, reviewer, admin, login/register, and claim detail pages
- `client/src/components`: route protection and error boundary
- `client/src/types`: shared frontend TypeScript types

## Architectural Decisions & Trade-offs

- Role-based access is enforced server-side with `requireAuth`. The frontend also guards routes for user experience, but backend authorization is the source of truth.
- JWTs are stateless and expire after 8 hours. This keeps the backend simple, but token revocation is limited; account suspension is enforced when protected APIs verify the user.
- Zod validation is used on backend request boundaries for auth, claim payloads, review decisions, admin status updates, and object ids. This prevents malformed data from reaching business logic.
- File uploads are stored on the local filesystem under `src/uploads` and served through `/uploads`. This is simple for local development, but a production deployment should use object storage such as S3/R2 and stricter access controls.
- Claim audit trails are embedded in the claim document. This makes claim history easy to fetch with the claim, but very large audit histories could eventually justify a separate collection.
- Admin fraud flags are rule-based, not ML-based. The current rule is transparent and easy to explain, but it is intentionally simplistic.
- Coverage calculation is deterministic and fixed for all claims. There is no per-member deductible tracking or annual usage ledger yet, so the annual limit is applied per calculation rather than across a real policy year history.
- The frontend currently contains `.js` files generated from TypeScript alongside `.tsx` files because the local TypeScript build emits into `client/src`. The Vite entry uses `main.tsx`; the `.tsx` files are the source of truth.

## Policy Coverage Rules

Claims use a simple fixed INR coverage policy:

- Claim amounts below `₹0` are treated as `₹0`.
- A deductible of `₹50,000` is applied first.
- The insurer covers `80%` of the amount remaining after the deductible.
- The covered amount is capped at an annual policy limit of `₹5,00,000`.
- Patient responsibility is the total claim amount minus the covered amount.
- Currency values are rounded to two decimal places.

Formula:

```text
eligibleAmount = max(totalClaimAmount, 0)
amountAfterDeductible = max(eligibleAmount - 50000, 0)
coveredAmount = min(amountAfterDeductible * 0.80, 500000)
patientResponsibility = eligibleAmount - coveredAmount
```

Examples:

```text
Claim: ₹40,000
Covered: ₹0
Patient responsibility: ₹40,000

Claim: ₹2,50,000
Amount after deductible: ₹2,00,000
Covered: ₹1,60,000
Patient responsibility: ₹90,000

Claim: ₹8,00,000
Amount after deductible: ₹7,50,000
80% would be ₹6,00,000, capped to ₹5,00,000
Patient responsibility: ₹3,00,000
```

## Key Features

- Provider registration and login
- Provider claim submission with line items and supporting documents
- Provider claim resubmission for rejected or partially approved claims
- Reviewer queue and claim status decisions
- Admin dashboard with:
  - user management and activate/suspend controls
  - all-claims read-only access
  - audit trail with actor name and id
  - fraud flags for claims more than 3x the average amount for the same procedure code
  - date filters and claim totals
- Automatic logout on JWT expiry or protected API `401`

## API Overview

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Claims:

- `POST /api/claims`
- `GET /api/claims`
- `GET /api/claims/:id`
- `PUT /api/claims/:id`
- `POST /api/claims/:id/review`

Reviewer:

- `GET /api/reviewer/queue`
- `GET /api/reviewer/dashboard`

Admin:

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/claims`
- `GET /api/admin/flagged-claims`

Uploads:

- `GET /uploads/:filename`

## Validation

Backend request validation uses Zod in `src/utils/validation.ts`.

Invalid payloads return:

```json
{
  "message": "Validation failed",
  "errors": {
    "fieldName": ["Reason"]
  }
}
```

## Testing

Run backend tests:

```bash
npm run test
```

Current tests cover:

- Claim line item payload parsing
- Policy coverage calculation

