@echo off
title Frontend RentalMobil
echo ====================================================
echo    Menjalankan Frontend RentalMobil
echo ====================================================
echo.
echo Menginstall dependensi (jika belum ada)...
call npm install
echo.
echo Menjalankan aplikasi React...
call npm run dev
pause
