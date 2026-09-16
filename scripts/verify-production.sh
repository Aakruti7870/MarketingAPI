#!/usr/bin/env bash
set -euo pipefail

ORIGIN="${1:-https://gold-etechapp.com}"
ORIGIN="${ORIGIN%/}"

echo "Checking GOLD-e AI production at ${ORIGIN}"

check_page() {
  local path="$1"
  local expected="$2"
  local body
  body="$(curl -fsSL --max-time 20 "${ORIGIN}${path}")"
  printf '%s' "$body" | grep -Fq "$expected" || {
    echo "FAIL ${path}: expected text not found: ${expected}" >&2
    exit 1
  }
  if printf '%s' "$body" | grep -Fqi 'TrackMyRMC'; then
    echo "FAIL ${path}: legacy TrackMyRMC branding is still rendering" >&2
    exit 1
  fi
  echo "PASS ${path}"
}

health="$(curl -fsSL --max-time 20 "${ORIGIN}/api/health")"
python3 - "$health" <<'PY'
import json, sys
payload = json.loads(sys.argv[1])
if payload.get("status") != "ok" or payload.get("database") != "ok":
    raise SystemExit(f"health check failed: {payload}")
print("PASS /api/health")
PY

check_page "/" "GOLD-e AI"
check_page "/pricing" "Pro Monthly"
check_page "/privacy" "Privacy Policy"
check_page "/terms" "Terms of Service"
check_page "/data-deletion" "Data Deletion"
check_page "/login" "GOLD-e"

echo "All GOLD-e AI production smoke checks passed."
