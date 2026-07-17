#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  Deploy RestaurantOS to Firebase Hosting
#  Requires: FIREBASE_TOKEN secret set in Replit Secrets
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="restaurant-os-88262"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)/artifacts/restaurant-os"

echo "▶ Building RestaurantOS for production..."
cd "$APP_DIR"
PORT=3000 BASE_PATH=/ pnpm run build

echo ""
echo "▶ Deploying to Firebase Hosting (project: $PROJECT_ID)..."
npx firebase-tools@latest deploy \
  --only hosting \
  --project "$PROJECT_ID" \
  --token "$FIREBASE_TOKEN" \
  --non-interactive

echo ""
echo "✅  Deployed!"
echo "    Live at: https://${PROJECT_ID}.web.app"
echo ""
echo "    To connect restaurant-os.com as a custom domain:"
echo "    Firebase Console → Hosting → Add custom domain"
