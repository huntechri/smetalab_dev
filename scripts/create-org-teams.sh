#!/usr/bin/env bash
# create-org-teams.sh
#
# Creates the GitHub Organization teams required by .github/CODEOWNERS.
# Each team maps to a domain and becomes the mandatory reviewer for that area.
#
#   Team slug       CODEOWNERS area
#   ─────────────   ─────────────────────────────────────────────────────────
#   admins          .github/ — CI, branch protection, workflows
#   platform        lib/infrastructure/, db schema, Drizzle, app/actions/
#   security        lib/infrastructure/auth/
#   payments        lib/infrastructure/payments/
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated
#   - The authenticated user must be an owner of the target organization
#
# Usage:
#   ./scripts/create-org-teams.sh <org-name>
#
# Example:
#   ./scripts/create-org-teams.sh smetalab

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <org-name>" >&2
  echo "Example: $0 smetalab" >&2
  exit 1
fi

ORG="$1"

# Verify gh CLI is available
if ! command -v gh &>/dev/null; then
  echo "Error: GitHub CLI (gh) is not installed." >&2
  echo "Install it from https://cli.github.com and run 'gh auth login' before retrying." >&2
  exit 1
fi

# Verify authentication
if ! gh auth status &>/dev/null; then
  echo "Error: not authenticated. Run 'gh auth login' first." >&2
  exit 1
fi

echo "Creating teams in GitHub Organization: ${ORG}"
echo ""

# ── Team definitions ─────────────────────────────────────────────────────────
# Format: "slug|description|privacy"
# privacy: secret (invisible to non-members) or closed (visible org-wide)
TEAMS=(
  "admins|Owns CI workflows, branch-protection rules, and .github config|closed"
  "platform|Owns database schema, Drizzle migrations, server actions, and shared infrastructure|closed"
  "security|Owns authentication and security-critical paths — required reviewer for auth changes|closed"
  "payments|Owns billing and payments infrastructure — required reviewer for payment changes|closed"
)

CREATED=0
SKIPPED=0
FAILED=0

for entry in "${TEAMS[@]}"; do
  IFS="|" read -r SLUG DESCRIPTION PRIVACY <<< "$entry"

  echo "Team: @${ORG}/${SLUG}"
  echo "  Description : ${DESCRIPTION}"
  echo "  Privacy     : ${PRIVACY}"

  # Check whether the team already exists
  if gh api "orgs/${ORG}/teams/${SLUG}" &>/dev/null 2>&1; then
    echo "  Status      : already exists — skipping"
    SKIPPED=$((SKIPPED + 1))
  else
    if gh api \
        --method POST \
        -H "Accept: application/vnd.github+json" \
        "orgs/${ORG}/teams" \
        -f name="${SLUG}" \
        -f description="${DESCRIPTION}" \
        -f privacy="${PRIVACY}" \
        --jq '.html_url' 2>/dev/null; then
      echo "  Status      : created"
      CREATED=$((CREATED + 1))
    else
      echo "  Status      : FAILED to create" >&2
      FAILED=$((FAILED + 1))
    fi
  fi

  echo ""
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo "=============================="
echo "Results: ${CREATED} created, ${SKIPPED} already existed, ${FAILED} failed"
echo "=============================="

if [ "$FAILED" -gt 0 ]; then
  echo "" >&2
  echo "One or more teams could not be created. Ensure the authenticated user" >&2
  echo "is an owner of the '${ORG}' organization and retry." >&2
  exit 1
fi

echo ""
echo "Next steps:"
echo "  1. Add members to each team in the GitHub UI:"
echo "     https://github.com/orgs/${ORG}/teams"
echo "  2. Ensure the repository has been transferred to the '${ORG}' organization."
echo "  3. Apply org-level branch protection:"
echo "     ./scripts/setup-org-branch-protection.sh ${ORG}"
echo "  4. Verify branch protection:"
echo "     ./scripts/verify-org-branch-protection.sh ${ORG}"
