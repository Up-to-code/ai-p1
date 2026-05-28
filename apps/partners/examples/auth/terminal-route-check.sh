#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${PARTNERS_ENV_FILE:-$ROOT_DIR/.env.local}"
BASE_URL="${PARTNERS_BASE_URL:-http://localhost:3002}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

ADMIN_TOKEN="${PARTNERS_ADMIN_SERVICE_TOKEN:-}"
PLATFORM_TOKEN="${PARTNERS_PLATFORM_SERVICE_TOKEN:-${QENTRAH_PLATFORM_SERVICE_TOKEN:-}}"

pass=0
fail=0

redact() {
  local value="${1:-}"
  if [[ -z "$value" ]]; then
    printf "<missing>"
  else
    printf "%s...%s" "${value:0:4}" "${value: -4}"
  fi
}

check_status() {
  local label="$1"
  local expected="$2"
  shift 2

  local tmp
  tmp="$(mktemp)"
  local status
  status="$(curl --silent --show-error --output "$tmp" --write-out "%{http_code}" "$@" || true)"
  if [[ "$status" == "$expected" ]]; then
    printf "PASS %-44s %s\n" "$label" "$status"
    pass=$((pass + 1))
  else
    printf "FAIL %-44s expected=%s actual=%s\n" "$label" "$expected" "$status"
    sed -n '1,12p' "$tmp"
    fail=$((fail + 1))
  fi
  rm -f "$tmp"
}

printf "Partners route check\n"
printf "Base URL: %s\n" "$BASE_URL"
printf "Admin token: %s\n" "$(redact "$ADMIN_TOKEN")"
printf "Platform token: %s\n" "$(redact "$PLATFORM_TOKEN")"
printf "\n"

check_status "unknown API returns JSON 404" 404 \
  "$BASE_URL/api/not-a-real-route"

check_status "admin list rejects missing token" 400 \
  "$BASE_URL/api/admin/partner-apps"

if [[ -n "$ADMIN_TOKEN" ]]; then
  check_status "admin list accepts bearer token" 200 \
    -H "authorization: Bearer $ADMIN_TOKEN" \
    "$BASE_URL/api/admin/partner-apps?limit=1"

  check_status "admin get missing app returns 404" 404 \
    -H "authorization: Bearer $ADMIN_TOKEN" \
    "$BASE_URL/api/admin/partner-apps/partners_app_missing"

  check_status "admin review validates body after auth" 400 \
    -X PATCH \
    -H "authorization: Bearer $ADMIN_TOKEN" \
    -H "content-type: application/json" \
    --data '{}' \
    "$BASE_URL/api/admin/partner-apps/partners_app_missing/review"
else
  printf "SKIP %-44s PARTNERS_ADMIN_SERVICE_TOKEN missing\n" "admin list accepts bearer token"
fi

check_status "platform catalog rejects missing token" 400 \
  "$BASE_URL/api/platform/published-apps"

if [[ -n "$PLATFORM_TOKEN" ]]; then
  check_status "platform catalog accepts service token" 200 \
    -H "x-qentrah-platform-token: $PLATFORM_TOKEN" \
    "$BASE_URL/api/platform/published-apps?limit=1"

  check_status "platform get missing app returns 404" 404 \
    -H "x-qentrah-platform-token: $PLATFORM_TOKEN" \
    "$BASE_URL/api/platform/published-apps/partners_app_missing"

  check_status "platform verify-authorization is protected" 200 \
    -X POST \
    -H "x-qentrah-platform-token: $PLATFORM_TOKEN" \
    -H "content-type: application/json" \
    --data '{"partnersAppId":"partners_app_missing","partnersClientId":"partners_client_missing","redirectUri":"https://partner.example.com/callback","scopes":["organization:read"]}' \
    "$BASE_URL/api/platform/verify-authorization"
else
  printf "SKIP %-44s PARTNERS_PLATFORM_SERVICE_TOKEN/QENTRAH_PLATFORM_SERVICE_TOKEN missing\n" "platform token checks"
fi

check_status "partner signup invalid body handled" 400 \
  -X POST \
  -H "content-type: application/json" \
  --data '{"email":"bad"}' \
  "$BASE_URL/api/partner-signup"

check_status "partner signin invalid body handled" 400 \
  -X POST \
  -H "content-type: application/json" \
  --data '{}' \
  "$BASE_URL/api/partner-signin"

check_status "partner organization requires session" 400 \
  -X POST \
  -H "content-type: application/json" \
  --data '{}' \
  "$BASE_URL/api/partner-organization"

check_status "MCP connections require session" 401 \
  "$BASE_URL/api/v1/mcp-connections"

check_status "MCP create requires session" 401 \
  -X POST \
  -H "content-type: application/json" \
  --data '{}' \
  "$BASE_URL/api/v1/mcp-connections"

check_status "MCP update requires session" 401 \
  -X PATCH \
  -H "content-type: application/json" \
  --data '{}' \
  "$BASE_URL/api/v1/mcp-connections/missing"

check_status "MCP revoke requires session" 401 \
  -X DELETE \
  "$BASE_URL/api/v1/mcp-connections/missing"

check_status "MCP rotate requires session" 401 \
  -X POST \
  -H "content-type: application/json" \
  --data '{}' \
  "$BASE_URL/api/v1/mcp-connections/missing/rotate"

check_status "MCP GET method not allowed" 405 \
  "$BASE_URL/api/mcp/partner/public/secret"

check_status "MCP DELETE method not allowed" 405 \
  -X DELETE \
  "$BASE_URL/api/mcp/partner/public/secret"

check_status "MCP POST invalid connection handled" 400 \
  -X POST \
  -H "content-type: application/json" \
  --data '{}' \
  "$BASE_URL/api/mcp/partner/public/secret"

check_status "search endpoint responds" 200 \
  "$BASE_URL/api/search"

check_status "sandbox rejects query bearer token" 400 \
  "$BASE_URL/api/v1/partner/organizations/sandbox_org_missing/clients?access_token=raw"

check_status "sandbox requires bearer header" 401 \
  "$BASE_URL/api/v1/partner/organizations/sandbox_org_missing/clients"

check_status "sandbox unknown resource is 404" 404 \
  "$BASE_URL/api/v1/partner/organizations/sandbox_org_missing/unknown"

check_status "sandbox delete collection is 405" 405 \
  -X DELETE \
  "$BASE_URL/api/v1/partner/organizations/sandbox_org_missing/clients"

check_status "sandbox OAuth authorize requires login" 401 \
  "$BASE_URL/sandbox/oauth/authorize"

check_status "sandbox OAuth token rejects grant" 400 \
  -X POST \
  -H "content-type: application/x-www-form-urlencoded" \
  --data 'grant_type=client_credentials' \
  "$BASE_URL/sandbox/oauth/token"

printf "\nSummary: %s passed, %s failed\n" "$pass" "$fail"
if [[ "$fail" -gt 0 ]]; then
  exit 1
fi
