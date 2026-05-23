#!/bin/bash
# ============================================================
# start-dev.sh — Script untuk menjalankan Backend + Frontend
# Cara pakai: bash start-dev.sh
# ============================================================

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🚗  RentalMobil Development Server     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Warna untuk output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Direktori project
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

# Pastikan dependencies sudah terinstall
echo -e "${YELLOW}📦 Memeriksa dependencies...${NC}"

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "   Installing frontend dependencies..."
  cd "$ROOT_DIR" && npm install
fi

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "   Installing backend dependencies..."
  cd "$BACKEND_DIR" && npm install
fi

# Seed database jika belum ada
DB_FILE="$BACKEND_DIR/rentalmobil.db"
if [ ! -f "$DB_FILE" ]; then
  echo -e "${YELLOW}🌱 Seeding database...${NC}"
  cd "$BACKEND_DIR" && node src/db/seed.js
fi

echo ""
echo -e "${GREEN}🚀 Menjalankan server...${NC}"
echo ""
echo -e "   ${BLUE}Backend API${NC} : http://localhost:5001/api"
echo -e "   ${BLUE}Frontend   ${NC} : http://localhost:5173"
echo ""
echo "   Tekan Ctrl+C untuk menghentikan semua server"
echo ""

# Jalankan backend di background
cd "$BACKEND_DIR" && node src/server.js &
BACKEND_PID=$!

# Tunggu backend siap
sleep 2

# Jalankan frontend
cd "$ROOT_DIR" && npm run dev -- --port 5173

# Ketika frontend dihentikan, kill backend juga
kill $BACKEND_PID 2>/dev/null
echo ""
echo "👋 Semua server dihentikan."
