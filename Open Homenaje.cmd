@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\open-homenaje.ps1"
if errorlevel 1 (
  echo.
  echo No se pudo abrir Homenaje. Revisa el mensaje anterior.
  pause
)
endlocal
