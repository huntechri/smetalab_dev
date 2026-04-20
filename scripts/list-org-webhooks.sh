#!/usr/bin/env bash
# list-org-webhooks.sh
#
# Lists all organization webhooks and optionally deletes one by ID.
# Companion to configure-org-webhook.sh (Способ 5).
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
#   ./scripts/list-org-webhooks.sh [org-name]
#   ./scripts/list-org-webhooks.sh [org-name] --delete <hook-id>
#
# All prompts can be bypassed by setting environment variables (useful in CI):
#   GH_TOKEN  – GitHub token with admin:org_hook scope
#   ORG       – GitHub organization name

set -euo pipefail

# ── Temp-file cleanup ─────────────────────────────────────────────────────────
cleanup() { rm -f /tmp/gh_webhook_list_response.json /tmp/gh_webhook_del_response.json; }
trap cleanup EXIT

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

# ── Parse arguments ───────────────────────────────────────────────────────────
DELETE_ID=""
POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --delete)
      if [[ -z "${2:-}" ]]; then
        error "--delete requires a hook ID argument (e.g. --delete 12345678)"
        exit 1
      fi
      DELETE_ID="$2"
      shift 2
      ;;
    --help|-h)
      echo ""
      echo "Usage: $0 [org-name] [--delete <hook-id>]"
      echo ""
      echo "  Lists all org webhooks and their IDs, URLs, events, and status."
      echo "  Pass --delete <hook-id> to remove a specific webhook."
      echo ""
      echo "Environment variables (skip interactive prompts):"
      echo "  GH_TOKEN  – GitHub token with admin:org_hook scope"
      echo "  ORG       – GitHub organization name"
      echo ""
      exit 0
      ;;
    -*)
      error "Unknown option: $1"
      echo "  Run '$0 --help' for usage."
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1")
      shift
      ;;
  esac
done

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║        GitHub Org Webhook Manager — Fork Protection         ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Step 1: Organization name ─────────────────────────────────────────────────
header "Step 1 of 2 — Organization name"

if [ "${#POSITIONAL_ARGS[@]}" -gt 0 ]; then
  ORG="${POSITIONAL_ARGS[0]}"
  info "Using org from argument: ${ORG}"
elif [ -n "${ORG:-}" ]; then
  info "Using org from environment: ${ORG}"
else
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
header "Step 2 of 2 — GitHub Personal Access Token"

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

# Validate token
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

