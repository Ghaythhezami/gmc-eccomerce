# Enabling Google sign-in

The app runs fine without Google credentials — the "Continue with Google" button is
disabled and the API rejects every Google token — so this is optional. Follow these
steps to turn it on.

## 1. Create the OAuth client

1. [Google Cloud Console](https://console.cloud.google.com/) → pick or create a project.
2. **APIs & Services → OAuth consent screen** → External → fill in the app name and
   support email. While the app is in *Testing*, add each tester's Google account under
   **Test users**, otherwise their sign-in is refused.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   → Application type **Web application**.
4. Under **Authorized JavaScript origins** add both dev apps:
   - `http://localhost:5173` (storefront)
   - `http://localhost:5174` (admin)

   No redirect URI is needed: the frontend uses the implicit token flow, which returns
   the token to the origin rather than a callback URL.
5. Copy the **Client ID** (ends in `.apps.googleusercontent.com`).

You do **not** need the client secret. The server only verifies tokens; it never
exchanges an authorization code.

## 2. Configure the three env files

Put the *same* client ID in all three:

```
apps/server/.env    GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
apps/client/.env    VITE_GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
apps/admin/.env     VITE_GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
```

If you prefer separate clients for the storefront and the admin app, list both on the
server, comma-separated:

```
GOOGLE_CLIENT_ID=storefront-id.apps.googleusercontent.com,admin-id.apps.googleusercontent.com
```

Restart both Vite servers afterwards — `VITE_*` values are inlined at startup, so a
hot reload will not pick them up.

## 3. What the server enforces

`GoogleTokenVerifier` (`apps/server/src/auth/google-token.verifier.ts`) checks, in order:

1. `GOOGLE_CLIENT_ID` is configured — otherwise every sign-in is rejected with
   *"Google sign-in is not configured on this server"*. It fails closed on purpose:
   without a client ID there is no way to prove a token was issued for this app.
2. Google recognises the token.
3. **The token's audience is one of our client IDs.** Without this an access token minted
   for any other Google app could be replayed here to sign in as that user.
4. The Google account has a verified email address.

## 4. Who can sign in

| Endpoint | Behaviour |
| --- | --- |
| `POST /api/auth/google` (storefront) | Signs in an existing customer, or creates a new `CUSTOMER`. Refuses to return an admin token. |
| `POST /api/admin/auth/google` (admin) | Signs in **only an account that already has role `ADMIN`**. It never creates an account. |

Admin accounts are created by an existing admin through `POST /api/admin/auth/register`
(the **Sign up** page inside the admin app), never by signing in with Google.

The first time an existing password account signs in with Google, its `googleId` is
recorded so later sign-ins match on the Google identity instead of the email alone.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Button greyed out, "not configured on this environment" | `VITE_GOOGLE_CLIENT_ID` is empty, or Vite was not restarted after setting it. |
| Google shows **Error 401: invalid_client** | The client ID is wrong or belongs to a deleted credential. |
| Google shows **redirect_uri_mismatch** / origin error | `http://localhost:5173` / `:5174` is missing from **Authorized JavaScript origins**. |
| API returns *"Google sign-in is not configured on this server"* | `GOOGLE_CLIENT_ID` is missing from `apps/server/.env`, or the API was not restarted. |
| API returns *"Invalid Google token"* | Usually the server and frontend are configured with different client IDs, so the audience check fails. |
| API returns *"Not authorized for admin access"* | The Google account exists but is not an `ADMIN`. Promote it, or create it via `POST /api/admin/auth/register`. |
