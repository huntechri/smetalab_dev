#!/usr/bin/env bash
# test-configure-org-webhook.sh
#
# Automated tests for scripts/configure-org-webhook.sh.
#
# Uses a mock curl shim (injected via PATH) so no real GitHub credentials or
# network access are required.  Every key response path is exercised:
#
#   T01 — happy path          (HTTP 201 Created)
#   T02 — duplicate webhook   (HTTP 422 + "already exists" message)
#   T03 — insufficient scope  (HTTP 403 Forbidden)
#   T04 — org not found       (HTTP 404 Not Found)
#   T05 — missing dependency  (curl absent from PATH → exit 1)
#   T06 — bad webhook URL     (non-https URL → exit 1)
#   T07 — empty org name      (no org supplied → exit 1)
#
# Usage:
#   ./scripts/test-configure-org-webhook.sh
#
# Exit code: 0 if all tests pass, 1 if any test fails.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${SCRIPT_DIR}/configure-org-webhook.sh"

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
#   201              — webhook created successfully
#   422-duplicate    — webhook URL already registered
#   403              — caller is not an org owner / wrong token scope
#   404              — organisation name not found

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

SCENARIO="${MOCK_SCENARIO:-201}"

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

# POST /orgs/.../hooks — webhook registration
if [[ "$URL" == */hooks ]]; then
  case "$SCENARIO" in
    201)
      BODY='{"id":99999,"active":true,"events":["repository"],"config":{"url":"https://example.com/hook","content_type":"json","insecure_ssl":"0"}}'
      HTTP_CODE="201"
      ;;
    422-duplicate)
      BODY='{"message":"Validation Failed","errors":[{"resource":"Hook","code":"custom","message":"Hook already exists on this organization for url: https://example.com/hook"}]}'
      HTTP_CODE="422"
      ;;
    403)
      BODY='{"message":"Must have admin rights to Repository.","documentation_url":"https://docs.github.com/rest"}'
      HTTP_CODE="403"
      ;;
    404)
      BODY='{"message":"Not Found","documentation_url":"https://docs.github.com/rest"}'
      HTTP_CODE="404"
      ;;
    *)
      BODY="{\"message\":\"unexpected scenario: ${SCENARIO}\"}"
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
# run_test <id> <desc> <expected-exit> <output-pattern> [VAR=val ...]
#
# Runs TARGET with:
#   • MOCK_DIR prepended to PATH (so the mock curl is used instead of real curl)
#   • Standard env vars that skip interactive prompts
#   • Any extra VAR=val pairs passed as additional arguments
#
# Verifies exit code and that stdout+stderr matches <output-pattern> (grep -qiE).

run_test() {
  local id="$1" desc="$2" want_exit="$3" pattern="$4"
  shift 4

  local output exit_code
  # Note: no || true here — we need the real exit code from the subshell.
  # set -uo pipefail (no -e) means a non-zero $() doesn't abort the outer script.
  output=$(env \
    PATH="${MOCK_DIR}:${PATH}" \
    ORG="test-org" \
    GH_TOKEN="ghp_mock_token_000000000000000000000" \
    WEBHOOK_URL="https://example.com/hook" \
    WEBHOOK_SECRET="mock-secret" \
    "$@" \
    bash "${TARGET}" 2>&1)
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

# ── T05 helper: build a PATH that has essential tools but NOT curl ─────────────
#
# We create wrappers for every external command used by configure-org-webhook.sh
# (jq, sed, grep, tr, git) pointing to their real absolute paths, then set PATH
# to that directory only.  curl is intentionally omitted so the dependency check
# fires and the script exits 1 with "Missing required tools: curl".

build_nocurl_dir() {
  local dir
  dir=$(mktemp -d)
  for cmd in jq sed grep tr git; do
    local real
    real=$(command -v "$cmd" 2>/dev/null) || continue
    printf '#!/usr/bin/env bash\nexec "%s" "$@"\n' "$real" > "${dir}/${cmd}"
    chmod +x "${dir}/${cmd}"
  done
  echo "$dir"
}

# ── Tests ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║    configure-org-webhook.sh — automated test suite          ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
info "Mock curl: ${MOCK_DIR}/curl"
info "Target:    ${TARGET}"

# T01 — Happy path: webhook created (HTTP 201)
header "T01 — Happy path (HTTP 201 Created)"
run_test T01 "exits 0 and reports success" 0 \
  "Webhook created successfully|Hook ID" \
  MOCK_SCENARIO=201

# T02 — Duplicate webhook (HTTP 422 + already-exists message) → exit 0, warn only
header "T02 — Duplicate webhook (HTTP 422)"
run_test T02 "exits 0 and warns about existing webhook" 0 \
  "already exists" \
  MOCK_SCENARIO=422-duplicate

# T03 — Insufficient scope / not an org owner (HTTP 403) → exit 1
header "T03 — Insufficient scope (HTTP 403)"
run_test T03 "exits 1 and reports permission denied" 1 \
  "Permission denied|HTTP 403|admin:org_hook" \
  MOCK_SCENARIO=403

# T04 — Org not found (HTTP 404) → exit 1
header "T04 — Org not found (HTTP 404)"
run_test T04 "exits 1 and reports org not found" 1 \
  "not found|HTTP 404" \
  MOCK_SCENARIO=404

# T05 — Missing curl dependency → exit 1 before any API call
header "T05 — Missing curl dependency"
NOCURL_DIR=$(build_nocurl_dir)
BASH_BIN=$(command -v bash)
output_t05=$(env \
  PATH="${NOCURL_DIR}" \
  ORG="test-org" \
  GH_TOKEN="ghp_mock" \
  WEBHOOK_URL="https://example.com/hook" \
  MOCK_SCENARIO=201 \
  "${BASH_BIN}" "${TARGET}" 2>&1)
exit_t05=$?
rm -rf "$NOCURL_DIR"
if [[ "$exit_t05" -ne 0 ]] && echo "$output_t05" | grep -qiE "curl|Missing"; then
  pass "T05: exits 1 when curl is absent from PATH"
else
  fail "T05: exits 1 when curl is absent from PATH"
  echo "       exit=${exit_t05}"
  echo "$output_t05" | tail -5 | sed 's/^/         /'
fi

# T06 — Non-HTTPS webhook URL → exit 1 before API call
header "T06 — Non-HTTPS webhook URL"
run_test T06 "exits 1 for non-https webhook URL" 1 \
  "https|must start" \
  MOCK_SCENARIO=201 \
  WEBHOOK_URL=http://example.com/hook

# T07 — Empty org name → exit 1 before any API call
header "T07 — Empty org name"
output_t07=$(env \
  PATH="${MOCK_DIR}:${PATH}" \
  GH_TOKEN="ghp_mock_token_000000000000000000000" \
  WEBHOOK_URL="https://example.com/hook" \
  MOCK_SCENARIO=201 \
  bash "${TARGET}" "" 2>&1)
exit_t07=$?
if [[ "$exit_t07" -ne 0 ]] && echo "$output_t07" | grep -qiE "required|organization"; then
  pass "T07: exits 1 when org name is empty"
else
  fail "T07: exits 1 when org name is empty"
  echo "       exit=${exit_t07}"
  echo "$output_t07" | tail -5 | sed 's/^/         /'
fi

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
