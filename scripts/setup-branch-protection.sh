#!/usr/bin/env bash
# setup-branch-protection.sh
#
# Applies the branch-protection ruleset defined in
# .github/rulesets/main-protection.json to the current GitHub repository
# using the Rulesets REST API (2022-11-28).
#
# Prerequisites:
#   - curl    (usually pre-installed; brew install curl / apt-get install curl)
#   - jq      (brew install jq / apt-get install jq)
#   - GitHub CLI (gh) installed and authenticated  OR  GH_TOKEN env var set
#   - The token must have the "administration:write" permission on the repo
#
# Usage:
#   ./scripts/setup-branch-protection.sh [owner/repo]
#
# If owner/repo is omitted the script auto-detects it from the git remote.

set -euo pipefail

# ── Dependency check ────────────────────────────────────────────────────────
MISSING_DEPS=()
command -v curl &>/dev/null || MISSING_DEPS+=("curl")
command -v jq   &>/dev/null || MISSING_DEPS+=("jq")
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  echo "Error: missing required tools: ${MISSING_DEPS[*]}" >&2
  echo "Install them (e.g. brew install ${MISSING_DEPS[*]} / apt-get install ${MISSING_DEPS[*]}) and retry." >&2
  exit 1
fi

RULESET_FILE="$(dirname "$0")/../.github/rulesets/main-protection.json"

# ── Resolve repository (owner/repo) ─────────────────────────────────────────
if [ -n "${1:-}" ]; then
  REPO="$1"
else
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  if [ -z "$REMOTE_URL" ]; then
    echo "Error: could not detect remote URL. Pass owner/repo as the first argument." >&2
    exit 1
  fi
  # Support both HTTPS and SSH remote URLs
  REPO=$(echo "$REMOTE_URL" \
    | sed -E 's|.*github\.com[:/]||; s|\.git$||')
fi

OWNER="${REPO%%/*}"
REPO_NAME="${REPO##*/}"

echo "Repository : ${OWNER}/${REPO_NAME}"
echo "Ruleset    : ${RULESET_FILE}"
echo ""

# ── Resolve GitHub token ─────────────────────────────────────────────────────
# Prefer GH_TOKEN; fall back to whatever 'gh auth token' returns
if [ -z "${GH_TOKEN:-}" ]; then
  if command -v gh &>/dev/null; then
    GH_TOKEN=$(gh auth token 2>/dev/null || true)
  fi
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "Error: GH_TOKEN is not set and 'gh auth token' returned nothing." >&2
  echo "Run 'gh auth login' or export GH_TOKEN before running this script." >&2
  exit 1
fi

# ── Helper: pretty-print JSON (graceful fallback if jq unavailable) ──────────
pretty_json() {
  if command -v jq &>/dev/null; then
    jq '{id, name, enforcement, target}' 2>/dev/null || cat
  else
    cat
  fi
}

API_BASE="https://api.github.com/repos/${OWNER}/${REPO_NAME}/rulesets"

# ── Step 1: look for an existing ruleset with the same name ─────────────────
echo "Step 1: Check for an existing 'main-protection' ruleset..."
EXISTING_ID=$(curl -sf \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${API_BASE}" \
  | jq -r '.[] | select(.name == "main-protection") | .id' 2>/dev/null || true)

PAYLOAD=$(cat "$RULESET_FILE")

# ── Step 2: create or update ─────────────────────────────────────────────────
if [ -n "$EXISTING_ID" ]; then
  echo "Found existing ruleset id=${EXISTING_ID}. Updating..."
  curl -sf \
    -X PUT \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    "${API_BASE}/${EXISTING_ID}" | pretty_json
else
  echo "No existing ruleset found. Creating..."
  curl -sf \
    -X POST \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    "${API_BASE}" | pretty_json
fi

echo ""
echo "Done. 'All Checks Passed' is now required and at least 1 approving review must be given before merging into main/master."
echo "     Stale approvals are automatically dismissed when new commits are pushed to a PR."
echo "     The person who pushed the last commit cannot approve the PR (require_last_push_approval=true)."
