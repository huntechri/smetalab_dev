#!/usr/bin/env bash
# verify-branch-protection.sh
#
# Queries the GitHub repo-level Rulesets API for a repository and asserts that
# the expected main-protection ruleset is active.
#
# Exits 0 on success, non-zero if any assertion fails.
#
# Prerequisites:
#   - curl   (brew install curl / apt-get install curl)
#   - jq     (brew install jq / apt-get install jq)
#   - GH_TOKEN env var with at least repo read access
#
# Usage:
#   ./scripts/verify-branch-protection.sh [owner/repo]
#
#   owner/repo defaults to the git remote when omitted.

set -euo pipefail

MISSING_DEPS=()
command -v curl &>/dev/null || MISSING_DEPS+=("curl")
command -v jq &>/dev/null || MISSING_DEPS+=("jq")
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  echo "Error: missing required tools: ${MISSING_DEPS[*]}" >&2
  exit 1
fi

if [ -n "${1:-}" ]; then
  REPO_FULL="$1"
else
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  if [ -z "$REMOTE_URL" ]; then
    echo "Error: could not detect remote URL. Pass owner/repo as the first argument." >&2
    exit 1
  fi
  REPO_FULL=$(echo "$REMOTE_URL" \
    | sed -E 's|.*github\.com[:/]||; s|\.git$||')
fi

OWNER="${REPO_FULL%%/*}"
REPO_NAME="${REPO_FULL##*/}"

echo "Repository : ${OWNER}/${REPO_NAME}"
echo ""

if [ -z "${GH_TOKEN:-}" ]; then
  if command -v gh &>/dev/null; then
    GH_TOKEN=$(gh auth token 2>/dev/null || true)
  fi
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "Error: GH_TOKEN is not set and 'gh auth token' returned nothing." >&2
  exit 1
fi

gh_api() {
  curl -sf \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$@"
}

PASS=0
FAIL=0
WARN=0

assert_pass() { echo "  [PASS] $*"; PASS=$((PASS + 1)); }
assert_fail() { echo "  [FAIL] $*" >&2; FAIL=$((FAIL + 1)); }
assert_warn() { echo "  [WARN] $*"; WARN=$((WARN + 1)); }

echo "=== Check 1: repo-level main-protection ruleset ==="
RULESETS=$(gh_api "https://api.github.com/repos/${OWNER}/${REPO_NAME}/rulesets" 2>/dev/null || echo "[]")

RULESET=$(echo "$RULESETS" \
  | jq -r '.[] | select(.name == "main-protection")' 2>/dev/null || true)

if [ -z "$RULESET" ]; then
  assert_fail "No repo-level 'main-protection' ruleset found."
else
  ENFORCEMENT=$(echo "$RULESET" | jq -r '.enforcement' 2>/dev/null || echo "unknown")
  if [ "$ENFORCEMENT" = "active" ]; then
    assert_pass "Ruleset found with enforcement=active."
  else
    assert_fail "Ruleset found but enforcement='${ENFORCEMENT}' (expected 'active')."
  fi

  RULESET_ID=$(echo "$RULESET" | jq -r '.id')
  RULESET_DETAIL=$(gh_api "https://api.github.com/repos/${OWNER}/${REPO_NAME}/rulesets/${RULESET_ID}" 2>/dev/null || echo "{}")

  echo ""
  echo "=== Check 2: required_status_checks rule ==="
  STATUS_CHECK_RULE=$(echo "$RULESET_DETAIL" \
    | jq '.rules // [] | map(select(.type == "required_status_checks")) | first' 2>/dev/null || echo "null")

  if [ "$STATUS_CHECK_RULE" = "null" ] || [ -z "$STATUS_CHECK_RULE" ]; then
    assert_fail "No 'required_status_checks' rule found inside the ruleset."
  else
    assert_pass "'required_status_checks' rule is present."

    echo ""
    echo "=== Check 3: 'All Checks Passed' context ==="
    ALL_CHECKS_PRESENT=$(echo "$STATUS_CHECK_RULE" \
      | jq -r '.parameters.required_status_checks // [] | map(select(.context == "All Checks Passed")) | length' \
      2>/dev/null || echo "0")

    if [ "$ALL_CHECKS_PRESENT" -gt 0 ]; then
      assert_pass "'All Checks Passed' is listed as a required status check."
    else
      assert_fail "'All Checks Passed' is NOT in the required_status_checks list."
    fi

    echo ""
    echo "=== Check 4: strict policy (branch must be up to date) ==="
    STRICT=$(echo "$STATUS_CHECK_RULE" \
      | jq -r '.parameters.strict_required_status_checks_policy // false' 2>/dev/null || echo "false")
    if [ "$STRICT" = "true" ]; then
      assert_pass "strict_required_status_checks_policy is true."
    else
      assert_fail "strict_required_status_checks_policy is NOT true (PRs may merge without being up to date)."
    fi
  fi

  echo ""
  echo "=== Check 5: pull_request review requirement ==="
  PR_RULE=$(echo "$RULESET_DETAIL" \
    | jq '.rules // [] | map(select(.type == "pull_request")) | first' 2>/dev/null || echo "null")

  if [ "$PR_RULE" = "null" ] || [ -z "$PR_RULE" ]; then
    assert_warn "No 'pull_request' rule found — PRs may be merged without a required review."
  else
    REVIEW_COUNT=$(echo "$PR_RULE" \
      | jq -r '.parameters.required_approving_review_count // 0' 2>/dev/null || echo "0")
    if [ "$REVIEW_COUNT" -ge 1 ]; then
      assert_pass "At least ${REVIEW_COUNT} approving review(s) required."
    else
      assert_warn "required_approving_review_count is 0 — PRs can merge without review."
    fi

    CODE_OWNER_REVIEW=$(echo "$PR_RULE" \
      | jq -r '.parameters.require_code_owner_review // false' 2>/dev/null || echo "false")
    if [ "$CODE_OWNER_REVIEW" = "true" ]; then
      assert_pass "require_code_owner_review is true."
    else
      assert_warn "require_code_owner_review is false."
    fi
  fi
fi

echo ""
echo "=============================="
echo "Results: ${PASS} passed, ${FAIL} failed, ${WARN} warnings"
echo "=============================="

if [ "$FAIL" -gt 0 ]; then
  echo "Branch protection verification FAILED. See [FAIL] lines above." >&2
  exit 1
fi

if [ "$WARN" -gt 0 ]; then
  echo "Branch protection verification PASSED with ${WARN} advisory warning(s). See [WARN] lines above."
else
  echo "Branch protection verification PASSED."
fi
