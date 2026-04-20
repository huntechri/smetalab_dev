#!/usr/bin/env bash
# configure-org-webhook.sh
#
# Guided setup script for admins: registers a GitHub Organization webhook that
# fires on repository-creation events, enabling zero-touch fork protection
# via auto-branch-protection.yml (Способ 5).
#
# No code editing required — just run this script and answer the prompts.
#
# Prerequisites:
#   - curl    (brew install curl / apt-get install curl)
#   - jq      (brew install jq / apt-get install jq)
#   - A GitHub Personal Access Token (classic) with the "admin:org_hook" scope
#     (Settings → Developer settings → Personal access tokens → Tokens (classic))
#
# Usage:
#   ./scripts/configure-org-webhook.sh [org-name]
#
# All prompts can be bypassed by setting environment variables (useful in CI):
#   GH_TOKEN         – GitHub token with admin:org_hook scope
#   WEBHOOK_URL      – HTTPS URL that will receive webhook payloads
#   WEBHOOK_SECRET   – Shared secret used to sign payloads (optional but recommended)
#   ORG              – GitHub organization name

set -euo pipefail

# ── Colours (disabled when not a TTY) ────────────────────────────────────────
if [ -t 1 ]; then
  BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  CYAN='\033[0;36m'; RED='\033[0;31m'; RESET='\033[0m'
else
  BOLD=''; GREEN=''; YELLOW=''; CYAN=''; RED=''; RESET=''
fi

info()    { echo -e "${CYAN}  ▶${RESET} $*"; }
success() { echo -e "${GREEN}  ✔${RESET} $*"; }
warn()    { echo -e "${YELLOW}  ⚠${RESET} $*"; }
error()   { echo -e "${RED}  ✘${RESET} $*" >&2; }
header()  { echo -e "\n${BOLD}$*${RESET}"; }
prompt()  { echo -en "${BOLD}  $* ${RESET}"; }

# ── Dependency check ──────────────────────────────────────────────────────────
MISSING=()
command -v curl &>/dev/null || MISSING+=("curl")
command -v jq   &>/dev/null || MISSING+=("jq")
if [ "${#MISSING[@]}" -gt 0 ]; then
  error "Missing required tools: ${MISSING[*]}"
  echo  "  Install with:  brew install ${MISSING[*]}"
  echo  "             or: sudo apt-get install -y ${MISSING[*]}"
  exit 1
fi

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║        GitHub Org Webhook Setup — Fork Protection           ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo "  This script registers an organization-level webhook so that GitHub"
echo "  automatically notifies your workflow whenever a new repository (or fork)"
echo "  is created in your organization."
echo ""
echo "  You will need:"
echo "    1. A GitHub Personal Access Token with the 'admin:org_hook' scope"
echo "    2. The HTTPS URL of the service that will receive webhook events"
echo "       (e.g. the URL of your GitHub App, or a hosted proxy)"
echo ""

# ── Step 1: Organization name ─────────────────────────────────────────────────
header "Step 1 of 4 — Organization name"

if [ -n "${1:-}" ]; then
  ORG="$1"
  info "Using org from argument: ${ORG}"
elif [ -n "${ORG:-}" ]; then
  info "Using org from environment: ${ORG}"
else
  # Try to auto-detect from git remote
  DETECTED=""
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  if [ -n "$REMOTE_URL" ]; then
    DETECTED=$(echo "$REMOTE_URL" \
      | sed -E 's|.*github\.com[:/]||; s|\.git$||; s|/.*||')
    warn "Detected '${DETECTED}' from git remote."
  fi

  prompt "Enter your GitHub organization name${DETECTED:+ [${DETECTED}]}:"
  read -r INPUT_ORG
  ORG="${INPUT_ORG:-${DETECTED}}"
fi

if [ -z "${ORG:-}" ]; then
  error "Organization name is required."
  exit 1
fi
success "Organization: ${ORG}"

# ── Step 2: GitHub token ──────────────────────────────────────────────────────
header "Step 2 of 4 — GitHub Personal Access Token"

if [ -z "${GH_TOKEN:-}" ]; then
  if command -v gh &>/dev/null; then
    GH_TOKEN=$(gh auth token 2>/dev/null || true)
    if [ -n "${GH_TOKEN}" ]; then
      info "Found token via GitHub CLI (gh)."
    fi
  fi
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "  Create a token at: https://github.com/settings/tokens/new"
  echo "  Required scopes:   admin:org_hook"
  echo ""
  prompt "Paste your GitHub Personal Access Token (input hidden):"
  read -rs GH_TOKEN
  echo ""
fi

if [ -z "${GH_TOKEN:-}" ]; then
  error "A GitHub token is required."
  exit 1
fi

