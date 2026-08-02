@echo off
title Backend RentalMobil
echo ====================================================
echo    Menjalankan Backend Server RentalMobil
echo ====================================================
echo.
cd backend
echo Menginstall dependensi (jika belum ada)...
call npm install
echo.
echo Menjalankan server backend...
node src/server.js
pause
