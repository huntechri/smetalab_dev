#!/usr/bin/env bash
# test-list-org-webhooks.sh
#
# Automated tests for scripts/list-org-webhooks.sh.
#
# Uses a mock curl shim (injected via PATH) so no real GitHub credentials or
# network access are required.  Every key response path is exercised:
#
#   T01 — list with multiple webhooks  (HTTP 200, two hooks returned)
#   T02 — list with no webhooks        (HTTP 200, empty array)
#   T03 — successful delete            (HTTP 204)
#   T04 — delete non-existent ID       (HTTP 404)
#   T05 — permission denied on list    (HTTP 403)
#   T06 — permission denied on delete  (HTTP 403)
#
# Usage:
#   ./scripts/test-list-org-webhooks.sh
#
# Exit code: 0 if all tests pass, 1 if any test fails.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${SCRIPT_DIR}/list-org-webhooks.sh"

# ── Colours ───────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  BOLD='\033[1m'; GREEN='\033[0;32m'; RED='\033[0;31m'
  CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RESET='\033[0m'
else
  BOLD=''; GREEN=''; RED=''; CYAN=''; YELLOW=''; RESET=''
fi

PASS_COUNT=0
FAIL_COUNT=0

pass() { echo -e "${GREEN}  PASS${RESET}  $*"; (( PASS_COUNT++ )) || true; }
fail() { echo -e "${RED}  FAIL${RESET}  $*"; (( FAIL_COUNT++ )) || true; }
info() { echo -e "${CYAN}  ----${RESET}  $*"; }
header() { echo -e "\n${BOLD}$*${RESET}"; }

# ── Scratch space ─────────────────────────────────────────────────────────────
MOCK_DIR=$(mktemp -d)
trap 'rm -rf "${MOCK_DIR}"' EXIT

# ── Write the mock curl shim ──────────────────────────────────────────────────
#
# The shim inspects its arguments and the MOCK_SCENARIO env var, then returns
# canned responses that mimic the GitHub API:
#
#   200-multiple  — list returns two webhooks
#   200-empty     — list returns an empty array
#   204-delete    — delete succeeds (HTTP 204, no body)
#   404-delete    — webhook ID not found during delete
#   403-list      — permission denied while listing
#   403-delete    — permission denied while deleting

cat > "${MOCK_DIR}/curl" << 'CURL_EOF'
#!/usr/bin/env bash
# Mock curl shim — reads MOCK_SCENARIO; never touches the network.

METHOD="GET"
OUTPUT_FILE=""
WRITE_OUT_FORMAT=""
HEAD_ONLY=false
URL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -X)   METHOD="$2"; shift 2 ;;
    -o)   OUTPUT_FILE="$2"; shift 2 ;;
    -w)   WRITE_OUT_FORMAT="$2"; shift 2 ;;
    -sI)  HEAD_ONLY=true; shift ;;
    -sf|-s|-f) shift ;;
    -H)   shift 2 ;;
    -d)   shift 2 ;;
    --*)  shift ;;
    http*) URL="$1"; shift ;;
    *)    shift ;;
  esac
done

SCENARIO="${MOCK_SCENARIO:-200-multiple}"

# HEAD-like: return response headers including OAuth scopes
if $HEAD_ONLY; then
  echo "HTTP/2 200"
  echo "x-oauth-scopes: admin:org_hook, read:org"
  echo ""
  exit 0
fi

# GET /user — token identity check
if [[ "$URL" == */user ]]; then
  echo '{"login":"mock-admin","id":1,"type":"User"}'
  exit 0
fi

# DELETE /orgs/.../hooks/<id>
if [[ "$METHOD" == "DELETE" ]]; then
  case "$SCENARIO" in
    204-delete)
      HTTP_CODE="204"
      BODY=""
      ;;
    404-delete)
      HTTP_CODE="404"
      BODY='{"message":"Not Found","documentation_url":"https://docs.github.com/rest"}'
      ;;
    403-delete)
      HTTP_CODE="403"
      BODY='{"message":"Must have admin rights to Repository.","documentation_url":"https://docs.github.com/rest"}'
      ;;
    *)
      HTTP_CODE="500"
      BODY='{"message":"unexpected scenario"}'
      ;;
  esac
  if [[ -n "$OUTPUT_FILE" ]]; then
    printf '%s' "$BODY" > "$OUTPUT_FILE"
  fi
  if [[ "$WRITE_OUT_FORMAT" == "%{http_code}" ]]; then
    printf '%s' "$HTTP_CODE"
  fi
  exit 0
fi

