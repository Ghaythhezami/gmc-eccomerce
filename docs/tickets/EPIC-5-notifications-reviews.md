# EPIC-5 — Real-Time Notifications & Reviews

**Owner:** Student 5 (raed) · **Base branch:** `feat(kenule)/auth`

Covers NestCart tickets NEC-501 … NEC-507: MongoDB-backed live notifications were
re-scoped onto the existing **Postgres/Prisma** stack (the repo already ships a
`Notification` model and a `notifications` module; adding a second database was out of
scope). One migration adds a `Review` model plus `Notification.type` / `Notification.orderId`.

## What shipped

| Ticket | Where |
|--------|-------|
| NEC-501 schemas | `apps/server/prisma/schema.prisma` — `NotificationType` enum, `Notification.type`/`orderId`, `Review` model (`@@unique([productId, userId])`, `@@index([productId])`). Migration `20260828224523_epic5_notifications_reviews`. |
| NEC-502 gateway | `apps/server/src/notifications/notifications.gateway.ts` — JWT verified on connect (`handshake.auth.token` or `Authorization`), invalid/missing ⇒ `disconnect`. Each socket joins room `user:<id>`; admins also join `role:ADMIN`. |
| NEC-503 triggers | `apps/server/src/common/events/` (tiny RxJS event bus) + `apps/server/src/notifications/notifications.listener.ts`. `order.status.changed` ⇒ notify the customer; `product.stock.changed` crossing below 5 ⇒ notify every admin. Events are emitted by the scaffold `orders` module. |
| NEC-504 reviews API | `apps/server/src/reviews/` — `POST /api/products/:productId/reviews` (purchase-gated, upsert), `GET …/reviews` (paginated + `averageRating`), `GET …/reviews/me/eligibility`. |
| NEC-505 bell | `apps/client/src/features/notifications/` — `NotificationBell` (unread badge, dropdown, load-older), `ToastHost`, `useNotificationsSocket`. Wired into `components/layout/Header.tsx` + `components/Shell.tsx`. Row click marks read and deep-links to `/orders/:id`. |
| NEC-506 reviews UI | `apps/client/src/pages/ProductDetail.tsx` (`/products/:id`) + `apps/client/src/features/reviews/ProductReviews.tsx` — star summary, list, and a form shown only when `…/eligibility` returns `eligible`. |
| NEC-507 tests | `apps/server/src/**/*.spec.ts` (reviews eligibility, listener thresholds, order-status transitions, notification de-dup) + `apps/server/test/socket-smoke.mjs`. |

## Scaffolds added for missing dependencies

- `apps/server/src/products/` — read-only `GET /api/products`, `GET /api/products/:id` (real work: FEATURE-002/006).
- `apps/server/src/orders/` — `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`, `PATCH /api/admin/orders/:id/status` (validated transitions). Emits `order.created` / `order.status.changed` / `product.stock.changed`. Real work: FEATURE-005.
- Client `features/orders/` — minimal order history + detail (the bell's deep-link target).
- Admin: `apps/admin/src/features/notifications/*` + `pages/Notifications.tsx` + bell in `AdminLayout` (the storefront `Shell` blocks admins, so low-stock alerts live here).

## Toolchain fixes on the branch (pre-existing breakage)

- `packages/tsconfig/base.json`: `ignoreDeprecations` `"6.0"` → `"5.0"` (invalid for the installed TypeScript; blocked every client/admin build).
- Added `jest` + `@types/jest` to `apps/server` dev deps and `apps/server/jest.config.js` (`jest` was only present transitively; there was no config).
- `pnpm lint` is still broken repo-wide (ESLint 9 wants a flat `eslint.config.js`); left as-is — not in scope.

## Manual socket checklist

1. `docker compose up -d`; create `apps/server/.env` from `.env.example`.
2. `pnpm install`; `pnpm --filter @ecommerce/server exec prisma migrate dev`; `pnpm --filter @ecommerce/server prisma:seed`.
3. `pnpm dev`. Storefront login `student1@example.com` / `Student123!`; admin login `admin@example.com` / `Student123!`.
4. `POST /api/auth/login` → copy `accessToken`. `node apps/server/test/socket-smoke.mjs <token>` → prints `connected`. Run again with a junk token → `connect_error` / `disconnected`.
5. `POST /api/orders` `{ "items": [{ "productId": "<id>", "quantity": 1 }] }` as the student.
6. As admin, `PATCH /api/admin/orders/<orderId>/status` `{ "status": "PAID" }` → smoke client prints `notification.created`; the storefront bell badge increments live and a toast appears; reload shows the row persisted. Repeat the same status → **no** duplicate.
7. Order enough units of a product to drop its stock below 5 → the admin app receives a live `LOW_STOCK` notification.
8. Reviews: as a student who hasn't bought product X, `POST /api/products/X/reviews` → 403 and the UI hides the form. Advance an order for X to `PAID`, retry → 201; `/products/X` shows the review and updated average without a reload; posting again updates the same review.
9. `pnpm --filter @ecommerce/server test`; `pnpm --filter @ecommerce/server build`; `pnpm --filter @ecommerce/client build`; `pnpm --filter @ecommerce/admin build`.
