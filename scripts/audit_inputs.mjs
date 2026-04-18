import { execSync } from "node:child_process"

console.log("Starting input fields audit (AST mode)...")
execSync("pnpm -s tsx scripts/migrate-inputs.ts --report", { stdio: "inherit" })
console.log("Audit complete. Results saved to reports/input-audit.json and docs/inputs_audit_updated.md")
