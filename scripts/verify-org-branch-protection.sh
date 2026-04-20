#!/usr/bin/env bash
# verify-org-branch-protection.sh
#
# Queries the GitHub org rulesets API and asserts that the
# "org-main-protection" ruleset is present and correctly configured.
#
# Exits 0 on success, non-zero if any assertion fails.
#
# Prerequisites:
#   - curl   (brew install curl / apt-get install curl)
#   - jq     (brew install jq / apt-get install jq)
#   - GH_TOKEN env var with admin:org scope (read org rulesets)
#
# Usage:
#   ./scripts/verify-org-branch-protection.sh [org-name]
#
#   org-name defaults to the owner inferred from the git remote.

set -euo pipefail

# ── Dependency check ────────────────────────────────────────────────────────
MISSING_DEPS=()
command -v curl &>/dev/null || MISSING_DEPS+=("curl")
command -v jq   &>/dev/null || MISSING_DEPS+=("jq")
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  echo "Error: missing required tools: ${MISSING_DEPS[*]}" >&2
  exit 1
fi

# ── Resolve organization name ────────────────────────────────────────────────
if [ -n "${1:-}" ]; then
  ORG="$1"
else
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  if [ -z "$REMOTE_URL" ]; then
    echo "Error: could not detect remote URL. Pass the org name as the first argument." >&2
    exit 1
  fi
  REPO_FULL=$(echo "$REMOTE_URL" \
    | sed -E 's|.*github\.com[:/]||; s|\.git$||')
  ORG="${REPO_FULL%%/*}"
fi

echo "Organization : ${ORG}"
echo ""

# ── Resolve GitHub token ─────────────────────────────────────────────────────
if [ -z "${GH_TOKEN:-}" ]; then
  if command -v gh &>/dev/null; then
    GH_TOKEN=$(gh auth token 2>/dev/null || true)
  fi
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "Error: GH_TOKEN is not set and 'gh auth token' returned nothing." >&2
  echo "The token needs the 'admin:org' scope to read org-level rulesets." >&2
  exit 1
fi

# ── Shared curl helper ───────────────────────────────────────────────────────
gh_api() {
  curl -sf \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$@"
}

API_BASE="https://api.github.com/orgs/${ORG}/rulesets"

PASS=0
FAIL=0

assert_pass() { echo "  [PASS] $*"; PASS=$((PASS+1)); }
assert_fail() { echo "  [FAIL] $*" >&2; FAIL=$((FAIL+1)); }

# ── Check 1: org-main-protection ruleset exists ───────────────────────────────
echo "=== Check 1: org-main-protection ruleset exists ==="

RULESETS=$(gh_api "${API_BASE}" 2>/dev/null || echo "[]")
RULESET=$(echo "$RULESETS" \
  | jq -r '.[] | select(.name == "org-main-protection")' 2>/dev/null || true)

if [ -z "$RULESET" ]; then
  assert_fail "No 'org-main-protection' ruleset found in org '${ORG}'."
  echo ""
  echo "=============================="
  echo "Results: ${PASS} passed, ${FAIL} failed"
  echo "=============================="
  echo "Org branch protection verification FAILED." \
    "Run scripts/setup-org-branch-protection.sh to create the ruleset." >&2
  exit 1
fi

assert_pass "Ruleset 'org-main-protection' found in org '${ORG}'."

# ── Check 2: enforcement=active ───────────────────────────────────────────────
echo ""
echo "=== Check 2: enforcement=active ==="

ENFORCEMENT=$(echo "$RULESET" | jq -r '.enforcement' 2>/dev/null || echo "unknown")

if [ "$ENFORCEMENT" = "active" ]; then
  assert_pass "enforcement=active."
else
  assert_fail "enforcement='${ENFORCEMENT}' (expected 'active'). The ruleset exists but is not enforced."
fi

# ── Fetch full ruleset detail (list endpoint omits rules array) ───────────────
RULESET_ID=$(echo "$RULESET" | jq -r '.id')
RULESET_DETAIL=$(gh_api "${API_BASE}/${RULESET_ID}" 2>/dev/null || echo "{}")

# ── Check 3: pull_request rule (at least 1 required review) ──────────────────
echo ""
echo "=== Check 3: pull_request review requirement ==="

PR_RULE=$(echo "$RULESET_DETAIL" \
  | jq '.rules // [] | map(select(.type == "pull_request")) | first' \
  2>/dev/null || echo "null")

if [ "$PR_RULE" = "null" ] || [ -z "$PR_RULE" ]; then
  assert_fail "No 'pull_request' rule found — PRs can be merged without a required review."
