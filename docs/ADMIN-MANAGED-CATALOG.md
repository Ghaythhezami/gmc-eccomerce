# Admin-Managed Catalog — technical notes

Makes the storefront catalog fully dynamic: every product, category, price, image and badge is
created and edited from the admin panel instead of living in a hardcoded file.

Branch: `feat/kenule-admin-catalog`, based on `feat(kenule)/auth`.

---

## 1. Prisma — one file per module

- Replaced the single `apps/server/prisma/schema.prisma` with a multi-file schema folder at
  `apps/server/prisma/schema/`, one file per domain module:
  - `schema.prisma` — `generator` + `datasource` only
  - `user.prisma` — `User`, `Role`
  - `category.prisma` — `Category`
  - `product.prisma` — `Product`
  - `cart.prisma` — `Cart`, `CartItem`
  - `order.prisma` — `Order`, `OrderItem`, `OrderStatus`
  - `notification.prisma` — `Notification`
  - `storefront.prisma` — `StorefrontAccess`
- Prisma 6.19 does **not** auto-detect a schema folder, so the path is declared explicitly in
  `apps/server/package.json` (`prisma.schema = "prisma/schema"`). This emits a deprecation warning
  pointing at `prisma.config.ts`; that migration is deliberately deferred (a config file disables
  automatic `.env` loading and would need a `dotenv` dependency).
- With a schema **folder**, Prisma resolves migrations relative to the folder, so
  `prisma/migrations/` was moved to `prisma/schema/migrations/`. Leaving it in the old location makes
  the CLI report the existing migrations as missing and demand a database reset.

## 2. Schema additions

New migration `20260902200917_catalog_fields` — additive only, no data loss:

- `Category`: `description`, `icon`, `imageUrl`, `sortOrder`, `isActive`, index on `(isActive, sortOrder)`
- `Product`: `compareAtPrice`, `rating`, `reviewCount`, `isFeatured`, `isActive`, index on `(isActive, isFeatured)`

`compareAtPrice` is the "was" price; the discount percentage is derived server-side rather than stored,
so it can never drift out of sync with the price.

## 3. Server — `categories` and `products` modules

- `apps/server/src/categories/` and `apps/server/src/products/`, each with a module, controller,
  service and DTO folder, following the existing `auth/` layout.
- Shared `apps/server/src/common/slug.ts` generates URL-safe slugs and strips accents
  (`Jeux Vidéo & Accessoires` → `jeux-video-accessoires`), so a slug is optional on create.
- Public reads vs admin writes are split on the same controller:
  - `GET /api/categories`, `GET /api/categories/:slug` — public, active categories only
  - `GET /api/products`, `GET /api/products/:slug` — public, active products only
  - `GET /api/{categories,products}/manage/all` — admin, includes hidden rows
  - `POST` / `PATCH` / `DELETE` — admin, behind `JwtAuthGuard` + `RolesGuard` + `@Roles(Role.ADMIN)`
- The literal `manage/all` route is declared **before** `:slug` so the parameterised route does not
  swallow it.
- `GET /api/products` supports `category`, `search`, `featured`, `onSale`, `sort`, `page`, `limit`
  and returns `{ items, total, page, limit, pageCount }`.
- `onSale` compares two columns (`compareAtPrice > price`). This uses Prisma **field references** in
  the `where` clause rather than filtering in JS after the query — filtering post-pagination would
  corrupt `total` and produce short pages.
- Prisma returns `Decimal` instances, which JSON-serialize to strings and break arithmetic in the
  browser. The service maps them to numbers and attaches a computed `discountPercent`.

### Validation and integrity rules

- DTOs use `class-validator`; the global `ValidationPipe` already runs with `whitelist` + `transform`.
- Name and slug uniqueness is checked before write, so clients get a readable `400` instead of a raw
  Prisma `P2002`.
- `compareAtPrice` must exceed `price`.
- A category holding products cannot be deleted (`400` naming the count).
- A product referenced by an order line cannot be deleted — the API tells the admin to deactivate it
  instead, which protects order history; cart lines are cleaned up automatically.

