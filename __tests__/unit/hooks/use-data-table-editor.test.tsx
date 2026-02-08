import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useDataTableEditor } from "@/hooks/use-data-table-editor"
import type { FormEvent } from "react"

const toastSpy = vi.fn()

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: toastSpy,
  }),
}))

interface TestRow {
  id: string
  name: string
}

describe("useDataTableEditor", () => {
  beforeEach(() => {
    toastSpy.mockClear()
  })

  it("updates edit form data and calls update handler", async () => {
    const onRowUpdate = vi.fn().mockResolvedValue({ success: true })

    const { result } = renderHook(() =>
      useDataTableEditor<TestRow>({
        onRowUpdate,
      })
    )

    act(() => {
      result.current.setEditingRow({ id: "1", name: "Original" })
    })

    expect(result.current.editFormData).toEqual({ id: "1", name: "Original" })

    act(() => {
      result.current.setEditFormData({ id: "1", name: "Updated" })
    })

    const event = { preventDefault: vi.fn() } as unknown as FormEvent

    act(() => {
      result.current.handleUpdate(event)
    })

    await waitFor(() => {
      expect(onRowUpdate).toHaveBeenCalledWith("1", { id: "1", name: "Updated" })
    })
  })

  it("calls delete handler for selected row", async () => {
    const onRowDelete = vi.fn().mockResolvedValue({ success: true })

    const { result } = renderHook(() =>
      useDataTableEditor<TestRow>({
        onRowDelete,
      })
    )

    act(() => {
      result.current.setDeletingRow({ id: "2", name: "Delete Me" })
    })

    act(() => {
      result.current.handleDelete()
    })

    await waitFor(() => {
      expect(onRowDelete).toHaveBeenCalledWith("2")
    })
  })
})
