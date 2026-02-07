import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { useMaterialsRowActions } from "@/app/(workspace)/app/guide/materials/hooks/useMaterialsRowActions"

const materialsMocks = vi.hoisted(() => ({
  updateMaterial: vi.fn(),
  deleteMaterial: vi.fn(),
}))

vi.mock("@/app/actions/materials", () => materialsMocks)

describe("useMaterialsRowActions", () => {
  it("normalizes price on update", async () => {
    materialsMocks.updateMaterial.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useMaterialsRowActions())

    act(() => {
      result.current.handleRowUpdate("1", { price: 1200 })
    })

    await waitFor(() => {
      expect(materialsMocks.updateMaterial).toHaveBeenCalledWith("1", {
        price: 1200,
      })
    })
  })

  it("calls delete action", async () => {
    materialsMocks.deleteMaterial.mockResolvedValue({ success: true })
    const { result } = renderHook(() => useMaterialsRowActions())

    act(() => {
      result.current.handleRowDelete("2")
    })

    await waitFor(() => {
      expect(materialsMocks.deleteMaterial).toHaveBeenCalledWith("2")
    })
  })
})
