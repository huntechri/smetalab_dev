#!/usr/bin/env bash
# validate-codeowners.test.sh
#
# Plain-Bash test suite for validate-codeowners.sh.
# No external dependencies required.
#
# Usage:
#   bash .github/scripts/validate-codeowners.test.sh
#
# Exit code:
#   0  — all tests passed
#   1  — one or more tests failed
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATE="$SCRIPT_DIR/validate-codeowners.sh"

# ── Helpers ──────────────────────────────────────────────────────────────────

PASS=0
FAIL=0
TMPDIR_ROOT="$(mktemp -d)"

cleanup() {
  rm -rf "$TMPDIR_ROOT"
}
trap cleanup EXIT

_tmp_file() {
  mktemp "$TMPDIR_ROOT/codeowners.XXXXXX"
}

_run() {
  local file="$1"
  # Always run without GITHUB_TOKEN so API verification is skipped.
  env -i HOME="$HOME" PATH="$PATH" bash "$VALIDATE" "$file" 2>&1
  return $?
}

pass() {
  local name="$1"
  echo "  PASS  $name"
  (( PASS++ )) || true
}

fail() {
  local name="$1" detail="$2"
  echo "  FAIL  $name"
  echo "        $detail"
  (( FAIL++ )) || true
}

assert_exits_zero() {
  local name="$1" file="$2"
  local output exit_code
  output=$(_run "$file") && exit_code=0 || exit_code=$?
  if [[ $exit_code -eq 0 ]]; then
    pass "$name"
  else
    fail "$name" "Expected exit 0, got $exit_code. Output: $output"
  fi
}

assert_exits_nonzero() {
  local name="$1" file="$2"
  local output exit_code
  output=$(_run "$file") && exit_code=0 || exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    pass "$name"
  else
    fail "$name" "Expected non-zero exit, got 0. Output: $output"
  fi
}

assert_output_contains() {
  local name="$1" file="$2" needle="$3"
  local output exit_code
  output=$(_run "$file") && exit_code=0 || exit_code=$?
  if echo "$output" | grep -qF "$needle"; then
    pass "$name"
  else
    fail "$name" "Expected output to contain '$needle'. Got: $output"
  fi
}

# ── Tests ────────────────────────────────────────────────────────────────────

echo "Running validate-codeowners.sh tests ..."
echo ""

# 1. Script fails when the CODEOWNERS file does not exist.
echo "[ missing file ]"
assert_exits_nonzero \
  "non-existent file causes failure" \
  "/tmp/this-file-does-not-exist-$(date +%s)"

echo ""

# 2. A fully valid CODEOWNERS file passes.
echo "[ valid file ]"
VALID_FILE=$(_tmp_file)
cat > "$VALID_FILE" <<'EOF'
# Global owners
* @org/team-alpha

# Backend
/src/server/ @alice @org/backend-team

# Frontend
/src/client/ @bob

# Inline comment should be stripped
/docs/ @carol # documentation team
EOF
assert_exits_zero \
  "valid file with users and teams passes" \
  "$VALID_FILE"

echo ""

# 3. Blank lines and pure-comment lines are skipped and do not cause failures.
echo "[ blank and comment lines ]"
BLANK_FILE=$(_tmp_file)
cat > "$BLANK_FILE" <<'EOF'

# This is a comment

   

# Another comment
* @dave
EOF
assert_exits_zero \
  "blank lines and comment-only lines are ignored" \
  "$BLANK_FILE"

echo ""

# 4. A pattern with no owner fails.
echo "[ missing owner ]"
NO_OWNER_FILE=$(_tmp_file)
cat > "$NO_OWNER_FILE" <<'EOF'
* @org/team-alpha
/src/server/
EOF
assert_exits_nonzero \
  "pattern with no owner fails" \
  "$NO_OWNER_FILE"

assert_output_contains \
  "missing-owner error message identifies the pattern" \
  "$NO_OWNER_FILE" \
  "no owner"

echo ""

# 5. A bad owner format (no leading @) fails.
echo "[ bad owner format — no @ ]"
BAD_FORMAT_FILE=$(_tmp_file)
cat > "$BAD_FORMAT_FILE" <<'EOF'
* alice
EOF
assert_exits_nonzero \
  "owner without @ prefix fails" \
  "$BAD_FORMAT_FILE"

assert_output_contains \
  "bad-format error message mentions format expectation" \
  "$BAD_FORMAT_FILE" \
  "invalid owner format"

echo ""

# 6. An owner with an invalid character in the handle fails.
echo "[ bad owner format — invalid characters ]"
BAD_CHARS_FILE=$(_tmp_file)
cat > "$BAD_CHARS_FILE" <<'EOF'
* @user name with spaces
EOF
assert_exits_nonzero \
  "owner with spaces in handle fails" \
  "$BAD_CHARS_FILE"

echo ""

# 7. A valid @org/team owner passes.
echo "[ @org/team format ]"
TEAM_FILE=$(_tmp_file)
cat > "$TEAM_FILE" <<'EOF'
* @myorg/platform-team
/api/ @myorg/api-team @lead-dev
EOF
assert_exits_zero \
  "@org/team format is accepted" \
  "$TEAM_FILE"

echo ""

# 8. Multiple owners on one line all pass (or all fail) correctly.
echo "[ multiple owners per line ]"
MULTI_OWNER_FILE=$(_tmp_file)
cat > "$MULTI_OWNER_FILE" <<'EOF'
* @alice @bob @org/core
EOF
assert_exits_zero \
  "multiple valid owners on one line passes" \
  "$MULTI_OWNER_FILE"

MULTI_BAD_FILE=$(_tmp_file)
cat > "$MULTI_BAD_FILE" <<'EOF'
* @alice badowner @org/core
EOF
assert_exits_nonzero \
  "one bad owner among valid ones still fails" \
  "$MULTI_BAD_FILE"

echo ""

# 9. Inline comments after a valid entry are stripped and do not become owners.
echo "[ inline comment stripping ]"
INLINE_COMMENT_FILE=$(_tmp_file)
cat > "$INLINE_COMMENT_FILE" <<'EOF'
* @alice # this comment should not be treated as an owner
EOF
assert_exits_zero \
  "inline comment after valid entry is stripped, not parsed as owner" \
  "$INLINE_COMMENT_FILE"

echo ""

# 10. The "Syntax OK" message appears on a passing run.
echo "[ success message ]"
SUCCESS_MSG_FILE=$(_tmp_file)
cat > "$SUCCESS_MSG_FILE" <<'EOF'
* @alice
EOF
assert_output_contains \
  "successful run prints 'Syntax OK'" \
  "$SUCCESS_MSG_FILE" \
  "Syntax OK"

echo ""

# ── Summary ──────────────────────────────────────────────────────────────────

TOTAL=$(( PASS + FAIL ))
echo "Results: $PASS passed, $FAIL failed (of $TOTAL tests)"
echo ""

if [[ $FAIL -gt 0 ]]; then
  echo "validate-codeowners tests FAILED." >&2
  exit 1
fi

echo "All validate-codeowners tests passed."
