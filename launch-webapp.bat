@echo off
setlocal
cd /d "%~dp0"
echo ============================================
echo   GMC E-Commerce  -  LAUNCH
echo ============================================

echo [env] Ensuring .env files exist (created with defaults if missing)...
if not exist "apps\server\.env" (
  (
    echo DATABASE_URL="postgresql://postgres:postgres@localhost:5433/ecommerce?schema=public"
    echo JWT_SECRET="local-dev-secret-change-me"
    echo PORT=3000
    echo CLIENT_URL="http://localhost:5173"
    echo ADMIN_URL="http://localhost:5174"
    echo VAPID_PUBLIC_KEY=
    echo VAPID_PRIVATE_KEY=
    echo VAPID_SUBJECT="mailto:admin@example.com"
  ) > "apps\server\.env"
  echo       created apps\server\.env
)
if not exist "apps\client\.env" (
  ( echo VITE_API_URL="http://localhost:3000/api"& echo VITE_GOOGLE_CLIENT_ID= ) > "apps\client\.env"
  echo       created apps\client\.env
)
if not exist "apps\admin\.env" (
  ( echo VITE_API_URL="http://localhost:3000/api"& echo VITE_GOOGLE_CLIENT_ID= ) > "apps\admin\.env"
  echo       created apps\admin\.env
)

echo [1/4] Starting PostgreSQL (Docker: gmc-postgres, host port 5433)...
docker start gmc-postgres >nul 2>&1
if errorlevel 1 (
  echo       container not found - creating it...
  docker run -d --name gmc-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecommerce -p 5433:5432 postgres:16-alpine
)

echo [2/4] Waiting for database to accept connections...
:waitdb
docker exec gmc-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
  ping -n 2 127.0.0.1 >nul
  goto waitdb
)
echo       database ready.

echo [3/4] Prisma client + schema sync + seed...
call corepack pnpm@9.15.0 --filter @ecommerce/server exec prisma generate
REM db push (not migrate deploy): the schema is multi-file (prisma/schema/), so
REM "migrate deploy" finds no migrations and creates no tables. db push syncs it.
call corepack pnpm@9.15.0 --filter @ecommerce/server exec prisma db push
REM The seed upserts, so it is safe to run on every launch (no duplicates).
call corepack pnpm@9.15.0 --filter @ecommerce/server run prisma:seed

echo [4/4] Starting apps (fresh compile - clears stale server build)...
if exist "apps\server\dist" rmdir /s /q "apps\server\dist"
echo       compiling server once so the watcher does not race an empty dist...
call corepack pnpm@9.15.0 --filter @ecommerce/server exec nest build
start "gmc-server" cmd /k "corepack pnpm@9.15.0 --filter @ecommerce/server dev"
start "gmc-client" cmd /k "corepack pnpm@9.15.0 --filter @ecommerce/client dev"
start "gmc-admin"  cmd /k "corepack pnpm@9.15.0 --filter @ecommerce/admin dev"

echo.
echo Waiting for the API to accept requests (first compile takes ~60s)...
set "APIUP="
for /l %%i in (1,1,40) do (
  if not defined APIUP (
    curl -s -o nul http://localhost:3000/api/categories && set "APIUP=1"
    if not defined APIUP ping -n 3 127.0.0.1 >nul
  )
)
if defined APIUP (
  echo       API is up.
) else (
  echo   *** WARNING: the API never came up. Check the gmc-server window.
  echo   *** Most common cause: the gmc-postgres container is not running.
)

echo.
echo   Storefront : http://localhost:5173
echo   Admin      : http://localhost:5174
echo   API + Docs : http://localhost:3000/api/docs
echo.
echo   Three terminal windows opened. Run stop-webapp.bat to shut everything down.
echo ============================================
endlocal
