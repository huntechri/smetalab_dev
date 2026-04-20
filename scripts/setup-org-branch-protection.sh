#!/usr/bin/env bash
# setup-org-branch-protection.sh
#
# Applies the branch-protection ruleset defined in
# .github/rulesets/org-main-protection.json to a GitHub ORGANIZATION
# using the Org-level Rulesets REST API (2022-11-28).
#
# An org-level ruleset automatically protects ALL repositories in the org
# (including forks created in the future) with zero manual steps per repo.
#
# Prerequisites:
#   - curl    (brew install curl / apt-get install curl)
#   - jq      (brew install jq / apt-get install jq)
#   - GitHub CLI (gh) installed and authenticated  OR  GH_TOKEN env var set
#   - The token must have the "admin:org" scope (org-level administration)
#
# Usage:
#   ./scripts/setup-org-branch-protection.sh [org-name]
#
# If org-name is omitted the script auto-detects it from the git remote.

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

RULESET_FILE="$(dirname "$0")/../.github/rulesets/org-main-protection.json"

# ── Resolve organization name ────────────────────────────────────────────────
if [ -n "${1:-}" ]; then
  ORG="$1"
else
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  if [ -z "$REMOTE_URL" ]; then
    echo "Error: could not detect remote URL. Pass the org name as the first argument." >&2
    exit 1
  fi
  REPO=$(echo "$REMOTE_URL" \
    | sed -E 's|.*github\.com[:/]||; s|\.git$||')
  ORG="${REPO%%/*}"
fi

echo "Organization : ${ORG}"
echo "Ruleset file : ${RULESET_FILE}"
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
  echo "The token needs the 'admin:org' scope for org-level rulesets." >&2
  exit 1
fi

# ── Helper: pretty-print JSON ────────────────────────────────────────────────
pretty_json() {
  jq '{id, name, enforcement, target}' 2>/dev/null || cat
}

API_BASE="https://api.github.com/orgs/${ORG}/rulesets"

# ── Step 1: look for an existing org ruleset with the same name ───────────
echo "Step 1: Check for an existing 'org-main-protection' ruleset in org '${ORG}'..."
EXISTING_ID=$(curl -sf \
  -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${API_BASE}" \
  | jq -r '.[] | select(.name == "org-main-protection") | .id' 2>/dev/null || true)

PAYLOAD=$(cat "$RULESET_FILE")

# ── Step 2: create or update ──────────────────────────────────────────────
if [ -n "$EXISTING_ID" ]; then
  echo "Found existing org ruleset id=${EXISTING_ID}. Updating..."
  curl -sf \
    -X PUT \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    "${API_BASE}/${EXISTING_ID}" | pretty_json
else
  echo "No existing org ruleset found. Creating..."
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
echo "Done."
echo "'org-main-protection' is now active for ALL repositories in the '${ORG}' organization,"
echo "including any future forks. No per-repo setup is required."