# Confirm the token has admin:org_hook scope
SCOPES=$(curl -sI \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/user" 2>/dev/null \
  | grep -i "^x-oauth-scopes:" | tr -d '\r' | sed 's/x-oauth-scopes: //i' || true)

if [ -n "$SCOPES" ]; then
  info "Token scopes: ${SCOPES}"
  if ! echo "$SCOPES" | grep -qE "(^|, )admin:org(_hook)?(,|$)"; then
    warn "The token appears to be missing the 'admin:org_hook' scope."
    warn "Listing/deleting webhooks will fail without it."
    warn "Regenerate the token at https://github.com/settings/tokens/new"
    warn "and enable the 'admin:org_hook' scope, then retry."
  fi
fi

# ── Delete mode ───────────────────────────────────────────────────────────────
if [ -n "$DELETE_ID" ]; then
  header "Deleting webhook ${DELETE_ID}..."

  HTTP_CODE=$(curl -s -o /tmp/gh_webhook_del_response.json -w "%{http_code}" \
    -X DELETE \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/orgs/${ORG}/hooks/${DELETE_ID}")

  rm -f /tmp/gh_webhook_del_response.json

  if [ "$HTTP_CODE" -eq 204 ]; then
    success "Webhook ${DELETE_ID} deleted successfully."
  elif [ "$HTTP_CODE" -eq 404 ]; then
    error "Webhook ${DELETE_ID} not found in org '${ORG}' (HTTP 404)."
    error "Run this script without --delete to list existing webhook IDs."
    exit 1
  elif [ "$HTTP_CODE" -eq 403 ]; then
    error "Permission denied (HTTP 403). Make sure:"
    error "  • You are an Owner of the '${ORG}' organization"
    error "  • Your token includes the 'admin:org_hook' scope"
    exit 1
  else
    error "Unexpected response (HTTP ${HTTP_CODE}) while deleting webhook ${DELETE_ID}."
    exit 1
  fi

  echo ""
  success "Done."
  exit 0
fi

# ── List mode (paginated) ──────────────────────────────────────────────────────
header "Fetching webhooks for org '${ORG}'..."

ALL_HOOKS="[]"
PAGE=1

while true; do
  HTTP_CODE=$(curl -s -o /tmp/gh_webhook_list_response.json -w "%{http_code}" \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/orgs/${ORG}/hooks?per_page=100&page=${PAGE}")

  PAGE_DATA=$(cat /tmp/gh_webhook_list_response.json)
  rm -f /tmp/gh_webhook_list_response.json

  if [ "$HTTP_CODE" -eq 403 ]; then
    error "Permission denied (HTTP 403). Make sure:"
    error "  • You are an Owner of the '${ORG}' organization"
    error "  • Your token includes the 'admin:org_hook' scope"
    exit 1
  elif [ "$HTTP_CODE" -eq 404 ]; then
    error "Organization '${ORG}' not found (HTTP 404). Check the name and try again."
    exit 1
  elif [ "$HTTP_CODE" -ne 200 ]; then
    error "Unexpected response (HTTP ${HTTP_CODE}):"
    echo "$PAGE_DATA" | jq . 2>/dev/null || echo "$PAGE_DATA"
    exit 1
  fi

  PAGE_COUNT=$(echo "$PAGE_DATA" | jq 'length')

  if [ "$PAGE_COUNT" -eq 0 ]; then
    break
  fi

  ALL_HOOKS=$(echo "$ALL_HOOKS $PAGE_DATA" | jq -s '.[0] + .[1]')

  if [ "$PAGE_COUNT" -lt 100 ]; then
    break
  fi

  PAGE=$((PAGE + 1))
done

RESPONSE="$ALL_HOOKS"
COUNT=$(echo "$RESPONSE" | jq 'length')

if [ "$COUNT" -eq 0 ]; then
  warn "No webhooks found for org '${ORG}'."
  echo ""
  info "Run ./scripts/configure-org-webhook.sh to register one."
  echo ""
  exit 0
fi

echo ""
echo -e "  Found ${BOLD}${COUNT}${RESET} webhook(s) in org '${BOLD}${ORG}${RESET}':"
echo ""
printf "  %-12s %-10s %-8s %-50s %s\n" "ID" "ACTIVE" "EVENTS" "URL" "CREATED"
printf "  %-12s %-10s %-8s %-50s %s\n" "------------" "----------" "--------" "--------------------------------------------------" "--------------------"

echo "$RESPONSE" | jq -c '.[]' | while IFS= read -r hook; do
  ID=$(echo     "$hook" | jq -r '.id')
  ACTIVE=$(echo "$hook" | jq -r '.active')
  URL=$(echo    "$hook" | jq -r '.config.url // "(none)"')
  EVENTS=$(echo "$hook" | jq -r '.events | length | tostring')
  CREATED=$(echo "$hook" | jq -r '.created_at | split("T")[0]')

  if [ "$ACTIVE" = "true" ]; then
    ACTIVE_LABEL="${GREEN}active${RESET}"
  else
    ACTIVE_LABEL="${YELLOW}inactive${RESET}"
  fi

  printf "  %-12s " "$ID"
  echo -en "${ACTIVE_LABEL}     "
  printf "%-8s %-50s %s\n" "$EVENTS" "$URL" "$CREATED"
done

echo ""
echo "  To see all events for a specific hook:"
echo "    curl -s -H 'Authorization: Bearer \$GH_TOKEN' \\"
echo "      https://api.github.com/orgs/${ORG}/hooks/<hook-id> | jq '.events'"
echo ""
echo "  To delete a webhook:"
echo "    ./scripts/list-org-webhooks.sh ${ORG} --delete <hook-id>"
echo ""
success "Done."