# GET /orgs/.../hooks (list, possibly paginated)
if [[ "$URL" == */hooks* ]]; then
  case "$SCENARIO" in
    200-multiple)
      BODY='[{"id":11111111,"active":true,"events":["repository","push"],"config":{"url":"https://example.com/hook1","content_type":"json"},"created_at":"2024-01-01T00:00:00Z"},{"id":22222222,"active":false,"events":["pull_request"],"config":{"url":"https://example.com/hook2","content_type":"json"},"created_at":"2024-06-01T00:00:00Z"}]'
      HTTP_CODE="200"
      ;;
    200-empty)
      BODY='[]'
      HTTP_CODE="200"
      ;;
    403-list)
      BODY='{"message":"Must have admin rights to Repository.","documentation_url":"https://docs.github.com/rest"}'
      HTTP_CODE="403"
      ;;
    *)
      BODY='{"message":"unexpected scenario"}'
      HTTP_CODE="500"
      ;;
  esac
  if [[ -n "$OUTPUT_FILE" ]]; then
    printf '%s' "$BODY" > "$OUTPUT_FILE"
  fi
  if [[ "$WRITE_OUT_FORMAT" == "%{http_code}" ]]; then
    printf '%s' "$HTTP_CODE"
  fi
  exit 0
fi

# Fallback
echo '{}' >&2
exit 1
CURL_EOF
chmod +x "${MOCK_DIR}/curl"

# ── run_test helper ───────────────────────────────────────────────────────────
#
# run_test <id> <desc> <expected-exit> <output-pattern> [VAR=val ...] [-- extra args]
#
# Runs TARGET with:
#   • MOCK_DIR prepended to PATH (so the mock curl is used instead of real curl)
#   • Standard env vars that skip interactive prompts
#   • Any extra VAR=val pairs passed before "--"
#   • Any extra positional args passed after "--" are forwarded to the script
#
# Verifies exit code and that stdout+stderr matches <output-pattern> (grep -qiE).

run_test() {
  local id="$1" desc="$2" want_exit="$3" pattern="$4"
  shift 4

  # Split remaining args into env vars (VAR=val) and script args (after --)
  local env_args=() script_args=()
  local past_sep=false
  for arg in "$@"; do
    if [[ "$arg" == "--" ]]; then
      past_sep=true
    elif $past_sep; then
      script_args+=("$arg")
    else
      env_args+=("$arg")
    fi
  done

  local output exit_code
  output=$(env \
    PATH="${MOCK_DIR}:${PATH}" \
    ORG="test-org" \
    GH_TOKEN="ghp_mock_token_000000000000000000000" \
    "${env_args[@]+"${env_args[@]}"}" \
    bash "${TARGET}" "${script_args[@]+"${script_args[@]}"}" 2>&1)
  exit_code=$?

  local ok=true
  [[ "$exit_code" -eq "$want_exit" ]] || ok=false
  echo "$output" | grep -qiE "$pattern"   || ok=false

  if $ok; then
    pass "${id}: ${desc}"
  else
    fail "${id}: ${desc}"
    echo "       Expected exit=${want_exit}, got exit=${exit_code}"
    echo "       Expected output matching: ${pattern}"
    echo "       Actual output (last 10 lines):"
    echo "$output" | tail -10 | sed 's/^/         /'
  fi
}

# ── Tests ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║      list-org-webhooks.sh — automated test suite            ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
info "Mock curl: ${MOCK_DIR}/curl"
info "Target:    ${TARGET}"

# T01 — List with multiple webhooks (HTTP 200)
header "T01 — List with multiple webhooks (HTTP 200)"
run_test T01 "exits 0 and displays webhook IDs and URLs" 0 \
  "11111111|22222222|example\.com/hook" \
  MOCK_SCENARIO=200-multiple

# T02 — List with no webhooks (HTTP 200, empty array)
header "T02 — List with no webhooks (HTTP 200, empty array)"
run_test T02 "exits 0 and reports no webhooks found" 0 \
  "No webhooks found|no webhooks" \
  MOCK_SCENARIO=200-empty

# T03 — Successful delete (HTTP 204)
header "T03 — Successful delete (HTTP 204)"
run_test T03 "exits 0 and reports webhook deleted" 0 \
  "deleted successfully" \
  MOCK_SCENARIO=204-delete \
  -- test-org --delete 11111111

# T04 — Delete non-existent ID (HTTP 404)
header "T04 — Delete non-existent ID (HTTP 404)"
run_test T04 "exits 1 and reports hook not found" 1 \
  "not found|HTTP 404" \
  MOCK_SCENARIO=404-delete \
  -- test-org --delete 99999999

# T05 — Permission denied on list (HTTP 403)
header "T05 — Permission denied on list (HTTP 403)"
run_test T05 "exits 1 and reports permission denied" 1 \
  "Permission denied|HTTP 403|admin:org_hook" \
  MOCK_SCENARIO=403-list

# T06 — Permission denied on delete (HTTP 403)
header "T06 — Permission denied on delete (HTTP 403)"
run_test T06 "exits 1 and reports permission denied" 1 \
  "Permission denied|HTTP 403|admin:org_hook" \
  MOCK_SCENARIO=403-delete \
  -- test-org --delete 11111111

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  Results:  ${GREEN}${PASS_COUNT} passed${RESET}   ${RED}${FAIL_COUNT} failed${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  exit 1
fi
exit 0
