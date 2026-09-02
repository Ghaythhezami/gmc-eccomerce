@echo off
echo ============================================
echo   GMC E-Commerce  -  STOP
echo ============================================

echo Stopping dev servers on ports 3000, 5173, 5174...
for %%P in (3000 5173 5174) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    echo   killing PID %%A on port %%P
    taskkill /F /PID %%A >nul 2>&1
  )
)

echo Closing app terminal windows (if still open)...
taskkill /FI "WINDOWTITLE eq gmc-server*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq gmc-client*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq gmc-admin*"  /T /F >nul 2>&1

echo Stopping PostgreSQL container (data is kept in the Docker volume)...
docker stop gmc-postgres >nul 2>&1

echo Done.
echo ============================================