## 4. Admin panel

- `apps/admin/src/features/catalog/` — RTK Query slice with `Category`/`Product` tags. Category
  mutations invalidate the product list too, because product rows embed their category.
- `apps/admin/src/components/ui.tsx` — small shared primitives (`Field`, `Input`, `Select`, `Toggle`,
  `Button`, `Banner`, `Modal`) built on the existing tokens in `styles.css`, plus an `errorMessage`
  helper that surfaces the API's message instead of a generic failure string.
- `pages/Categories.tsx` — table (icon, slug, product count, order, visibility) and a modal form.
- `pages/Products.tsx` — table with thumbnail, category, price with strike-through and discount badge,
  stock, Live/Featured status, plus a category filter and a full create/edit modal.
- Both pages are wired into `AdminLayout`'s nav and route table; `Products` and `Categories` were
  removed from the placeholder list. `App.tsx` was simplified: `AdminLayout` renders its own `Routes`,
  so the duplicate child routes in `App.tsx` were dead code and are gone.

## 5. Storefront

- Deleted `apps/client/src/components/home/data.ts` — the hardcoded product/category arrays.
- `apps/client/src/features/catalog/catalogApi.ts` provides `getCategories`, `getProducts`, `getProduct`.
- Now server-driven: `CategoryNav`, `CategorySection`, `HeroSection` category rails, `FlashSaleSection`
  (`onSale=true`), `FeaturedSection` (`featured=true`).
- `ProductCard` takes the API `Product` shape, renders the real rating as stars, and disables
  "Add to Cart" at zero stock. A matching skeleton keeps grids from jumping while loading.
- `pages/Products.tsx` is a real catalog: search, sort, pagination, empty states. It serves both
  `/products` and `/category/:slug`; the route param pins the category.
- `pages/ProductDetail.tsx` is new, replacing the placeholder on `/products/:slug`.
- Sections that would render empty (no sale items, no featured items) hide themselves rather than
  showing an empty row.

## 6. Seed and data coherence

- `prisma/seed.ts` now seeds 6 coherent categories and 12 products with real prices, stock, ratings,
  sale prices and imagery. It is idempotent (`upsert` on slug).
- The original starter seed had left `Electronics` and `Home` categories holding a
  `Wireless Headphones` and a `Desk Lamp` — placeholders that do not belong in a games catalog and
  were showing up in the storefront navigation. Both products were reassigned to `Accessories`
  (whose scope is "controllers, headsets and desk gear") and the two empty categories were removed.
- Post-cleanup state: 6 categories, 14 products, 0 products with a dangling category.

## 7. Verification performed

- `tsc --noEmit` clean on server, admin and client.
- Guards: `401` unauthenticated, `403` with a CUSTOMER token on an admin write.
- Validation: `400` for `compareAtPrice <= price`; `400` deleting a non-empty category.
- Full round trip through the admin UI: created a product, confirmed slug generation and the derived
  discount, saw it appear on the storefront category page and its detail page, then deleted it and
  confirmed a `404`.

## 8. Overlap with PR #4 — needs a human decision

FEATURE-003 (Category Management) is **already implemented** on `feat/kenule-category-management`
and open as PR #4. This branch independently adds its own `apps/server/src/categories/` module at the
same paths, so the two conflict. Differences:

| | PR #4 | this branch |
|---|---|---|
| Category CRUD API | yes | yes |
| Unit test (`categories.service.spec.ts`) | yes | no |
| Products-by-category | `GET /categories/:slug/products` | `GET /products?category=slug` |
| Uniqueness conflict status | `409` | `400` |
| `icon` / `sortOrder` / `isActive` / `imageUrl` | no | yes |
| Admin CRUD UI | no | yes |
| Products module | no | yes |
| Storefront wired to API | partial (categories page) | yes, whole storefront |

Recommendation: merge PR #4 first, then rebase this branch onto it and keep PR #4's service plus its
test, re-applying only the extra fields and the admin UI. Do not merge both as-is.