else
  REVIEW_COUNT=$(echo "$PR_RULE" \
    | jq -r '.parameters.required_approving_review_count // 0' \
    2>/dev/null || echo "0")

  if [ "$REVIEW_COUNT" -ge 1 ]; then
    assert_pass "'pull_request' rule requires ${REVIEW_COUNT} approving review(s)."
  else
    assert_fail "'pull_request' rule found but required_approving_review_count=0 — PRs can merge without review."
  fi

  # ── Check: require_code_owner_review ───────────────────────────────────────
  CODE_OWNER_REVIEW=$(echo "$PR_RULE" \
    | jq -r '.parameters.require_code_owner_review // false' \
    2>/dev/null || echo "false")

  if [ "$CODE_OWNER_REVIEW" = "true" ]; then
    assert_pass "require_code_owner_review is true — CODEOWNERS team review is enforced."
  else
    assert_fail "require_code_owner_review is NOT true — domain-team review is not enforced."
  fi

  # ── Check: dismiss_stale_reviews_on_push ───────────────────────────────────
  DISMISS_STALE=$(echo "$PR_RULE" \
    | jq -r '.parameters.dismiss_stale_reviews_on_push // false' \
    2>/dev/null || echo "false")

  if [ "$DISMISS_STALE" = "true" ]; then
    assert_pass "dismiss_stale_reviews_on_push is true — approvals are invalidated on new pushes."
  else
    assert_fail "dismiss_stale_reviews_on_push is NOT true — stale approvals may allow unsafe merges."
  fi

  # ── Check: require_last_push_approval ──────────────────────────────────────
  LAST_PUSH=$(echo "$PR_RULE" \
    | jq -r '.parameters.require_last_push_approval // false' \
    2>/dev/null || echo "false")

  if [ "$LAST_PUSH" = "true" ]; then
    assert_pass "require_last_push_approval is true — the last pusher cannot approve their own changes."
  else
    assert_fail "require_last_push_approval is NOT true — the last pusher could self-approve."
  fi
fi

# ── Check 4: required_status_checks rule is present ──────────────────────────
echo ""
echo "=== Check 4: required_status_checks rule ==="

STATUS_CHECK_RULE=$(echo "$RULESET_DETAIL" \
  | jq '.rules // [] | map(select(.type == "required_status_checks")) | first' \
  2>/dev/null || echo "null")

if [ "$STATUS_CHECK_RULE" = "null" ] || [ -z "$STATUS_CHECK_RULE" ]; then
  assert_fail "No 'required_status_checks' rule found inside the 'org-main-protection' ruleset."
else
  assert_pass "'required_status_checks' rule is present."

  # ── Check 5: 'All Checks Passed' context ─────────────────────────────────
  echo ""
  echo "=== Check 5: 'All Checks Passed' context ==="

  ALL_CHECKS_PRESENT=$(echo "$STATUS_CHECK_RULE" \
    | jq -r '.parameters.required_status_checks // [] | map(select(.context == "All Checks Passed")) | length' \
    2>/dev/null || echo "0")

  if [ "$ALL_CHECKS_PRESENT" -gt 0 ]; then
    assert_pass "'All Checks Passed' is listed as a required status check."
  else
    assert_fail "'All Checks Passed' is NOT in the required_status_checks list."
  fi

  # ── Check 6: strict_required_status_checks_policy ────────────────────────
  echo ""
  echo "=== Check 6: strict_required_status_checks_policy ==="

  STRICT=$(echo "$STATUS_CHECK_RULE" \
    | jq -r '.parameters.strict_required_status_checks_policy // false' \
    2>/dev/null || echo "false")

  if [ "$STRICT" = "true" ]; then
    assert_pass "strict_required_status_checks_policy is true."
  else
    assert_fail "strict_required_status_checks_policy is NOT true (PRs may merge without being up to date)."
  fi
fi

# ── Check 7: deletion rule is present ────────────────────────────────────────
echo ""
echo "=== Check 7: deletion rule ==="

DELETION_RULE=$(echo "$RULESET_DETAIL" \
  | jq '.rules // [] | map(select(.type == "deletion")) | length' \
  2>/dev/null || echo "0")

if [ "$DELETION_RULE" -gt 0 ]; then
  assert_pass "'deletion' rule is present (branch cannot be deleted)."
else
  assert_fail "'deletion' rule is missing — protected branches can be deleted."
fi

# ── Check 8: non_fast_forward rule is present ────────────────────────────────
echo ""
echo "=== Check 8: non_fast_forward rule ==="

NFF_RULE=$(echo "$RULESET_DETAIL" \
  | jq '.rules // [] | map(select(.type == "non_fast_forward")) | length' \
  2>/dev/null || echo "0")

if [ "$NFF_RULE" -gt 0 ]; then
  assert_pass "'non_fast_forward' rule is present (force-pushes are blocked)."
else
  assert_fail "'non_fast_forward' rule is missing — force-pushes are not blocked."
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "=============================="
echo "Results: ${PASS} passed, ${FAIL} failed"
echo "=============================="

if [ "$FAIL" -gt 0 ]; then
  echo "Org branch protection verification FAILED. See [FAIL] lines above." >&2
  echo "Re-run scripts/setup-org-branch-protection.sh or correct" \
    ".github/rulesets/org-main-protection.json." >&2
  exit 1
fi

echo "Org branch protection verification PASSED."
echo "'org-main-protection' is active and correctly configured for org '${ORG}'."
