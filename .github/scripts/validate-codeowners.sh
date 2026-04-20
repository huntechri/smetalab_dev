#!/usr/bin/env bash
# validate-codeowners.sh
#
# Validates .github/CODEOWNERS for:
#   1. Syntax  — every non-comment, non-blank line must have a pattern and at
#                least one owner in @user or @org/team format.
#   2. Owner existence — when GITHUB_TOKEN is set, each unique owner is
#                verified against the GitHub API (users and teams).
#
# Required token permissions for full API verification:
#   - User verification  : No extra scope needed (public API).
#   - Team verification  : The token must have the `read:org` scope (or be a
#                          fine-grained token with "Members" read access).
#                          Without it, the API returns HTTP 403 or 404, which
#                          this script reports as a permissions error rather
#                          than a missing-team error so you get a clear signal.
#
# Environment variables:
#   GITHUB_TOKEN          Required for API verification (set automatically in CI).
#   GITHUB_REPOSITORY     Set automatically in CI (<owner>/<repo>).
#   CODEOWNERS_API_STRICT When set to "true", any API response other than 200
#                         or 404 is treated as a hard failure instead of a
#                         warning. Useful for enforcing full verification.
#
# Usage:
#   bash validate-codeowners.sh [<path-to-CODEOWNERS>]
#   Default path: .github/CODEOWNERS
set -euo pipefail

CODEOWNERS="${1:-.github/CODEOWNERS}"
STRICT="${CODEOWNERS_API_STRICT:-false}"

if [[ ! -f "$CODEOWNERS" ]]; then
  echo "ERROR: CODEOWNERS file not found at '$CODEOWNERS'" >&2
  exit 1
fi

echo "Validating $CODEOWNERS ..."

errors=0
line_number=0
declare -A seen_owners

OWNER_PATTERN='^@[A-Za-z0-9_.-]+(/[A-Za-z0-9_.-]+)?$'

while IFS= read -r line; do
  (( line_number++ )) || true

  # Strip inline comments
  line_body="${line%%#*}"

  # Skip blank lines and pure-comment lines
  [[ -z "${line_body// /}" ]] && continue

  # Split into tokens
  read -ra tokens <<< "$line_body"

  # First token is the path pattern — must be present
  if [[ ${#tokens[@]} -lt 1 ]]; then
    echo "ERROR line $line_number: empty entry (no pattern)." >&2
    (( errors++ )) || true
    continue
  fi

  # Must have at least one owner
  if [[ ${#tokens[@]} -lt 2 ]]; then
    echo "ERROR line $line_number: pattern '${tokens[0]}' has no owner." >&2
    (( errors++ )) || true
    continue
  fi

  # Validate each owner token
  for (( i=1; i<${#tokens[@]}; i++ )); do
    owner="${tokens[$i]}"
    if [[ ! "$owner" =~ $OWNER_PATTERN ]]; then
      echo "ERROR line $line_number: invalid owner format '$owner' (expected @user or @org/team)." >&2
      (( errors++ )) || true
    else
      seen_owners["$owner"]=1
    fi
  done

done < "$CODEOWNERS"

if [[ $errors -gt 0 ]]; then
  echo "CODEOWNERS syntax validation failed with $errors error(s)." >&2
  exit 1
fi

echo "Syntax OK — ${#seen_owners[@]} unique owner(s) found."

# ── Optional: verify owners exist via the GitHub API ─────────────────────────
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN not set — skipping API owner verification."
  exit 0
fi

if [[ -z "${GITHUB_REPOSITORY:-}" ]]; then
  echo "GITHUB_REPOSITORY not set — skipping API owner verification."
  exit 0
fi

# Emit a note so operators know what mode is active.
if [[ "$STRICT" == "true" ]]; then
  echo "API verification mode: STRICT (any unexpected HTTP status is a failure)."
else
  echo "API verification mode: LENIENT (transient API errors are warnings; set CODEOWNERS_API_STRICT=true to harden)."
fi

api_errors=0
api_warnings=0

_api_get() {
  local url="$1"
  curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "$url"
}

_handle_unexpected_status() {
  local owner="$1" type="$2" status="$3"
  if [[ "$STRICT" == "true" ]]; then
    echo "ERROR: could not verify $type $owner — unexpected HTTP $status (strict mode)." >&2
    (( api_errors++ )) || true
  else
    echo "WARN: could not verify $type $owner (HTTP $status) — skipping. If this persists, check token permissions." >&2
    (( api_warnings++ )) || true
  fi
}

for owner in "${!seen_owners[@]}"; do
  slug="${owner#@}"

  if [[ "$slug" == */* ]]; then
    # ── Team: @org/team-slug ──────────────────────────────────────────────────
    team_org="${slug%%/*}"
    team_slug="${slug#*/}"
    url="https://api.github.com/orgs/${team_org}/teams/${team_slug}"
    status=$(_api_get "$url")

    case "$status" in
      200)
        echo "  OK   team  $owner"
        ;;
      404)
        echo "ERROR: team $owner not found (HTTP 404). Verify the org and team slug are correct." >&2
        (( api_errors++ )) || true
        ;;
      403)
        echo "ERROR: access denied verifying team $owner (HTTP 403). The GITHUB_TOKEN needs the 'read:org' scope to look up team membership." >&2
        (( api_errors++ )) || true
        ;;
      *)
        _handle_unexpected_status "$owner" "team" "$status"
        ;;
    esac

  else
    # ── User: @username ───────────────────────────────────────────────────────
    url="https://api.github.com/users/${slug}"
    status=$(_api_get "$url")

    case "$status" in
      200)
        echo "  OK   user  $owner"
        ;;
      404)
        echo "ERROR: user $owner not found (HTTP 404). Verify the GitHub username is spelled correctly." >&2
        (( api_errors++ )) || true
        ;;
      *)
        _handle_unexpected_status "$owner" "user" "$status"
        ;;
    esac
  fi
done

if [[ $api_errors -gt 0 ]]; then
  echo "CODEOWNERS API verification failed: $api_errors owner(s) could not be resolved." >&2
  exit 1
fi

if [[ $api_warnings -gt 0 ]]; then
  echo "API verification completed with $api_warnings warning(s) — some owners were not fully verified."
else
  echo "All owners verified successfully."
fi
