## 2025-02-23 - In-Memory Rate Limiting Constraints
**Vulnerability:** Missing rate limiting on `signIn`/`signUp` endpoints allowed for potential brute-force attacks.
**Learning:** In Next.js Server Actions (especially on Vercel/serverless), in-memory state (like `Map` or `Set`) is not shared across function instances and is ephemeral. An in-memory rate limiter provides only partial protection (per-instance) and is not a complete substitute for a distributed store (e.g., Redis).
**Prevention:** For robust production rate limiting, integrate a persistent store (Redis/Upstash) or use edge middleware with rate limiting capabilities.

## 2026-02-02 - Commit Message Linting
**Constraint:** The `commitlint` configuration enforces a strict 100-character limit on the body of commit messages.
**Learning:** Even if a commit subject is short, the body lines must also be wrapped manually. Long error messages or descriptions in the body will cause CI failure ("Lint Commit Messages").
**Prevention:** Always verify commit message body line lengths before committing or submitting. Use concise bullet points and wrap text.

## 2025-05-27 - DNS Rebinding & 0.0.0.0 Bypass in SSRF Protection
**Vulnerability:** A `check-then-fetch` pattern for image downloads (checking hostname, then fetching) is vulnerable to DNS Rebinding (TOCTOU). Additionally, omitting `0.0.0.0` (which often resolves to localhost on Linux/macOS) from private IP blocklists allows bypassing local access restrictions.
**Learning:** Validating a URL's hostname string is insufficient because DNS resolution can change between check and use. Also, `0.0.0.0` is effectively `localhost` in many environments.
**Prevention:** Use a custom `lookup` function in `http.request` / `https.request` to validate the resolved IP address immediately before connection. Always include `0.0.0.0` and `::` in private IP blocklists.

## 2025-05-27 - IPv4-Mapped IPv6 SSRF Bypass
**Vulnerability:** The `isPrivateIp` check failed to detect IPv4-mapped IPv6 addresses (e.g., `::ffff:127.0.0.1`), allowing attackers to bypass SSRF protections and access internal services by using this alternative notation.
**Learning:** Standard IP validation logic often overlooks mapped addresses unless explicitly handled. `dns.lookup` (and thus `http.request`) supports these addresses natively.
**Prevention:** Strip the `::ffff:` prefix from IPv6 addresses and re-validate the remaining suffix against IPv4 private ranges. Ensure IP validation handles all possible representations.

## 2025-02-23 - Weak JWT Secret Handling
**Vulnerability:** The application initialized `jose` JWT signing key using `new TextEncoder().encode(process.env.AUTH_SECRET)`. If `AUTH_SECRET` was undefined, this resulted in an empty `Uint8Array`, potentially allowing tokens to be signed with an empty key if the library permitted it (or simply running with a known weak state).
**Learning:** `TextEncoder.encode(undefined)` does not throw but returns an empty buffer (or encodes "undefined"). This can silently mask missing configuration in security-critical paths.
**Prevention:** Always explicitly validate existence and length of security secrets before usage. Do not rely on implicit type coercion or default behaviors of browser-like APIs (TextEncoder) in Node.js environment.
