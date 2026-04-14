import { describe, expect, it } from "vitest"

import { ensureButtonImport, migrateCode, parseArgs } from "@/scripts/migrate-buttons"

describe("migrate-buttons codemod", () => {
  it("parses flags deterministically", () => {
    expect(parseArgs([])).toEqual({ write: false, report: false })
    expect(parseArgs(["--write"])).toEqual({ write: true, report: true })
    expect(parseArgs(["--report"])).toEqual({ write: false, report: true })
  })

  it("merges Button into shared/ui/button import", () => {
    const input = 'import { buttonVariants } from "@/shared/ui/button"\nconst a = 1\n'
    const out = ensureButtonImport(input)
    expect(out).toContain('import { buttonVariants, Button } from "@/shared/ui/button"')
  })

  it("replaces raw button with Button and adds import", () => {
    const input = `export function Demo(){return <button type="button">Go</button>}`
    const out = migrateCode(input)

    expect(out.changed).toBe(true)
    expect(out.code).toContain('<Button type="button">Go</Button>')
    expect(out.code).toContain('import { Button } from "@/shared/ui/button"')
  })

  it("wraps styled link as asChild Button", () => {
    const input = `import Link from "next/link"\nexport function Demo(){return <Link href="/x" className="inline-flex px-3 py-2 rounded">Go</Link>}`
    const out = migrateCode(input)

    expect(out.changed).toBe(true)
    expect(out.code).toContain('<Button asChild><Link href="/x" className="inline-flex px-3 py-2 rounded">Go</Link></Button>')
  })
})
