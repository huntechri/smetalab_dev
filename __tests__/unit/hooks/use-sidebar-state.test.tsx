import { renderHook, act } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useSidebarState } from "@/hooks/use-sidebar-state"

describe("useSidebarState", () => {
  it("sets cookie when toggling open state", () => {
    document.cookie = ""

    const { result } = renderHook(() =>
      useSidebarState({
        defaultOpen: false,
        isMobile: false,
        cookieName: "sidebar_state",
        cookieMaxAge: 100,
        keyboardShortcut: "b",
      })
    )

    act(() => {
      result.current.setOpen(true)
    })

    expect(result.current.open).toBe(true)
    expect(document.cookie).toContain("sidebar_state=true")
  })
})
