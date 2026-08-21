# Future Ticket Roadmap

These tickets are intentionally not implemented yet. Create one vertical branch per ticket.

- **FEATURE-006 Product Admin Management:** admin product CRUD, stock and image metadata; only admins can mutate products.
- **FEATURE-007 User Management:** admin user list, role updates and account status; audit every privileged mutation.
- **FEATURE-008 Product Search & Filtering:** indexed search, category/price filters and sort; preserve query state in the URL.
- **FEATURE-009 Checkout:** address, delivery option and order review; validate inventory before creating an order.
- **FEATURE-010 Payment Integration:** payment provider boundary and webhook handling; never store card data.
- **FEATURE-011 Real-Time Notifications:** authenticated Socket.IO rooms and notification center; emit `notification.created`.
- **FEATURE-012 Order Status Notifications:** notify customers on status transitions; deduplicate events.
- **FEATURE-013 Wishlist:** add/remove/list wishlist products; enforce customer ownership.
- **FEATURE-014 Reviews & Ratings:** verified-purchase reviews, rating aggregates and moderation.
- **FEATURE-015 Inventory Management:** stock movements, low-stock thresholds and concurrency-safe updates.
- **FEATURE-016 Discount/Coupon System:** validated codes, expiry, usage limits and server-side totals.
- **FEATURE-017 Admin Dashboard Analytics:** sales, orders and catalog metrics with bounded date ranges.
- **FEATURE-018 Image Upload:** validated image uploads and product media management without storing binary data in Postgres.
- **FEATURE-019 Email Notifications:** provider adapter, templates and retryable delivery records.
- **FEATURE-020 Security & Audit Logs:** privileged action history, request correlation and retention policy.
