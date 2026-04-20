import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useWorksActions } from "@/features/works/hooks/useWorksActions"
import type { WorkRow } from "@/shared/types/domain/work-row"
import type { ChangeEvent, Dispatch, SetStateAction } from "react"

const toastSpy = vi.fn()

const worksMocks = vi.hoisted(() => ({
  exportWorks: vi.fn(),
  importWorks: vi.fn(),
  deleteAllWorks: vi.fn(),
  reorderWorks: vi.fn(),
  updateWork: vi.fn(),
  deleteWork: vi.fn(),
}))

vi.mock("@/components/providers/use-app-toast", () => ({
  useAppToast: () => ({
    toast: toastSpy,
  }),
}))

vi.mock("@/app/actions/works", () => worksMocks)

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}))

describe("useWorksActions", () => {
  beforeEach(async () => {
    toastSpy.mockClear()
    worksMocks.exportWorks.mockReset()
    worksMocks.importWorks.mockReset()
    worksMocks.deleteAllWorks.mockReset()
    worksMocks.reorderWorks.mockReset()
    worksMocks.updateWork.mockReset()
    worksMocks.deleteWork.mockReset()
    const xlsx = vi.mocked(await import("xlsx"))
    vi.mocked(xlsx.writeFile).mockReset()
    vi.mocked(xlsx.utils.json_to_sheet).mockReset()
    vi.mocked(xlsx.utils.book_new).mockReset()
    vi.mocked(xlsx.utils.book_append_sheet).mockReset()
  })

  it("exports works and writes the file", async () => {
    worksMocks.exportWorks.mockResolvedValue({ success: true, data: [{ name: "Test" }] })
    const setData = vi.fn() as unknown as Dispatch<SetStateAction<WorkRow[]>>

    const { result } = renderHook(() => useWorksActions({ setData }))

    act(() => {
      result.current.handleExport()
    })

    const xlsx = vi.mocked(await import("xlsx"))

    await waitFor(() => {
      expect(worksMocks.exportWorks).toHaveBeenCalled()
      expect(xlsx.writeFile).toHaveBeenCalled()
    })
  })

  it("imports works from file input", async () => {
    worksMocks.importWorks.mockResolvedValue({ success: true })
    const setData = vi.fn() as unknown as Dispatch<SetStateAction<WorkRow[]>>

    const { result } = renderHook(() => useWorksActions({ setData }))
    const file = new File(["test"], "works.xlsx", { type: "application/vnd.ms-excel" })
    const event = {
      target: { files: [file] },
    } as unknown as ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.handleFileChange(event)
    })

    await waitFor(() => {
      expect(worksMocks.importWorks).toHaveBeenCalled()
    })
  })

  it("clears data when deleting all works", async () => {
    worksMocks.deleteAllWorks.mockResolvedValue({ success: true, message: "ok" })
    const setData = vi.fn() as unknown as Dispatch<SetStateAction<WorkRow[]>>

    const { result } = renderHook(() => useWorksActions({ setData }))

    act(() => {
      result.current.handleDeleteAll()
    })

    await waitFor(() => {
      expect(worksMocks.deleteAllWorks).toHaveBeenCalled()
      expect(setData).toHaveBeenCalledWith([])
    })
  })
})
