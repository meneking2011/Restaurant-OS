#!/usr/bin/env bash
# Deploy restaurant-os to Firebase Hosting
# Requires: GOOGLE_APPLICATION_CREDENTIALS_JSON secret (service account JSON)
# Usage: bash scripts/deploy-firebase.sh

set -e

SA_FILE=$(mktemp /tmp/firebase-sa-XXXXXX.json)
trap 'rm -f "$SA_FILE"' EXIT

if [ -z "$GOOGLE_APPLICATION_CREDENTIALS_JSON" ]; then
  echo "ERROR: GOOGLE_APPLICATION_CREDENTIALS_JSON secret is not set." >&2
  exit 1
fi

echo "$GOOGLE_APPLICATION_CREDENTIALS_JSON" > "$SA_FILE"

echo "==> Building for production…"
cd "$(dirname "$0")/../artifacts/restaurant-os"
PORT=3000 BASE_PATH=/ pnpm run build

echo "==> Deploying to Firebase Hosting…"
FIREBASE_TOKEN="" GOOGLE_APPLICATION_CREDENTIALS="$SA_FILE" \
  npx firebase-tools@latest deploy --only hosting \
  --project restaurant-os-88262 --non-interactive

echo "==> Done! Live at https://restaurant-os-88262.web.app"