# Validate token and check org membership/admin rights
info "Validating token against GitHub API..."
USER_JSON=$(curl -sf \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/user" 2>/dev/null || true)

if [ -z "$USER_JSON" ]; then
  error "Token validation failed — check that the token is correct and not expired."
  exit 1
fi
GH_USER=$(echo "$USER_JSON" | jq -r '.login')
success "Authenticated as: ${GH_USER}"

# Confirm the token has admin:org_hook scope (the API lists allowed scopes in headers)
SCOPES=$(curl -sI \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/user" 2>/dev/null \
  | grep -i "^x-oauth-scopes:" | tr -d '\r' | sed 's/x-oauth-scopes: //i' || true)

if [ -n "$SCOPES" ]; then
  info "Token scopes: ${SCOPES}"
  if ! echo "$SCOPES" | grep -qE "(^|, )admin:org(_hook)?(,|$)"; then
    warn "The token appears to be missing the 'admin:org_hook' scope."
    warn "Webhook creation will fail without it."
    warn "Regenerate the token at https://github.com/settings/tokens/new"
    warn "and enable the 'admin:org_hook' scope, then retry."
  fi
else
  warn "Could not verify token scopes — this is expected for fine-grained PATs,"
  warn "which do not expose an x-oauth-scopes header."
  warn "Please ensure the token has the 'org_hooks: write' permission before continuing."
  warn "You can review token permissions at https://github.com/settings/tokens"
fi

# ── Step 3: Webhook payload URL ───────────────────────────────────────────────
header "Step 3 of 4 — Webhook payload URL"

echo "  This is the HTTPS endpoint that GitHub will call when a repository is"
echo "  created in your organization."
echo ""
echo "  If you are using the recommended GitHub App approach (Способ 5 in the"
echo "  README), paste the 'Webhook URL' shown in your App's settings page."
echo ""

if [ -z "${WEBHOOK_URL:-}" ]; then
  prompt "Paste the webhook payload URL:"
  read -r WEBHOOK_URL
fi

if [ -z "${WEBHOOK_URL:-}" ]; then
  error "A webhook URL is required."
  exit 1
fi

if [[ "$WEBHOOK_URL" != https://* ]]; then
  error "The webhook URL must start with 'https://'."
  exit 1
fi
success "Webhook URL: ${WEBHOOK_URL}"

# ── Step 4: Webhook secret ────────────────────────────────────────────────────
header "Step 4 of 4 — Webhook secret (optional but strongly recommended)"

echo "  A shared secret lets your app verify that webhook payloads really come"
echo "  from GitHub. Generate a random string and store it in your app's"
echo "  environment as well."
echo ""
echo "  Generate one now: openssl rand -hex 32"
echo ""

if [ -z "${WEBHOOK_SECRET:-}" ]; then
  prompt "Enter a webhook secret (leave blank to skip):"
  read -rs WEBHOOK_SECRET
  echo ""
fi

if [ -n "${WEBHOOK_SECRET:-}" ]; then
  success "Webhook secret provided (not displayed)."
else
  warn "No webhook secret set — payload authenticity cannot be verified."
fi

# ── Create the webhook ────────────────────────────────────────────────────────
header "Creating the organization webhook..."

SECRET_JSON=""
if [ -n "${WEBHOOK_SECRET:-}" ]; then
  SECRET_JSON=", \"secret\": $(echo -n "${WEBHOOK_SECRET}" | jq -Rs .)"
fi

PAYLOAD=$(cat <<EOF
{
  "name": "web",
  "active": true,
  "events": ["repository"],
  "config": {
    "url": $(echo -n "${WEBHOOK_URL}" | jq -Rs .)
    , "content_type": "json"
    , "insecure_ssl": "0"
    ${SECRET_JSON}
  }
}
EOF
)

API_URL="https://api.github.com/orgs/${ORG}/hooks"

HTTP_CODE=$(curl -s -o /tmp/gh_webhook_response.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$API_URL")

RESPONSE=$(cat /tmp/gh_webhook_response.json)
rm -f /tmp/gh_webhook_response.json

if [ "$HTTP_CODE" -eq 201 ]; then
  HOOK_ID=$(echo "$RESPONSE" | jq -r '.id')
  HOOK_EVENTS=$(echo "$RESPONSE" | jq -r '.events | join(", ")')
  echo ""
  success "Webhook created successfully!"
  info  "  Hook ID : ${HOOK_ID}"
  info  "  Events  : ${HOOK_EVENTS}"
  info  "  URL     : ${WEBHOOK_URL}"
elif [ "$HTTP_CODE" -eq 422 ]; then
  MSG=$(echo "$RESPONSE" | jq -r '.errors[0].message // .message // empty' 2>/dev/null || true)
  if echo "$MSG" | grep -qi "already exists\|Hook already"; then
    warn "A webhook pointing to this URL already exists in '${ORG}' — no duplicate created."
  else
    error "Validation error (HTTP 422): ${MSG:-see response below}"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
    exit 1
  fi
elif [ "$HTTP_CODE" -eq 403 ]; then
  error "Permission denied (HTTP 403). Make sure:"
  error "  • You are an Owner of the '${ORG}' organization"
  error "  • Your token includes the 'admin:org_hook' scope"
  exit 1
elif [ "$HTTP_CODE" -eq 404 ]; then
  error "Organization '${ORG}' not found (HTTP 404). Check the name and try again."
  exit 1
else
  error "Unexpected response (HTTP ${HTTP_CODE}):"
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

# ── Next steps ────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║                        Next Steps                          ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo "  The org webhook is now registered. To complete zero-touch fork"
echo "  protection you still need an authenticated intermediary that:"
echo ""
echo "  1. Receives the 'repository.created' event at ${WEBHOOK_URL}"
echo "  2. Authenticates to GitHub (as a GitHub App installation or via a PAT)"
echo "  3. Calls POST /repos/${ORG}/<this-repo>/dispatches with:"
echo "       { \"event_type\": \"repository_created\","
echo "         \"client_payload\": { \"repository\": \"${ORG}/<new-repo>\" } }"
echo ""
echo "  The workflow .github/workflows/auto-branch-protection.yml then"
echo "  applies branch protection automatically to the new repository."
echo ""
echo "  See the README (Способ 5) for the full recommended GitHub App setup."
echo ""
echo "  Need to verify the webhook was registered? Run:"
echo "    curl -s -H 'Authorization: Bearer \$GH_TOKEN' \\"
echo "      https://api.github.com/orgs/${ORG}/hooks | jq '.[].config.url'"
echo ""
success "Done."
