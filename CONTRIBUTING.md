# Contributing

## Branches

`main` is stable. Work from `develop` and create branches such as `feature/authentication` or `fix/cart-total`.

## Ticket workflow

1. Choose and assign one ticket.
2. Create a feature branch from `develop`.
3. Implement the complete vertical slice.
4. Run frontend and backend checks.
5. Commit with a clear message and push the branch.
6. Open a PR into `develop`.
7. Ask another student and the instructor to review it.
8. Resolve feedback and merge only after approval.

Keep modules independent, validate DTOs at the API boundary, use RTK Query for server state, and update the ticket documentation with implementation notes.
