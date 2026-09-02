@echo off
setlocal
cd /d "%~dp0"
echo ============================================
echo   GMC E-Commerce  -  LAUNCH
echo ============================================

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
  REM ping, not timeout: timeout aborts when stdin is redirected (CI / scripted runs).
  ping -n 2 127.0.0.1 >nul
  goto waitdb
)
echo       database ready.

echo [3/4] Prisma client + migrations...
call corepack pnpm@9.15.0 --filter @ecommerce/server exec prisma generate
call corepack pnpm@9.15.0 --filter @ecommerce/server exec prisma migrate deploy
REM First run only - seed demo data (admin@example.com + starter catalog):
REM   corepack pnpm@9.15.0 --filter @ecommerce/server run prisma:seed

echo [4/4] Starting apps (fresh compile - clears stale server build)...
if exist "apps\server\dist" rmdir /s /q "apps\server\dist"
REM Build once before the watcher starts. "nest start --watch" launches dist/src/main.js
REM as soon as it appears, so against an empty dist it races the compiler and dies with
REM "Cannot find module './app.module'" - and the watcher only retries on a file change.
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
