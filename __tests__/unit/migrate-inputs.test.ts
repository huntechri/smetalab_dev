import { describe, expect, it } from "vitest"

import { migrateCode, normalizeInputClassName, parseArgs } from "@/scripts/migrate-inputs"

describe("migrate-inputs codemod", () => {
  it("parses flags deterministically", () => {
    expect(parseArgs([])).toEqual({ write: false, report: false })
    expect(parseArgs(["--write"])).toEqual({ write: true, report: true })
    expect(parseArgs(["--report"])).toEqual({ write: false, report: true })
  })

  it("removes manual visual tokens from className", () => {
    expect(normalizeInputClassName("h-8 text-xs border-primary/20 bg-primary/2 px-2 min-w-[180px]")).toBe("min-w-[180px]")
  })

  it("strips className when it only had overriden visual tokens", () => {
    const input = 'export function Demo(){return <Input className="text-xs border-primary/20 bg-primary/2" />} '
    const out = migrateCode(input)

    expect(out.changed).toBe(true)
    expect(out.code).toContain("<Input />")
  })

  it("keeps functional className tokens", () => {
    const input = 'export function Demo(){return <Input className="h-8 min-w-[180px] text-xs" />} '
    const out = migrateCode(input)

    expect(out.changed).toBe(true)
    expect(out.code).toContain('className="min-w-[180px]"')
  })
})
